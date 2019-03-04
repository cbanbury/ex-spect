import Kohonen, {hexagonHelper} from 'kohonen';
const crossValidation = require('ml-cross-validation');

Template.classification.onCreated(function(){
	this.accuracy = new ReactiveVar(null);
});

Template.classification.events({
	'click .testRun': function(event) {
		console.log('got here')
		var model = this.k;
		var testData = TestSpectra.find({}).fetch();
		// console.log(testData)
		console.log("trying to do prediction")
		console.log(model._predict(testData.map(function(item){return item.y})));
		console.log(model.labelEnum)

	},
	'submit .cross-validation-form': function(event){
		event.preventDefault();
		$('#cvButton').attr('disabled', true);
		var model = this.k;
		var folds = event.target.folds.value;

		$('#cvButton').text('processing');
		const confusionMatrix = crossValidation.kFold(model._data.v, model._data.labels, folds, function(trainFeatures, trainLabels, testFeatures) {
		  var neurons = hexagonHelper.generateGrid(model.numNeurons, model.numNeurons);
		  const k = new Kohonen({
		    data: trainFeatures,
		    labels: trainLabels,
		    neurons, 
		    maxStep: model.maxStep,
		    maxLearningCoef: model.maxLearningCoef,
		    minLearningCoef: model.minLearningCoef,
		    maxNeighborhood: model.maxNeighborhood,
		    minNeighborhood: model.minNeighborhood,
		    distance: model.distance,
		    norm: model.norm
		  });

		  	for (var i=0; i<model.maxStep; i++) {
			    window.setTimeout(function(){
			      var step = k.learnStep();
			    }, 0);
			}

			return k._predict(testFeatures);
		});

		$('#cvButton').text('run');
		$('#cvButton').attr('disabled', null)
		Template.instance().accuracy.set(confusionMatrix.getAccuracy());
	} 
})

Template.classification.helpers({
	'accuracy': ()=>{
		return Template.instance().accuracy.get();
	},
	'testData': ()=>{
		return TestSpectra.find({}).count();
	}
})