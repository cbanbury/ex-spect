import _ from 'lodash';

Template.classification.events({
	'click .testRun': function(event) {
		Meteor.call('SOM:test-data', FlowRouter.getQueryParam('m'), FlowRouter.getParam("id"))
		M.toast({html: 'Running test data...', displayLength: 2000});
	}
})

Template.classification.helpers({
	'testAccuracy': ()=>{
		return _.round(SOM.findOne({_id: FlowRouter.getQueryParam('m')}).test.accuracy, 1);
	},
	'hasPredictions': ()=>{
		if (SOM.findOne({_id: FlowRouter.getQueryParam('m')}).test) {
			return true;
		}
	},
	'testData': ()=>{
		return TestSpectra.find({uid: Meteor.userId(), projectId: FlowRouter.getParam("id")}).count();
	},
	'confusionRow': (index)=>{
		return SOM.findOne({_id: FlowRouter.getQueryParam('m')}).test.confusionMatrix[index];
	}
})
