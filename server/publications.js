Meteor.publish("projects", function() {
	return Projects.find({uid: this.userId});
});

Meteor.publish("project", function(projectId) {
	return Projects.find({uid: this.userId, _id: projectId});
});

Meteor.publish("project:spectra", function(projectId) {
    return Spectra.find({uid: this.userId, projectId: projectId});
});
