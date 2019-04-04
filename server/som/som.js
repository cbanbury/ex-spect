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
    'SOM:delete': function(id) {
        var result = SOM.remove({uid: Meteor.userId(), _id: id});
    },
    'SOM:compute': function(projectId, props) {
        console.log('New call to build SOM');
        var somID = new Mongo.ObjectID().toString();
        SOM.insert({
            status: 0,
            _id: somID,
            uid: Meteor.userId(),
            projectId: projectId,
            gridSize: props.gridSize,
            created_at: new Date()
        });
        // define ids for labels
        var labels = props.labels;
        labels = labels.map(function(item, index) {
          return {tag: item.tag, id: index}
        });

        var spectra = Spectra.find({uid: Meteor.userId(),
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
