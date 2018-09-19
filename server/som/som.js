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
    'SOM:save': function(model, projectId, labelEnum) {
        // make sure we don't duplicate the data
        delete model._data;
        SOM.insert({
            completed_at: new Date(),
            uid: Meteor.userId(),
            labels: labelEnum,
            model: model,
            projectId: projectId
        });
    }
})