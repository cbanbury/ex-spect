Template.projects.onRendered(function(){
	$('ul.tabs').tabs('select_tab', 'projects');
});

Template.projects.events({
	'click .new-project': function() {
		FlowRouter.go('newProject')
	},
	'click .delete-project': function() {
		Meteor.call('projects:remove', this._id);
	},
	'click .view-project': function() {
		FlowRouter.go('project', {id: this._id});
	}
})

Template.projects.helpers({
	projects: function() {
		return Projects.find({uid: Meteor.userId()}, {sort: {_id: -1}});
	}
});