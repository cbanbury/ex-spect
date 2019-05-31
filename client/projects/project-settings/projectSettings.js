Template.projectSettings.helpers({
	'crumbs': function() {
		var project = Template.instance().projectData.get();
		return [
			{
				path: '/projects',
				title: 'Projects'
			},
			{
				path: '/projects/' + project._id,
				title: project.name
			},
			{
				path: '',
				title: 'Settings'
			}
		]
	},
	'projectData': function() {
		return Template.instance().projectData.get();
	},
	'labels': ()=>{
		return Labels.find();
	}
});

Template.projectSettings.onCreated(function() {
	Labels.remove({});
	this.projectData = new ReactiveVar({name: ''});
});

Template.projectSettings.onRendered(function(){
	this.autorun(()=>{
		if (FlowRouter.subsReady()) {
			Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
			Template.instance().projectData.get().labels.forEach(function(label) {
				delete label._id;
				Labels.insert(label);
			})
			jscolor.installByClassName("jscolor");
		}
	})
});

Template.projectSettings.events({
	'change .tag-input': function(event) {
		var id = event.target.id.split('-')[0];
		Labels.update({_id: id}, {$set: {tag: event.target.value}});
	},
	'change .color-input': function(event) {
		var id = event.target.id.split('-')[0];
		Labels.update({_id: id}, {$set: {color: event.target.value}});
	},
	'click .add-label': function(event) {
		event.preventDefault();
		Labels.insert({tag: 'New', color: '#212121'})
		jscolor.installByClassName("jscolor");
	},
	'click .remove-label': function(event) {
		event.preventDefault();
		Labels.remove({_id: event.target.id})
	},
	'submit .save-project':function(event) {
		event.preventDefault();

		var doc = {
			_id: FlowRouter.getParam("id"),
			name: event.target.project_name.value,
			description: event.target.project_description.value,
			labels: Labels.find().fetch()
		};
		Meteor.call('projects:update', doc);
		FlowRouter.go('projects');
	}
});
