
import React from 'react';
import {mount} from 'react-mounter';
import {MainLayout} from '/client/layouts/mainLayout.jsx';

FlowRouter.route("/", {
    action (){
        mount(MainLayout)
    }
});
