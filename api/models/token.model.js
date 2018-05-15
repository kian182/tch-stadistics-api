'use strict';
import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * TK Schema
 */
var tokenSchema = new Schema({
  tk: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },

  creationDate: {
    type: Date,
    default: Date.now

  },

  expirationDate: {
    type: Date,
    default: Date,
    required: true
  },

  userId: {
    type: String,
    required: true
    // unique: true,
  }
});
module.exports = mongoose.model('Token', tokenSchema);