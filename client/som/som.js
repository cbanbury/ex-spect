Template.som.events({
    'submit .compute-som': function(event) {
        event.preventDefault();
        var projectId = event.target.projectSelect.value;
        var labels =  $('.chips').material_chip('data').map((item)=>{return item.tag});

        var spectra = Spectra.find({uid: Meteor.userId(), projectId: projectId, label: {$in: labels}}, {y: 1, label: 1}).fetch();
        var gridSize = event.target.gridSize.value;
        
        Template.instance().labels.set(labels);
        Template.instance().gridSize.set(gridSize);
        console.log('good to go')
        console.log(Session.get('data-loaded'))
        console.log(labels)
          console.log(spectra.length)

        
       
        // Template.instance().somData.set(calculateSom(spectra, labels, gridSize));
    },
    'change .project-select': function(event) {
      Session.set('data-loaded', false);
      Template.instance().projectId.set(event.target.value);
      var labels = Projects.findOne({uid: Meteor.userId(), _id: event.target.value}).labels;
       $('.chips').material_chip({
        data: labels
      });  
    }
});

Template.som.helpers({
  projects: function() {
    return Projects.find({uid: Meteor.userId()});
  },
  somData: function() {
    return Template.instance().somData.get();
  },
  labels: function() {
    return Template.instance().labels.get();
  },
  gridSizes: function() {
    return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  },
  gridSize: function() {
    return Template.instance().gridSize.get();
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
  this.projectId = new ReactiveVar();
  this.autorun(()=>{
    this.projectSubscription = this.subscribe('projects');
  });
  
  this.somData = new ReactiveVar(null);
  this.labels = new ReactiveVar(null);
  this.gridSize = new ReactiveVar(null);
});

Template.som.onRendered(function() {
    this.percentTrained = new ReactiveVar();
    
    this.autorun(()=>{
      this.spectraSubscription = this.subscribe('project:spectra', Template.instance().projectId.get());

      if (this.projectSubscription.ready()) {
        $('select').material_select();
      }

      if (this.spectraSubscription.ready()) {
        Session.set('data-loaded', true);
      }
    });
});

function calculateSom(spectra, labels, gridSize) {
    import Kohonen, {hexagonHelper} from 'kohonen';
    import _ from 'lodash/fp';
    import d3 from 'd3';

    var autoSteps = spectra.length * 10;

    var suggestedGridSize = Math.sqrt(5*Math.sqrt(spectra.length));
    console.log('Suggested grid size for data: ' + suggestedGridSize);

    console.log('Number of steps to run: ' + autoSteps);

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
    var start = new Date().getTime();
    k.training(function() {
        console.log('step complete')
    });
    var end = new Date().getTime();

    console.log('past training in: ' + (end-start)/1000);
    
    var positions = k.mapping();

    return _.unzip([
      positions,
      _.map(
        _.pick(['label', 'file_meta']),
        spectra,
        ),
      ]);
};
