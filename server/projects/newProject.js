Meteor.methods({
	'projects:insert': function(data) {
		data.uid = Meteor.userId();
		Projects.insert(data);
	},
	'projects:remove': function(id) {
		return Projects.remove({
		    uid: Meteor.userId(),
		    _id: id
		});
	}
});