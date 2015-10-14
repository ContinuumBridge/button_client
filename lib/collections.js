
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
      foreignKey: 'organisationId'
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

