Template.som.events({
    'submit .compute-som': function(event, instance) {
        event.preventDefault();
        instance.modelSettings.set({
          labels: $('.chips').material_chip('data').map((item)=>{return item.tag}),
          gridSize: event.target.gridSize.value
        });
    },
    'change .project-select': function(event) {
      Session.set('data-loaded', false);
      Template.instance().projectId.set(event.target.value);
      var labels = Projects.findOne({uid: Meteor.userId(), _id: event.target.value}).labels;
       $('.chips').material_chip({
        data: labels
      });  
    },
    'click .view-model': function(event) {
      event.preventDefault();
      FlowRouter.go('model', {id: this._id});
    }
});

Template.som.helpers({
  projects: function() {
    return Projects.find({uid: Meteor.userId()});
  },
  dummy: function() {
    return Session.get('dummy');
  },
  models: function() {
    var models = SOM.find({uid: Meteor.userId()}, {sort: {created_at: -1}}).fetch();
    pids = models.map((item)=>{return item.projectId});
    var projects = Projects.find({uid: Meteor.userId(), _id: {$in: pids}}).fetch();
    
    return models.map((item)=>{
      item.projectName = projects.filter((project)=>{return project._id === item.projectId})[0].name;
      return item;
    });
  },
  gridSizes: function() {
    return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  },
  dataLoaded: function() {
    if (!Session.get('data-loaded')) {
      return 'disabled';
    }
  },
  runText: function() {
    if (Session.get('data-loaded')) {
      return 'Run';
    }

    return 'Loading'
  }
})

Template.som.onCreated(function() {
  this.modelSettings = new ReactiveVar();
  this.projectId = new ReactiveVar();
  this.autorun(()=>{
    this.projectSubscription = this.subscribe('projects');
  });
});

Template.som.onRendered(function() {
    function calculateSOM(labels, gridSize) {
        $('#runButton').text('building...');
        $('#runButton').attr('disabled', 'disabled')
        import Kohonen, {hexagonHelper} from 'kohonen';
        import _ from 'lodash/fp';
        var projectId = Template.instance().projectId.get();

        var start = new Date().getTime();
        var spectra = Spectra.find({uid: Meteor.userId(), 
            projectId: projectId, label: {$in: labels}}, {y: 1, label: 1}).fetch();
        
        var autoSteps = spectra.length * 10;

        var suggestedGridSize = Math.sqrt(5*Math.sqrt(spectra.length));
        
        var updateInterval = Math.round(autoSteps / 10);

        Meteor.call('SOM:seed', labels, projectId, +gridSize, autoSteps, function(err, objectId) {
          // setup the self organising map
          var neurons = hexagonHelper.generateGrid(gridSize, gridSize);

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
              console.log((counter / updateInterval) * 10);
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
          console.log('Completed training');
          Meteor.call('SOM:save', objectId, positions, function(err) {
            $('#runButton').text('run');
            $('#runButton').attr('disabled', null)
          });
        });
    }

    this.autorun(()=>{
      modelSettings = Template.instance().modelSettings.get();
      if (modelSettings && modelSettings.labels) {
        calculateSOM(modelSettings.labels, modelSettings.gridSize)
      }

      this.spectraSubscription = this.subscribe('project:spectra:meta', Template.instance().projectId.get());
      this.modelSubscription = this.subscribe('SOM');
      if (this.projectSubscription.ready()) {
        $('select').material_select();
      }

      if (this.spectraSubscription.ready()) {
        Session.set('data-loaded', true);
      }
    });
});
