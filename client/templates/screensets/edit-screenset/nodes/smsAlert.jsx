
import React from 'react';
import {ControlLabel, FormControl, FormGroup} from 'react-bootstrap';
import AddressView from '../../../_components/address-field';

SMSAlertView = React.createClass({

    mixins: [ NodeDataMixin ],
   
    componentDidMount: function() {

        var nodeId = this.props.record._id;
   
        var sourceEndpoints = [
            {
                uuid: nodeId + "TransitionTo",
                anchor: [0.5, 1, 0, 1, 0, 0],
                //label: "Double Right"
            }
        ];
 
        var targetEndpoints = [
            {
                isTarget: true,
                maxConnections: 5,
                uuid: nodeId + "Main",
                anchor: [0.5, 0, 0, -1, 0, 0],
                //anchor: "Continuous",
                dropOptions: { hoverClass: "hover" }
            }
        ];
        
        this.props.setupEndpoints(sourceEndpoints, targetEndpoints);
    },
   
    render: function() {
        
        var node = this.data.node;
        var sms = node.get('sms') || "";

        return (
            <div className="screen-inner">
                <FormGroup controlId={1}>
                    <ControlLabel>SMS number</ControlLabel>
                    <AddressView value={sms} onResize={this.props.onResize}
                                 type='sms' onChange={this.handleFieldChange.bind(this, 'sms')} />
                </FormGroup>
                <FormGroup controlId={2}>
                    <ControlLabel>Message</ControlLabel>
                    <FormControl name="message" type="text" value={node.get('message')}
                                 onChange={this.handleFieldChange.bind(this, 'message')}/>
                </FormGroup>
            </div>
        )
    }
});

