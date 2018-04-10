Template.newProject.onRendered(function() {
	$('.chips').material_chip({
		placeholder: 'Enter a label',
		data: [{
		  tag: 'Control',
		}, {
		  tag: 'Test',
		}],
	});
});

Template.newProject.events({
	'submit .save-project':function(event) {
		event.preventDefault();

		var doc = {
			name: event.target.project_name.value,
			description: event.target.project_description.value,
			labels: $('.chips').material_chip('data')
		};

		Meteor.call('projects:insert', doc);
		FlowRouter.go('projects');
	}
});