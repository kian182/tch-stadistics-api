'use strict';

module.exports = app => {
  var todoList = require('../controllers/todoListController');
  var userHandlers = require('../controllers/user.cntrl.js');
  var licGeneratorHandlers = require('../controllers/licGenerator.cntrl.js');
  var licTypeHandlers = require('../controllers/licenseType.cntrl.js');
  var historyHandlers = require('../controllers/history.cntrl');

  // todoList koRoutes
  // app.route('/tasks')
  //   .get(todoList.list_all_tasks)
  //   .post(userHandlers.loginRequired, todoList.create_a_task);
  //
  // app.route('/tasks/:taskId')
  //   .get(todoList.read_a_task)
  //   .put(todoList.update_a_task)
  //   .delete(todoList.delete_a_task);

  app.route('/users')
    .post(userHandlers.register)

  app.route('/auth/login')
    .post(userHandlers.signIn)

  app.route('/auth/logout')
    .delete(userHandlers.loginRequired, userHandlers.logout)

  app.route('/config/licenseType')
    .get(userHandlers.loginRequired, licTypeHandlers.readLicenseTypes)
    .put(userHandlers.loginRequired, licTypeHandlers.updateLicenseType)

  /***
   * query params
   * format: "tree"
   * ***/
  app.route('/licenses')
    .get(userHandlers.loginRequired, historyHandlers.licensesList)
    .post(userHandlers.loginRequired, licGeneratorHandlers.licGenerate)

  // app.route('/licenses/tree')
  //   .get(historyHandlers.licensesListTree)

  app.route('/licenses/:licenseId')
    .delete(userHandlers.loginRequired, licGeneratorHandlers.deleteLicense)
    .get(userHandlers.loginRequired, licGeneratorHandlers.getLicense)

  app.route('/licenses/search/macAddress')
    .get(userHandlers.loginRequired, historyHandlers.listAllMacAddress)

  app.route('/licenses/search/licenseTo')
    .get(userHandlers.loginRequired, historyHandlers.listAllLicenseTo)
};