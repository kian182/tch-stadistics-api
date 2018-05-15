'use strict';
import mongoose from "mongoose";
import childProcess from "child_process"

const fs = require('fs')
import Q from "q"
const License = mongoose.model('License');

import conf from "../config"
import LicType from "../services/licenseType.service"

const srcLicGen = conf.API_PATH + "/api/exe/licGen.sh"
const srcLicPem = conf.API_PATH + "/static/flexPrivate.pem"
const tmpOptionsFile = conf.API_PATH + '/tmp/options.tmp'
const tempLicSource = conf.API_PATH + '/tmp/'

exports.deleteLicense = (req, res) => {
  License.remove({
    _id: req.params.licenseId
  }, function(err, license) {
    if (err)
      res.send(err);
    res.json({ message: 'License successfully deleted' });
  });
};

exports.getLicense = (req, res) => {
  License.findById(req.params.licenseId, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.licGenerate = (req, res) => {
  generatorManager(req.body).then(function (response) {
    res.json(response);
  });
};

/***
 * @conf Array
 * ***/

function generatorManager(body) {
  let result = Q()
  let responses = []
  let licsToGenerate = body
  licsToGenerate.forEach(function (licGen, index) {
    result = result.then(function () {
      return new Promise((resolve) => {
        LicType.getLicenseType(licGen.licenseTypeCode).then(licType => {
          if (!licGen.licenseTo) {
            let errObj = failedObj(licGen.licenseTypeCode, 'The License to field is not assigned.')
            responses.push(errObj)
            resolve(responses)
          }
          else if (!isValidOptionField(licGen)) {
            let errObj = failedObj(licGen.licenseTypeCode, 'Review the Options field.')
            responses.push(errObj)
            resolve(responses)
          } else {
            updateOptionTemp(licGen, licGen.options).then(options => {
              verifyIfAlreadyExistsAndDelete(licGen).then(() => {
                var cmd = srcLicGen + ' '
                  + srcLicPem + ' '
                  + licGen.macAddress + ' '
                  + licType.name + ' '
                  + tempLicSource + licType.name + ' '
                  + tmpOptionsFile;

                childProcess.exec(cmd, function (error, stdout) {

                  let obj = {
                    licenseTypeCode: licGen.licenseTypeCode,
                    licenseName: licType.name,
                    filename: licType.name + '.' + licGen.macAddress + '.lic',
                    licenseTo: licGen.licenseTo,
                    endCustomer: licGen.endCustomer ? licGen.endCustomer : 'NONE',
                    content: stdout,
                    status: "ok"
                  };

                  let newLicense = new License(obj)
                  newLicense.macAddress = licGen.macAddress
                  newLicense.licenseTo = licGen.licenseTo
                  newLicense.endCustomer = licGen.endCustomer ? licGen.endCustomer : 'NONE'
                  newLicense.options = options
                  newLicense.save(function (err, license) {
                    responses.push(obj)
                    resolve(responses)
                  });
                })
              })
            })
          }
        }).catch(err => {
          let errObj = failedObj(licGen.licenseTypeCode, 'The license type code has not been found.')
          responses.push(errObj)
          resolve(responses)
        })
      })
    })
  })

  return result
}

function failedObj(licenseTypeCode, msg) {
  return {
    licenseTypeCode: licenseTypeCode,
    errorMsg: msg,
    status: 'failed'
  }
}

function updateOptionTemp(licGen, options) {
  let licenseTo = licGen.licenseTo
  let endCustomer= licGen.endCustomer? licGen.endCustomer:'NONE'
  return new Promise((resolve, reject) => {
    if(licGen.endCustomer){
      options.unshift({'endCustomer':endCustomer})
    }
    options.unshift({'licenseTo':licenseTo})
    let optionsTxt = JSON.stringify(options)
    fs.writeFile(tmpOptionsFile, optionsTxt, function (err, data) {
      if (err) {
        return reject({message: err})
      }
      resolve(options)
    })
  })
}

function isValidOptionField(ligGen) {
  if (!ligGen.options) {
    return false
  }
  return true;
}

function verifyIfAlreadyExistsAndDelete(licGen) {
  return License.find({
    macAddress: licGen.macAddress,
    licenseTypeCode: licGen.licenseTypeCode,
    licenseTo: licGen.licenseTo,
    endCustomer: licGen.endCustomer||'NONE'
  }, (err, license) => {
    if (Array.isArray(license) && license.length > 0) {
      return License.remove({
        _id: license[0]._id
      }, function () {
        return true
      });
    }
  })
}