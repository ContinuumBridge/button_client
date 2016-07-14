var EDITING_KEY = 'EDITING_TODO_ID';

Template.buttonsItem.helpers({
    /*
    buttonAction: function() {
        switch (this.attributes.status) {
            case 'normal':
                return 'Press';
                break;
            case 'pressed':
                return 'Override';
                break;
            case 'acknowledged':
                return 'Reset';
                break;
            default:
                return '';
        }
    },
    */
    ledColour: function() {

        if (this.attributes.showCustom) return "green";

        switch (this.attributes.status) {
            case 'normal':
                return 'off';
                break;
            case 'pressed':
                return 'amber';
                break;
            default:
                return 'off';
        }
    },
    ledLabel: function() {

        if (this.attributes.showCustom) return "Custom: " + this.attributes.customMessage;

        switch (this.attributes.status) {
            case 'normal':
                return 'Normal: ' + this.attributes.normalMessage;
                break;
            case 'pressed':
                return 'Pressed: ' + this.attributes.pressedMessage;
                break;
            default:
                return this.attributes.status;
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

    'change .js-show-custom': function(event) {
    //'change [type=checkbox]': function(event) {
        //var checked = $(event.target).is(':checked');
        //var data = {};
        //data[event.target.id] = checked;
        //event.currentTarget.checked
        Buttons.update(this._id, {$set: {showCustom: event.currentTarget.checked}});
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

    //'mousedown .js-button-action, click .js-button-action': function(event) {
    /*
    'mousedown .js-button-action': function(event) {

        console.log('js-button-action this', this);
        var newStatus;
        switch(this.attributes.status) {
            case 'normal':
                newStatus = 'pressed';
                break;
            case 'pressed':
                newStatus = 'acknowledged';
                break;
            case 'acknowledged':
                newStatus = 'normal';
                break;
            default:
                newStatus = 'normal';
                break;
        }
        Buttons.update(this._id, {$set: {status: newStatus}});
        //Modal.show('buttonConfigModal', this);
    },
    */

    'mousedown .js-button-config, click .js-button-config': function(event) {

        console.log('Modal show this', this);
        console.log('Buttons.findOne(this._id)', Buttons.findOne(this._id));
        //Modal.show('buttonConfigModal', function() { return Buttons.findOne(this._id)});
        // Don't use this._id directly, otherwise reactivness doesn't work :S
        var id = this._id;
        Modal.show('buttonConfigModal', function() { 
            return Buttons.findOne({_id: id});
        });
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

Template.buttonsItem.onRendered(function() {
    // Activate the tooltip(s)
    var el = this.find('[data-toggle="tooltip"]');
    var $el = $(el);
    //console.log('buttonsItem onRendered el', $el);
    $el.tooltip();
});
