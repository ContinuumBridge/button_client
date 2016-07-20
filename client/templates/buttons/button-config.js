
//var navDep = new Deps.Dependency;

/*
ReactiveTabs.createInterface({
    template: 'spurTabs',
    onChange: function (slug, template) {
        // This callback runs every time a tab changes.
        // The `template` instance is unique per {{#basicTabs}} block.
        //console.log('[tabs] Tab has changed! Current tab:', slug);
        //console.log('[tabs] Template instance calling onChange:', template);
    }
});
*/

/*
Template.buttonConfigModal.rendered = function(){
    console.log('buttonConfigModal.rendered');
    //navDep.changed();
};

Template.buttonConfigModal.onCreated(function() {
    
    this.screensetName = new ReactiveVar(String("None"));
    var screenset = Screensets.findOne(this.attributes.screensetId);
    screenset.observeChanges({
        changed: function(a, b) {
            console.log('screenset changed', a, b);
        }
    })
});
*/

Template.buttonConfigModal.events({

    'change [type=checkbox]': function(event) {
        var checked = $(event.target).is(':checked');
        var data = {};
        data[event.target.id] = checked;
        Buttons.update(this._id, {$set: data});
    },
    
    // update the text of the item on keypress but throttle the event to ensure
    // we don't flood the server with updates (handles the event at most once
    // every 300ms)
    //'keyup input[type=text]': _.throttle(function(event) {
    'keyup textarea, keyup input[type=text], change input[type=text]': _.throttle(function(event) {
        console.log('edit event', event);
        var data = {};
        data[event.target.id] = event.target.value;
        Buttons.update(this._id, {$set: data});
        //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300),
    
    'mousedown .js-select-screenset, click .js-select-screenset': function(event) {

        event.preventDefault();
        
        // Callback has context of the screenset
        var buttonId = event.currentTarget.getAttribute('buttonId');
        console.log('event.currentTarget.id', event.currentTarget.id);
        Buttons.update(buttonId, {$set: {screensetId: event.currentTarget.id}});
    }
});

Template.buttonConfigModal.helpers(ScreensetsDropdown.helpers);
