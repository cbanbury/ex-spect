Meteor.publish("projects", function() {
	return Projects.find({uid: this.userId});
});

Meteor.publish("project", function(projectId) {
	return Projects.find({uid: this.userId, _id: projectId});
});

Meteor.publish("project:spectra", function(projectId) {
    return Spectra.find({uid: this.userId, projectId: projectId});
});

Meteor.publish("project:spectra:meta", function(projectId) {
    return Spectra.find({uid: this.userId, projectId: projectId}, {x: 0, y: 0});
});

Meteor.publish("user:spectra", function() {
	return Spectra.find({uid: this.userId});
})

Meteor.publish("SOM", function() {
    return SOM.find({uid: this.userId});
});

Meteor.publish("SOM:model", function(modelId) {
    return SOM.find({uid: this.userId, _id: modelId});
});
