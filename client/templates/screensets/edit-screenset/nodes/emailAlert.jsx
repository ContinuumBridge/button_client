
import React from 'react';

EmailAlertView = React.createClass({

    mixins: [ NodeDataMixin ],
   
    componentDidMount: function() {

        var nodeId = this.props.record._id;
        
        var sourceEndpoints = [
            {
                uuid: nodeId + "SingleLeft",
                anchor: [0, 0.3, -1, 0, -200, 0],
                //label: "Left"
            },
            {
                uuid: nodeId + "DoubleLeft",
                anchor: [0, 0.6, -1, 0, -200, 0],
                //label: "Double Left"
            },
            {
                uuid: nodeId + "SingleRight",
                anchor: [1, 0.3, 1, 0, -200, 0],
                //label: "Right"
            },
            {
                uuid: nodeId + "DoubleRight",
                anchor: [1, 0.6, 1, 0, -200, 0],
                //label: "Double Right"
            }
        ];
        
        var targetEndpoints = [
            {
                isTarget: true,
                maxConnections: 5,
                uuid: nodeId + "Main",
                anchor: [0.5, 0, 0, -1, -200, 0],
                //anchor: "Continuous",
                dropOptions: { hoverClass: "hover" }
            }
        ];
        
        this.props.setupEndpoints(sourceEndpoints, targetEndpoints);
    },
   
    render: function() {
        
        var node = this.data.node;

        return (
            <div className="screen-inner">
                <div className="form-group">
                    <label for="address">Email Address</label>
                    <input name="address" value={node.get('address')}
                           type="text" onChange={this.handleFieldChange} />
                </div>
                <div className="checkbox">
                    <input type="checkbox" name="useButtonDefault" />
                    <label for="useButtonDefault"></label>
                    <div>Use button default</div>
                </div>
            </div>
        )
    }
});

