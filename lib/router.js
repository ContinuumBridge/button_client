
import React from 'react';
//import {mount} from 'react-mounter';
//import  EditScreenset from '/client/templates/screensets/edit-screenset/edit-screenset.jsx';

Meteor.navigateTo = function (path) {
    FlowRouter.go(path)
};

var exposed = FlowRouter.group({});

exposed.route('/signin', {
    action: function () {
        BlazeLayout.render('appBody', {content: 'signin'})
    },
    name: 'signin'
});

/*
FlowRouter.route('/signout', {
    action: App.signout
});
*/

var loggedIn = FlowRouter.group({
    triggersEnter: [function(context, redirect) {
        if (!(Meteor.loggingIn() || Meteor.userId())) {
            FlowRouter.go('signin');
        }
    }]
});

loggedIn.route("/", {

    action () {
        BlazeLayout.render('appBody');
        //BlazeLayout.render('appBody', {page: 'appBody', app_data: { title: 'Hello World'} });
    },
    
    name: "home"
});

loggedIn.route("/lists/:listId", {

    action(params) {
        
        console.log('listShow params', params);
        
        BlazeLayout.render('appBody', {content: 'listShow'});
        //BlazeLayout.render('appBody', {page: 'appBody', app_data: { title: 'Hello World'} });
        //mount(EditScreenset)
    },
    
    name: 'listShow'
});

loggedIn.route("/screensets/", {

    action(params) {
        
        BlazeLayout.render('appBody', {content: 'screensetsShow'});
    },
    
    name: 'screensetsShow'
});

FlowRouter.route("/screensets/:screensetId", {

    reactComponent () { return EditScreensetView; },

    action () {
        BlazeLayout.render('appBody', {hasReactComponent: true});
        //BlazeLayout.render('appBody', {page: 'appBody', app_data: { title: 'Hello World'} });
    },
    
    name: 'editScreenset'
});

loggedIn.route("/organisations/", {

    action(params) {
        
        BlazeLayout.render('appBody', {content: 'organisationsShow'});
    },
    
    name: 'organisationsShow'
});

loggedIn.route("/users/", {

    action(params) {

        BlazeLayout.render('appBody', {content: 'usersShow'});
    },

    name: 'usersShow'
});

