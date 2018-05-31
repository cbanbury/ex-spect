Meteor.startup(()=>{
	Spectra._ensureIndex({uid:1}, {background:true});
	SOM._ensureIndex({uid: 1, created_at:1}, {background: true});
});