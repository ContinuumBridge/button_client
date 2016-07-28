
/*
var _ = require('underscore');
//var Bacon = require('baconjs');
var util = require('util');
//var Plumb = require('./plumb');
var Q = require('q');
var React = require('react');

var Node = require('../../methods/node');
var Nodes = require('../../methods/nodes');
var Connections = require('../../methods/connections');

var NodeView = require('./nodes/node');
//var MenuView = require('./menu');

var ConnectorOverlayView = require('../components/connectorOverlay');
var CounterView = require('../components/counter');
*/
import Q from 'q';
import React from 'react';
import {ReactMeteorData} from 'meteor/react-meteor-data';

ScreensView = React.createClass({

    mixins: [ ReactMeteorData ],

    getMeteorData: function() {
        
        var self = this;
        console.log('screens getMeteorData');
        var data = {};
        //var postId = this.props.postId;
        var screensHandle = Meteor.subscribe('nodes');
        if (screensHandle.ready()) {
            var screensetId = FlowRouter.getParam('screensetId');
            console.log('screensetId ', screensetId );
            var screens = Nodes.find({screensetId: screensetId});
            /*
            screens.observeChanges({
                added: function (id, fields) {
                    console.log('doc inserted 1', id, fields);
                    console.log('self.state.plumbInitDeferred', self.state.plumbInitDeferred);
                    self.state.plumbInitDeferred.promise.then(function(plumb) {
                        console.log('doc inserted 2', id, fields);
                    });
                },
                changed: function (id, fields) {
                    console.log('doc updated', id, fields);
                },
                removed: function (id) {
                    console.log('doc removed', id);
                }
            });
            */
            data.screens = screens.fetch();
            var connectionsHandle = Meteor.subscribe('nodeConnections');
            if (connectionsHandle.ready()) {
                var connections = NodeConnections.find({screensetId: screensetId});
                connections.observeChanges({
                    added: function (id, fields) {
                        console.log('connection inserted 1', id, fields);
                        self.addPlumbConnection(id, fields);
                    },
                    changed: function (id, fields) {
                        console.log('connection updated', id, fields);
                    },
                    removed: function (id) {
                        console.log('connection removed', id);
                        self.removePlumbConnection(id);
                    }
                });
                data.connections = connections.fetch();
            }
        }
        return data;
    },

    getInitialState: function() {

        console.log('screens getInitialState');
        return {
            nodes: [],
            connections: [],
            renderedConnections: [],
            plumbInitDeferred: Q.defer()
        }
    },

    componentDidMount: function() {

        var self = this;

        var plumbInitDeferred = this.state.plumbInitDeferred;

        var plumb = this.plumb = new Plumb("plumb", plumbInitDeferred);

        /*
        var $plumb = $(self.refs.plumb);
        console.log('$plumb', $plumb);
        plumb.setContainer($plumb);
        */

        plumbInitDeferred.promise.then(function(plumb) {

            plumb.bind('beforeDrop', function(connInfo, originalEvent) {

                console.log('beforeDrop connInfo', connInfo);
                return self.onConnection(connInfo, false);
            });

            plumb.bind("connectionDetached", function (connInfo, originalEvent) {
                console.log('plumb connectionDetached', connInfo);
                return self.onDisconnection(connInfo);
                //updateConnections(info.connection, true);
            });
        }).done();
    },

    onConnection: function(connInfo, remove) {

        console.log('onConnection connInfo', connInfo);
        var sourceUUID = connInfo.connection.endpoints[0].getUuid();
        console.log('sourceUUID ', sourceUUID );
        //return true;
        var sourceId = sourceUUID.substring(0, 17);
        var targetId = connInfo.targetId;
        
        //return false;
        if (sourceId == targetId) return false;
        var sourceAnchor = sourceUUID.substring(17);
        console.log('this.props.screenset._id', this.props.screenset._id);

        var screenConnectionId = NodeConnections.insert({
            sourceId: sourceId,
            sourceAnchor: sourceAnchor,
            targetId: connInfo.targetId,
            targetAnchor: "Main",
            screensetId: this.props.screenset._id,
            createdAt: new Date()
        });
        return false;
    },

    onDisconnection: function(connInfo) {

        console.log('onDisconnection connInfo', connInfo);
        NodeConnections.remove(connInfo.connection.id);

        return false;
    },
    
    addPlumbConnection: function(id, fields) {

        var plumbInitDeferred = this.state.plumbInitDeferred;
        console.log('addPlumbConnection fields', fields);
        console.log('id', id);
        
        plumbInitDeferred.promise.then(function(plumb) {
            
            console.log('fields.sourceId', fields.sourceId);
            console.log('fields.targetId', fields.targetId);
            //console.log('fields.', fields.sourceId);
            var connection = plumb.connect({
                uuids: [fields.sourceId + fields.sourceAnchor
                        , fields.targetId + fields.targetAnchor],
                editable: true
            });
            connection.id = id;
            console.log('addPlumbConnection connection ', connection );
        });
    },

    removePlumbConnection: function(id, fields) {

        var plumbInitDeferred = this.state.plumbInitDeferred;

        plumbInitDeferred.promise.then(function(plumb) {
            
        });
    },
    
    renderScreens: function() {

        var self = this;
        var screens = this.data.screens;
        console.log('screens ', screens );
        
        if (screens.length > 0) {

            return screens.map(function (screen, index) {

                var plumbInit = self.state.plumbInitDeferred.promise;
                console.log('renderScreens screen', screen);
                return <NodeView key={screen._id} 
                                   record={screen} plumbInitPromise={plumbInit} />;
            });
        } else {
            return (
                <div className="wrapper-message">
                    <div className="title-message">No screens here</div>
                    <div className="subtitle-message">Add new screens using the button above</div>
                </div>
            );
        }
    },

    render: function() {

        var self = this;

        console.log('screens render this.data ', this.data);

        /*
        var nodes = this.state.nodes.map(function(node, index) {

            var plumbInit = self.state.plumbInitDeferred.promise;

            return (
                <NodeView node={node} nodes={self.props.nodes} engine={self.props.engine}
                          key={node.name} plumbInitPromise={plumbInit} />
            )
        });

        this.renderConnections();
        */

        /*
        return (
            <div id="wells" className="wells" ref="nodes">
                Nodes
                {this.data.screens ? this.renderScreens() : <div>Loading</div>}
            </div>
        )
        */
        return (
            <div id="plumb" className="plumb" ref="plumb">
                    {this.data.screens ? this.renderScreens() : 
                        <div className="wrapper-message">
                          <div className="title-message">Loading screens...</div>
                        </div>
                    }
            </div>
        )
    }
});

/*
 <div className="jtk-demo-canvas canvas-wide flowchart-demo jtk-surface jtk-surface-nopan" id="canvas">
 </div>
var TopbarView = React.createClass({
    
    addScreen: function () {

        Nodes.insert({
            name: 'Test screen',
            display: 'Test display',
            x: 200,
            y: 100,
            screensetId: this.props.screensetId,
            createdAt: new Date()
        });
    },
    
    render: function() {
        return (
            <button class="btn-sm btn-default btn-content" onClick={this.addScreen}>
                Add Screen
            </button>
        );
    }
});
*/
        
