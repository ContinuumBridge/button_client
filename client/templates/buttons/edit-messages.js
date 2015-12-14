
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

Template.buttonMessagesModal.events({

    // update the text of the item on keypress but throttle the event to ensure
    // we don't flood the server with updates (handles the event at most once
    // every 300ms)
    //'keyup input[type=text]': _.throttle(function(event) {
    'keyup textarea': _.throttle(function(event) {
        console.log('edit event', event);
        var data = {};
        data[event.target.id] = event.target.value;
        console.log('data ', data );
        console.log('this._id', this._id);
        Buttons.update(this._id, {$set: data});
        //Buttons.update(this._id, {$set: {text: event.target.value}});
    }, 300)
});

