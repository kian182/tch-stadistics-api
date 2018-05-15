'use strict';
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import TK from "../services/token.service"
import utils from "../utils/utils.service";

const User = mongoose.model('User');

exports.register = (req, res) => {
  let newUser = new User(req.body);
  newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function (err, user) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      user.hashPassword = undefined;
      user = {
        user: user.username,
        created: user.created
      };
      return res.json(user);
    }
  });
};

exports.signIn = (req, res) => {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err) throw err;

    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(401).json({message: 'Authentication failed. Invalid username or password.'});
    }

    let userObj = {
      username:user.username,
      created:user.created,
      _id:user._id
    }

    TK.updateToken(user._id).then((tkDetails) => {
      return res.json({
        token: tkDetails.tk,
        expirationDate: tkDetails.expirationDate,
        creationDate: tkDetails.creationDate,
        user:userObj,
        buildNumber:utils.getBuildNumber()
      })
    }).catch(()=>{
      return TK.create(user._id).then((tkDetails) => {
        return res.json({
          token: tkDetails.tk,
          expirationDate: tkDetails.expirationDate,
          creationDate: tkDetails.creationDate,
          user:userObj,
          buildNumber:utils.getBuildNumber()||''
        })
      });
    });
  });
};

exports.logout = (req, res) =>{
  let tk =  req.headers.authorization.split(' ')[1];
  return TK.deleteOne('tk', tk).then(()=>{
    return res.json({message: 'Successfully logged out'});
  }).catch(()=>{
    return res.status(401).json({message: 'User not logged'});
  });
};

exports.loginRequired = (req, res, next) => {
  if (req.userId) {
    next();
  } else {
    return res.status(403).json({message: 'Unauthorized user!'});
  }
};