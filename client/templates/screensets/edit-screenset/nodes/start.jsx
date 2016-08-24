
import React from 'react';

StartNodeView = React.createClass({

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
        
        var targetEndpoints = [];
        
        this.props.setupEndpoints(sourceEndpoints, targetEndpoints);
    },
   
    render: function() {
        
        var node = this.data.node;

        return (
            <div className="screen-inner">
                Start
            </div>
        )
    }
});

