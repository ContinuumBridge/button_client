
import React from 'react';
import {ReactMeteorData} from 'meteor/react-meteor-data';
import { DropdownButton, MenuItem } from 'react-bootstrap';

EditScreensetView = React.createClass({
   
    mixins: [ ReactMeteorData ],

    getMeteorData: function() {
        
        var self = this;
        console.log('screenset getMeteorData');
        var data = {};
        //var postId = this.props.postId;
        var handle = Meteor.subscribe('screensets');
        if (handle.ready()) {
            var screensetId = FlowRouter.getParam('screensetId');
            data.screenset = Screensets.findOne(screensetId);
        }
        return data;
    },

    addNode: function(attrs) {

        Nodes.insert(_.extend({
            x: 200,
            y: 100,
            screensetId: this.data.screenset._id,
            createdAt: new Date()
        }, attrs));
    },

    addScreen: function() {
        
        console.log('addScreen this.data.screenset._id', this.data.screenset._id);

        this.addNode({
            type: 'screen',
            display: 'Test display',
            left: "",
            right: "",
            doubleLeft: "",
            doubleRight: "",
        });
    },

    addEmailAlert: function() {

        console.log('addEmail this.data.screenset._id', this.data.screenset._id);

        this.addNode({
            type: 'emailAlert',
            address: '',
            message: '',
            useScreensetDefault: false,
            useButtonDefault: false
        });
    },

    addSMSAlert: function() {

        console.log('addEmail this.data.screenset._id', this.data.screenset._id);

        this.addNode({
            type: 'smsAlert',
            number: '',
            message: '',
            useScreensetDefault: false,
            useButtonDefault: false
        });
    },

    handleDestroy: function() {

        var screensetId = this.data.screenset && this.data.screenset._id;
        console.log('screensetId ', screensetId );
        if (screensetId)
            Meteor.call('removeScreenset', screensetId);
        FlowRouter.go('/screensets');
    },
        
    render: function() {
        
        var screenset = this.data.screenset;
        var name = screenset && screenset.get('name') || "";
        
        return (
            <div className="page lists-show">
                <nav className="js-title-nav">
                    <div className="nav-group">
                        <a href="#" class="js-menu nav-item"><span class="icon-list-unordered" title="Show menu"></span></a>
                    </div>
                    <h1 className="js-edit-list title-page">
                        <span class="title-wrapper">
                            Screenset {name}
                        </span>
                    </h1>
                    <div className="nav-group right">
                      <div className="nav-item options-mobile">
                        <select class="list-edit">
                          <option value="delete">Delete</option>
                        </select>
                        <span className="icon-cog"></span>
                      </div>
                      <div className="options-web">

                        <button className="btn-sm btn-primary btn-content" onClick={this.addScreen}>
                            Add Screen
                        </button>

                        <DropdownButton bsStyle="primary" title="Add Alert" id="addAlertDropdown">
                            <MenuItem eventKey="1" onClick={this.addEmailAlert}>Email</MenuItem>
                            <MenuItem eventKey="2" onClick={this.addSMSAlert}>Text Message</MenuItem>
                        </DropdownButton>

                        <a className="js-delete-list nav-item" onClick={this.handleDestroy}>
                          <span className="icon-trash" title="Delete list"></span>
                        </a>
                      </div>
                    </div>
                </nav>
            
                {this.data.screenset ? <ScreensView screenset={this.data.screenset} /> :
                    <div className="wrapper-message">
                        <div className="title-message">Loading screenset...</div>
                    </div>
                }
            </div>
        );
    }
});

/*
<button className="btn-sm btn-primary btn-content dropdown-toggle">
    Add Alert
    <span class="caret"></span>
</button>
*/

/*
                        {{#if screensReady}}
                            {{#with _id}}
                                {{#each screens this}}
                                  {{> screenNode}}
                                {{else}}
                                  <div class="wrapper-message">
                                    <div class="title-message">No screens here</div>
                                    <div class="subtitle-message">Add new screens using the button above</div>
                                  </div>
                                {{/each}}
                            {{/with}}
                        {{else}}
                            <div class="wrapper-message">
                              <div class="title-message">Loading screenset...</div>
                            </div>
                        {{/if}}
 */
