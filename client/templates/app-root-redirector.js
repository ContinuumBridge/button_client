
Template.rootRedirector.onCreated(function rootRedirectorOnCreated() {
    
    this.subscribe('lists');
    this.subscribe('organisations');
    this.subscribe('users');

    
    this.autorun(() => {
        if (this.subscriptionsReady()) {
            console.log('Meteor.getCurrentOrganisation().lists.findOne()._id', Meteor.getCurrentOrganisation().lists.findOne()._id);
            FlowRouter.go('/lists/' + Meteor.getCurrentOrganisation().lists.findOne()._id);
        }
    });
});
