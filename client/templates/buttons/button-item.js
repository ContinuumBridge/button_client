var EDITING_KEY = 'EDITING_TODO_ID';

Template.buttonsItem.helpers({
    buttonAction: function() {
        switch (this.attributes.status) {
            case 'pressed':
                return 'Acknowledge';
                break;
            case 'acknowledged':
                return 'Clear';
                break;
            case 'operational':
                return 'Press';
                break;
            default:
                return '';
        }
    },
    ledColour: function() {
        switch (this.attributes.status) {
            case 'pressed':
                return 'green';
                break;
            default:
                return 'off';
        }
    },
    signal: function() {
        var signal = this.attributes.signal;
        return signal ? signal : "-1";
    },
    checkedClass: function() {
        return this.checked && 'checked';
    },
    editingClass: function() {
        return Session.equals(EDITING_KEY, this._id) && 'editing';
    },
    statusColour: function() {
        var status = this.attributes.status;
        return status == 'pressed' ? 'green' : '';
    }
});

Template.buttonsItem.events({

    'change [type=checkbox]': function(event) {
        var checked = $(event.target).is(':checked');
        var data = {};
        data[event.target.id] = checked;
        Buttons.update(this._id, {$set: data});
        //console.log('checkbox checked', checked);
        //Buttons.update(this._id, {$set: {enabled: checked}});
        //Lists.update(this.listId, {$inc: {incompleteCount: checked ? -1 : 1}});
    },

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
      //console.log('edit event', event);
      var data = {};
      data[event.target.id] = event.target.value;
      Buttons.update(this._id, {$set: data});
      //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300),

    'mousedown .js-button-config, click .js-button-config': function(event) {

        //console.log('edit-messages', this);
        Modal.show('buttonConfigModal', this);
        //var user = Users.build(Meteor.user());
        //user.setOrganisation(this);
    },

    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-delete-item, click .js-delete-item': function() {
        //console.log('this._id', this._id);
        Buttons.remove(this._id);
        //if (! this.checked)
          //Lists.update(this.listId, {$inc: {incompleteCount: -1}});
    }
});