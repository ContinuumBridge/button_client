
Template.addButtonModal.events({

    'submit .modal-form': function(event) {

        event.preventDefault();

        var target = event.target;
        //console.log('this._id', this.get('listId'));
        //console.log('submit ', event.target.enabled.value);
        var buttonId = Buttons.insert({
            listId: this.get('listId'),
            enabled: false,
            //id: result.id,
            name: target.name.value,
            email: target.email.value,
            sms: target.sms.value,
            normalMessage: target.normalMessage.value,
            pressedMessage: target.pressedMessage.value,
            overrideMessage: target.overrideMessage.value,
            createdAt: new Date()
        });

        Modal.hide();
    }
    // update the text of the item on keypress but throttle the event to ensure
    // we don't flood the server with updates (handles the event at most once
    // every 300ms)
    //'keyup input[type=text]': _.throttle(function(event) {
    /*
    'keyup textarea': _.throttle(function(event) {
        console.log('edit event', event);
        var data = {};
        data[event.target.id] = event.target.value;
        console.log('data ', data );
        console.log('this._id', this._id);
        Buttons.update(this._id, {$set: data});
        //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300)
    */
});
