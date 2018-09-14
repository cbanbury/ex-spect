Meteor.methods({
	'projects:insert': function(data) {
		data.uid = Meteor.userId();
		Projects.insert(data);
	},
	'projects:update': function(data) {
		data.uid = Meteor.userId();
		Projects.update({_id: data._id}, {$set: data});
	},
	'projects:remove': function(id) {
		return Projects.remove({
		    uid: Meteor.userId(),
		    _id: id
		});
	}
});