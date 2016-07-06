var ERRORS_KEY = 'appErrors';

var EDITING_KEY = 'editingUser';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
/*
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
usersFadeInHold = null;
*/

Template.usersShow.onRendered(function() {
  /*
  if (firstRender) {
    // Released in app-body.js
    usersFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    //usersRenderHold.release();

    firstRender = false;
  }
  */

  this.find('.js-title-nav')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        this.remove();
      });
    }
  };
});

Template.usersShow.helpers({
  editing: function() {
    return Session.get(EDITING_KEY);
  },

  /*
  usersReady: function() {
    return Router.current().usersHandle.ready();
  },
  */

  users: function(listId) {
    return Users.find({});
  }
});

var editList = function(list, template) {
  Session.set(EDITING_KEY, true);
  
  // force the template to redraw based on the reactive change
  Tracker.flush();
  template.$('.js-edit-form input[type=text]').focus();
};

var saveList = function(list, template) {
  Session.set(EDITING_KEY, false);
  Lists.update(list._id, {$set: {name: template.$('[name=name]').val()}});
}

Template.usersShow.events({
  'click .js-cancel': function() {
    Session.set(EDITING_KEY, false);
  },
  
  'keydown input[type=text]': function(event) {
    // ESC
    if (27 === event.which) {
      event.preventDefault();
      $(event.target).blur();
    }
  },
  
  'blur input[type=text]': function(event, template) {
    // if we are still editing (we haven't just clicked the cancel button)
    if (Session.get(EDITING_KEY))
      saveList(this, template);
  },

  'submit .js-edit-form': function(event, template) {
    event.preventDefault();
    saveList(this, template);
  },
  
  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel': function(event) {
    event.preventDefault();
    Session.set(EDITING_KEY, false);
  },

  'change .list-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editList(this, template);
    } else if ($(event.target).val() === 'delete') {
      deleteList(this, template);
    } else {
      toggleListPrivacy(this, template);
    }

    event.target.selectedIndex = 0;
  },
  
  'click .js-edit-list': function(event, template) {
    editList(this, template);
  },
  
  'click .js-toggle-list-privacy': function(event, template) {
    toggleListPrivacy(this, template);
  },
  
  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },

  /*
  'click .js-button-add': function(event, template) {
    template.$('.js-button-new input').focus();
  },
  */
  'click .js-item-add': function(event) {

    var self = this;

    event.preventDefault();

    var modalBody = Template.addUserModal.renderFunction().value;
    bootbox.formModal({
      title: "Add a user",
      value: modalBody,
      fields: {
          email: 'email',
          password: 'password',
          isAdmin: 'checkbox'
      },
      callback: function(result) {

          if (result === null) {
            //Example.show("Prompt dismissed");
          } else {
              console.log('result', result);
              var userId = Accounts.createUser({
                      email: result.email,
                      password: result.password
                  }, function(error) {
                      if (error) {
                          return Session.set(ERRORS_KEY, {'none': error.reason});
                      }
                  }
              );
              if (result.isAdmin) {
                  Roles.addUsersToRoles(userId, ['admin']);
              }
          }

        /*
        if (result === null) {
          //Example.show("Prompt dismissed");
        } else {
          Buttons.insert({
            listId: self._id,
            enabled: true,
            id: result.id,
            name: result.name,
            email: result.email,
            sms: result.sms,
            createdAt: new Date()
          });
          Lists.update(this._id, {$inc: {incompleteCount: 1}});
          //Example.show("Hi <b>"+result+"</b>");
        }
         */
      }
    });
  }
});
