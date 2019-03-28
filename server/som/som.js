import Kohonen, {hexagonHelper} from 'kohonen';
import _ from 'lodash/fp';

function mapLabels(spectra, labelEnum) {
  return spectra.map((spectrum)=>{
  var match = labelEnum.filter((item)=>{return item.tag === spectrum.label});
  if (match && match.length === 1) {
    return match[0].id;  
  }
  });
}

Meteor.methods({
    'SOM:save': function(model, projectId, LVQ) {
        // make sure we don't duplicate the data
        delete model._data;
        SOM.insert({
            completed_at: new Date(),
            uid: Meteor.userId(),
            model: model,
            projectId: projectId,
            gridSize: Math.sqrt(model.numNeurons),
            lvq: LVQ
        });
    },
    'SOM:delete': function(id) {
        SOM.remove({uid: Meteor.userId(), _id: id});
    },
    'SOM:compute': function(projectId, props) {
        console.log('New call to build SOM');
        var spectra = Spectra.find({uid: Meteor.userId(), 
            projectId: projectId, label: {$in: props.labels.map((item)=>{return item.tag})}}, {y: 1, label: 1, labelId: 1}).fetch();

        var neurons = hexagonHelper.generateGrid(props.gridSize, props.gridSize);
        const k = new Kohonen({
          data: _.map(_.get('y'), spectra),
          labels: mapLabels(spectra, props.labels),
          labelEnum: props.labels,
          neurons, 
          maxStep: props.steps,
          maxLearningCoef: props.learningRate,
          minLearningCoef: 0.001,
          maxNeighborhood: props.neighbourhood,
          minNeighborhood: 0.1,
          // distance: 'manhattan',
          norm: true
        });

        console.log('Starting learning');
        k.learn((neurons, step)=>{console.log(step)});
        if (props.lvq) {
          k.LVQ();
        }

        console.log('Finished learning');

        console.log('Saving model');
        var model = k.export();
        delete model._data;
        SOM.insert({
            completed_at: new Date(),
            uid: Meteor.userId(),
            model: model,
            projectId: projectId,
            gridSize: Math.sqrt(model.numNeurons),
            lvq: props.lvq
        });
    },
    'SOM:getMapping': function(somId, projectId) {
      var som = SOM.findOne({_id: somId});

      var spectra = Spectra.find({projectId: projectId, 
                  label: {$in: som.model.labelEnum.map((item)=>{return item.tag})}}, {y: 1, label: 1}).fetch();
      var k = new Kohonen();
      k.import(_.map(_.get('y'), spectra), mapLabels(spectra, som.model.labelEnum), som.model);
      return {mapping: k.mapping(), som: som};
    }
})