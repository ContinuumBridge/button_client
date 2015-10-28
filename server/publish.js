
Meteor.publish('users', function() {

    if (this.userId) {

        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Users.find({});
        } else {
            return Users.find({_id: this.userId});
        }
    } else {

        this.ready();
    }
});

Meteor.publish('organisations', function() {

    if (this.userId) {

        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Organisations.find({});
        } else {
            var user = Users.build(Users.findOne(this.userId));
            //console.log('user.organisations.find()', user.organisations.find());
            return user.organisations.find();
            //return Organisations.find({_id: this.userId});
        }
    } else {

        this.ready();
    }
});

Meteor.publish('lists', function() {

    //console.log('publish lists this.userId', this.userId);
    if (this.userId) {
        var user = Users.build(Users.findOne(this.userId));
        //if (!user) return;
        var organisation = user.organisations.findOne();
        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Lists.find({});
        } else {
            return Lists.find({organisationId: organisation._id});
        }
    } else {

        this.ready();
    }
    //return Lists.find({});
});

Meteor.publish('buttons', function(listId) {

    console.log('publish buttons', listId);
    if (this.userId) {

        var user = Users.build(Users.findOne(this.userId));
        var organisation = user.organisations.findOne();
        var lists = Lists.find({organisationId: organisation._id}).fetch();
        var listIds = _.pluck(lists, '_id');
        var index = listIds.indexOf(listId);

        if (index >= 0) {

            return Buttons.find({listId: listId});
        //} else if (Roles.userIsInRole(this.userId, ['admin'])) {

        } else {
            this.ready();
        }
    } else {

        this.ready();
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
