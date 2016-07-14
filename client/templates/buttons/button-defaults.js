
Template.buttonDefaultsModal.events({

    'change input[type=text], keyup input[type=text], keyup textarea': _.throttle(function(event) {
        console.log('edit event', event);
        var data = {};
        data[event.target.id] = event.target.value;
        console.log('data ', data );
        console.log('this._id', this._id);
        Buttons.update(this._id, {$set: data});
        //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300)
});


Template.buttonDefaultsModal.helpers({
    /*
    tabs: function () {
        // Every tab object MUST have a name and a slug!
        return [
            { name: 'Config', slug: 'config' },
            { name: 'Messages', slug: 'messages' }
        ];
    },
    activeTab: function () {
        // Use this optional helper to reactively set the active tab.
        // All you have to do is return the slug of the tab.

        // You can set this using an Iron Router param if you want--
        // or a Session variable, or any reactive value from anywhere.

        // If you don't provide an active tab, the first one is selected by default.
        // See the `advanced use` section below to learn about dynamic tabs.
        return Session.get('activeTab'); // Returns "people", "places", or "things".
    }
    */
});
