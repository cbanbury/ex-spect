Meteor.methods({
    'som:calculate': function(labels, projectId, gridSize) {
        import { Jobs } from 'meteor/msavin:sjobs';

        Jobs.register({
            "buildSOM": function (userId) {
                var that = this;
                import Kohonen, {hexagonHelper} from 'kohonen';
                import _ from 'lodash/fp';

                var spectra = Spectra.find({uid: userId, 
                    projectId: projectId, label: {$in: labels}}, {y: 1, label: 1}).fetch();
                var autoSteps = spectra.length * 10;

                var suggestedGridSize = Math.sqrt(5*Math.sqrt(spectra.length));
                console.log('Suggested grid size for data: ' + suggestedGridSize);

                console.log('Number of steps to run: ' + autoSteps);
                var updateInterval = Math.round(autoSteps / 10);

                // setup the self organising map
                var neurons = hexagonHelper.generateGrid(gridSize, gridSize);
                
                var start = new Date().getTime();
                SOM.insert(
                {
                    labels: labels,
                    projectId: projectId,
                    neurons: +gridSize,
                    autoSteps: autoSteps,
                    uid: userId,
                    complete: false,
                    created_at: new Date()
                }, function(err, objectId) {
                    const k = new Kohonen({
                      data: _.map(_.get('y'), spectra),
                      neurons, 
                      maxStep: autoSteps,
                      maxLearningCoef: 1,
                      minLearningCoef: 0.3,
                      maxNeighborhood: 1,
                      minNeighborhood: 0.3,
                      randomStart: true,
                      classPlanes: labels
                    });

                    console.log('Starting training')
                    var counter = 0;
                    k.training(function(neuron) {
                        counter++;
                        if (counter % updateInterval === 0) {
                            SOM.update({_id: objectId}, {$set: {progress: (counter / updateInterval) * 10}})
                        }
                        
                    });
                    
                    var positions = k.mapping();

                    positions = _.unzip([
                      positions,
                      _.map(
                        _.pick(['label', 'file_meta']),
                        spectra,
                        ),
                    ]);

                    SOM.update({_id: objectId}, {$set: {
                        completed_at: new Date(),
                        positions: positions,
                        complete: true
                    }}, function(err){
                    });
                    that.success();
                });
            }
        });

        Jobs.run("buildSOM", Meteor.userId());
    }
})