
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

        var user = Users.findOne(this.userId);

        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Organisations.find({});
        } else if (user.organisationIds && user.organisationIds[0]) {
            return Organisations.find({_id: user.organisationIds[0]});
        }
    }

    this.ready();
});

Meteor.publish('lists', function() {

    if (this.userId) {
        var user = Users.findOne(this.userId);
        //if (!user) return;
        var organisationId = user.organisationIds && user.organisationIds[0];
        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Lists.find({});
        } else if (organisationId) {
            return Lists.find({organisationId: organisationId});
        }
    }

    this.ready();

    //return Lists.find({});
});

Meteor.publish('buttons', function(listId) {

    if (this.userId) {

        var user = Users.findOne(this.userId);
        var organisationId = user.organisationIds[0];
        if (organisationId) {
            
            var organisation = Organisations.findOne(organisationId);
            var lists = Lists.find({organisationId: organisation._id}).fetch();
            var listIds = _.pluck(lists, '_id');
            var index = listIds.indexOf(listId);
            
            if (index >= 0) {

                return Buttons.find({listId: listId});
            //} else if (Roles.userIsInRole(this.userId, ['admin'])) {

            } else {
                this.ready();
            }
        }
    } else {

        this.ready();
    }
});

Meteor.publish('screensets', function() {

    if (this.userId) {

        //return Screensets.find({});
        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Screensets.find({});
        } else {
            
            // Let users access their screensets and templates
            var user = Users.findOne(this.userId);
            var organisationId = user.organisationIds && user.organisationIds[0];
            return organisationId ? Screensets.find(
                {$or: [{isTemplate: true}, {organisationId: organisationId}]})
                : Screensets.find({isTemplate: true});
        }
    } else {

        this.ready();
    }
});


Meteor.publish('screens', function() {

    if (this.userId) {

        return Screens.find({});
        /*
        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Screensets.find({});
        } else {
            var user = Users.build(Users.findOne(this.userId));
            return user.organisations.find();
        }
        */
    } else {

        this.ready();
    }
});

Meteor.publish('screenConnections', function() {

    if (this.userId) {

        return ScreenConnections.find({});
        /*
        if (Roles.userIsInRole(this.userId, ['admin'])) {
            return Screensets.find({});
        } else {
            var user = Users.build(Users.findOne(this.userId));
            return user.organisations.find();
        }
        */
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
