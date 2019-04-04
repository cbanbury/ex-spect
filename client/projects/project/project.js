import '../../lib/cross-validation';

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
	},
	range: function() {
		return Template.instance().range.get();
	}
});

Template.project.events({
	'click .pluck-data': function(event) {
		event.preventDefault();
		Meteor.call('spectra:pluck:test', FlowRouter.getParam("id"), function(err) {

		});
	},
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
	},
	'submit .truncate-form': function(event) {
		event.preventDefault();
		var from = event.target.range_from.value;
		var to = event.target.range_to.value;
		var projectId = FlowRouter.getParam("id");
		Meteor.call('spectra:truncate', from, to, projectId, function(err) {
			if (!err) {
				M.toast({html: 'Data truncated', displayLength: 2000});
			} else {
				M.toast({html: 'Error truncating data', displayLength: 2000});
			}
		});
	}
});

Template.project.onCreated(function() {
	SelectedSpectra.remove();

	this.range = new ReactiveVar({min: -1, max: -1});
	Meteor.call('spectra:xrange', FlowRouter.getParam("id"), (err, range)=> {
		this.range.set(range);
	});

});

Template.project.onRendered(function() {
	console.log('cross validation dummy')
	window.cv.folds([], 10);
	import materialize from 'materialize-css';
	$('ul.tabs').tabs();
	$('.collapsible').collapsible();
	$('.modal').modal();
});
