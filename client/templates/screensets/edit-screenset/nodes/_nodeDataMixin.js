
import {ReactMeteorData} from 'meteor/react-meteor-data';

NodeDataMixin = {

    mixins: [ ReactMeteorData ],

    getMeteorData: function() {

        var nodeId = this.props.record._id;
        var node = Nodes.findOne(nodeId);

        return {node: node};
    },
     
    handleFieldChange: function(field, event, value) {

        var update = {};
        update[field] = value ? value : event.target.value;
        //update[event.target.attributes.getNamedItem('name').value] = event.target.value;
        
        // For some mysterious reason this stops the UI cursor jumping to the end on change
        this.setState(update);

        Nodes.update(this.props.record._id, {
            $set: update
        });
    }
};

