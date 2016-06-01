
var ORGANISATION_KEY = 'organisation';
//Session.setDefault(ORGANISATION_KEY, false);

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
      Meteor.subscribe('users'),
      Meteor.subscribe('organisations'),
      Meteor.subscribe('lists')
      //Meteor.subscribe('buttons')
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

}

Router.onBeforeAction(function () {


    if (!Meteor.userId()) {
        Router.go('signin');
    }
    /*
    if (!Session.get(ORGANISATION_KEY)) {
        var organisation = Users.build(Meteor.user()).organisations.findOne();
        console.log('onBeforeAction organisation ', organisation );
        if (organisation) Session.set(ORGANISATION_KEY, organisation._id);
    }
    */

    this.next();
});

Router.map(function() {
  this.route('join');
  this.route('signin');

  this.route('listShow', {
    path: '/lists/:_id',
    // subscribe to buttons before the page is rendered but don't wait on the
    // subscription, we'll just render the items as they arrive
    onBeforeAction: function () {
      this.listHandle = Meteor.subscribe('buttons', this.params._id);

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
      }
      this.next();
    },
    data: function () {
      return Lists.findOne(this.params._id);
    },
    action: function () {
      this.render();
    }
  });

  this.route('usersShow', {
    path: '/users/',
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
    path: '/organisations',
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

  this.route('screensetsShow', {
    path: '/screensets',
    onBeforeAction: function () {
      this.screensetsHandle = Meteor.subscribe('screensets');

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
      }
      this.next();
    },
    action: function () {
      this.render();
    }
  });
  
  this.route('editScreenset', {
    path: '/screensets/:_id',
    onBeforeAction: function () {
      console.log('onBeforeAction this.params._id', this.params._id);
      this.screensetHandle = Meteor.subscribe('screens', this.params._id);
      //this.screensetsHandle = Meteor.subscribe('screensets');

      console.log('onBeforeAction');
      
      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
      }
      this.next();
    },
    waitOn: function(){
      return Meteor.subscribe("screensets", this.params._id);
    },
    /*
    screens: function() {
        
      return Meteor.findOne("screensets", this.params._id);
    },
    */
    data: function() {

      console.log('this.params._id', this.params._id);
      console.log('Screensets.findOne(this.params._id);', Screensets.findOne(this.params._id));
      return Screensets.findOne(this.params._id);
    }, 
    /*{
      screenset: function() { Screensets.findOne(this.params._id)},
      screens: function() { console.log('data screens this', this) }
    },*/
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
