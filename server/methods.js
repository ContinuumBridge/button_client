


Meteor.methods({

  changeUserPassword: function (userId, newPassword) {

      var future = new Future();

      var error = false;
      try {
          Accounts.setPassword(userId, newPassword);
      } catch (e) {
          console.log('error', e);
          error = e;
      }

      if (error) {
          future.throw(error);
      } else {
          future.return(false);
      }

      return future.wait();
  }
});

Meteor.startup(function () {
// code to run on server at startup
Future = Npm.require('fibers/future');

});
