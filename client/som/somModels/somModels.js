Template.somModels.events({
	'click .load-model':function(event) {
		FlowRouter.go('learn', {id: FlowRouter.getParam("id")}, {m: event.target.id});
	},
	'click .del-model': function(event) {
		Meteor.call('SOM:delete', event.target.id);
	},
	'submit .compute-som': function(event, instance) {
			console.log('called submit');
			event.preventDefault();
			var project = Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});

			var labelEnum = [];
			project.labels.forEach(function(label) {
				var enabled = event.target['label-' + label.tag].checked;
				if (enabled) {
					labelEnum.push({tag: label.tag, id: label.id, color: label.color});
				}
			});

			var props = {
				labels: labelEnum,
				gridSize: +event.target.gridSize.value,
				learningRate: +event.target.learning_rate.value,
				steps: +event.target.steps.value,
				lvq: event.target.lvq.checked,
				description: event.target.description.value
			}

			var projectId = FlowRouter.getParam("id");

			if (event.target.cv.checked) {
				Meteor.call('SOM:cross-validate', projectId, props);
				M.toast({html: 'Running cross validation', displayLength: 2000});
			} else {
				Meteor.call('SOM:compute', projectId, props);
				M.toast({html: 'Model building', displayLength: 2000});
			}
	},
})

Template.somModels.helpers({
	'isDisabled': function(status) {
			if (status === 100) {
				return '';
			}
			return 'disabled';
	},
	'labels': function() {
		project = Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});
		return project.labels;
	},
	'models':function() {
		return SOM.find({projectId: FlowRouter.getParam("id")});
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
