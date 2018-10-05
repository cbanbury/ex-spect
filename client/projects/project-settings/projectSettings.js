Template.projectSettings.helpers({
	'crumbs': function() {
		var project = Template.instance().projectData.get();
		return [
			{
				path: '/projects',
				title: 'Projects'
			},
			{
				path: '',
				title: project.name
			},
			{
				path: '',
				title: 'Settings'
			}
		]
	},
	'projectData': function() {
		return Template.instance().projectData.get();
	}
});

Template.projectSettings.onCreated(function() {
	this.autorun(() => {
	  this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
	});
	this.projectData = new ReactiveVar({name: ''});
});


Template.projectSettings.onRendered(function(){
	this.autorun(()=>{
		if (this.projectSubscription.ready()) {
			Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));

			$('.chips').material_chip({
				placeholder: 'Enter a label',
				data: Template.instance().projectData.get().labels,
			});
		}
	})
});

Template.projectSettings.events({
	'submit .save-project':function(event) {
		event.preventDefault();

		var doc = {
			_id: FlowRouter.getParam("id"),
			name: event.target.project_name.value,
			description: event.target.project_description.value,
			labels: $('.chips').material_chip('data')
		};
		Meteor.call('projects:update', doc);
		FlowRouter.go('projects');
	}
});