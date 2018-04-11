Meteor.publish("spectra", function (skip, limit) {
    Counts.publish(this, 'total_spectra', Spectra.find());
    if (skip < 0) {
        skip = 0;
    }
    return Spectra.find({uid: this.userId}, {
        skip: skip,
        limit: 10
    });
});

Meteor.publish("projects", function() {
	return Projects.find({uid: this.userId});
});

Meteor.publish("project", function(projectId) {
	return Projects.find({uid: this.userId, _id: projectId});
});

Meteor.publish("project:spectra", function(projectId) {
    return Spectra.find({uid: this.userId, projectId: projectId});
});
