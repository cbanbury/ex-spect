Meteor.methods({
    'SOM:seed': function(labels, projectId, neurons, autoSteps) {
        var project = Projects.findOne({_id: projectId});

        return SOM.insert({
            uid: Meteor.userId(),
            projectId: projectId,
            projectName: project.name,
            neurons: neurons,
            complete: false,
            created_at: new Date(),
            progress: 0,
            autoSteps, autoSteps
        });
    },
    'SOM:save': function(objectId, model, labelEnum) {
        if (SOM.find({uid: Meteor.userId()}).count() >= 5) {
            var last = SOM.findOne({uid: Meteor.userId(), _id: {$ne: objectId}}, {sort: {created_at: -1}, limit: 1});
            SOM.remove({_id: last._id});
        }
        doc = {
            complete: true,
            completed_at: new Date(),
            uid: Meteor.userId(),
            labels: labelEnum,
            model: model
        }

        SOM.update({_id: objectId}, {$set: doc});
    }
})