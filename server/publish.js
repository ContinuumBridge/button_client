
Meteor.publish('users', function() {

  if (Roles.userIsInRole(this.userId, ['admin'])) {
      return Users.find({});
  } else {
      return Users.find({_id: this.userId});
  }
});

Meteor.publish('organisations', function() {

  if (Roles.userIsInRole(this.userId, ['admin'])) {
      return Organisations.find({});
  } else {
      return Organisations.find({_id: this.userId});
  }
});

Meteor.publish('lists', function() {
    return Lists.find({});
});

Meteor.publish('publicLists', function() {
  return Lists.find({userId: {$exists: false}});
});

Meteor.publish('privateLists', function() {
  if (this.userId) {
    return Lists.find({userId: this.userId});
  } else {
    this.ready();
  }
});

Meteor.publish('buttons', function(listId) {
  check(listId, String);

  return Buttons.find({listId: listId});
});
