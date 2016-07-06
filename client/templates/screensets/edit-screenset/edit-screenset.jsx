
import React from 'react';
import {ReactMeteorData} from 'meteor/react-meteor-data';

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
    
    addScreen: function() {
        
        console.log('addScreen this.data.screenset._id', this.data.screenset._id);
        
        Screens.insert({
            name: 'Test screen',
            display: 'Test display',
            x: 200,
            y: 100,
            left: "",
            right: "",
            doubleLeft: "",
            doubleRight: "",
            screensetId: this.data.screenset._id,
            createdAt: new Date()
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
        
        console.log('edit screenset render this.data.screenset', this.data.screenset);
        
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
