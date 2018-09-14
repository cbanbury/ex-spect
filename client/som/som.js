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
      FlowRouter.go('model', {id: FlowRouter.getParam("id"), modelId: this._id});
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
  dummy: function() {
    return Session.get('dummy');
  },
  models: function() {
    return SOM.find({uid: Meteor.userId(), projectId: FlowRouter.getParam("id")}, {sort: {created_at: -1}});
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
  this.autorun(()=>{
   this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
   this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));
  });

  this.projectData = new ReactiveVar({name: ''});
});

Template.som.onRendered(function() {
    function calculateSOM(labels, gridSize) {
        $('#runButton').text('building...');
        $('#runButton').attr('disabled', 'disabled')
        import Kohonen, {hexagonHelper} from 'kohonen';
        import _ from 'lodash/fp';
        var projectId = FlowRouter.getParam("id");

        var start = new Date().getTime();

        var spectra = Spectra.find({uid: Meteor.userId(), 
            projectId: projectId, label: {$in: labels}}, {y: 1, label: 1, labelId: 1}).fetch();
        
        var autoSteps = spectra.length * 10;

        var suggestedGridSize = Math.sqrt(5*Math.sqrt(spectra.length));
        
        var updateInterval = Math.round(autoSteps / 10);

        Meteor.call('SOM:seed', labels, projectId, +gridSize, autoSteps, function(err, objectId) {
          var labelEnum = [];
          labels.map((item, index)=>{labelEnum.push({tag: item, id: index})});
          
          var spectraLabels = spectra.map((spectrum)=>{
            var match = labelEnum.filter((item)=>{return item.tag === spectrum.label});
            return match[0].id;  
          });

          // setup the self organising map
          var neurons = hexagonHelper.generateGrid(gridSize, gridSize);

          const k = new Kohonen({
            data: _.map(_.get('y'), spectra),
            labels: spectraLabels,
            neurons, 
            maxStep: autoSteps,
            maxLearningCoef: 1,
            minLearningCoef: 0.3,
            maxNeighborhood: 1,
            minNeighborhood: 0.3
          });

          console.log('Starting training')
          // var counter = 0;
          k.learn((step)=>{
            console.log('got here')
            Materialize.toast('woop woop')
          });
          
          var positions = k.mapping();

          console.log('Completed training');

          Meteor.call('SOM:save', objectId, positions, labelEnum, function(err) {
            $('#runButton').text('run');
            $('#runButton').attr('disabled', null)
          });
        });
    }
    $('select').material_select();
    this.autorun(()=>{
      modelSettings = Template.instance().modelSettings.get();
      if (modelSettings && modelSettings.labels) {
        calculateSOM(modelSettings.labels, modelSettings.gridSize)
      }

      this.modelSubscription = this.subscribe('SOM');
      if (this.projectSubscription.ready()) {
        Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
        $('.chips').material_chip({
          data: Template.instance().projectData.get().labels
        });
      }

      if (this.spectraSubscription.ready()) {
        Session.set('data-loaded', true);
      }
    });
});
