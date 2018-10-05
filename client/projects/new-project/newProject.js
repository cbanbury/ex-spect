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

		var labelNames = $('.chips').material_chip('data');
		var labelEnum = [];

		labelNames.forEach(function(label, index) {
			labelEnum.push({tag: label.tag, id: index});
		})

		var doc = {
			name: event.target.project_name.value,
			description: event.target.project_description.value,
			labels: labelEnum
		};

		Meteor.call('projects:insert', doc);
		FlowRouter.go('projects');
	}
});