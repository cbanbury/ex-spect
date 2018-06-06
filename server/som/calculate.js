Meteor.methods({
    'SOM:seed': function(labels, projectId, neurons, autoSteps) {
        return SOM.insert({
            uid: Meteor.userId(),
            labels: labels,
            projectId: projectId,
            neurons: neurons,
            complete: false,
            created_at: new Date(),
            progress: 0,
            autoSteps, autoSteps
        });
    },
    'SOM:save': function(objectId, positions) {
        if (SOM.find({uid: Meteor.userId()}).count() >= 5) {
            var last = SOM.findOne({uid: Meteor.userId(), _id: {$ne: objectId}}, {sort: {created_at: -1}, limit: 1});
            SOM.remove({_id: last._id});
        }
        doc = {
            positions: positions,
            complete: true,
            completed_at: new Date(),
            uid: Meteor.userId()
        }

        SOM.update({_id: objectId}, {$set: doc});
    }
})