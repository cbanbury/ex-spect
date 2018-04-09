Template.projects.onRendered(function(){
	$('ul.tabs').tabs('select_tab', 'projects');
});

Template.projects.events({
	'click .new-project': function() {
		FlowRouter.go('newProject')
	}
})