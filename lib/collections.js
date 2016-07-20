
Models = {};

Models.User = Graviton.Model.extend({

    belongsToMany: {
        organisations: {
            collectionName: 'organisations',
            field: 'organisationIds'
        }
    }
}, {
    setOrganisation: function(organisation) {

        var self = this;

        Users.update({_id: this._id}, {$set:{organisationIds: [organisation._id]}});
        
        /*
        _.each(this.organisations.find({}).fetch(), function(organisation) {
            self.organisations.remove(organisation);
        });
        this.organisations.add(organisation);
        */
    }
});

Users = Graviton.define('users', {
  modelCls: Models.User
});

Users.allow({
  'insert': function(userId, doc) {
    return Roles.userIsInRole(userId, ['admin']);
  },

  //for each of the records being update, make sure the current user is the owner
  'update': function(userId, docs, fields, modifier) {
    return Roles.userIsInRole(userId, ['admin']);
  },

  //for each of the records being removed, make sure the user owns them
  'remove': function(userId, docs) {
    return Roles.userIsInRole(userId, ['admin']);
  }
});

Models.Organisation = Graviton.Model.extend({

  hasMany: {
    users: {
      collection: 'users',
      foreignKey: 'organisationId'
    },
    lists: {
      collection: 'lists',
      foreignKey: 'organisationId'
    }
  }
});

Organisations = Graviton.define('organisations', {
    modelCls: Models.Organisation
});

var organisationAccessAllowed = function(userId, organisationId) {

    //var user = Users.build(Users.findOne(userId));
    var user = Users.findOne(userId);

    if (organisationId && _.contains(user.organisationIds, organisationId)) {

        return true;

    } else if (Roles.userIsInRole(userId, ['admin'])) {

        return true;

    } else {

        throw new Meteor.Error(403, "You are not permitted to access this organisation");;
    }
}

Organisations.allow({
  'insert': function(userId, doc) {
      return organisationAccessAllowed(userId, doc._id);
  },

  //for each of the records being update, make sure the current user is the owner
  'update': function(userId, doc, fields, modifier) {
      return organisationAccessAllowed(userId, doc._id);
  },

  //for each of the records being removed, make sure the user owns them
  'remove': function(userId, doc) {
      return organisationAccessAllowed(userId, doc._id);
  }
});

Meteor.getCurrentOrganisation = function() {
    //return Users.build(Meteor.user()).organisations.findOne();
    return Organisations.findOne({_id: Meteor.user().organisationIds[0]});
}

Meteor.getCurrentOrganisationId = function() {
    //return Users.build(Meteor.user()).organisations.findOne();
    var user = Meteor.user();
    return user.organisationIds && user.organisationIds[0];
}

/*
Meteor.setCurrentOrganisation = function(organisation) {
  return Users.build(Meteor.user()).organisations.findOne();
}
*/

Models.List = Graviton.Model.extend({
    hasMany: {
        buttons: {
            collection: 'buttons',
            foreignKey: 'listId'
        }
    },
    belongsTo: {
        organisation: {
            collection: 'organisations',
            field: 'organisationId'
        }
    }
}, {
    getDefaultButton: function () {

        var button;
        button = this.buttons.findOne({listDefault: true});
        if (!button) {
            var buttonId = Buttons.insert({
                listId: this._id,
                enabled: true,
                /*
                normalMessage: 'Press to call for service',
                pressedMessage: 'Your request has been sent',
                overrideMessage: 'Request received\nSomeone will be with you\nas soon as possible',
                normalMessage: 'Press to call for service',
                */
                listDefault: true,
                createdAt: new Date()
            });
            button = Buttons.findOne(buttonId);
        }
        return button;
    }
});

Lists = Graviton.define('lists', {
    modelCls: Models.List
});

var listAccessAllowed = function(userId, list) {

    var organisationId = list.get('organisationId');
    if (!organisationId) throw new Meteor.Error(403, "List has no organisation");
    //console.log('userId, list', userId, list);
    //console.log('organisationAccessAllowed(userId, organisationId)', organisationAccessAllowed(userId, organisationId));
    return organisationAccessAllowed(userId, organisationId)
}

Lists.allow({
    'insert': function(userId, doc) {
        return listAccessAllowed(userId, doc);
    },

    //for each of the records being update, make sure the current user is the owner
    'update': function(userId, doc, fields, modifier) {
        return listAccessAllowed(userId, doc);
    },

    //for each of the records being removed, make sure the user owns them
    'remove': function(userId, doc) {
        return listAccessAllowed(userId, doc);
    }
});

// Calculate a default name for a list in the form of 'List A'
Lists.defaultName = function() {
  var nextLetter = 'A', nextName = 'List ' + nextLetter;
  while (Lists.findOne({name: nextName})) {
    // not going to be too smart here, can go past Z
    nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    nextName = 'List ' + nextLetter;
  }

  return nextName;
};

Models.Button = Graviton.Model.extend({
    belongsTo: {
        list: {
          collection: 'lists',
          field: 'listId'
        }
    },
    belongsTo: {
        screenset: {
            collection: 'screensets',
            field: 'screensetId'
        }
    }
});

Buttons = Graviton.define('buttons', {
    modelCls: Models.Button
});
//Buttons = new Mongo.Collection('buttons');
/*
 Organisations = new Mongo.Collection('organisations');

 Lists = new Mongo.Collection('lists');
*/

var buttonAccessAllowed = function(userId, button) {

    var listId = button.get('listId');
    if (!listId) throw new Meteor.Error(403, "Button list not specified");

    var list = Lists.findOne(listId);
    if (!list) throw new Meteor.Error(403, "List for button not found");

    return listAccessAllowed(userId, list);
}

Buttons.allow({
    'insert': function(userId, doc) {
        console.log('buttonAccessAllowed(userId, doc)', buttonAccessAllowed(userId, doc));
        return buttonAccessAllowed(userId, doc);
    },

    //for each of the records being update, make sure the current user is the owner
    'update': function(userId, doc, fields, modifier) {
        return buttonAccessAllowed(userId, doc);
    },

    //for each of the records being removed, make sure the user owns them
    'remove': function(userId, doc) {
        return buttonAccessAllowed(userId, doc);
    }
});

// Screensets
Models.Screenset = Graviton.Model.extend({
    belongsTo: {
        organisation: {
          collection: 'organisations',
          field: 'organisationId'
        }
    }
});

Screensets = Graviton.define('screensets', {
    modelCls: Models.Screenset
});

var screensetAccessAllowed = function(userId, screenset) {

    var organisationId = screenset.get('organisationId');
    if (!organisationId) throw new Meteor.Error(403, "Screenset organisation not specified");
    //var organisation = Organisations.findOne(organisationId);
    //if (!organisation) throw new Meteor.Error(403, "Screenset organisation not found");
    return organisationAccessAllowed(userId, organisationId);
    /*
    var listId = button.get('listId');
    if (!listId) throw new Meteor.Error(403, "Button list not specified");

    var list = Lists.findOne(listId);
    if (!list) throw new Meteor.Error(403, "List for button not found");

    return listAccessAllowed(userId, list);
    */
}

Screensets.allow({
    'insert': function(userId, doc) {
        return screensetAccessAllowed(userId, doc);
    },

    //for each of the records being update, make sure the current user is the owner
    'update': function(userId, doc, fields, modifier) {
        return screensetAccessAllowed(userId, doc);
    },

    //for each of the records being removed, make sure the user owns them
    'remove': function(userId, doc) {
        return screensetAccessAllowed(userId, doc);
    }
});

// Screens
Models.Screen = Graviton.Model.extend({
    belongsTo: {
        screenset: {
          collection: 'screensets',
          field: 'screensetId'
        }
    }
});

Screens = Graviton.define('screens', {
    modelCls: Models.Screen
});

var screenAccessAllowed = function(userId, screen) {

    var screensetId = screen.get('screensetId');
    if (!screensetId) throw new Meteor.Error(403, "Screen screenset not specified");
    var screenset = Screensets.findOne(screensetId);
    if (!screenset) throw new Meteor.Error(403, "Screen screenset not found");
    return screensetAccessAllowed(userId, screenset);
}

Screens.allow({
    'insert': function(userId, doc) {
        return screenAccessAllowed(userId, doc);
    },

    //for each of the records being update, make sure the current user is the owner
    'update': function(userId, doc, fields, modifier) {
        return screenAccessAllowed(userId, doc);
    },

    //for each of the records being removed, make sure the user owns them
    'remove': function(userId, doc) {
        return screenAccessAllowed(userId, doc);
    }
});


// ScreenConnections
Models.ScreenConnection = Graviton.Model.extend({
    belongsTo: {
        source: {
            collection: 'screens',
            field: 'sourceId'
        },
        target: {
            collection: 'screens',
            field: 'targetId'
        },
        screenset: {
            collection: 'screensets',
            field: 'screensetId'
        }
    }
});

ScreenConnections = Graviton.define('screenConnections', {
    modelCls: Models.ScreenConnection
});

var screenConnectionAccessAllowed = function(userId, connection) {

    var screensetId = connection.get('screensetId');
    if (!screensetId) throw new Meteor.Error(403, "Connection screenset not specified");
    var screenset = Screensets.findOne(screensetId);
    if (!screenset) throw new Meteor.Error(403, "Connection screenset not found");
    return screensetAccessAllowed(userId, screenset);
}

ScreenConnections.allow({
    'insert': function(userId, doc) {
        return screenConnectionAccessAllowed(userId, doc);
    },

    'update': function(userId, doc, fields, modifier) {
        return screenConnectionAccessAllowed(userId, doc);
    },

    'remove': function(userId, doc) {
        return screenConnectionAccessAllowed(userId, doc);
    }
});

