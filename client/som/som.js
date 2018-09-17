Template.som.events({
    'submit .compute-som': function(event, instance) {
        event.preventDefault();
        var labels = $('.chips').material_chip('data').map((item)=>{return item.tag});
        var gridSize = event.target.gridSize.value;
        
        instance.calculateSOM(labels, gridSize);
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
  labels: function() {
    return $('.chips').material_chip('data');
  },
  somBuilt: function () {
    return Template.instance().somBuilt.get();
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
  },
  k: function() {
    return Template.instance().k.get();
  },
  positions: function() {
    return Template.instance().positions.get();
  }
})

Template.som.onCreated(function() {
  this.autorun(()=>{
   this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
   this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));
  });

  this.projectData = new ReactiveVar({name: ''});
  this.somBuilt = new ReactiveVar(false);
  this.k = new ReactiveVar();
  this.positions = new ReactiveVar();
});

Template.som.onRendered(function() {
    this.calculateSOM = function (labels, gridSize) {
        Template.instance().somBuilt.set(false);
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

        var instance = Template.instance();
        instance.k.set(k);

        for (var i=0; i<autoSteps; i++) {
          window.setTimeout(function(){
            var step = k.learnStep();

            $('#runButton').text(Math.floor((step / autoSteps)*100) + '%');
            if (step === autoSteps) {
              $('#runButton').text('run');
              $('#runButton').attr('disabled', null)
              instance.somBuilt.set(true);
              instance.positions.set(k.mapping());
            }
          }, 0);
        }
    }

    $('select').material_select();
    this.autorun(()=>{
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
