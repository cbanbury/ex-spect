import { Jobs } from 'meteor/msavin:sjobs'
import Kohonen, {hexagonHelper} from 'kohonen';
import _ from 'lodash/fp';
const crossValidation = require('ml-cross-validation');

function mapLabels(spectra, labelEnum) {
  return spectra.map((spectrum)=>{
  var match = labelEnum.filter((item)=>{return item.tag === spectrum.label});
  if (match && match.length === 1) {
    return match[0].id;
  }
  });
}

Jobs.register({
    "buildSOM": function (projectId, props, somID, userId) {
      console.log('Starting to build SOM for project ' + projectId);

      // define ids for labels
      var labels = props.labels;
      labels = labels.map(function(item, index) {
        return {tag: item.tag, id: index}
      });

      var spectra = Spectra.find({uid: userId,
          projectId: projectId, label: {$in: props.labels.map((item)=>{return item.tag})}}, {y: 1, label: 1, labelId: 1}).fetch();

      var neurons = hexagonHelper.generateGrid(props.gridSize, props.gridSize);
      const k = new Kohonen({
        data: _.map(_.get('y'), spectra),
        labels: mapLabels(spectra, labels),
        labelEnum: labels,
        neurons,
        maxStep: props.steps * spectra.length,
        maxLearningCoef: props.learningRate,
        minLearningCoef: 0.00001,
        maxNeighborhood: props.gridSize * (2 / 3),
        minNeighborhood: 0.1,
        // distance: 'manhattan',
        norm: 'zscore'
      });

      console.log('Starting learning');

      k.learn((neurons, step)=>{
        console.log(step)
      });
      if (props.lvq) {
        k.LVQ();
      }
      console.log('Finished learning');

      console.log('Saving model');
      var mapping = k.mapping();
      var model = k.export();
      delete model._data;
      SOM.update({_id: somID}, {$set: {
          status: 100,
          completed_at: new Date(),
          model: model,
          positions: mapping,
          lvq: props.lvq
        }
      });
      console.log('Saved model');
      this.success();
    }
});

Jobs.register({
  "crossValidation": function(projectId, props, somID, userId) {
    console.log('Starting cross validation');
    var labels = props.labels;
    labels = labels.map(function(item, index) {
      return {tag: item.tag, id: index}
    });

    var spectra = Spectra.find({uid: userId,
      projectId: projectId, label: {$in: props.labels.map((item)=>{return item.tag})}}, {y: 1, label: 1, labelId: 1}).fetch();

    const confusionMatrix = crossValidation.kFold(
      _.map(_.get('y'), spectra),
      mapLabels(spectra, labels),
      10,
      function(trainFeatures, trainLabels, testFeatures) {
        console.log('One epoch = ' + spectra.length);
        var neurons = hexagonHelper.generateGrid(props.gridSize, props.gridSize);
        const k = new Kohonen({
          data: trainFeatures,
          labels: trainLabels,
          labelEnum: labels,
          neurons,
          maxStep: props.steps * trainFeatures.length, // TODO: undo fixing this
          maxLearningCoef: props.learningRate,
          minLearningCoef: 0.001,
          maxNeighborhood: props.gridSize * (2 / 3),
          minNeighborhood: 0.1,
          // distance: 'manhattan',
          norm: 'zscore'
        });

        console.log('Starting learning');
        k.learn();
        if (props.lvq) {
          k.LVQ();
        }
        console.log('Finished fold');
        return k._predict(testFeatures);
    });
    console.log('Finished cross validation');
    var doc = {
      accuracy: confusionMatrix.getAccuracy(),
      confusionMatrix: confusionMatrix.getMatrix()
    }
    SOM.update({_id: somID}, {$set: {cv: doc}});
    Jobs.run("buildSOM", projectId, props, somID, userId, {singular: true});
    this.success();
  }
});
