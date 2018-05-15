'use strict';
import mongoose from "mongoose";
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

const Schema = mongoose.Schema;

/**
 * TK Schema
 */
var licenseSchema = new Schema({
  macAddress: {
    type: String,
    trim: true,
    required: true
  },

  licenseTo: {
    type: String,
    trim: true,
    required: true
  },

  endCustomer: {
    type: String,
    trim: true
  },

  licenseTypeCode: {
    type: String,
    trim: true,
    required: true
  },

  licenseName:{
    type: String,
    trim: true,
    required: true
  },

  filename: {
    type: String,
    trim: true,
    required: true
  },

  content:{
    type: String,
    trim: true,
    required: true
  },

  options: {
    type: Array,
    required: true
  },

  creationDate: {
    type: Date,
    default: Date.now

  }
});
licenseSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('License', licenseSchema);