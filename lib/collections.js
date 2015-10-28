
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

        _.each(this.organisations.find({}).fetch(), function(organisation) {
            self.organisations.remove(organisation);
        });
        this.organisations.add(organisation);
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

var organisationAccessAllowed = function(userId, organisation) {

    //console.log('organisationAccessAllowed userId', userId);
    //console.log('organisationAccessAllowed organisation._id', organisation._id);
    var user = Users.build(Users.findOne(userId));

    //console.log('user.organisations.findOne(organisation._id)', user.organisations.findOne(organisation._id));
    if (user.organisations.findOne(organisation._id)) {

        return true;

    } else if (Roles.userIsInRole(userId, ['admin'])) {

        //console.log('Roles.userIsInRole(userId, [admin]', Roles.userIsInRole(userId, ['admin']));
        return true;

    } else {

        throw new Meteor.Error(403, "You are not permitted to access this organisation");;
    }
}

Organisations.allow({
  'insert': function(userId, doc) {
      return organisationAccessAllowed(userId, doc);
  },

  //for each of the records being update, make sure the current user is the owner
  'update': function(userId, doc, fields, modifier) {
      return organisationAccessAllowed(userId, doc);
  },

  //for each of the records being removed, make sure the user owns them
  'remove': function(userId, doc) {
      return organisationAccessAllowed(userId, doc);
  }
});

Meteor.getCurrentOrganisation = function() {
    return Users.build(Meteor.user()).organisations.findOne();
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
});

Lists = Graviton.define('lists', {
    modelCls: Models.List
});

var listAccessAllowed = function(userId, list) {

    var organisation = list.organisation();
    if (!organisation) throw new Meteor.Error(403, "List has no organisation");
    return organisationAccessAllowed(userId, organisation)

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
    lists: {
      collection: 'lists',
      field: 'listId'
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
