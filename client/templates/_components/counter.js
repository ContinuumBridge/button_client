

var React = require('react');

module.exports = React.createClass({

    getInitialState: function() {
        return {
            value: null
        }
    },

    componentDidMount: function() {

        var self = this;

        /*
         var record = this.props.record.subscribe(this.props.field, function (newValue) {
         this.setState({value: newValue});
         }.bind(this));

         this.setState({value: this.props.record.get(this.props.field)});
         */
    },

    handleIncrement: function(increment) {
        
        var step = this.props.step || 100;
        var value = (parseFloat(this.props.value) + (increment * step)) || 0;
        //var round = 1 / step;
        var rounded = Math.round( value * (1/step) ) / (1/step);
        var min = this.props.min || 0;
        rounded = rounded < min ? min : rounded;
        this.props.onChange(rounded);
    },

    handleChange: function(event) {

        try {
            var val = parseFloat(event.target.value) * this.props.displayScale;
            this.props.onChange(val);
        } catch (e) {
        }
    },
    
    /*
    handleChange: function(value) {

        this.props.onChange(value);
    },
    */

    render: function() {

        /*
         var record = this.props.record;
         var value = record.get(this.props.field);
         var value = this.sync[this.props.field];
         var id = this.sync._id;
         */
        var value = this.props.value / (this.props.displayScale || 1);
        
        var counterClass = "input-group counter " + this.props.type;

        return (
            <div className={counterClass}>
                <input type="text" className="form-control number text-center"
                       readonly="true" value={value} onChange={this.handleChange} />
                <div className="button-group">
                    <button className="btn plus"
                            onClick={this.handleIncrement.bind(this, 1)}>
                        <span className="glyphicon glyphicon-plus"></span>
                    </button>
                    <button className="btn minus"
                            onClick={this.handleIncrement.bind(this, -1)}>
                        <span className="glyphicon glyphicon-minus"></span>
                    </button>
                </div>
            </div>
        )
    }
});

/*
 <span className="input-group-btn">
 </span>
 */
