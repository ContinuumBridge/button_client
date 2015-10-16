
Models = {};
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

Organisations.allow({
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

Models.User = Graviton.Model.extend({
  belongsToMany: {
    organisations: {
      collectionName: 'organisations',
      field: 'organisationIds'
    }
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

Models.List = Graviton.Model.extend({
  hasMany: {
    buttons: {
      collection: 'buttons',
      foreignKey: 'listId'
    }
  },
  belongsToMany: {
    organisations: {
      collection: 'organisations',
      field: 'organisationIds'
    }
  }
});

Lists = Graviton.define('lists', {
    modelCls: Models.List
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
      foreignKey: 'listId'
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

