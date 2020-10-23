const express = require('express');
const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const soap = require('soap');
const tmp = require('tmp');
const xmljs = require('xml-js');
const { validateXMLWithXSD } = require('validate-with-xmllint');

const models = require('../../../models');

const StatusCodes = {
  PERMISSION_DENIED_FOR_ORG: '-3',
  PERMISSION_DENIED_FOR_OP: '-2',
  INVALID_CREDENTIALS: '-1',
  INVALID_PARAM_VALUE: '-4',
  INVALID_PARAM_COMBO: '-5',
  GENERIC_SERVER_ERROR: '-20',
  SERVER_ERROR_DB: '-21',
  SERVER_ERROR_IO: '-22',
  FAILED_IMPORT_ALREADY_EXISTS: '-11',
  FAILED_IMPORT_XSD: '-12',
  FAILED_IMPORT_SCH_FATAL: '-13',
  FAILED_IMPORT_SCH_ERROR: '-14',
  FAILED_IMPORT_ETL: '-15',
  FAILED_IMPORT_BI: '-16',
  FAILED_IMPORT_TOO_LARGE: '-30',
  SUCCESS: '1',
  SUCCESS_WITH_SCH_ERROR: '2',
  SUCCESS_WITH_SCH_WARN: '3',
  SUCCESS_WITH_ETL_WARN: '4',
  SUCCESS_WITH_BI_WARN: '5',
  PARTIAL_SUCCESS_WITH_SCH_ERROR: '6',
  STATUS_VALIDATED_IN_PROGRESS: '10',
  SUCCESS_QUERY_LIMIT: '51',
  SERVER_ERROR_BUSY: '-50',
  FAILED_QUERY_LIMIT: '-51',
};

class NemsisServer {
  static get StatusCodes() {
    return StatusCodes;
  }

  constructor(routePath) {
    this.routePath = routePath;
    /// set up the wsdl for our service endpoint based on core spec
    const wsdl = fs.readFileSync(path.resolve(__dirname, '../../../nemsis/wsdl/NEMSIS_V3_core.wsdl'), 'utf8');
    this.wsdl = wsdl.replace(
      '<soap:address location="https://validator.nemsis.org/" />',
      `<soap:address location="${process.env.BASE_URL}${routePath}" />`
    );
    /// parse to extract status code messages
    const json = xmljs.xml2js(wsdl, { compact: true });
    const statusMessages = {};
    for (const type of json['wsdl:definitions']['wsdl:types']['xsd:schema']['xs:simpleType']) {
      if (type._attributes?.name?.endsWith('Codes')) {
        const enumeration = type['xs:restriction']?.['xs:enumeration'];
        if (enumeration) {
          for (const value of enumeration) {
            const code = value._attributes?.value;
            const message = value['xs:annotation']?.['xs:documentation']?._text;
            if (code && message) {
              statusMessages[code] = message;
            }
          }
        }
      }
    }
    this.statusMessages = statusMessages;
  }

  configure(app) {
    // soap config is asynchronous, so attach it to a router that we can place in the middleware stack NOW
    const router = express.Router();
    this.server = soap.listen(router, this.routePath, this, this.wsdl);
    app.use(router);
  }

  get NemsisWsService() {
    return {
      NemsisWsPort: {
        SubmitData: (args, cb, headers, req) => this.handleAsync(() => this.submitData(args, headers, req)),
      },
    };
  }

  async handleAsync(func) {
    try {
      return await func();
    } catch (error) {
      // console.log('!!!', error);
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.GENERIC_SERVER_ERROR],
        statusCode: StatusCodes.GENERIC_SERVER_ERROR,
      };
    }
  }

  async authenticate(args) {
    const agency = await models.Agency.findOne({
      where: { subdomain: args.organization },
    });
    if (!agency) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.PERMISSION_DENIED_FOR_ORG],
        statusCode: StatusCodes.PERMISSION_DENIED_FOR_ORG,
      };
    }
    const user = await models.User.findOne({
      where: { email: args.username },
    });
    if (!user || !(await user.authenticate(args.password))) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.INVALID_CREDENTIALS],
        statusCode: StatusCodes.INVALID_CREDENTIALS,
      };
    }
    const employment = await models.Employment.findOne({
      where: { userId: user.id, agencyId: agency.id },
    });
    const isAllowed =
      employment && employment.isActive && (employment.isOwner || employment.roles.include(models.Employment.Roles.REPORTING));
    if (!isAllowed) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.PERMISSION_DENIED_FOR_ORG],
        statusCode: StatusCodes.PERMISSION_DENIED_FOR_ORG,
      };
    }
    return null;
  }

  async submitData(args, headers, req) {
    const response = await this.authenticate(args, headers, req);
    if (response) {
      return response;
    }
    // extract the raw XML payload
    let payload = req.body.toString();
    const startIndex = payload.indexOf('<payloadOfXmlElement>') + 21;
    const endIndex = payload.indexOf('</payloadOfXmlElement>');
    payload = payload.substring(startIndex, endIndex);
    switch (args.requestDataSchema) {
      case '61':
        return this.submitEmsDataSet(payload, args, headers, req);
      case '62':
        return this.submitDemDataSet(payload, args, headers, req);
      case '65':
        return this.submitStateDataSet(payload, args, headers, req);
      default:
        return {
          requestType: 'SubmitData',
          requestHandle: this.statusMessages[StatusCodes.INVALID_PARAM_VALUE],
          statusCode: StatusCodes.INVALID_PARAM_VALUE,
        };
    }
  }

  static async validateXMLWithXSD(xml, xsdPath) {
    const xmlValidationErrorReport = {
      totalErrorCount: 0,
    };
    try {
      await validateXMLWithXSD(xml, xsdPath);
    } catch (error) {
      xmlValidationErrorReport.xmlError = [];
      for (const m of error.message.matchAll(/-:(\d+): element ([^:]+): Schemas validity error : ([^\n]+)/g)) {
        xmlValidationErrorReport.totalErrorCount += 1;
        xmlValidationErrorReport.xmlError.push({
          desc: m[3],
          failedElementList: {
            xmlElementInfo: [
              {
                elementName: m[2],
                elementLocation: {
                  line: parseInt(m[1], 10),
                },
              },
            ],
          },
        });
      }
    }
    return xmlValidationErrorReport;
  }

  static async validateXMLWithSchematron(xml, schPath) {
    const srcFileObj = tmp.fileSync();
    const dstFilePath = tmp.tmpNameSync();
    const schematronReport = {
      completeSchematronReport: {},
    };
    try {
      fs.writeFileSync(srcFileObj.fd, xml);
      if (shelljs.exec(`bin/xslt ${srcFileObj.name} ${schPath} ${dstFilePath}`).code === 0) {
        const svrl = fs.readFileSync(dstFilePath, 'utf8');
        schematronReport.completeSchematronReport.$xml = svrl.replace(/<\?xml[^?]*\?>\s*/, '');
        const json = xmljs.xml2js(svrl, { compact: true });
        if (!('svrl:failed-assert' in json['svrl:schematron-output'])) {
          return null;
        }
      }
    } finally {
      srcFileObj.removeCallback();
      if (fs.existsSync(dstFilePath)) {
        fs.unlinkSync(dstFilePath);
      }
    }
    return schematronReport;
  }

  async submitDemDataSet(payload) {
    // validate against XSD
    const xmlValidationErrorReport = await NemsisServer.validateXMLWithXSD(
      payload,
      path.resolve(__dirname, '../../../nemsis/xsd/DEMDataSet_v3.xsd')
    );
    if (xmlValidationErrorReport.totalErrorCount > 0) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_XSD],
        statusCode: StatusCodes.FAILED_IMPORT_XSD,
        reports: {
          xmlValidationErrorReport,
        },
      };
    }
    const schematronReport = await NemsisServer.validateXMLWithSchematron(
      payload,
      path.resolve(__dirname, '../../../nemsis/schematron/DEMDataSet.sch.xsl')
    );
    if (schematronReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_SCH_ERROR],
        statusCode: StatusCodes.FAILED_IMPORT_SCH_ERROR,
        reports: {
          xmlValidationErrorReport,
          schematronReport,
        },
      };
    }
    return {
      requestType: 'SubmitData',
      requestHandle: this.statusMessages[StatusCodes.GENERIC_SERVER_ERROR],
      statusCode: StatusCodes.GENERIC_SERVER_ERROR,
    };
  }

  async submitEmsDataSet(payload) {
    const xmlValidationErrorReport = await NemsisServer.validateXMLWithXSD(
      payload,
      path.resolve(__dirname, '../../../nemsis/xsd/EMSDataSet_v3.xsd')
    );
    if (xmlValidationErrorReport.totalErrorCount > 0) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_XSD],
        statusCode: StatusCodes.FAILED_IMPORT_XSD,
        reports: {
          xmlValidationErrorReport,
        },
      };
    }
    const schematronReport = await NemsisServer.validateXMLWithSchematron(
      payload,
      path.resolve(__dirname, '../../../nemsis/schematron/EMSDataSet.sch.xsl')
    );
    if (schematronReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_SCH_ERROR],
        statusCode: StatusCodes.FAILED_IMPORT_SCH_ERROR,
        reports: {
          xmlValidationErrorReport,
          schematronReport,
        },
      };
    }
    return {
      requestType: 'SubmitData',
      requestHandle: this.statusMessages[StatusCodes.GENERIC_SERVER_ERROR],
      statusCode: StatusCodes.GENERIC_SERVER_ERROR,
    };
  }

  async submitStateDataSet(payload) {
    const xmlValidationErrorReport = await NemsisServer.validateXMLWithXSD(
      payload,
      path.resolve(__dirname, '../../../nemsis/xsd/StateDataSet_v3.xsd')
    );
    if (xmlValidationErrorReport.totalErrorCount > 0) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_XSD],
        statusCode: StatusCodes.FAILED_IMPORT_XSD,
        reports: {
          xmlValidationErrorReport,
        },
      };
    }
    const schematronReport = await NemsisServer.validateXMLWithSchematron(
      payload,
      path.resolve(__dirname, '../../../nemsis/schematron/StateDataSet.sch.xsl')
    );
    if (schematronReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_SCH_ERROR],
        statusCode: StatusCodes.FAILED_IMPORT_SCH_ERROR,
        reports: {
          xmlValidationErrorReport,
          schematronReport,
        },
      };
    }
    return {
      requestType: 'SubmitData',
      requestHandle: this.statusMessages[StatusCodes.GENERIC_SERVER_ERROR],
      statusCode: StatusCodes.GENERIC_SERVER_ERROR,
    };
  }
}

module.exports = { NemsisServer };
