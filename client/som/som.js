Template.som.events({
    'submit .compute-som': function(event) {
        event.preventDefault();
        var projectId = event.target.projectSelect.value;
        var labels =  $('.chips').material_chip('data').map((item)=>{return item.tag});
        var spectra = Spectra.find({uid: Meteor.userId(), projectId: projectId, label: {$in: labels}}).fetch();
        var gridSize = event.target.gridSize.value;
        
        Template.instance().labels.set(labels);
        Template.instance().gridSize.set(gridSize);
        Template.instance().somData.set(calculateSom(spectra, labels, gridSize));
    },
    'change .project-select': function(event) {
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
  }
})

Template.som.onCreated(function() {
  this.autorun(()=>{
    this.projectSubscription = this.subscribe('projects');
    this.spectraSubscription = this.subscribe('user:spectra');
  });

  this.projectData = new ReactiveVar();
  this.somData = new ReactiveVar(null);
  this.labels = new ReactiveVar(null);
  this.gridSize = new ReactiveVar(null);
});

Template.som.onRendered(function() {
    this.percentTrained = new ReactiveVar();
    
    this.autorun(()=>{
      if (this.projectSubscription.ready()) {
        $('select').material_select();
      }
    });
});

function calculateSom(spectra, labels, gridSize) {
    import Kohonen, {hexagonHelper} from 'kohonen';
    import _ from 'lodash/fp';
    import d3 from 'd3';

    // setup the self organising map
    var neurons = hexagonHelper.generateGrid(gridSize, gridSize);
    const k = new Kohonen({
      data: _.map(_.get('y'), spectra),
      neurons, 
      maxStep: 10,
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
