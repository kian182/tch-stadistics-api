'use strict';
import _ from "lodash"
import mongoose from "mongoose"

const Licenses = mongoose.model('License');

exports.listAllMacAddress = (req, res) => {
  function parserMacAddresResp(macList) {
    return _.forEach(macList, function (value) {
      value['macAddress'] = value._id;
      delete value._id;
    });
  }

  let agg = [
    {
      $group: {
        _id: "$macAddress", totalLicenses: {$sum: 1}
      }
    }
  ];

  Licenses.aggregate(agg, function (err, macList) {
    if (err)
      res.send(err)
    res.json(parserMacAddresResp(macList));
  });
}

exports.listAllLicenseTo = (req, res) => {
  function parserLicenseToResp(macList) {
    return _.forEach(macList, function (value) {
      value['licenseTo'] = value._id;
      delete value._id;
    });
  }

  let agg = [
    {
      $group: {
        _id: "$licenseTo", totalLicenses: {$sum: 1}
      }
    }
  ];

  Licenses.aggregate(agg, function (err, licenseToList) {
    if (err)
      res.send(err)
    res.json(parserLicenseToResp(licenseToList))
  })
}

exports.licensesList = (req, res) => {
  if(req.query && req.query.format && req.query.format === 'tree'){
    licensesListTree(req, res)
  } else if (req.query && req.query.format && req.query.format === 'macAddress') {
    let filterTo = req.query.searchString || ''
    let agg = [
      {
        $match: {"macAddress": {$regex: new RegExp("^" + filterTo.toLowerCase(), "i")}}
      },
      {
        $group: {
          _id: "$macAddress", totalLicenses: {$push: "$licenseTypeCode"}
        }
      }
    ]

    Licenses.aggregate(agg, function (err, licenses) {
      if (err)
        res.send(err)
      res.json(licenses)
    })
  } else {
    let filterTo = req.query.searchString || ''
    filterTo = {$regex: new RegExp("^" + filterTo.toLowerCase(), "i")}
    Licenses.find({
      $or: [
        {"filename": filterTo},
        {"macAddress": filterTo},
        {"endCustomer": filterTo},
        {"licenseTo": filterTo}
      ]
    }, function (err, licenses) {
      if (err)
        res.send(err)
      res.json(licenses)
    })
  }
}

function licensesListTree(req, res) {
  let aggregate =  Licenses.aggregate()
  let filterTo = req.query.searchString || ''

  let page = req.query.page || 0
  let limit = req.query.limit || 10
  aggregate.match({
    $or: [
      {"filename": {$regex: new RegExp("^" + filterTo.toLowerCase(), "i")}},
      {"macAddress": {$regex: new RegExp("^" + filterTo.toLowerCase(), "i")}},
      {"endCustomer": {$regex: new RegExp("^" + filterTo.toLowerCase(), "i")}},
      {"licenseTo": {$regex: new RegExp("^" + filterTo.toLowerCase(), "i")}}
    ]
  }).group({
    _id: {
      licenseTo: "$licenseTo",
      endCustomer: "$endCustomer",
      macAddress: "$macAddress"
    },
    licenses: {
      $push: {
        _id: "$_id",
        endCustomer: "$endCustomer",
        licenseName: "$licenseName",
        licenseTypeCode: "$licenseTypeCode",
        content: "$content",
        options: "$options",
        filename: "$filename",
        creationDate: "$creationDate",
        macAddress: "$macAddress",
        licenseTo: "$licenseTo"
      }
    }

  }).group({
    _id: {
      licenseTo: "$_id.licenseTo",
      endCustomer: "$_id.endCustomer"
    },
    sf_devices: {$push: {macAddress: "$_id.macAddress", licenses: "$licenses",}}
  }).group({
    _id: "$_id.licenseTo",
    endCustomers: {$push: {endCustomer: "$_id.endCustomer", sf_devices: "$sf_devices"}}
  }).project({licenseTo_lc: { $toLower: "$_id" },_id: 0, licenseTo: "$_id", endCustomers: "$endCustomers"}).sort( {licenseTo_lc: 0})

  var options = { page : page, limit : limit}

  Licenses.aggregatePaginate(aggregate, options, function(err, results, pageCount, count) {
    if (err)
      res.send(err)
    res.json(results)
  })
}