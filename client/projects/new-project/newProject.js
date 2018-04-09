Template.newProject.onCreated(function() {
	this.labels = new ReactiveVar();
});

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
