
var _ = require('underscore');
import React from 'react';
import {Button} from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';

// Field for node email or SMS addresses

const emails = [
    {
        label: 'button email',
        value: '{{button_email}}'
    },
    {
        label: 'list email',
        value: '{{list_email}}'
    }
];

const smss = [
    {
        label: 'button SMS',
        value: '{{button_sms}}'
    },
    {
        label: 'list SMS',
        value: '{{list_sms}}'
    }
];

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getAddresses(type) {
    console.log('getAddresses type', type);
    return type == 'email' ? emails : smss;
    /*
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
        return [];
    }

    const regex = new RegExp('^' + escapedValue, 'i');

    return emails.filter(email => regex.test(email.name));
    */
}

function getSuggestionValue(suggestion) {
    console.log('suggestion', suggestion);
    return suggestion.value;
}

function renderSuggestion(suggestion) {
    
    var label = "Use " + suggestion.label;
    
    return (
        <span>
            <Button bsSize="xsmall">{label}</Button>
        </span>
    );
}

class CBAutoSuggest extends Autosuggest {

    constructor() {
        super(arguments)
    }

    willRenderSuggestions() {
        console.log('willRenderSuggestions');
        const { suggestions, inputProps, shouldRenderSuggestions } = this.props;
        const { value } = inputProps;

        return true;
        //return suggestions.length > 0 && shouldRenderSuggestions(value);
    }
}

var AddressView = React.createClass({

    getInitialState: function() {

        return {
            value: '',
            addresses: getAddresses(this.props.type)
        };
    },
    
    
    onFocus: function(event) {

        console.log('onFocus');
        this.props.onResize();
    },
    
    onBlur: function() {
        
        console.log('onBlur');
        this.props.onResize();
    },
    
    onSuggestionsUpdateRequested({ value }) {
        //console.log('onSuggestionsUpdateRequested', value);
        //this.props.onSizeChange();
        this.setState({
            addresses: getAddresses(this.props.type)
        });
    },

    shouldRenderSuggestions: function(value) {
        //this.props.onSizeChange();
        //console.log('shouldRenderSuggestions', value);
        return true;
    },
    
    render: function() {

        var self = this;
        
        const { value, addresses } = this.state;
        var address = this.props.value;
        console.log('address-field value ', address);
        //var addresses = getAddresses(this.props.type);
        console.log('addresses ', addresses );
        var presetAddress = _.findWhere(addresses, {value: address});
        console.log('presetAddress ', presetAddress );
        var placeholder = presetAddress &&  "Using " + presetAddress.label || "";
        console.log('placeholder ', placeholder );
        var addressText = placeholder ? "" : address || "";
        
        console.log('addressText', addressText);
        
        const inputProps = {
            placeholder: placeholder,
            value: addressText,
            onChange: function(event, value) {
                self.props.onChange(event, value.newValue);
                self.props.onResize();
            },
            onFocus: this.onFocus,
            onBlur: this.onBlur
        };
        
        return (
            <CBAutoSuggest // eslint-disable-line react/jsx-no-undef
                suggestions={addresses}
                onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                getSuggestionValue={getSuggestionValue}
                shouldRenderSuggestions={this.shouldRenderSuggestions}
                renderSuggestion={renderSuggestion}
                inputProps={inputProps} />
        );
    }
});

export default AddressView;
