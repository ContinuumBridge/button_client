
import Q from 'q';
import React from 'react';
import ReactDOM from 'react-dom';

var InnerViews = {};
InnerViews['screen'] = ScreenView;
InnerViews['emailAlert'] = EmailAlertView;
InnerViews['start'] = StartNodeView;
//InnerViews['smsAlert'] = SMSAlertView;

NodeView = React.createClass({

    getInitialState: function() {

        return {
            connections: [],
            plumb: false,
            nodeElementDeferred: Q.defer()
        }
    },

    componentDidMount: function() {

        var self = this;

        self.props.plumbInitPromise.then(function(plumb) {
            self.setState({plumb: plumb});
        }).done();
    },

    componentWillUnmount: function() {

        var self = this;
        
        console.log('componentWillUnmount 1');
        var plumb = this.state.plumb;
        if (plumb) {
            var screenNode = ReactDOM.findDOMNode(this.refs['screen']);
            plumb.detachAllConnections(screenNode);
            plumb.removeAllEndpoints(screenNode)
        }
        /*
        this.props.plumbInitPromise.then(function(plumb) {
            
            console.log('React.findDOMNode(self.refs[screen])', React.findDOMNode(self.refs['screen']));
            plumb.detachAllConnections(React.findDOMNode(self.refs['screen']));
            //self.initPlumb(plumb);
        }).done();
        */
        console.log('componentWillUnmount 2');
    },
    
    setupEndpointsWrapper: function(sourceEndpoints, targetEndpoints) {
        
        var self = this;
        
        self.props.plumbInitPromise.then(function(plumb) {
            self.setupEndpoints(plumb, sourceEndpoints, targetEndpoints);
        }).done();
    },
    
    setupEndpoints: function(plumb, sourceEndpoints, targetEndpoints) {

        var self = this;

        var screen = this.props.record;
        //var screenUID = screen._id;
        var screenNode = ReactDOM.findDOMNode(this.refs['screen']);

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

        _.each(targetEndpoints, function(endpoint) {
            plumb.addEndpoint(screenNode, targetEndpoint, endpoint);
        });

        this.state.nodeElementDeferred.resolve({
            plumb: plumb,
            element: this.refs.screen
        });
    },

    handleMouseUp: function() {

        var style = this.refs.screen.style;
        Nodes.update(this.props.record._id, {
            $set: { x: parseInt(style.left, 10)
                  , y: parseInt(style.top, 10)}
        });
    },

    handleDestroy: function() {

        var screenId = this.props.record._id;

        Meteor.call('removeScreen', screenId);
    },

    handleDisplayChange: function(event) {

        console.log('handleDisplayChange event', event.target.value);
        Nodes.update(this.props.record._id, {
            $set: { display: event.target.value },
        });
        //this.setState({value: event.target.value});
    },

    render: function() {

        console.log('render NodeView');
        var node = this.props.record;
        
        var InnerView = InnerViews[node.get('type')];
        var innerView;
        if (InnerView) {
            //innerView = <InnerView record={node} engine={this.props.engine} nodes={this.props.nodes} />;
            innerView = <InnerView record={node} setupEndpoints={this.setupEndpointsWrapper} />
        } else {
            innerView = <div></div>;
        }

        var node = this.props.record;
        var style = {
            left: node.get('x'),
            top: node.get('y')
        }
        var nodeElement = this.state.nodeElementDeferred.promise;
        return (
            <div className="draggable-object window screen" style={style} id={node._id} ref="screen"
                onMouseUp={this.handleMouseUp} onClick={this.handleClick} >
                {innerView}
                <TitlebarView parentElementPromise={nodeElement} handleDestroy={this.handleDestroy} />
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
                <div onClick={this.props.handleDestroy} className="node-delete">
                    <i className="fa fa-times screen-title-icon"></i>
                </div>
                <div ref="handle" className="node-handle">
                    <i className="fa fa-arrows screen-title-icon"></i>
                </div>
            </div>
        )
    }
});