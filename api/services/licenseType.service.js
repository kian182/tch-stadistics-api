'use strict'
import conf from "../config"
import _ from "lodash";
const fs = require('fs')
const srcLicenseTypes = conf.API_PATH + '/licenseType.json'

exports.getLicenseTypes = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(srcLicenseTypes, function (err, data) {
      if (err) {
        reject(err)
      }
      resolve(JSON.parse(data))
    })
  })
}

exports.updateLicenseTypeList = obj => {
  return new Promise((resolve, reject) => {
    let licenseType = JSON.stringify(obj, false, 2)
    fs.writeFile(srcLicenseTypes, licenseType, function (err) {
      if (err) {
        return reject({message: err})
      }
      resolve({message: 'The license type list was changed successfully.'})
    })
  })
}

exports.getLicenseType = licenseTypeCode => {
  return new Promise((resolve, reject) => {
    fs.readFile(srcLicenseTypes, function (err, data) {
      if (err) {
        reject(null)
      }
      let licenseTypes = JSON.parse(data)
      let licenseTypeList = licenseTypes.licenseTypes
      let obj = _.find(licenseTypeList, function(o) { return o.licenseTypeCode === licenseTypeCode; })
      if (obj) {
        resolve(obj)
      } else {
        reject(null)
      }
    })
  });
}