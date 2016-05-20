var EDITING_KEY = 'editingScreenset';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the screenset template is rendered
var firstRender = true;
var screensetRenderHold = LaunchScreen.hold();
screensetFadeInHold = null;

Template.screensetsShow.onRendered(function() {
  if (firstRender) {
    // Released in app-body.js
    screensetFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    screensetRenderHold.release();

    firstRender = false;
  }

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

  screensetsReady: function() {
    return Router.current().screensetsHandle.ready();
  },

  screensets: function(screensetId) {
    return Screensets.find({});
    //return Buttons.find({screensetId: screensetId}, {sort: {name : 1}});
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
  // ensure the last public screenset cannot be deleted.
  /*
  if (! screenset.userId && screensets.find({userId: {$exists: false}}).count() === 1) {
    return alert("Sorry, you cannot delete the final public screenset!");
  }
  */

  var message = "Are you sure you want to delete the screenset " + screenset.name + "?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    /*
    Buttons.find({organisationId: organisation._id}).forEach(function(button) {
      Buttons.remove(button._id);
    });
    organisations.remove(organisation._id);
    */

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

  'change .screenset-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editscreenset(this, template);
    } else if ($(event.target).val() === 'delete') {
      deletescreenset(this, template);
    } 

    event.target.selectedIndex = 0;
  },
  
  'click .js-edit-screenset': function(event, template) {
    editscreenset(this, template);
  },
  
  'click .js-delete-screenset': function(event, template) {
    deletescreenset(this, template);
  },

  /*
  'click .js-button-add': function(event, template) {
    template.$('.js-button-new input').focus();
  },
  */

  'click .js-item-add': function(event) {

    var self = this;

    event.preventDefault();

    var modalBody = Template.addScreensetModal.renderFunction().value;
    console.log('modal body', modalBody);
    bootbox.formModal({
      title: "Add a screenset",
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
          Screensets.insert({
            id: result.id,
            name: result.name,
            createdAt: new Date()
          });
        }
      }
    });
  }
});
