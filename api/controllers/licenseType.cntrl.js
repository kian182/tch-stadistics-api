'use strict'
import LicType from "../services/licenseType.service"

exports.readLicenseTypes = (req, res) => {
  LicType.getLicenseTypes().then(response => {
    res.json(response)
  }).catch(err => {
    return res.status(400).send({
      message: err
    })
  })
}

exports.updateLicenseType = (req, res) => {
  LicType.updateLicenseTypeList(req.body).then(response => {
    res.json(response)
  }).catch(err => {
    return res.status(400).send({
      errorMsg: err
    })
  })
}