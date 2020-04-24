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

function sampleSpectra(userId, projectId, tag, size) {
  const collection = Spectra.rawCollection()
  const aggregate = Meteor.wrapAsync(collection.aggregate, collection)
  temp = aggregate([{$match: {uid: userId, projectId: projectId, label: tag}},
                 {$project: {y:1, label: 1}}, {$sample: {'size': size}}]);
  temp = temp.toArray().await();
  return temp;
}

Jobs.register({
    "buildSOM": function (projectId, props, somID, userId, oversample) {
      console.log('Starting to build SOM for project ' + projectId);

      // define ids for labels
      var labels = props.labels;
      labels = labels.map(function(item, index) {
        var count = Spectra.find({uid: userId, projectId: projectId, label: item.tag}).count();
        return {tag: item.tag, id: index, count: count};
      });

      // handle class inbalance
      var maxCount = Math.max.apply(Math, labels.map(function(item) { return item.count;}));
      var minCount = Math.min.apply(Math, labels.map(function(item) { return item.count;}));

      var spectra = Spectra.find({uid: userId,
          projectId: projectId, label: {$in: props.labels.map((item)=>{return item.tag})}}, {y: 1, label: 1, labelId: 1}).fetch();
      
      if (oversample && maxCount !== minCount) {
        console.log('fixing class imbalance');
        labels.forEach((item)=>{
          if (item.count < maxCount) {
            // randomly sample additional maxCount - minCount spectra
            var diff = maxCount - item.count;

            
            if (diff > item.count) {
              var batches = diff / item.count;
              for (var i=0; i<Math.floor(batches); i++) {
                temp = sampleSpectra(userId, projectId, item.tag, item.count);
                spectra = spectra.concat(temp);
              }
              var remainder = diff % item.count;
              if (remainder > 0) {
                temp = sampleSpectra(userId, projectId, item.tag, remainder);
                spectra = spectra.concat(temp);
              }
            } else {
              temp = sampleSpectra(userId, projectId, item.tag, diff);
              spectra = spectra.concat(temp);
            }
          }
        });
      }

      var neurons = hexagonHelper.generateGrid(props.gridSize, props.gridSize);
      var steps = props.steps * spectra.length;
      const k = new Kohonen({
        data: _.map(_.get('y'), spectra),
        labels: mapLabels(spectra, labels),
        labelEnum: labels,
        neurons,
        maxStep: steps,
        maxLearningCoef: props.learningRate,
        minLearningCoef: 0.0001,
        maxNeighborhood: props.gridSize * (2 / 3),
        minNeighborhood: 0.1,
        distance: 'cosine',
        // class_method: 'hits',
        norm: 'zscore'
      });

      console.log('Starting learning');

      var previous = 0;
      k.learn((neurons, step)=>{
        var percent = Math.round((step / steps)*100);
        if (percent % 5 === 0 && percent !== previous) {
          console.log(percent);
          previous = percent;
        } 
      });

      if (props.lvq) {
        k.LVQ();
      }

      console.log('Finished learning');

      console.log('Mapping');
      var mapping = k.mapping();
      
      console.log('Saving model');
      var model = k.export();
      delete model._data;
      SOM.update({_id: somID}, {$set: {
          status: 100,
          completed_at: new Date(),
          model: model,
          lvq: props.lvq
        }
      });
      console.log('Saved model');
      this.success();
    }
});

Jobs.register({
  "crossValidation": function(projectId, props, somID, userId, oversample) {
    console.log('Starting cross validation');
    var labels = props.labels;
    labels = labels.map(function(item, index) {
      return {tag: item.tag, id: index}
    });

    var spectra = Spectra.find({uid: userId,
      projectId: projectId, label: {$in: props.labels.map((item)=>{return item.tag})}}, {y: 1, label: 1, labelId: 1}).fetch();

    // handle class inbalance
    var maxCount = Math.max.apply(Math, labels.map(function(item) { return item.count;}));
    var minCount = Math.min.apply(Math, labels.map(function(item) { return item.count;}));
    if (oversample && maxCount !== minCount) {
      console.log('fixing class imbalance');
      labels.forEach((item)=>{
        if (item.count < maxCount) {
          // randomly sample additional maxCount - minCount spectra
          var diff = maxCount - item.count;

          if (diff > item.count) {
            var batches = diff / item.count;
            for (var i=0; i<Math.floor(batches); i++) {
              temp = sampleSpectra(userId, projectId, item.tag, item.count);
              spectra = spectra.concat(temp);
            }
            var remainder = diff % item.count;
            if (remainder > 0) {
              temp = sampleSpectra(userId, projectId, item.tag, remainder);
              spectra = spectra.concat(temp);
            }
          } else {
            temp = sampleSpectra(userId, projectId, item.tag, diff);
            spectra = spectra.concat(temp);
          }
        }
      });
    }

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
          minLearningCoef: 0.0001,
          maxNeighborhood: props.gridSize * (2 / 3),
          minNeighborhood: 0.1,
          distance: 'cosine',
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
    console.log('Finished cross validation: ' + confusionMatrix.getAccuracy());
    var doc = {
      accuracy: confusionMatrix.getAccuracy(),
      confusionMatrix: confusionMatrix.getMatrix()
    }
    SOM.update({_id: somID}, {$set: {cv: doc}});
    Jobs.run("buildSOM", projectId, props, somID, userId, oversample, {singular: true});
    this.success();
  }
});
