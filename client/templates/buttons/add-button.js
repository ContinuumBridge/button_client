
var SCREENSET_KEY = 'addButtonScreenset';
Session.setDefault(SCREENSET_KEY, false);

Template.addButtonModal.rendered = function() {
    
    // Initially set the screenset from the default button
    var screensetId = this.data.get('screensetId');
    if (screensetId)
        Session.set(SCREENSET_KEY, screensetId);
};

Template.addButtonModal.events({

    'mousedown .js-select-screenset, click .js-select-screenset': function(event) {

        console.log('event.currentTarget.id', event.currentTarget.id);
        event.preventDefault();
        var screensetId = event.currentTarget.id;
        Session.set(SCREENSET_KEY, screensetId);
    },
    
    'submit .modal-form': function(event) {

        event.preventDefault();

        var target = event.target;
        //console.log('this._id', this.get('listId'));
        //console.log('submit ', target.name.value);
        var buttonId = Buttons.insert({
            listId: this.get('listId'),
            enabled: false,
            id: target.buttonId.value,
            name: target.name.value,
            email: target.email.value,
            sms: target.sms.value,
            screensetId: Session.get(SCREENSET_KEY),
            /*
            normalMessage: target.normalMessage.value,
            pressedMessage: target.pressedMessage.value,
            customMessage: target.customMessage.value,
            */
            createdAt: new Date()
        });

        Modal.hide();
    }
});

Template.addButtonModal.helpers(_.defaults({
    screensetName: function() {
        var screensetId = Session.get(SCREENSET_KEY);
        return screensetId ? Screensets.findOne(screensetId).get('name') : "None";
    }
}, ScreensetsDropdown.helpers));
