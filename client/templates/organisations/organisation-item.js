var EDITING_KEY = 'EDITING_ORGANISATION_ID';

Template.organisationItem.helpers({
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

Template.organisationItem.events({

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
    //Buttons.update(this._id, {$set: {text: event.target.value}});
  }, 300),

  'mousedown .js-view-lists, click': function() {
    Router.go('listsShow', Lists.findOne({userId: {$exists: false}}));
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-delete-item, click .js-delete-item': function() {
    Organisations.remove(this._id);
  }
});