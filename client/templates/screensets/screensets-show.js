var EDITING_KEY = 'editingScreenset';
Session.setDefault(EDITING_KEY, false);

Template.screensetsShow.onCreated(function() {
    var self = this;
    self.autorun(function() {
        self.subscribe('screensets');
    });
});

Template.screensetsShow.onRendered(function() {

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

Template.screensetsShow.helpers({
  
  editing: function() {
    
      return Session.get(EDITING_KEY);
  },
  screensets: function() {

      //var user = Meteor.user();
      //var organisationId = user.organisationIds && user.organisationIds[0];
      var organisationId = Meteor.getCurrentOrganisationId();
      return Screensets.find({organisationId: organisationId});
  }
});

var editScreenset = function(screenset, template) {
  Session.set(EDITING_KEY, true);
  
  // force the template to redraw based on the reactive change
  Tracker.flush();
  template.$('.js-edit-form input[type=text]').focus();
};

var saveScreenset = function(screenset, template) {
  Session.set(EDITING_KEY, false);
  screensets.update(screenset._id, {$set: {name: template.$('[name=name]').val()}});
}

var deleteScreenset = function(screenset) {

  var message = "Are you sure you want to delete the screenset " + screenset.name + "?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    
    Router.go('home');
    return true;
  } else {
    return false;
  }
};

Template.screensetsShow.events({
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
      savescreenset(this, template);
  },

  'submit .js-edit-form': function(event, template) {
    event.preventDefault();
    savescreenset(this, template);
  },
  
  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel': function(event) {
    event.preventDefault();
    Session.set(EDITING_KEY, false);
  },

  /*
  'change .screenset-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editScreenset(this, template);
    } else if ($(event.target).val() === 'delete') {
      deleteScreenset(this, template);
    } 

    event.target.selectedIndex = 0;
  },
  */
  
  /*
  'click .js-edit-screenset': function(event, template) {
    editScreenset(this, template);
  },
  
  'click .js-delete-screenset': function(event, template) {
    deleteScreenset(this, template);
  },
  */

  'click .js-item-add': function(event) {

    var self = this;

    event.preventDefault();
    
    console.log('click .js-item-add');

    console.log('this', this);

    Modal.show('addScreensetModal');
    /*
    Screens.insert({
        name: 'Test',
        x: 50,
        y: 100,
        createdAt: new Date()
    });
    */
    /*
    var modalBody = Template.addScreensetModal.renderFunction().value;
    console.log('modal body', modalBody);
    bootbox.formModal({
      title: "Add a Screenset",
      value: modalBody,
      fields: {
          name: 'text'
      },
      callback: function(resuScreensets) {
        if (result === null) {
          //Example.show("Prompt dismissed");
        } else {
          console.log('submitted', result);
          Screensets.insert({
            name: result.name,
            createdAt: new Date()
          });
        }
      }
    });
    */
  }
});
