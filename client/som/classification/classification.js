import Kohonen, {hexagonHelper} from 'kohonen';
const crossValidation = require('ml-cross-validation');

Template.classification.onCreated(function(){
	this.accuracy = new ReactiveVar(null);
	this.testAccuracy = new ReactiveVar(null);
	this.hasPredictions = new ReactiveVar(false);
});

Template.classification.events({
	'click .testRun': function(event) {
		Template.instance().hasPredictions.set(false);
		var model = this.k;
		var testData = TestSpectra.find({}).fetch();
		var predictions = model._predict(testData.map(function(item){return item.y}));

		var testLabels = testData.map(function(item) {
			var match = model.labelEnum.filter(function(label) {
				return label.tag === item.label;
			});

			if (match[0]) {
				return match[0].id;
			}
			return -1;
		});

		var accuracy = 0;
		var total = testData.length;
		testLabels.forEach(function(label, index) {
			if (label === predictions[index]) {
				accuracy++;
			}
		});

		Template.instance().hasPredictions.set(true);
		Template.instance().testAccuracy.set((accuracy / total) * 100);
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
	'testAccuracy': ()=>{
		return Template.instance().testAccuracy.get();
	},
	'hasPredictions': ()=>{
		return Template.instance().hasPredictions.get();
	},
	'testData': ()=>{
		return TestSpectra.find({}).count();
	}
})