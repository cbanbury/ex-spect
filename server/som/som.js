Meteor.methods({
    'SOM:save': function(model, projectId, LVQ) {
        // make sure we don't duplicate the data
        delete model._data;
        SOM.insert({
            completed_at: new Date(),
            uid: Meteor.userId(),
            model: model,
            projectId: projectId,
            gridSize: Math.sqrt(model.numNeurons),
            lvq: LVQ
        });
    },
    'SOM:delete': function(id) {
        SOM.remove({uid: Meteor.userId(), _id: id});
    }
})