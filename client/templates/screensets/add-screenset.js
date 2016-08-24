var TEMPLATE_ID = 'screensetTemplate';
Session.setDefault(TEMPLATE_ID, false);

Template.addScreensetModal.helpers({
    selectedTemplateName: function() {
        var templateId = Session.get(TEMPLATE_ID);
        return templateId 
                ? Screensets.findOne(templateId).get('name')
                : "None"
    },
    templates: function() {
        return Screensets.find({});
    }
});

Template.addScreensetModal.events({

    'mousedown .js-select-template, click .js-select-template': function(event) {
        
        console.log('event.currentTarget.id', event.currentTarget.id);
        Session.set(TEMPLATE_ID , event.currentTarget.id);
        event.preventDefault();
    },
    'submit .modal-form': function(event) {

        event.preventDefault();

        var target = event.target;
        var templateId = Session.get(TEMPLATE_ID);
        console.log('templateId ', templateId );
        //var template = Screensets.findOne(templateId);
        Meteor.call('createScreensetFromTemplate', templateId, target.name.value);
        
        Modal.hide();
    }
});
