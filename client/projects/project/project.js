Template.project.helpers({
	'project': function() {
		return Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});
	},
	'crumbs': function() {
		var project = Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});
		return [
			{
				path: '/projects',
				title: 'Projects'
			},
			{
				path: '',
				title: project.name
			}
		]
	},
	spectra: function(tag) {
	    return Spectra.find({uid: Meteor.userId(), projectId: FlowRouter.getParam("id"), label: tag}, {limit: 10});
	},
	spectraCount: function(tag) {
		return Spectra.find({uid: Meteor.userId(), projectId: FlowRouter.getParam("id"), label: tag}).count();
	},
	testSpectraCount: function(tag) {
		return TestSpectra.find({uid: Meteor.userId(), projectId: FlowRouter.getParam("id"), label: tag}).count();
	},
	pages: function(tag) {
		return Math.round(Spectra.find({uid: Meteor.userId(), projectId: FlowRouter.getParam("id"), label: tag}).count() / 10);
	},
	formatDate: function(date) {
		return moment(date).format('DD-MM-YYYY');
	}
});

Template.project.events({
	'click .training-data':function(event) {
		FlowRouter.go('projectUpload', {id: FlowRouter.getParam("id")}, {label: this.tag});
	},
	'click .test-data':function(event) {
		FlowRouter.go('projectUpload', {id: FlowRouter.getParam("id")}, {label: this.tag, type: 'test'});
	},
	'click .select-spectrum': function(event) {
		if (event.target.checked) {
			SelectedSpectra.insert({_id: event.target.id, label: event.target.getAttribute('data-tag')})
		} else {
			SelectedSpectra.remove({_id: event.target.id, label: event.target.getAttribute('data-tag')})
		}
	},
	'click .view-data': function(event) {
		FlowRouter.go('plot', {id: FlowRouter.getParam("id")});
	},
	'click .project-settings': function(event) {
		FlowRouter.go('projectSettings', {id: FlowRouter.getParam("id")});
	},
	'click .machine-learning': function(event) {
		FlowRouter.go('models', {id: FlowRouter.getParam("id")});
	}
});

Template.project.onCreated(function() {
	SelectedSpectra.remove();
});

Template.project.onRendered(function() {
	import materialize from 'materialize-css';
	$('ul.tabs').tabs();
	$('.collapsible').collapsible();
});