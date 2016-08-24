

ScreensetsDropdown = {
    helpers: {
        screensetName: function () {
            var screensetId = this.get('screensetId');
            return screensetId ? Screensets.findOne(screensetId).get('name') : "None";
        },
        screensets: function () {

            var organisationId = Meteor.getCurrentOrganisationId();
            return Screensets.find({organisationId: organisationId});
        }
    },
    events: {
        'mousedown .js-select-screenset, click .js-select-screenset': function (event) {

            event.preventDefault();

            // Callback has context of the screenset
            var buttonId = event.currentTarget.getAttribute('buttonId');
            console.log('buttonId ', buttonId );
            console.log('event.currentTarget.id', event.currentTarget.id);
            Buttons.update(buttonId, {$set: {screensetId: event.currentTarget.id}});
        }
    }
}
