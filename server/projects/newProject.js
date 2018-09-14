Meteor.methods({
	'projects:insert': function(data) {
		data.uid = Meteor.userId();
		Projects.insert(data);
	},
	'projects:update': function(data) {
		var old = Projects.findOne({_id: data._id, uid: Meteor.userId()}).labels;
		old.forEach((item)=>{
			var match = data.labels.filter((label)=>{return label.tag === item.tag});
			if (match.length < 1) {
				Spectra.remove({projectId: data._id, uid: Meteor.userId(), label: item.tag});
			}
		})

		data.uid = Meteor.userId();
		Projects.update({_id: data._id}, {$set: data});
	},
	'projects:remove': function(id) {
		Spectra.remove({projectId: id, uid: Meteor.userId()})

		return Projects.remove({
		    uid: Meteor.userId(),
		    _id: id
		});
	}
});