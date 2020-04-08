'use strict'

const { City, Country, County, State } = require('../codes');
const CommonTypes = require('./commonTypes');

/// a few additional CA names that don't exactly match the v3.5 enum type
const CATypeOfFacilityNameValueMapping = {
  'Independent Living Facility': '1701001',
  'Morgue': '1701023',
  'Rehabilitation Facility': '1701013',
};
const CAHospitalDesignationNameValueMapping = {
  'Stroke Center': '9908017',
  'STEMI Center (24/7)': '9908033',
};
const CACityMapping = {
  'City of West Hills': '2410877', // City of Los Angeles
  'Beale Air Force Base Census Designated Place': '2407813',
  'Fort Mojave Census Designated Place': '2628855', // Fort Mohave Census Designated Place
  'Carmel': '2409987', // City of Carmel-by-the-Sea
  'Arleta': '2410877', // City of Los Angeles
  'Echo Park': '2410877', // City of Los Angeles
  'McClellan Park': '2583067', // McClellan Park Census Designated Place
};
const CACountryMapping = {
  'United States': 'US', // United States of America
};
const parseFacilitySpreadsheet = async function(data) {
  const facilities = {};
  const setValue = function(obj, property, isOptional, value, isMulti, attrs) {
    value = `${value || ''}`;
    if (value && value !== '') {
      if (obj[property]) {
        if (!Array.isArray(obj[property])) {
          obj[property] = [obj[property]];
        }
        value = {_text: value};
        if (attrs) {
          value._attributes = attrs;
        }
        obj[property].push(value);
      } else {
        if (isMulti) {
          const values = `${value}`.split(',');
          for (let value of values) {
            if (value !== '') {
              obj[property] = obj[property] || [];
              value = {_text: value};
              if (attrs) {
                value._attributes = attrs;
              }
              obj[property].push(value);
            }
          }
        } else {
          value = {_text: value};
          if (attrs) {
            value._attributes = attrs;
          }
          obj[property] = value;
        }
      }
    } else {
      if (!isOptional) {
        obj[property] = {_attributes: {'xsi:nil': true, NV: '7701003'}};
      }
    }
  };
  for (let row of data.rows) {
    const type = CommonTypes.enums['TypeOfFacility'].nameMapping[row['Type of Facility']] ||
                 CATypeOfFacilityNameValueMapping[row['Type of Facility']] || null;
    facilities[type] = facilities[type] || [];
    const facility = {};
    setValue(facility, 'sFacility.02', false, row['Name']);
    setValue(facility, 'sFacility.03', false, row['Code']);
    if (row['Hospital Designation']) {
      const names = row['Hospital Designation'].split(',');
      for (let name of names) {
        if (name !== '') {
          const value = CommonTypes.enums['HospitalDesignation'].nameMapping[name] ||
                        CAHospitalDesignationNameValueMapping[name];
          setValue(facility, 'sFacility.04', false, value);
        }
      }
    }
    setValue(facility, 'sFacility.05', true, row['National Provider Identifier (comma separate for multiple. Max length allowed per code is 10 character. '], true);
    setValue(facility, 'sFacility.06', true, row['Room, \nSuite \nor Apt.']);
    setValue(facility, 'sFacility.07', true, `${row['Address'] || ''}\n${row['Address2'] || ''}`.trim());

    let countryCode = null;
    if (row['Country'] && row['Country'] !== '') {
      countryCode = Country.getAlpha2Code(row['Country'], 'en');
      if (!countryCode) {
        countryCode = CACountryMapping[row['Country']];
        if (!countryCode) {
          console.log(`Not found: ${row['Country']}`);
        }
      }
      setValue(facility, 'sFacility.12', true, countryCode);
    }

    let stateCode = null;
    if (row['State'] && row['State'] !== '') {
      let state = State.nameMapping[row['State']];
      if (state) {
        stateCode = state.code;
        setValue(facility, 'sFacility.09', false, stateCode);
      }
    }

    let countyCode = null;
    if (row['County'] && row['County'] !== '') {
      countyCode = await County.getCode(row['County'], stateCode);
      if (!countyCode) {
        console.log(`Not found county: ${row['County']}`)
      }
      setValue(facility, 'sFacility.11', false, countyCode);
    }

    if (row['City'] && row['City'] !== '') {
      let code = await City.getCode(row['City'], stateCode);
      if (!code) {
        code = CACityMapping[row['City']];
      }
      setValue(facility, 'sFacility.08', true, code);
    }

    setValue(facility, 'sFacility.10', false, row['Postal \nCode']);
    const gps = `${row['Latitude']},${row['Longitude']}`.trim();
    if (gps.match(/[-\d\.]+,[-\d\.]+/)) {
      setValue(facility, 'sFacility.13', true, gps);
    }
    setValue(facility, 'sFacility.15', true, row['Work \nPhone \nNumber'], true, {PhoneNumberType: '9913009'});
    setValue(facility, 'sFacility.15', true, row['Fax \nNumber'], true, {PhoneNumberType: '9913001'});
    setValue(facility, 'sFacility.15', true, row['Home \nPhone \nNumber'], true, {PhoneNumberType: '9913003'});
    setValue(facility, 'sFacility.15', true, row['Mobile \nPhone \nNumber'], true, {PhoneNumberType: '9913005'});
    setValue(facility, 'sFacility.15', true, row['Pager \nNumber'], true, {PhoneNumberType: '9913007'});
    setValue(facility, 'sFacility.15', true, row['Primary \nNumber'], true, {PhoneNumberType: '9913009'});
    facilities[type].push(facility);
  }
  const sFacility = {sFacilityGroup: []}
  for (let type in facilities) {
    const sFacilityGroup = {'sFacility.FacilityGroup': []};
    if (type == 'null') {
      sFacilityGroup['sFacility.01'] = {_attributes: {'xsi:nil': true, NV: '7701003'}};
    } else {
      sFacilityGroup['sFacility.01'] = {_text: type};
    }
    for (let facility of facilities[type]) {
      sFacilityGroup['sFacility.FacilityGroup'].push(facility);
    }
    sFacility.sFacilityGroup.push(sFacilityGroup);
  }
  return sFacility;
};

module.exports = {
  parseFacilitySpreadsheet,
}
