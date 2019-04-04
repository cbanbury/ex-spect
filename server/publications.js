Meteor.publish("projects", function() {
	return Projects.find({uid: this.userId});
});

Meteor.publish("project", function(projectId) {
	return Projects.find({uid: this.userId, _id: projectId});
});

Meteor.publish("project:spectra", function(projectId) {
    return Spectra.find({uid: this.userId, projectId: projectId});
});

Meteor.publish("project:test:spectra", function(projectId) {
    return TestSpectra.find({uid: this.userId, projectId: projectId});
});

Meteor.publish("project:spectra:meta", function(projectId) {
    return Spectra.find({uid: this.userId, projectId: projectId}, {fields: {x: 0, y: 0}});
});

Meteor.publish("project:test:spectra:meta", function(projectId) {
    return TestSpectra.find({uid: this.userId, projectId: projectId}, {fields: {x: 0, y: 0}});
});

Meteor.publish("project:spectra:selected", function(ids) {
	console.log('got here')
	console.log(ids)
    return Spectra.find({uid: this.userId, _id: {$in: ids}});
});

Meteor.publish("user:spectra", function() {
	return Spectra.find({uid: this.userId});
})

Meteor.publish("SOM", function() {
    return SOM.find({uid: this.userId}, {fields: {positions:0, model:0}, sort: {created_at: -1}});
});

Meteor.publish("SOM:model", function(modelId) {
    return SOM.find({uid: this.userId, _id: modelId});
});
