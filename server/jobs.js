import { Jobs } from 'meteor/msavin:sjobs'
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
        maxStep: props.steps,
        maxLearningCoef: props.learningRate,
        minLearningCoef: 0.001,
        maxNeighborhood: props.neighbourhood,
        minNeighborhood: 0.1,
        // distance: 'manhattan',
        norm: true
      });

      console.log('Starting learning');
      var logLevel = props.steps / 10;
      k.learn((neurons, step)=>{
        if (step % logLevel == 0) {
          var percent = (step / props.steps) * 100;
          console.log(percent + '%');
          SOM.update({_id: somID}, {$set: {
              status: percent
            }
          });
        }
        // console.log(step)
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
