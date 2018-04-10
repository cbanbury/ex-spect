Template.editProject.helpers({
	'project': function() {
		return Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});
	}
});