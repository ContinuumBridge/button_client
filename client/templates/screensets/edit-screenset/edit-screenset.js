//var EDITING_KEY = 'EDITING_ORGANISATION_ID';

/*
import Q from 'q';
import React from 'react';

EditScreensetView = React.createClass({

    mixins: [ ReactMeteorData ],

    getMeteorData: function() {
        console.log('screens getMeteorData');
        var data = {};
        //var postId = this.props.postId;
        var handle = Meteor.subscribe('screens');
        if (handle.ready()) {
            data.screens = Screens.find({});
        }
        return data;
    },
    
    render: function() {
        
        return (
            <button class="js-item-add btn-sm btn-default btn-content" type="submit">
                Add Screen
            </button>
            <ScreensView />
        );
    }
}
*/


/*
Template.editScreenset.helpers({
    screensReady: function() {
        return Router.current().screensetHandle.ready();
    },
    screens: function(screensetId) {
        console.log('screens screensetId', screensetId);
        return Screens.find({screensetId: screensetId});
    }
});

Template.editScreenset.events({
    
    'click .js-item-add': function(event) {

        var self = this;

        event.preventDefault();
        console.log('item-add this', this);
        
        Screens.insert({
            name: 'Test screen',
            display: 'Test display',
            x: 200,
            y: 100,
            screensetId: this._id,
            createdAt: new Date()
        });
        
        //var modalBody = Template.addOrganisationModal.renderFunction().value;
    }
});

Template.editScreenset.onRendered(function() {

    console.log('editScreenset onRendered');
    console.log('editScreenset this', this);

    var query = Screens.find({screensetId: this.data._id});
    query.observeChanges({
        added: function (id, fields) {
            console.log('doc inserted', id, fields);
        },
        changed: function (id, fields) {
            console.log('doc updated', id, fields);
        },
        removed: function (id) {
            console.log('doc removed', id);
        }
    });

    jsPlumb.ready(function () {

        //registerFlowchart();
        
        console.log('jsPlumb.ready');
        
        jsPlumb.importDefaults({
            // default drag options
            DragOptions: { cursor: 'pointer', zIndex: 2000 },
            
            Container: "plumb",
            // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
            // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
            ConnectionOverlays: [
                [ "Arrow", {
                    location: 1,
                    visible:true,
                    id:"ARROW",
                    events:{
                        click:function() { alert("you clicked on the arrow overlay")}
                    }
                } ],
                [ "Label", {
                    location: 0.1,
                    id: "label",
                    cssClass: "aLabel",
                    events:{
                        tap:function() { alert("hey"); }
                    }
                }]
            ],
        });

        var basicType = {
            connector: "StateMachine",
            paintStyle: { strokeStyle: "red", lineWidth: 4 },
            hoverPaintStyle: { strokeStyle: "blue" },
            overlays: [
                "Arrow"
            ]
        };
        jsPlumb.registerConnectionType("basic", basicType);

        var init = function (connection) {
            connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        };

        //var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
        //    console.log('_addEndpoints ', toId, sourceAnchors, targetAnchors);
        //    for (var i = 0; i < sourceAnchors.length; i++) {
        //        var sourceUUID = toId + sourceAnchors[i];
        //        console.log('sourceUUID', sourceUUID);
        //        jsPlumb.addEndpoint("flowchart" + toId, sourceEndpoint, {
        //            anchor: sourceAnchors[i], uuid: sourceUUID
        //        });
        //    }
        //    for (var j = 0; j < targetAnchors.length; j++) {
        //        var targetUUID = toId + targetAnchors[j];
        //        jsPlumb.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
        //    }
        //};

        // suspend drawing and initialise.
        jsPlumb.batch(function () {

            console.log('jsPlumb.batch');
            
            //_addEndpoints("Window4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
            //_addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
            //_addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
            //_addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);

            //// listen for new connections; initialise them the same way we initialise the connections at startup.
            //jsPlumb.bind("connection", function (connInfo, originalEvent) {
            //    init(connInfo.connection);
            //});

            //// make all the window divs draggable
            //jsPlumb.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
            //// THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
            //// method, or document.querySelectorAll:
            ////jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

            //// connect a few up
            //jsPlumb.connect({uuids: ["Window2BottomCenter", "Window3TopCenter"], editable: true});
            //jsPlumb.connect({uuids: ["Window2LeftMiddle", "Window4LeftMiddle"], editable: true});
            //jsPlumb.connect({uuids: ["Window4TopCenter", "Window4RightMiddle"], editable: true});
            //jsPlumb.connect({uuids: ["Window3RightMiddle", "Window2RightMiddle"], editable: true});
            //jsPlumb.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], editable: true});
            //jsPlumb.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], editable: true});

            //
            // listen for clicks on connections, and offer to delete connections on click.
            //
            jsPlumb.bind("click", function (conn, originalEvent) {
                // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                //   jsPlumb.detach(conn);
                conn.toggleType("basic");
            });

            jsPlumb.bind("connectionDrag", function (connection) {
                console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
            });

            jsPlumb.bind("connectionDragStop", function (connection) {
                console.log("connection " + connection.id + " was dragged");
            });

            jsPlumb.bind("connectionMoved", function (params) {
                console.log("connection " + params.connection.id + " was moved");
            });
        });

        //jsPlumb.fire("jsPlumbDemoLoaded", instance);

    });
    //}
});
*/

/*
Template.organisationItem.events({

  'focus input[type=text]': function(event) {
    Session.set(EDITING_KEY, this._id);
  },
  
  'blur input[type=text]': function(event) {
    if (Session.equals(EDITING_KEY, this._id))
      Session.set(EDITING_KEY, null);
  },
  
  'keydown input[type=text]': function(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },
  
  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once 
  // every 300ms)
  'keyup input[type=text]': _.throttle(function(event) {
    console.log('organisation edit event', event);
    var data = {};
    data[event.target.id] = event.target.value;
    Organisations.update(this._id, {$set: data});
    //Buttons.update(this._id, {$set: {text: event.target.value}});
  }, 300),

  'mousedown .js-view-lists, click': function(event) {

    console.log('view-lists', event.target);
    var user = Users.build(Meteor.user());
    user.setOrganisation(this);
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-delete-item, click .js-delete-item': function() {
    Organisations.remove(this._id);
  }
});
*/
