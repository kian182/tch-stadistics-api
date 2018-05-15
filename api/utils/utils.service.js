'use strict';

exports.generateUUID = () => {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

exports.addHoursToCurrentTime = (h) => {
  let d1 = new Date();
  let d2 = new Date(d1);
  return d2.setHours(d1.getHours() + h);
};

exports.convISODateToTimestamp = (ISODate) => {
  return new Date(ISODate).getTime();
};

exports.getBuildNumber = () => {
  let revision = require('child_process')
    .execSync('git rev-parse HEAD')
    .toString().trim()
  return revision.substring(0, 7)
}