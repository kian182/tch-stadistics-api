'use strict';
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
  username:{
    type: String,
    trim: true,
    required: true,
    unique:true
  },
  hashPassword: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }

  // fullName: {
  //   type: String,
  //   trim: true,
  //   required: true
  // },
  // email: {
  //   type: String,
  //   unique: true,
  //   lowercase: true,
  //   trim: true,
  //   required: true
  // },
  // hash_password: {
  //   type: String,
  //   required: true
  // },
  // created: {
  //   type: Date,
  //   default: Date.now
  // }
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hashPassword);
};

mongoose.model('User', UserSchema);
