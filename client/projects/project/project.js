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
	}
});

Template.project.events({
	'click .upload-data':function(event) {
		FlowRouter.go('projectUpload', {id: FlowRouter.getParam("id")}, {label: this.tag});
	}
});

Template.project.onCreated(function() {
	this.autorun(() => {
	  this.subscriptions = this.subscribe('project', FlowRouter.getParam("id"));
	});
});

Template.project.onRendered(function(){
	this.autorun(()=>{
		if (this.subscriptions.ready()) {
			$('.collapsible').collapsible();
		}
	})
});