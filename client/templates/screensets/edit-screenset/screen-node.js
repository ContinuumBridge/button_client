
// the definition of source endpoints (the small blue ones)
var sourceEndpoint = {
    endpoint: "Dot",
    paintStyle: {
        strokeStyle: "#7AB02C",
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
    overlays: [
        [ "Label", {
            location: [0.5, 1.5],
            label: "Drag",
            cssClass: "endpointSourceLabel",
            visible:false
        } ]
    ]
};

// the definition of target endpoints (will appear when the user drags a connection)
var targetEndpoint = {
    endpoint: "Dot",
    paintStyle: { fillStyle: "#7AB02C", radius: 11 },
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: -1,
    dropOptions: { hoverClass: "hover", activeClass: "active" },
    isTarget: true,
    overlays: [
        [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
    ]
};

// this is the paint style for the connecting lines..
var connectorPaintStyle = {
    lineWidth: 4,
    strokeStyle: "#61B7CF",
    joinstyle: "round",
    outlineColor: "white",
    outlineWidth: 2
};
// .. and this is the hover style.
var connectorHoverStyle = {
    lineWidth: 4,
    strokeStyle: "#216477",
    outlineWidth: 2,
    outlineColor: "white"
};
var endpointHoverStyle = {
    fillStyle: "#216477",
    strokeStyle: "#216477"
};
        

Template.screenNode.onRendered(function() {

    console.log('screenNode onRendered');
    //console.log('_addEndpoints ', toId, sourceAnchors, targetAnchors);

    var sourceAnchors = ["LeftMiddle", "RightMiddle"];
    var targetAnchors = ["TopCenter", "BottomCenter"];
    
    for (var i = 0; i < sourceAnchors.length; i++) {
        var sourceUUID = "flowchartWindow1" + sourceAnchors[i];
        console.log('sourceUUID', sourceUUID);
        jsPlumb.addEndpoint("flowchartWindow1", sourceEndpoint, {
            anchor: sourceAnchors[i], uuid: sourceUUID
        });
    }
    for (var j = 0; j < targetAnchors.length; j++) {
        var targetUUID = "flowchartWindow1" + targetAnchors[j];
        jsPlumb.addEndpoint("flowchartWindow1", targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
    }

});

Template.screenNode.helpers({
  
});

Template.screenNode.events({

    'mousedown .js-delete-item, click .js-delete-item': function() {
        Screens.remove(this._id);
    }
});
