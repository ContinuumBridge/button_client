var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);

var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);

var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

var ORGANISATION_KEY = 'organisation';

var CONNECTION_ISSUE_TIMEOUT = 5000;

Meteor.startup(function () {
  // set up a swipe left / right handler
  $(document.body).touchwipe({
    wipeLeft: function () {
      Session.set(MENU_KEY, false);
    },
    wipeRight: function () {
      Session.set(MENU_KEY, true);
    },
    preventDefaultEvents: false
  });

  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(function () {
    // FIXME
    // Launch screen handle created in lib/router.js
    //dataReadyHold.release();

    // Show the connection error box
    Session.set(SHOW_CONNECTION_ISSUE_KEY, true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.appBody.onCreated(function() {
  var self = this;
  self.autorun(function() {
    //var postId = FlowRouter.getParam('postId');
    self.subscribe('lists');
    self.subscribe('organisations');
    self.subscribe('users');
  });
});

Template.appBody.onRendered(function() {
  this.find('#content-container')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn(function () {
          //listFadeInHold.release();
        });
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };
});

Template.appBody.helpers({
  hasReactComponent: function() {
      return !_.isUndefined(FlowRouter.current().route.options.reactComponent);
  },
  reactComponent: function() {
      return FlowRouter.current().route.options.reactComponent();
  },
  // We use #each on an array of one item so that the "list" template is
  // removed and a new copy is added when changing lists, which is
  // important for animation purposes. #each looks at the _id property of it's
  // items to know when to insert a new item and when to update an old one.
  thisArray: function() {
    return [this];
  },
  menuOpen: function() {
    return Session.get(MENU_KEY) && 'menu-open';
  },
  cordova: function() {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart: function() {
    var email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },
  userMenuOpen: function() {
    return Session.get(USER_MENU_KEY);
  },
  currentOrganisation: function() {

    return Users.build(Meteor.user()).organisations.findOne();
  },
  currentOrganisationName: function() {
    var organisation = Meteor.getCurrentOrganisation();
    if (organisation) {
      return organisation.get('name');
    } else {
      return "No Organisation Selected"
    }
  },
  lists: function() {
    //var organisationId = Session.get(ORGANISATION_KEY);
    var organisation = Meteor.getCurrentOrganisation();
    console.log('getCurrentOrganisation organisation ', organisation );
    if (organisation) {
      return Lists.find({organisationId: organisation._id});
    } else {
      return [];
    }
  },
  activeListClass: function() {
    return;
    // FIXME
    /*
    var current = Router.current();
    if (current.route.name === 'listsShow' && current.params._id === this._id) {
      return 'active';
    }
    */
  },
  connected: function() {
    if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
      return Meteor.status().connected;
    } else {
      return true;
    }
  }
});

Template.appBody.events({
  'click .js-menu': function() {
    Session.set(MENU_KEY, ! Session.get(MENU_KEY));
  },

  'click .content-overlay': function(event) {
    Session.set(MENU_KEY, false);
    event.preventDefault();
  },

  'click .js-user-menu': function(event) {
    Session.set(USER_MENU_KEY, ! Session.get(USER_MENU_KEY));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click #menu a': function() {
    Session.set(MENU_KEY, false);
  },

  'click .js-logout': function() {
    Meteor.logout();

    Router.go('signin');

    // if we are on a private list, we'll need to go to a public one
    /*
    var current = Router.current();
    if (current.route.name === 'listShow' && current.data().userId) {
      Router.go('listsShow', Lists.findOne({userId: {$exists: false}}));
    }
    */
  },

  'click .js-new-list': function() {
    console.log('Meteor.getCurrentOrganisation()._id', Meteor.getCurrentOrganisation()._id);
    var list = {name: Lists.defaultName(), organisationId: Meteor.getCurrentOrganisation()._id};
    list._id = Lists.insert(list);

    Router.go('listShow', list);
  }
});
