Template.projectSettings.helpers({
	'crumbs': function() {
		var project = Template.instance().projectData.get();
		return [
			{
				path: '/projects',
				title: 'Projects'
			},
			{
				path: '/projects/' + project._id,
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
	this.projectData = new ReactiveVar({name: ''});
});


Template.projectSettings.onRendered(function(){
	this.autorun(()=>{
		if (FlowRouter.subsReady()) {
			Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));

			$('.chips').chips({
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
			labels: M.Chips.getInstance(document.getElementById('tags')).chipsData
		};
		Meteor.call('projects:update', doc);
		FlowRouter.go('projects');
	}
});