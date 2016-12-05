

var userOrganisationsMatch = function(user1, user2) {
    var organisationId1 = user1.organisationIds 
        && user1.organisationIds.length == 1 && user1.organisationIds[0];
    var organisationId2 = user2.organisationIds 
        && user2.organisationIds.length == 1 && user2.organisationIds[0];
    return organisationId1 == organisationId2;
}

userCanModifyUser = function(subject, object) {

    var subjectIsReadOnly = subject._id ? Roles.userIsInRole(subject._id, ['readOnly']) : subject.isReadOnly;
    var subjectIsAdmin = subject._id ? Roles.userIsInRole(subject._id, ['admin']) : subject.isAdmin;
    //var objectIsReadOnly = object._id ? Roles.userIsInRole(object._id, ['readOnly']) : object.isReadOnly;
    var objectIsAdmin = object._id ? Roles.userIsInRole(object._id, ['admin']) : object.isAdmin;
    
    var organisationsMatch = userOrganisationsMatch(subject, object);

    if (!organisationsMatch && !subjectIsAdmin)
        throw new Meteor.Error('Unauthorized: Only an admin can modify a user from another organisation');

    if (subjectIsReadOnly)
        throw new Meteor.Error('Unauthorized: Readonly users cannot modify other users');
    
    if (!subjectIsAdmin && objectIsAdmin)
        throw new Meteor.Error('Unauthorized: Only admin can modify an admin user');

    return true;
}

Meteor.methods({

    createAccountUser: function(attributes) {

        console.log('createAccountUser attributes', attributes );
        
        var loggedInUser = Users.findOne(this.userId);
        if (!loggedInUser)
            throw new Meteor.Error('Unauthorized: User not logged in');
        userCanModifyUser(loggedInUser, attributes);
        
        var userId = Accounts.createUser(_.omit(attributes, 'isAdmin', 'isReadOnly', 'organisationIds')/*, function(error) {
                if (error) {
                    return Session.set(ERRORS_KEY, {'none': error.reason});
                }
            }*/
        );
        
        Users.update({_id: userId}, {$set:{organisationIds: attributes.organisationIds}});
        if (attributes.isReadOnly)
            Roles.addUsersToRoles(userId, ['readOnly']);
        if (attributes.isAdmin && Roles.userIsInRole(this.userId, ['admin']))
            Roles.addUsersToRoles(userId, ['admin']);
        return userId;
    },
    
    changeUserPassword: function (userId, newPassword) {

        var loggedInUser = Users.findOne(this.userId);
        if (!loggedInUser)
            throw new Meteor.Error('Unauthorized: User not logged in');
        var user = Users.findOne(userId);
        
        userCanModifyUser(loggedInUser, user);
        
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

        //var user = Meteor.user();

        organisationAccessAllowed(this.userId, organisationId);

        var lists = Lists.find({organisationId: organisationId}).fetch();
        _.each(lists, function() {
            Meteor.call('removeScreenset', screenset._id);
        });
        
        var screensets = Screensets.find({organisationId: organisationId}).fetch();
        _.each(screensets, function(screenset) {
            Meteor.call('removeScreenset', screenset._id);
        });
        Organisations.remove({_id: organisationId});
    },

    removeList: function(listId) {

        listAccessAllowed(this.userId, listId);
        //console.log('removeList', listId);
        Buttons.remove({listId: listId});
        Lists.remove({_id: listId});
    },
    
    createScreensetFromTemplate: function(templateId, name) {

        if (Roles.userIsInRole(this.userId, ['readOnly']))
            throw new Meteor.Error('Unauthorized: Readonly users may not modify anything');
        
        var user = Meteor.user();
        var organisationId = user.organisationIds && user.organisationIds[0];
        if (!organisationId) return;
        
        var screensetId = Screensets.insert({
            organisationId: organisationId,
            name: name,
            createdAt: new Date()
        });
        
        var templateNodes = Nodes.find({screensetId: templateId}).fetch();
        
        // Key: template id. Value: instantiated id
        var nodesMap = {};
        
        var hasStartNode = false;
        
        _.each(templateNodes, function(templateNode) {
            var attributes = _.omit(templateNode.attributes, '_id');
            attributes.screensetId = screensetId;
            attributes.createdAt = new Date();
            var nodeId = Nodes.insert(attributes);
            nodesMap[templateNode._id] = nodeId;
            if (attributes.type == 'start') hasStartNode = true;
        });

        if (!hasStartNode) {
            // Insert a start node if it doesn't exist in the template
            Nodes.insert({
                type: 'start',
                x: 200,
                y: 100,
                screensetId: screensetId,
                transitionTo: '',
                createdAt: new Date()
            });
        }
        
        var templateConnections = NodeConnections.find({
            screensetId: templateId
        }).fetch();
        
        _.each(templateConnections, function(templateConnection) {

            var attributes = _.omit(templateConnection.attributes, '_id');
            attributes.screensetId = screensetId;
            attributes.createdAt = new Date();
            attributes.sourceId = nodesMap[attributes.sourceId];
            attributes.targetId = nodesMap[attributes.targetId];
            NodeConnections.insert(attributes);
        });
        return screensetId;
    },
    
    removeScreenset: function(screensetId) {

        screensetAccessAllowed(this.userId, screensetId);
        
        console.log('removeScreenset screensetId', screensetId);
        var screens = Nodes.find({screensetId: screensetId}).fetch();
        _.each(screens, function(screen) {
            Meteor.call('removeScreen', screen._id);
        });
        Screensets.remove({_id: screensetId});
    },
    
    removeScreen: function(screenId) {

        console.log('removeScreen screenId', screenId);
        nodeAccessAllowed(this.userId, screenId);
        
        var node = Nodes.findOne(screenId);
        //console.log('removeScreen node ', node );
        if (node.get('type') == 'led') {
            var screenset = Screensets.findOne(node.get('screensetId'));
            screenset.updateLEDs(node._id, '', true);
            //console.log('removeScreen screenset ', screenset );
        }
        NodeConnections.remove({$or: [{sourceId: screenId},{targetId: screenId}]});
        Nodes.remove(screenId);
    }
});

Meteor.startup(function () {
    // code to run on server at startup
    Future = Npm.require('fibers/future');
});
