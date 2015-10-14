Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
      Meteor.subscribe('publicLists'),
      Meteor.subscribe('privateLists'),
      Meteor.subscribe('organisations'),
      Meteor.subscribe('lists')
    ];
  }
});

dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  dataReadyHold = LaunchScreen.hold();

  // Show the loading screen on desktop
  Router.onBeforeAction('loading', {except: ['join', 'signin']});
  Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});

  var organisation = Users.build(Meteor.userId).organisations.findOne();
  if (organisation) Session.setDefault('organisation', organisation._id);
}

Router.map(function() {
  this.route('join');
  this.route('signin');

  this.route('listShow', {
    path: '/lists/:_id',
    // subscribe to buttons before the page is rendered but don't wait on the
    // subscription, we'll just render the items as they arrive
    onBeforeAction: function () {
      this.buttonsHandle = Meteor.subscribe('buttons', this.params._id);

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
      }
      this.next();
    },
    data: function () {
      console.log('Lists.findOne(this.params._id)', Lists.findOne(this.params._id));
      return Lists.findOne(this.params._id);
    },
    action: function () {
      this.render();
    }
  });

  this.route('usersShow', {
    path: '/users/:_id',
    // subscribe to buttons before the page is rendered but don't wait on the
    // subscription, we'll just render the items as they arrive
    onBeforeAction: function () {
      console.log('onBeforeAction this.params', this.params);
      this.usersHandle = Meteor.subscribe('users');
      //this.usersHandle = Meteor.subscribe('users', this.params._id);

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
      }
      this.next();
    },
    /*
    data: function () {
      return Users;
    },
    */
    action: function () {
      this.render();
    }
  });

  this.route('organisationsShow', {
    path: '/organisations/:_id',
    // subscribe to buttons before the page is rendered but don't wait on the
    // subscription, we'll just render the items as they arrive
    onBeforeAction: function () {
      this.organisationsHandle = Meteor.subscribe('organisations');

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
      }
      this.next();
    },
    /*
    data: function () {
      return Users;
    },
    */
    action: function () {
      this.render();
    }
  });

  this.route('home', {
    path: '/',
    action: function() {
      Router.go('listShow', Lists.findOne());
    }
  });
});
