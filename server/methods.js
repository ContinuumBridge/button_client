


Meteor.methods({

    createAccountUser: function(attributes) {

        // TODO Permissions
        var userId = Accounts.createUser({
                email: attributes.email,
                password: attributes.password
            }/*, function(error) {
                if (error) {
                    return Session.set(ERRORS_KEY, {'none': error.reason});
                }
            }*/
        );
        if (attributes.isAdmin) {
            Roles.addUsersToRoles(userId, ['admin']);
        }
        return userId;
    },
    
    changeUserPassword: function (userId, newPassword) {

        var future = new Future();

        var error = false;
        try {
            Accounts.setPassword(userId, newPassword);
        } catch (e) {
            console.log('error', e);
            error = e;
        }

        if (error) {
            future.throw(error);
        } else {
            future.return(false);
        }

        return future.wait();
    },
     
    removeOrganisation: function(organisationId) {

        var screensets = Screensets.find({organisationId: organisationId}).fetch();
        _.each(screensets, function(screenset) {
            Meteor.call('removeScreenset', screenset._id);
        });
        Organisations.remove({_id: organisationId});
    },
    
    createScreensetFromTemplate: function(templateId, name) {
        
        console.log('createScreensetFromTemplate templateId', templateId);
        
        var user = Meteor.user();
        var organisationId = user.organisationIds && user.organisationIds[0];
        console.log('organisationId ', organisationId );
        if (!organisationId) return;
        
        var screensetId = Screensets.insert({
            organisationId: organisationId,
            name: name,
            createdAt: new Date()
        });
        
        var templateScreens = Screens.find({screensetId: templateId}).fetch();
        
        // Key: template id. Value: instantiated id
        var screensMap = {};
        
        _.each(templateScreens, function(templateScreen) {
            console.log('templateScreen', templateScreen.attributes);
            var attributes = _.omit(templateScreen.attributes, '_id');
            attributes.screensetId = screensetId;
            attributes.createdAt = new Date();
            var screenId = Screens.insert(attributes);
            screensMap[templateScreen._id] = screenId;
        });
        
        var templateConnections = ScreenConnections.find({
            screensetId: templateId
        }).fetch();
        
        _.each(templateConnections, function(templateConnection) {

            var attributes = _.omit(templateConnection.attributes, '_id');
            attributes.screensetId = screensetId;
            attributes.createdAt = new Date();
            attributes.sourceId = screensMap[attributes.sourceId];
            attributes.targetId = screensMap[attributes.targetId];
            ScreenConnections.insert(attributes);
        });
        return screensetId;
    },
    
    removeScreenset: function(screensetId) {

        var self = this;
        
        console.log('removeScreens screensetId', screensetId);
        var screens = Screens.find({screensetId: screensetId}).fetch();
        _.each(screens, function(screen) {
            Meteor.call('removeScreen', screen._id);
        });
        Screensets.remove({_id: screensetId});
    },
    
    removeScreen: function(screenId) {

        console.log('removeScreen screenId', screenId);
        // TODO permissions
        ScreenConnections.remove({$or: [{sourceId: screenId},{targetId: screenId}]});
        Screens.remove(screenId);
    }
});

Meteor.startup(function () {
    // code to run on server at startup
    Future = Npm.require('fibers/future');
});
