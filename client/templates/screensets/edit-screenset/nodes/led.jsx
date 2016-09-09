
import React from 'react';
import {ControlLabel, FormControl, FormGroup} from 'react-bootstrap';
import AddressView from '../../../_components/address-field';

LEDScreenView = React.createClass({

    mixins: [ NodeDataMixin ],
    
    getInitialState: function() {
        
        return {
            colour: '',
            display: ''
        }
    },
   
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
    
    getNextLEDColour: function(currentColour) {
        
        var colours = ['green', 'amber', 'red'];
        console.log('currentColour ', currentColour );
        var index = colours.indexOf(currentColour);
        //console.log('index ', index );
        //var nextIndex = (index + 1) % colours.length;
        return colours[(index + 1) % colours.length];
    },
    
    handleLEDClick: function(event) {

        var node = this.data.node;
        var currentColour = node.get('colour');
        var colour = this.getNextLEDColour(currentColour);
        this.handleFieldChange('colour', colour);
        
        var screenset = this.props.screenset;
        screenset.updateLEDs(node._id, colour);
        /*
        var screensetColours = screenset.get('leds');

        if (screensetColours.indexOf(colour) == -1) {
            Screensets.update(screenset._id, {
                $set: {leds: screensetColours.push(colour)}
            });
        }
        */
    },
   
    render: function() {
        
        var node = this.data.node;
        var colour = node.get('colour') || "off";
        var ledSrc = "/img/led-" + colour + ".png";
        
        return (
            <div className="screen-inner">
                <textarea name="display" className="display" value={node.get('display')}
                          onChange={this.handleFieldChange.bind(this, 'display')} />
                <img className="screen-led" onClick={this.handleLEDClick} src={ledSrc} />
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
