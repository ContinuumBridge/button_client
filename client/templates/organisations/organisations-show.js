var EDITING_KEY = 'editingOrganisation';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the organisation template is rendered
var firstRender = true;
var organisationRenderHold = LaunchScreen.hold();
organisationFadeInHold = null;

Template.organisationsShow.onCreated(function() {
  /*
    var self = this;
    self.autorun(function() {
        var listId = FlowRouter.getParam('listId');
        console.log('listId ', listId );
        self.subscribe('buttons', listId);
        self.subscribe('lists', listId);
    });
  */
});

Template.organisationsShow.onRendered(function() {
  /*
  if (firstRender) {
    // Released in app-body.js
    organisationFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    organisationRenderHold.release();

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

Template.organisationsShow.helpers({
  editing: function() {
    return Session.get(EDITING_KEY);
  },

  /*
  organisationsReady: function() {
    return Router.current().organisationsHandle.ready();
  },
  */

  organisations: function(organisationId) {
    return Organisations.find({});
    //return Buttons.find({organisationId: organisationId}, {sort: {name : 1}});
  }
});

var editOrganisation = function(organisation, template) {
  Session.set(EDITING_KEY, true);
  
  // force the template to redraw based on the reactive change
  Tracker.flush();
  template.$('.js-edit-form input[type=text]').focus();
};

var saveOrganisation = function(organisation, template) {
  Session.set(EDITING_KEY, false);
  organisations.update(organisation._id, {$set: {name: template.$('[name=name]').val()}});
}

var deleteOrganisation = function(organisation) {
  // ensure the last public organisation cannot be deleted.
  /*
  if (! organisation.userId && organisations.find({userId: {$exists: false}}).count() === 1) {
    return alert("Sorry, you cannot delete the final public organisation!");
  }
  */

  var message = "Are you sure you want to delete the organisation " + organisation.name + "?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    Buttons.find({organisationId: organisation._id}).forEach(function(button) {
      Buttons.remove(button._id);
    });
    organisations.remove(organisation._id);

    Router.go('home');
    return true;
  } else {
    return false;
  }
};

var toggleorganisationPrivacy = function(organisation) {
  if (! Meteor.user()) {
    return alert("Please sign in or create an account to make private organisations.");
  }

  if (organisation.userId) {
    organisations.update(organisation._id, {$unset: {userId: true}});
  } else {
    // ensure the last public organisation cannot be made private
    /*
    if (organisations.find({userId: {$exists: false}}).count() === 1) {
      return alert("Sorry, you cannot make the final public organisation private!");
    }
    */

    organisations.update(organisation._id, {$set: {userId: Meteor.userId()}});
  }
};

Template.organisationsShow.events({
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
      saveorganisation(this, template);
  },

  'submit .js-edit-form': function(event, template) {
    event.preventDefault();
    saveorganisation(this, template);
  },
  
  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel': function(event) {
    event.preventDefault();
    Session.set(EDITING_KEY, false);
  },

  'change .organisation-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editorganisation(this, template);
    } else if ($(event.target).val() === 'delete') {
      deleteorganisation(this, template);
    } else {
      toggleorganisationPrivacy(this, template);
    }

    event.target.selectedIndex = 0;
  },
  
  'click .js-edit-organisation': function(event, template) {
    editorganisation(this, template);
  },
  
  'click .js-toggle-organisation-privacy': function(event, template) {
    toggleorganisationPrivacy(this, template);
  },
  
  'click .js-delete-organisation': function(event, template) {
    deleteorganisation(this, template);
  },

  /*
  'click .js-button-add': function(event, template) {
    template.$('.js-button-new input').focus();
  },
  */

  'click .js-item-add': function(event) {

    var self = this;

    event.preventDefault();

    var modalBody = Template.addOrganisationModal.renderFunction().value;
    console.log('modal body', modalBody);
    bootbox.formModal({
      title: "Add an organisation",
      value: modalBody,
      fields: {
          name: 'text'
      },
      callback: function(result) {
        if (result === null) {
          //Example.show("Prompt dismissed");
        } else {
          console.log('submitted', result);
          console.log('self._id', self._id);
          Organisations.insert({
            id: result.id,
            name: result.name,
            createdAt: new Date()
          });
        }
      }
    });
  }
});
