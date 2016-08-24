
Template.buttonDefaultsModal.events(_.defaults({

    'change input[type=text], keyup input[type=text], keyup textarea': _.throttle(function(event) {
        console.log('edit event', event);
        var data = {};
        data[event.target.id] = event.target.value;
        console.log('data ', data );
        console.log('this._id', this._id);
        Buttons.update(this._id, {$set: data});
        //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300)
}, ScreensetsDropdown.events));


Template.buttonDefaultsModal.helpers(ScreensetsDropdown.helpers);
