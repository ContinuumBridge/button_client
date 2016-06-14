
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
            data.screenset = Screensets.findOne();
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
        
    render: function() {
        
        console.log('edit screenset render this.data.screenset', this.data.screenset);
        
        return (
            <div>
                <p>Edit Screenset</p>
            
                <button class="btn-sm btn-default btn-content" onClick={this.addScreen}>
                    Add Screen
                </button>

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
