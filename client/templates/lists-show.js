var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.listsShow.onRendered(function() {
  if (firstRender) {
    // Released in app-body.js
    listFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    listRenderHold.release();

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

Template.listsShow.helpers({
  editing: function() {
    return Session.get(EDITING_KEY);
  },

  buttonsReady: function() {
    return Router.current().buttonsHandle.ready();
  },

  buttons: function(listId) {
    return Buttons.find({listId: listId}, {sort: {name : 1}});
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

  var message = "Are you sure you want to delete the list " + list.name + "?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    Buttons.find({listId: list._id}).forEach(function(button) {
      Buttons.remove(button._id);
    });
    Lists.remove(list._id);

    Router.go('home');
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

Template.listsShow.events({
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

    var modalBody = Template.addItemModal.renderFunction().value;
    console.log('modal body', modalBody);
    bootbox.addItem({
      title: "Add a button",
      value: modalBody,
      callback: function(result) {
        if (result === null) {
          //Example.show("Prompt dismissed");
        } else {
          console.log('submitted', result);
          console.log('Buttons', Buttons);
          console.log('self._id', self._id);
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
      }
    });
    //$('#add-item-modal').modal()
    /*
    var $input = $(event.target).find('[type=text]');
    if (! $input.val())
      return;
    
    Buttons.insert({
      listId: this._id,
      text: $input.val(),
      checked: false,
      createdAt: new Date()
    });
    Lists.update(this._id, {$inc: {incompleteCount: 1}});
    $input.val('');
    */
  }
});
