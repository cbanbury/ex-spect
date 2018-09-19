Template.somModels.onCreated(function() {
	this.autorun(()=>{
		this.modelSubscription = this.subscribe('SOM')
	});
});

Template.somModels.helpers({
	'models':function() {
		return SOM.find();
	}
})