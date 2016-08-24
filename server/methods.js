


Meteor.methods({

    createAccountUser: function(attributes) {

        console.log('createAccountUser', userId );
        
        // TODO Permissions
        var userId = Accounts.createUser(_.omit(attributes, 'isAdmin', 'organisationIds')/*, function(error) {
                if (error) {
                    return Session.set(ERRORS_KEY, {'none': error.reason});
                }
            }*/
        );
        
        Users.update({_id: userId}, {$set:{organisationIds: attributes.organisationIds}});
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

        console.log('removeList', listId);
        Buttons.remove({listId: listId});
        Lists.remove({_id: listId});
    },
    
    createScreensetFromTemplate: function(templateId, name) {
        
        console.log('createScreensetFromTemplate templateId', templateId);
        
        var user = Meteor.user();
        var organisationId = user.organisationIds && user.organisationIds[0];
        if (!organisationId) return;
        
        var screensetId = Screensets.insert({
            organisationId: organisationId,
            name: name,
            createdAt: new Date()
        });
        
        var templateNodes = Nodes.find({screensetId: templateId}).fetch();
        //var startNode = _.findWhere(templateNodes, {type: 'start'});
        
        
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

        var self = this;
        
        console.log('removeScreenset screensetId', screensetId);
        var screens = Nodes.find({screensetId: screensetId}).fetch();
        _.each(screens, function(screen) {
            Meteor.call('removeScreen', screen._id);
        });
        Screensets.remove({_id: screensetId});
    },
    
    removeScreen: function(screenId) {

        console.log('removeScreen screenId', screenId);
        // TODO permissions
        NodeConnections.remove({$or: [{sourceId: screenId},{targetId: screenId}]});
        Nodes.remove(screenId);
    }
});

Meteor.startup(function () {
    // code to run on server at startup
    Future = Npm.require('fibers/future');
});
