Template.newProject.onRendered(function() {
	import materialize from 'materialize-css';
	$('.chips').chips({
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
			labels: M.Chips.getInstance(document.getElementById('tags')).chipsData
		};

		Meteor.call('projects:insert', doc);
		FlowRouter.go('projects');
	}
});