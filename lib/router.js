
import React from 'react';
//import {mount} from 'react-mounter';
//import  EditScreenset from '/client/templates/screensets/edit-screenset/edit-screenset.jsx';

FlowRouter.route("/", {
    reactComponent () { return EditScreensetView; },
    /*
    subsciptions () {
        this.register('users', Meteor.subscribe('users'))
        this.register('organisations', Meteor.subscribe('organisations'))
        this.register('lists', Meteor.subscribe('lists'))
    },
    */
    action () {
        BlazeLayout.render('appBody');
        //BlazeLayout.render('appBody', {page: 'appBody', app_data: { title: 'Hello World'} });
        //console.log('/ route');
        //mount(EditScreenset)
    }
});
