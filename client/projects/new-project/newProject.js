Labels = new Mongo.Collection(null);

Template.newProject.onCreated(function(){
	Labels.insert({tag: 'Control', color: '#2962ff'})
	Labels.insert({tag: 'Test', color: '#d50000'})
})

Template.newProject.helpers({
		'labels': ()=>{
			return Labels.find();
		}
})

Template.newProject.onRendered(function() {
	import materialize from 'materialize-css';
	this.autorun(()=>{
		jscolor.installByClassName("jscolor");
	})
});

Template.newProject.events({
	'change .tag-input': function(event) {
		var id = event.target.id.split('-')[0];
		Labels.update({_id: id}, {$set: {tag: event.target.value}});
	},
	'change .color-input': function(event) {
		var id = event.target.id.split('-')[0];
		Labels.update({_id: id}, {$set: {color: event.target.value}});
	},
	'click .add-label': function(event) {
		Labels.insert({tag: 'New', color: '#212121'})
		jscolor.installByClassName("jscolor");
	},
	'click .remove-label': function(event) {
		Labels.remove({_id: event.target.id})
	},
	'submit .save-project':function(event) {
		event.preventDefault();

		var doc = {
			name: event.target.project_name.value,
			description: event.target.project_description.value,
			labels: Labels.find().fetch()
		};

		Meteor.call('projects:insert', doc);
		FlowRouter.go('projects');
	}
});
