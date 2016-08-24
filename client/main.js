
Template.main.helpers({
    hasReactComponent: function() {
        return !_.isUndefined(FlowRouter.current().route.options.reactComponent);
    },
    reactComponent: function() {
        return FlowRouter.current().route.options.reactComponent();
    }
});