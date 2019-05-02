import _ from 'lodash';
import Matrix from 'ml-matrix';
const { fork } = require('child_process');
const path = require('path');

import Kohonen, {hexagonHelper} from 'kohonen';

function mapLabels(spectra, labelEnum) {
  return spectra.map((spectrum)=>{
    var match = labelEnum.filter((item)=>{return item.tag === spectrum.label});
    if (match && match.length === 1) {
      return match[0].id;
    }
    return -1;
  });
}

Meteor.methods({
    'SOM:delete': function(id) {
        var result = SOM.remove({uid: Meteor.userId(), _id: id});
    },
    'SOM:compute': function(projectId, props) {
      console.log('New call to build SOM');
      var somID = SOM.insert({
          status: 0,
          // _id: somID,
          uid: Meteor.userId(),
          projectId: projectId,
          gridSize: props.gridSize,
          created_at: new Date(),
          description: props.description
      });

      Jobs.run("buildSOM", projectId, props, somID, Meteor.userId(), {singular: true});
    },
    'SOM:cross-validate': function(projectId, props) {
      console.log('New call for cross validation');
      var somID = SOM.insert({
          status: 0,
          uid: Meteor.userId(),
          projectId: projectId,
          gridSize: props.gridSize,
          created_at: new Date(),
          description: props.description
      });

      Jobs.run("crossValidation", projectId, props, somID, Meteor.userId());
    },
    'SOM:test-data': function(somId, projectId) {
      console.log('running test data');
      var som = SOM.findOne({_id: somId});
      var k = new Kohonen();
      k.import([], [], som.model);

      // load test Data
      var testData = TestSpectra.find({uid: Meteor.userId(),
          projectId: projectId, label: {$in: som.model.labelEnum.map((item)=>{return item.tag})}},
          {y: 1, label: 1}).fetch();
      var predictions = k._predict(testData.map(function(item){return item.y}));
      var accuracy = 0;
      var total = testData.length;
      var maxLabel = _.maxBy(som.model.labelEnum, (item)=>{return item.id});

      maxLabel = maxLabel.id +1;
      var confusionMatrix = Matrix.zeros(maxLabel, maxLabel);

      var testLabels = mapLabels(testData, som.model.labelEnum);
      testLabels.forEach(function(actual, index) {
        var prediction = predictions[index];
       	if (actual === prediction) {
       	  accuracy++;
       	}

       	confusionMatrix.set(actual, prediction, confusionMatrix.get(actual, prediction) + 1);
      });

      SOM.update({_id: somId}, {$set: {
        test: {
          accuracy: (accuracy / total) * 100,
          confusionMatrix: confusionMatrix.to2DArray()
        }
      }})
      console.log('finished running test data');
    },
    'SOM:getModel': function(somId, projectId) {
      var project = Projects.findOne({_id: projectId});
      var som = SOM.findOne({_id: somId});
      som.model.labelEnum.map((item)=>{
          var match = project.labels.filter((label)=>{
            return label.tag === item.tag;
          })

          if (match && match[0]) {
            item.color = match[0].color;
          }
      })
      return som;
    },
    'SOM:getX': function(projectId) {
      return Spectra.findOne({projectId: projectId}, {x: 1}).x
    }
})
