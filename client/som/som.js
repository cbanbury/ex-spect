Template.som.events({
    'submit .compute-som': function(event, instance) {
        event.preventDefault();
        var projectId = event.target.projectSelect.value;
        if (!projectId) {
          Materialize.toast('Please select a project first.', 3000, 'red');
          return;
        }

        Materialize.toast('Building SOM...', 4000);

        var labels =  $('.chips').material_chip('data').map((item)=>{return item.tag});
        var gridSize = event.target.gridSize.value;
        Meteor.call('som:calculate', labels, projectId, gridSize);
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
  models: function() {
    return SOM.find({uid: Meteor.userId()}, {sort: {created_at: -1}});
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
  
  this.gridSize = new ReactiveVar(null);
});

Template.som.onRendered(function() {
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
