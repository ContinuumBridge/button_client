//require('./connector');

Plumb = function(elementName, initDeferred) {

    var self = this;

    var instance = jsPlumb.getInstance({
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        Endpoint: ["Blank", {}],
        ConnectionOverlays: [
            [ "Arrow", { location: 1 } ],
            [ "Label", {
                location: 0.1,
                id: "label",
                cssClass: "aLabel"
            }]
        ],
        Container: elementName
    });

    var basicType = {
        connector: "StateMachine",
        paintStyle: { strokeStyle: "red", lineWidth: 4 },
        hoverPaintStyle: { strokeStyle: "blue" },
        overlays: [
            "Arrow"
        ]
    };
    instance.registerConnectionType("basic", basicType);

    // suspend drawing and initialise.
    instance.batch(function () {

        //console.log('plumb batch', instance);

        // Trigger the well views to initialize
        initDeferred.resolve(instance);

        //_addEndpoints("Window4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
        //_addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
        //_addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
        //_addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        //instance.bind("connection", function (connInfo, originalEvent) {
        //    init(connInfo.connection);
        //});

        // make all the window divs draggable
        //instance.draggable(jsPlumb.getSelector(".plumb .node"), {});
        //instance.draggable(jsPlumb.getSelector(".plumb .menu"), {});
        //instance.draggable(jsPlumb.getSelector(".plumb .chart-container"), {});

        // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
        // method, or document.querySelectorAll:
        //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

        // connect a few up
        /*
         instance.connect({uuids: ["Window2BottomCenter", "Window3TopCenter"], editable: true});
         instance.connect({uuids: ["Window2LeftMiddle", "Window4LeftMiddle"], editable: true});
         instance.connect({uuids: ["Window4TopCenter", "Window4RightMiddle"], editable: true});
         instance.connect({uuids: ["Window3RightMiddle", "Window2RightMiddle"], editable: true});
         instance.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], editable: true});
         instance.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], editable: true});
         */

        //
        // listen for clicks on connections, and offer to delete connections on click.
        //
        /*
         instance.bind("click", function (connInfo, originalEvent) {
         // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
         //   instance.detach(conn);
         console.log('conn', connInfo);
         //var sourceNode = ds.record.getRecord(util.format('node/%s', connInfo.sourceId));
         //conn.toggleType("basic");
         });
         */

        /*
        instance.bind("connectionDrag", function (connection) {
            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
        });

        instance.bind("connectionDragStop", function (connection) {
            console.log("connection " + connection.id + " was dragged");
        });

         instance.bind("connection", function (info, originalEvent) {
         console.log('plumb connection', info);
         //updateConnections(info.connection);
         });
         instance.bind("connectionDetached", function (info, originalEvent) {
         console.log('plumb connectionDetached', info);
         //updateConnections(info.connection, true);
         });

         instance.bind("connectionMoved", function (info, originalEvent) {
         //  only remove here, because a 'connection' event is also fired.
         // in a future release of jsplumb this extra connection event will not
         // be fired.
         //updateConnections(info.connection, true);
         });
         */
    });

    instance.getOffset = function(el, relativeToRoot, container) {
        // ADDED
        //relativeToRoot = true;
        
        el = jsPlumb.getElement(el);
        container = container || this.getContainer();
        console.log('container ', container );
        var out = {
                left: el.offsetLeft,
                top: el.offsetTop
            },
            op = (relativeToRoot  || (container != null && (el != container && el.offsetParent != container))) ?  el.offsetParent : null,
            _maybeAdjustScroll = function(offsetParent) {
                if (offsetParent != null && offsetParent !== document.body && (offsetParent.scrollTop > 0 || offsetParent.scrollLeft > 0)) {
                    out.left -= offsetParent.scrollLeft;
                    // ADDED
                    //out.left -= 200;
                    out.top -= offsetParent.scrollTop;
                }
            }.bind(this);

        while (op != null) {
            out.left += op.offsetLeft;
            out.top += op.offsetTop;
            _maybeAdjustScroll(op);
            op = relativeToRoot ? op.offsetParent :
                op.offsetParent == container ? null : op.offsetParent;
        }
        
        // ADDED
        if (el.className.substring(0,16) == 'jsplumb-endpoint') {
            out.left -= 200;
        }

        // if container is scrolled and the element (or its offset parent) is not absolute or fixed, adjust accordingly.
        if (container != null && !relativeToRoot && (container.scrollTop > 0 || container.scrollLeft > 0)) {
            var pp = el.offsetParent != null ? this.getStyle(el.offsetParent, "position") : "static",
                p = this.getStyle(el, "position");
            if (p !== "absolute" && p !== "fixed" && pp !== "absolute" && pp != "fixed") {
                out.left -= container.scrollLeft;
                out.top -= container.scrollTop;
            }
        }
        return out;
    }
    //jsPlumb.fire("jsPlumbDemoLoaded", instance);

    return instance;
}
