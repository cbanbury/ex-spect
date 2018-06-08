Template.som.events({
    'submit .compute-som': function(event, instance) {
        event.preventDefault();
        instance.modelSettings.set({
          labels: $('.chips').material_chip('data').map((item)=>{return item.tag}),
          gridSize: event.target.gridSize.value
        });
    },
    'click .view-model': function(event) {
      event.preventDefault();
      FlowRouter.go('model', {id: FlowRouter.getParam('id'), modelId: this._id});
    }
});

Template.som.helpers({
  'crumbs': function() {
    var project = Template.instance().projectData.get();
    return [
      {
        path: '/projects',
        title: 'Projects'
      },
      {
        path: '/projects/' + project._id,
        title: project.name
      },
      {
        path: '',
        title: 'Machine Learning'
      }
    ]
  },
  models: function() {
    console.log(SOM.findOne({}))
    return SOM.find({uid: Meteor.userId()}, {sort: {created_at: -1}});
  },
  gridSizes: function() {
    return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  },
  ready: function() {
    return Template.instance().ready.get();
  }
})

Template.som.onCreated(function() {
  this.modelSettings = new ReactiveVar();
  this.projectData = new ReactiveVar({name: ''});
  this.ready = new ReactiveVar();

  this.modelSubscription = this.subscribe('SOM:meta');
  this.projectSubscription = this.subscribe('project', FlowRouter.getParam('id'));
  this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));
});

Template.som.onRendered(function() {
    import _ from 'lodash/fp';
    function calculateSOM(labels, gridSize) {
        $('#runButton').text('building...');
        $('#runButton').attr('disabled', 'disabled')
        import Kohonen, {hexagonHelper} from 'kohonen';
        
        var projectId = FlowRouter.getParam("id");

        var spectra = Spectra.find({uid: Meteor.userId(), 
            projectId: projectId, label: {$in: labels}}, {y: 1, label: 1}).fetch();
        
        var autoSteps = spectra.length * 10;

        var suggestedGridSize = Math.sqrt(5*Math.sqrt(spectra.length));
        
        var updateInterval = Math.round(autoSteps / 10);

        // setup the self organising map
        var neurons = hexagonHelper.generateGrid(gridSize, gridSize);
        return {
          k: new Kohonen({
            data: _.map(_.get('y'), spectra),
            neurons, 
            maxStep: autoSteps,
            maxLearningCoef: 1,
            minLearningCoef: 0.3,
            maxNeighborhood: 1,
            minNeighborhood: 0.3,
            randomStart: true,
            classPlanes: labels
          }),
          autoSteps: autoSteps,
          updateInterval: updateInterval,
          spectra: spectra
        };
    }

    this.autorun(()=>{
      var modelSettings = Template.instance().modelSettings.get();
      if (modelSettings && modelSettings.labels) {
        labels = modelSettings.labels;
        gridSize = modelSettings.gridSize;
        Template.instance().modelSettings.set(null);
        
        console.log('starting');
        const somSetup = calculateSOM(modelSettings.labels, modelSettings.gridSize);

        Meteor.call('SOM:seed', modelSettings.labels, FlowRouter.getParam("id"), +modelSettings.gridSize, somSetup.autoSteps, function(err, objectId) {
          var k = somSetup.k;

          console.log('Starting training')
          
          var counter = 0;
          k.training(function(neuron) {
            counter++;
            if (counter % somSetup.updateInterval === 0) {
              console.log((counter / somSetup.updateInterval) * 10);
            }
          });
          
          var positions = k.mapping();

          positions = _.unzip([
            positions,
            _.map(
              _.pick(['label', 'file_meta']),
              somSetup.spectra,
              ),
          ]);
          console.log('Completed training');
          Meteor.call('SOM:save', objectId, positions, function(err) {
            $('#runButton').text('run');
            $('#runButton').attr('disabled', null);
          });
        });
      }

      if (Template.instance().subscriptionsReady()) {
        Template.instance().ready.set(true);
        var project = Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});
        Template.instance().projectData.set(project);

        Tracker.afterFlush(()=>{
          $('select').material_select();

          $('.chips').material_chip({
            data:  project.labels
          });  
        });
      }
    });
});
