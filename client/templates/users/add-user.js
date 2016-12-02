
var ORGANISATION_KEY = 'addUserOrganisation';
Session.setDefault(ORGANISATION_KEY, false);
var ERRORS_KEY = "addUserErrors";

Template.addUserModal.onCreated(function() {
  Session.set(ERRORS_KEY, {});
});

Template.addUserModal.helpers({
    
    organisationName: function() {
        var organisationId = Session.get(ORGANISATION_KEY);
        if (organisationId) {
            return Organisations.findOne(organisationId).get('name');
        } else {
            return "None";
        }
    },
    organisations: function() {
        return Organisations.find({});
    },
    errorMessages: function() {
        return _.values(Session.get(ERRORS_KEY));
    },
    errorClass: function(key) {
        return Session.get(ERRORS_KEY)[key] && 'error';
    }
});

Template.addUserModal.events({
    
    'mousedown .js-select-organisation, click .js-select-organisation': function(event) {

        event.preventDefault();
        var organisationId = event.currentTarget.id;
        Session.set(ORGANISATION_KEY, organisationId);
    },
    
    'submit .modal-form': function(event) {

        event.preventDefault();

        var target = event.target;
        console.log('target.email.value', target.email.value);
        console.log('target.password.value', target.password.value);
        console.log('target.isAdmin.value', target.isAdmin.checked);
        console.log('Session.get(ORGANISATION_KEY)', Session.get(ORGANISATION_KEY));
        var attrs = {
            email: target.email.value,
            password: target.password.value,
            isAdmin: target.isAdmin.checked,
            isReadOnly: target.isReadOnly.checked,
            organisationIds: [Session.get(ORGANISATION_KEY)]
        }
        
        Meteor.call('createAccountUser', attrs);

        /*
        if (error) {
            return Session.set(ERRORS_KEY, {'none': error.reason});
        }
        */
        /*
        //console.log('this._id', this.get('listId'));
        //console.log('submit ', event.target.enabled.value);
        var buttonId = Buttons.insert({
            listId: this.get('listId'),
            enabled: false,
            id: target.buttonId.value,
            name: target.name.value,
            email: target.email.value,
            sms: target.sms.value,
            normalMessage: target.normalMessage.value,
            pressedMessage: target.pressedMessage.value,
            customMessage: target.customMessage.value,
            createdAt: new Date()
        });
        */

        Modal.hide();
    }
});
