Template.project.helpers({
	'project': function() {
		return Template.instance().projectData.get();
	},
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
			}
		]
	},
	spectra: function(tag) {
	    return Spectra.find({uid: Meteor.userId(), projectId: FlowRouter.getParam("id"), label: tag}, {limit: 10});
	},
	formatDate: function(date) {
		return moment(date).format('DD-MM-YYYY');
	}
});

Template.project.events({
	'click .upload-data':function(event) {
		FlowRouter.go('projectUpload', {id: FlowRouter.getParam("id")}, {label: this.tag, lid: this.id});
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
		FlowRouter.go('learn', {id: FlowRouter.getParam("id")});
	}
});

Template.project.onCreated(function() {
	this.autorun(() => {
	  this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
	  this.spectraSubscription = this.subscribe('project:spectra:meta', FlowRouter.getParam("id"));
	});
	this.projectData = new ReactiveVar({name: ''});
	SelectedSpectra.remove();
});

Template.project.onRendered(function(){
	this.autorun(()=>{
		if (this.projectSubscription.ready()) {
			$('.collapsible').collapsible();
			Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
		}
	})
});