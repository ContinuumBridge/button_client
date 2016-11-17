
import React from 'react';
import {ControlLabel, FormControl, FormGroup} from 'react-bootstrap';
import AddressView from '../../../_components/address-field';
//import { getStates, matchStateToTerm, sortStates, styles } from 'react-autocomplete';

EmailAlertView = React.createClass({

    mixins: [ NodeDataMixin ],
    
    getInitialState: function() {
        
        return {
            email: '',
            message: ''
        }
    },
   
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
    
    /*
    onFieldChange: function(field, event, value) {
        
        console.log('onFieldChange', field, event, value);
        
        var update = {};
        update[field] = value ? value : event.target.value;
        console.log('onFieldChange update ', update );
        //this.setState(update);
        
        Nodes.update(this.props.record._id, {
            $set: update
        });
    },
    */

    render: function() {
        
        var node = this.data.node;
        var email = node.get('email') || "";
        
        return (
            <div className="screen-inner">
                <FormGroup controlId={1}>
                    <ControlLabel>Email address</ControlLabel>
                    <AddressView value={email} onResize={this.props.onResize} 
                                 type='email' onChange={this.handleFieldChange.bind(this, 'email')} />
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

/*


 <Autocomplete value={node.get('address')} items={[{abbr: 'tes', name: 'test'}]}
 className="form-control"
 getItemValue={function(item) {return item.name}}
 shouldItemRender={function(item) {return true}}
 renderItem={function(item, isHighlighted) {
 return <div key={item.name}>item.name</div>;
 }}/>

 <FormControl name="address" type="email" value={node.get('address')}
     onChange={this.handleFieldChange}/>

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

 <div className="form-group">
 <label for="address">Email Address</label>
 <input name="address" value={node.get('address')}
 type="email" onChange={this.handleFieldChange} />
 </div>
*/
