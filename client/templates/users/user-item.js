var EDITING_KEY = 'EDITING_USER_ID';

Template.userItem.helpers({
    primaryEmail: function() {
        return this.primaryEmail();
    },
    isAdmin: function() {
        return Roles.userIsInRole(this._id, ['admin']);
    },
    checkedClass: function() {
        return this.checked && 'checked';
    },
    editingClass: function() {
        return Session.equals(EDITING_KEY, this._id) && 'editing';
    },
    stateColour: function() {
        return this.state == 'Pressed' ? 'green' : '';
    },
    organisationName: function() {
        console.log('this', Users.build(this));
        //console.log('this.organisations.findOne().name', Users.build(this).organisations.findOne().name);
        var organisation = Users.build(this).organisations.findOne();
        return organisation ? organisation.get('name') : "None";
    },
    organisations: function() {
        return Organisations.find({});
    }
});

Template.userItem.events({

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
        Users.update(this._id, {$set: data});
        //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300),

    'mousedown .js-select-organisation, click .js-select-organisation': function(event) {
        var userId = event.currentTarget.getAttribute('user');
        var user = Users.build(Users.findOne(userId));
        _.each(user.organisations.find({}).fetch(), function(organisation) {
            console.log('organisation', organisation);
            user.organisations.remove(organisation);
        });
        var organisation = Organisations.findOne(event.currentTarget.id);
        user.organisations.add(organisation);
    },
    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-delete-item, click .js-delete-item': function() {
      Users.remove(this._id);
    }
});