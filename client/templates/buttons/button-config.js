
//var navDep = new Deps.Dependency;

ReactiveTabs.createInterface({
    template: 'spurTabs',
    onChange: function (slug, template) {
        // This callback runs every time a tab changes.
        // The `template` instance is unique per {{#basicTabs}} block.
        //console.log('[tabs] Tab has changed! Current tab:', slug);
        //console.log('[tabs] Template instance calling onChange:', template);
    }
});

/*
Template.buttonConfigModal.rendered = function(){
    console.log('buttonConfigModal.rendered');
    //navDep.changed();
};
*/

Template.buttonConfigModal.events({

    'change [type=checkbox]': function(event) {
        var checked = $(event.target).is(':checked');
        var data = {};
        data[event.target.id] = checked;
        Buttons.update(this.item._id, {$set: data});
    },
    // update the text of the item on keypress but throttle the event to ensure
    // we don't flood the server with updates (handles the event at most once
    // every 300ms)
    //'keyup input[type=text]': _.throttle(function(event) {
    'keyup textarea, keyup input[type=text]': _.throttle(function(event) {
        console.log('edit event', event);
        var data = {};
        data[event.target.id] = event.target.value;
        Buttons.update(this.item._id, {$set: data});
        //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300),
    'mousedown .js-select-screenset, click .js-select-screenset': function(event) {

        console.log('this', this);
        var buttonId = event.currentTarget.getAttribute('buttonId');
        console.log('buttonId ', buttonId );
        console.log('event.currentTarget.id', event.currentTarget.id);
        Buttons.update(buttonId, {$set: {screensetId: event.currentTarget.id}});
    },
});

Template.buttonConfigModal.helpers({
    tabs: function () {
        // Every tab object MUST have a name and a slug!
        return [
            { name: 'Config', slug: 'config', onRender: function() { console.log('Config tabs rendered')}},
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
    },
    screensetName: function() {
        //navDep.depend();
        //Screensets.findOne();
        console.log('screensetName this', this);
        var button = Buttons.findOne(this.item._id);
        var screensetId = this.item.screensetId;
        //if (Session.get('rerenderHack')) void(0);
        if (screensetId) {
            return Screensets.findOne(screensetId).get('name');
        } else {
            return "None";
        }
    },
    screensets: function() {

        var organisationId = Meteor.getCurrentOrganisationId();
        console.log('screensets organisationId ', organisationId );
        return Screensets.find({organisationId: organisationId});
    }
});

/*
Template.buttonMessagesModal.onRendered(function() {


    console.log('quill ');
    var quill = new Quill(this.$('#normalMessage')[0], {
        modules: {
            'toolbar': { container: '#full-toolbar' },
        },
        theme: 'snow'
    });
    //quill.addModule('toolbar', { container: '#toolbar' });
});
*/
