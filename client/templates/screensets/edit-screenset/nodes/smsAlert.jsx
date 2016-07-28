
import React from 'react';

SMSAlertView = React.createClass({

    mixins: [ NodeDataMixin ],
   
    componentDidMount: function() {

        var nodeId = this.props.record._id;
   
        var sourceEndpoints = [
            {
                uuid: nodeId + "TransitionTo",
                anchor: [0.5, 1, 0, 1, -200, 0],
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
                    <label for="number">SMS Number</label>
                    <input name="number" value={node.get('number')}
                           type="text" onChange={this.handleFieldChange} />
                </div>
                <div className="checkbox">
                    <input type="checkbox" name="useScreensetDefault" />
                    <label for="useScreensetDefault"></label>
                    <div>Use screenset default</div>
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

