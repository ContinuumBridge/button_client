
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
      var user = Users.build(Users.findOne(this.userId));
      //console.log('user.organisations.find()', user.organisations.find());
      return user.organisations.find();
      //return Organisations.find({_id: this.userId});
  }
});

Meteor.publish('lists', function() {

    var user = Users.build(Users.findOne(this.userId));
    var organisation = user.organisations.findOne();
    if (Roles.userIsInRole(this.userId, ['admin'])) {
        return Lists.find({});
    } else {
        return Lists.find({organisationId: organisation._id});
    }
    //return Lists.find({});
});

Meteor.publish('buttons', function() {

    var user = Users.build(Users.findOne(this.userId));
    var organisation = user.organisations.findOne();
    var lists = Lists.find({organisationId: organisation._id}).fetch();
    var listIds = _.pluck(lists, '_id');

    if (Roles.userIsInRole(this.userId, ['admin'])) {
        return Buttons.find({});
    } else {
        return Buttons.find({listId: {$in: listIds}});
    }
});

/*
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
*/
