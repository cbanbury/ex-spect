Template.somModels.events({
	'click .new-model':function() {
		FlowRouter.go('learn', {id: FlowRouter.getParam("id")});
	},
	'click .load-model':function(event) {
		FlowRouter.go('learn', {id: FlowRouter.getParam("id")}, {m: event.target.id});
	},
	'click .del-model': function(event) {
		Meteor.call('SOM:delete', event.target.id);
	}
})

Template.somModels.helpers({
	'models':function() {
		return SOM.find({projectId: FlowRouter.getParam("id")}, {sort: {completed_at: -1}});
	},
	'crumbs': function() {
		var project = Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});
		return [
			{
				path: '/projects',
				title: 'Projects'
			},
			{
				path: '/projects/' + FlowRouter.getParam("id"),
				title: project.name
			},
			{
				path: '/projects/' + FlowRouter.getParam("id") + '/models',
				title: 'Machine Learning'
			}
		]
	},
})