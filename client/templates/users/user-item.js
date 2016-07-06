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
        console.log('organisationName this', this);
        //console.log('this.organisations.findOne().name', Users.build(this).organisations.findOne().name);
        var organisationId = this.organisationIds && this.organisationIds[0];
        if (organisationId) {
            return Organisations.findOne(organisationId).get('name');
        } else {
            return "None";
        }
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

    'change .js-is-admin':function(e){
    //'change input[type=checkbox]':function(e){
        console.log('e', e.currentTarget.checked);
        if (e.currentTarget.checked) {
            Roles.addUsersToRoles(this._id, ['admin']);
        } else {
            Roles.removeUsersFromRoles(this._id, ['admin']);
        }
    },

    'mousedown .js-select-organisation, click .js-select-organisation': function(event) {

        var userId = event.currentTarget.getAttribute('user');
        var user = Users.build(Users.findOne(userId));
        var organisation = Organisations.findOne(event.currentTarget.id);
        user.setOrganisation(organisation);
    },

    'click .js-change-password': function(event) {

        var self = this;

        event.preventDefault();

        var modalBody = Template.setPasswordModal.renderFunction().value;
        bootbox.formModal({
            title: "Change password",
            value: modalBody,
            fields: {
                password: 'password'
            },
            callback: function (result) {

                if (result === null) {
                    //Example.show("Prompt dismissed");
                } else {
                    console.log('Change password result', result);
                    console.log('Change password self._id', self._id);
                    Meteor.call('changeUserPassword', self._id, result.password, function(error, response) {

                        if (error) {console.error('Error changing user password', error)}
                    });
                }
            }
        });
    },

    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-delete-item, click .js-delete-item': function() {
      Users.remove(this._id);
    }
});