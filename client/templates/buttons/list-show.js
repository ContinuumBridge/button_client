var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
//var listRenderHold = LaunchScreen.hold();
//listFadeInHold = null;

Template.listShow.onCreated(function() {
    var self = this;
    self.autorun(function() {
        var listId = FlowRouter.getParam('listId');
        console.log('listId ', listId );
        self.subscribe('buttons', listId);
        self.subscribe('lists', listId);
    });
});

Template.listShow.onRendered(function() {
    /*
  if (firstRender) {
    // Released in app-body.js
    //listFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    //listRenderHold.release();

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

Template.listShow.helpers({
    
    editing: function() {
      return Session.get(EDITING_KEY);
    },
    
    list: function() {
        var list = Lists.findOne(FlowRouter.getParam('listId'));
        console.log('helpers list ', list );
        return list;
    },
    
    buttons: function() {
        
        var listId = FlowRouter.getParam('listId');
        return Buttons.find({listId: listId, listDefault: {$ne: true}}, {sort: {name : 1}});
        //return Buttons.find({listId: listId, listDefault: {$ne: true}}, {sort: {name : 1}});
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

var deleteList = function(list) {
  // ensure the last public list cannot be deleted.
  /*
  if (! list.userId && Lists.find({userId: {$exists: false}}).count() === 1) {
    return alert("Sorry, you cannot delete the final public list!");
  }
  */
    console.log('list', list.content());

  var message = "Are you sure you want to delete this list?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    Buttons.find({listId: list._id}).forEach(function(button) {
      Buttons.remove(button._id);
    });
    Lists.remove(list._id);

    FlowRouter.go('home');
    return true;
  } else {
    return false;
  }
};

var toggleListPrivacy = function(list) {
  if (! Meteor.user()) {
    return alert("Please sign in or create an account to make private lists.");
  }

  if (list.userId) {
    Lists.update(list._id, {$unset: {userId: true}});
  } else {
    // ensure the last public list cannot be made private
    /*
    if (Lists.find({userId: {$exists: false}}).count() === 1) {
      return alert("Sorry, you cannot make the final public list private!");
    }
    */

    Lists.update(list._id, {$set: {userId: Meteor.userId()}});
  }
};

Template.listShow.events({

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

    /*
    'click .js-toggle-list-privacy': function(event, template) {
        toggleListPrivacy(this, template);
    },
    */

    'mousedown .js-edit-defaults': function(event) {

        //var defaultButton = this.getDefaultButton(this);
        var list = Lists.findOne(FlowRouter.getParam('listId'));
        //console.log('defaultButton ', defaultButton );
        Modal.show('buttonDefaultsModal', list.getDefaultButton());
    },

    /*
    'mousedown .js-edit-config': function(event) {

        var defaultButton = this.getDefaultButton(this);
        Modal.show('buttonConfigDefaultsModal', defaultButton);
    },
    */

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

        var list = Lists.findOne(FlowRouter.getParam('listId'));
        console.log('list ', list );
        var defaultButton = list.getDefaultButton();
        console.log('defaultButton ', defaultButton );
       
        Modal.show('addButtonModal', list.getDefaultButton());
    }
});
