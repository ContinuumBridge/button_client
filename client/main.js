
playBellSound = function() {
    var bell = new Audio('/sounds/bell.mp3');
    bell.addEventListener('canplaythrough', function () {
        bell.play();
    });
}

Template.main.helpers({
    hasReactComponent: function() {
        return !_.isUndefined(FlowRouter.current().route.options.reactComponent);
    },
    reactComponent: function() {
        return FlowRouter.current().route.options.reactComponent();
    }
});