
/*
var _ = require('underscore');
var $ = require('jquery');
var React = require('react');
var Q = require('q');
var util = require('util');

var Node = require('../../../methods/node');
*/
import Q from 'q';
import React from 'react';

ScreenView = React.createClass({

    getInitialState: function() {

        return {
            connections: [],
            screenElementDeferred: Q.defer()
        }
    },

    componentDidMount: function() {

        var self = this;

        self.props.plumbInitPromise.then(function(plumb) {
            self.initPlumb(plumb);
        }).done();
        
        /*
        var node = this.props.node;
        var nodeUID = Node.getUID(node);
        var updateState = function(data) {

            self.setState(_.extend(data, {
                uid: nodeUID
            }));
        }

        node.subscribe(function(data) {
            updateState(data);
        }.bind(this));

        updateState(node.get());

        node.whenReady(function() {
            self.props.plumbInitPromise.then(function(plumb) {
                self.initPlumb(plumb);
            }).done();
        });
        */
    },

    initPlumb: function(plumb) {

        var self = this;

        console.log('Screen initPlumb', plumb);
        var screen = this.props.record;
        var screenUID = screen._id;
        var screenNode = React.findDOMNode(this.refs['screen']);

        // this is the paint style for the connecting lines..
        var connectorPaintStyle = {
            //lineWidth: 4,
            //strokeStyle: "#61B7CF",
            strokeStyle: "#0000C4",
            joinstyle: "round",
            outlineColor: "white",
            outlineWidth: 2
        },
        // .. and this is the hover style.
        connectorHoverStyle = {
            //lineWidth: 4,
            strokeStyle: "#216477",
            outlineWidth: 2,
            outlineColor: "white"
        },
        endpointHoverStyle = {
            fillStyle: "#0000C4",
            strokeStyle: "#0000C4"
        },
        // the definition of source endpoints (the small blue ones)
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                strokeStyle: "#0000C4",
                fillStyle: "transparent",
                radius: 7,
                lineWidth: 3
            },
            isSource: true,
            connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {},
            overlays: []
        },
        // the definition of target endpoints (will appear when the user drags a connection)
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: { fillStyle: "#0000C4", radius: 11 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: { hoverClass: "hover", activeClass: "active" },
            isTarget: true,
            /*
            overlays: [
                [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel" } ]
            ]
            */
        },
        init = function (connection) {
            connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        };

        console.log('screenUID ', screenUID );
        var sourceEndpoints = [
            {
                uuid: screenUID + "SingleLeft",
                anchor: [0, 0.3, -1, 0],
                //label: "Left"
            },
            {
                uuid: screenUID + "DoubleLeft",
                anchor: [0, 0.6, -1, 0],
                //label: "Double Left"
            },
            {
                uuid: screenUID + "SingleRight",
                anchor: [1, 0.3, 1, 0],
                //label: "Right"
            },
            {
                uuid: screenUID + "DoubleRight",
                anchor: [1, 0.6, 1, 0],
                //label: "Double Right"
            }
        ];
        _.each(sourceEndpoints, function(endpoint) {

            /*
            sourceEndpoint.overlays[0] =
                [ "Label", {
                    location: [0.5, 1.5],
                    label: endpoint.label,
                    cssClass: "endpointSourceLabel"
                }];
            */
            plumb.addEndpoint(screenNode, sourceEndpoint, endpoint);
        });

        var targetEP = plumb.addEndpoint(screenNode,
            targetEndpoint, {
                isTarget: true,
                maxConnections: 5,
                uuid: screenUID + "Main",
                anchor: [0.5, 0, 0, -1],
                //anchor: "Continuous",
                dropOptions: { hoverClass: "hover" }
            }
        );
        console.log('targetEP ', targetEP );

        this.state.screenElementDeferred.resolve({
            plumb: plumb,
            element: this.refs.screen
        });
    },

    handleMouseUp: function() {

        var style = this.refs.screen.style;
        //var style = this.refs.node.getDOMNode().style;
        //console.log('left', style.left, 'top', style.top);
        Screens.update(this.props.record._id, {
            $set: { x: parseInt(style.left, 10)
                  , y: parseInt(style.top, 10)}
        });
        /*
        node.set('x', parseInt(style.left, 10));
        node.set('y', parseInt(style.top, 10));
        */
        //console.log('mouse up', node);
    },

    handleDestroy: function() {

        var screenId = this.props.record._id;

        ScreenConnections.find({$or: [{sourceId: screenId},{targetId: screenId}]});
        Screens.remove(this.props.record._id);
    },

    handleDisplayChange: function(event) {

        console.log('handleDisplayChange event', event.target.value);
        Screens.update(this.props.record._id, {
            $set: { display: event.target.value },
        });
        //this.setState({value: event.target.value});
    },

    render: function() {

        console.log('render ScreenView');
        var node = this.props.node;
        /*
        var InnerView = NodeViews[node.get('type')];
        var innerView;
        if (InnerView) {
            innerView = <InnerView record={node} engine={this.props.engine} nodes={this.props.nodes} />;
        } else {
            innerView = <div></div>;
        }
        */

        var screen = this.props.record;
        var style = {
            left: screen.get('x'),
            top: screen.get('y')
        }
        var screenElement = this.state.screenElementDeferred.promise;
        return (
            <div className="draggable-object window screen" style={style} id={screen._id} ref="screen"
                onMouseUp={this.handleMouseUp} onClick={this.handleClick} >
                <div className="screen-inner">
                    <textarea className="display" value={screen.get('display')} 
                           onChange={this.handleDisplayChange} />
                </div>
                <TitlebarView parentElementPromise={screenElement} destroy={this.handleDestroy} />
            </div>
        )
    }
});


var TitlebarView = React.createClass({

    getMoveElement: function() {
        return this.refs.move;
    },

    componentDidMount: function() {

        var self = this;

        this.props.parentElementPromise.then(function(result) {

            // Make the parent element draggable and proxy events from the move handle to it
            result.plumb.draggable(result.element, {});
            $(self.refs.handle).bind('click mousedown mousemove mouseup', function(e) {
                $(result.element).trigger(e);
            });

        }).done();
    },

    render: function() {
        return (
            <div className="screen-titlebar">
                <div onClick={this.props.destroy} className="node-delete">
                    <i className="fa fa-times screen-title-icon"></i>
                </div>
                <div ref="handle" className="node-handle">
                    <i className="fa fa-arrows screen-title-icon"></i>
                </div>
            </div>
        )
    }
});