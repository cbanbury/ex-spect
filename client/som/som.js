Template.som.events({
    'submit .compute-som': function(event, instance) {
        event.preventDefault();
        var projectId = event.target.projectSelect.value;
        var labels =  $('.chips').material_chip('data').map((item)=>{return item.tag});

        // var spectra = Spectra.find({uid: Meteor.userId(), projectId: projectId, label: {$in: labels}}, {y: 1, label: 1}).fetch();
        var gridSize = event.target.gridSize.value;

        Meteor.call('som:calculate', labels, projectId, gridSize);
        
        // Template.instance().labels.set(labels);
        // Template.instance().gridSize.set(gridSize);
        // instance.training.set({status:true});
        // NProgress.start();
        // calculateSom(spectra, labels, gridSize);
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
  models: function() {
    console.log(SOM.find({uid: Meteor.userId()}).fetch())
    return SOM.find({uid: Meteor.userId()}, {sort: {created_at: -1}});
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
