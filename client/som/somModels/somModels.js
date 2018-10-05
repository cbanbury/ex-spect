Template.somModels.onCreated(function() {
	this.autorun(()=>{
		this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
		this.modelSubscription = this.subscribe('SOM')
	});

	this.projectData = new ReactiveVar({name: ''});
});

Template.somModels.onRendered(function(){
	this.autorun(()=>{
		if (this.projectSubscription.ready()) {
			Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
		}
	})
});

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
		var project = Template.instance().projectData.get();
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