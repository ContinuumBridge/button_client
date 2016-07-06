var EDITING_KEY = 'EDITING_SCREENSET_ID';

Template.screensetItem.helpers({
  checkedClass: function() {
    return this.checked && 'checked';
  },
  editingClass: function() {
    return Session.equals(EDITING_KEY, this._id) && 'editing';
  },
  stateColour: function() {
    return this.state == 'Pressed' ? 'green' : '';
  }
});

Template.screensetItem.events({

  'focus input[type=text]': function(event) {
    Session.set(EDITING_KEY, this._id);
  },
  
  'blur input[type=text]': function(event) {
    if (Session.equals(EDITING_KEY, this._id))
      Session.set(EDITING_KEY, null);
  },
  
  'keydown input[type=text]': function(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },
  
  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once 
  // every 300ms)
  'keyup input[type=text]': _.throttle(function(event) {
      console.log('organisation edit event', event);
      var data = {};
      data[event.target.id] = event.target.value;
      Organisations.update(this._id, {$set: data});
  }, 300),

  'mousedown .js-edit-screenset, click .js-edit-screenset': function(event) {

      console.log('edit screenset this', this);

      FlowRouter.go('/screensets/' + this._id);
      /*
      console.log('view-lists', event.target);
      var user = Users.build(Meteor.user());
      user.setOrganisation(this);
      */
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-delete-item, click .js-delete-item': function() {
      Meteor.call('removeScreenset', this._id);
      //Screensets.remove(this._id);
  }
});