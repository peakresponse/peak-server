const express = require('express');
const fs = require('fs');
const path = require('path');
const soap = require('soap');
const xmljs = require('xml-js');

const models = require('../../../models');
const nemsisXsd = require('../xsd');
const nemsisSchematron = require('../schematron');

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
      `<soap:address location="${process.env.BASE_URL}${routePath}" />`,
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
      where: { subdomain: args.organization, isDraft: false },
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
    const employment = await models.Employment.scope('finalOrNew').findOne({
      where: { userId: user.id, createdByAgencyId: agency.id },
    });
    const isAllowed =
      employment && employment.isActive && (employment.isOwner || employment.roles.includes(models.Employment.Roles.REPORTING));
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

  async submitDemDataSet(payload) {
    // validate against XSD
    const xmlValidationErrorReport = await nemsisXsd.validate(
      null,
      payload,
      path.resolve(__dirname, '../../../nemsis/xsd/DEMDataSet_v3.xsd'),
    );
    if (xmlValidationErrorReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_XSD],
        statusCode: StatusCodes.FAILED_IMPORT_XSD,
        reports: {
          xmlValidationErrorReport,
        },
      };
    }
    const completeSchematronReport = await nemsisSchematron.validate(
      null,
      payload,
      path.resolve(__dirname, '../../../nemsis/schematron/DEMDataSet.sch.xsl'),
    );
    if (completeSchematronReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_SCH_ERROR],
        statusCode: StatusCodes.FAILED_IMPORT_SCH_ERROR,
        reports: {
          xmlValidationErrorReport: {
            totalErrorCount: 0,
          },
          schematronReport: {
            completeSchematronReport,
          },
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
    const xmlValidationErrorReport = await nemsisXsd.validate(
      null,
      payload,
      path.resolve(__dirname, '../../../nemsis/xsd/EMSDataSet_v3.xsd'),
    );
    if (xmlValidationErrorReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_XSD],
        statusCode: StatusCodes.FAILED_IMPORT_XSD,
        reports: {
          xmlValidationErrorReport,
        },
      };
    }
    const completeSchematronReport = await nemsisSchematron.validate(
      null,
      payload,
      path.resolve(__dirname, '../../../nemsis/schematron/EMSDataSet.sch.xsl'),
    );
    if (completeSchematronReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_SCH_ERROR],
        statusCode: StatusCodes.FAILED_IMPORT_SCH_ERROR,
        reports: {
          xmlValidationErrorReport: {
            totalErrorCount: 0,
          },
          schematronReport: {
            completeSchematronReport,
          },
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
    const xmlValidationErrorReport = await nemsisXsd.validate(
      null,
      payload,
      path.resolve(__dirname, '../../../nemsis/xsd/StateDataSet_v3.xsd'),
    );
    if (xmlValidationErrorReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_XSD],
        statusCode: StatusCodes.FAILED_IMPORT_XSD,
        reports: {
          xmlValidationErrorReport,
        },
      };
    }
    const completeSchematronReport = await nemsisSchematron.validate(
      null,
      payload,
      path.resolve(__dirname, '../../../nemsis/schematron/StateDataSet.sch.xsl'),
    );
    if (completeSchematronReport) {
      return {
        requestType: 'SubmitData',
        requestHandle: this.statusMessages[StatusCodes.FAILED_IMPORT_SCH_ERROR],
        statusCode: StatusCodes.FAILED_IMPORT_SCH_ERROR,
        reports: {
          xmlValidationErrorReport: {
            totalErrorCount: 0,
          },
          schematronReport: {
            completeSchematronReport,
          },
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
