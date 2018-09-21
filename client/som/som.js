import Kohonen, {hexagonHelper} from 'kohonen';
import _ from 'lodash/fp';

Template.som.events({
    'submit .compute-som': function(event, instance) {
        event.preventDefault();
        var props = {
          labels: $('.chips').material_chip('data').map((item)=>{return item.tag}),
          gridSize: +event.target.gridSize.value,
          learningRate: +event.target.learning_rate.value,
          steps: +event.target.steps.value,
          lvq: event.target.lvq.checked,
          neighbourhood: +event.target.neighbourhood.value
        }
        
        instance.calculateSOM(props);
    },
    'click .save-model':function() {
      event.preventDefault();
      Meteor.call('SOM:save', 
        Template.instance().k.get().export(),
        FlowRouter.getParam("id"),
        Template.instance().labelEnum.get(),
        $('#lvq').is(':checked')
      );
      Materialize.toast('Model saved', 2000);
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
        path: '/projects/' + FlowRouter.getParam("id") + '/models',
        title: 'Machine Learning'
      },
      {
        path: '',
        title: 'Model'
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
  canSave: function() {
    if (!Template.instance().somBuilt.get()) {
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
  this.projectData = new ReactiveVar({name: ''});
  this.somBuilt = new ReactiveVar(false);
  this.k = new ReactiveVar();
  this.positions = new ReactiveVar();
  this.labelEnum = new ReactiveVar();

  this.autorun(()=>{
   this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
   this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));

   if (FlowRouter.getQueryParam('m')) {
    this.modelSubscription = this.subscribe('SOM:model', FlowRouter.getQueryParam('m'));
   }
  });
});

Template.som.onRendered(function() {
    this.mapLabels = (spectra, labelEnum)=>{
      return spectra.map((spectrum)=>{
          var match = labelEnum.filter((item)=>{return item.tag === spectrum.label});
          if (match && match.length === 1) {
            return match[0].id;  
          }
      });
    }

    this.calculateSOM = (props)=> {
        Template.instance().somBuilt.set(false);
        $('#runButton').text('building...');
        $('#runButton').attr('disabled', 'disabled')

        var projectId = FlowRouter.getParam("id");

        var start = new Date().getTime();

        var spectra = Spectra.find({uid: Meteor.userId(), 
            projectId: projectId, label: {$in: props.labels}}, {y: 1, label: 1, labelId: 1}).fetch();

        var suggestedGridSize = Math.sqrt(5*Math.sqrt(spectra.length));
        Materialize.toast('Suggested grid size: ' + Math.round(suggestedGridSize), 2000);

        var labelEnum = [];
        props.labels.map((item, index)=>{labelEnum.push({tag: item, id: index})});
        
        Template.instance().labelEnum.set(labelEnum);

        // setup the self organising map
        var neurons = hexagonHelper.generateGrid(props.gridSize, props.gridSize);
        const k = new Kohonen({
          data: _.map(_.get('y'), spectra),
          labels: this.mapLabels(spectra, labelEnum),
          neurons, 
          maxStep: props.steps,
          maxLearningCoef: props.learningRate,
          minLearningCoef: 0.01,
          maxNeighborhood: props.neighbourhood,
          minNeighborhood: 0.1,
          distance: 'manhattan',
          norm: true
        });

        var instance = Template.instance();
        instance.k.set(k);

        for (var i=0; i<props.steps; i++) {
          window.setTimeout(function(){
            var step = k.learnStep();

            $('#runButton').text(Math.floor((step / props.steps)*100) + '%');
            if (step === props.steps) {
              if (props.lvq) {
                Materialize.toast('Running LVQ', 2000)
                k.LVQ();
              }
              $('#runButton').text('run');
              $('#runButton').attr('disabled', null)
              instance.somBuilt.set(true);
              instance.k.set(k);
              instance.positions.set(k.mapping());
            }
          }, 0);
        }
    }

    $('select').material_select();
    $('ul.som-tabs').tabs();
    this.autorun(()=>{
      if (this.projectSubscription.ready()) {
        Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
        $('.chips').material_chip({
          data: Template.instance().projectData.get().labels
        });
      }

      if (this.spectraSubscription.ready()) {
        Session.set('data-loaded', true);

        if (this.modelSubscription.ready()) {
          var som = SOM.findOne({_id: FlowRouter.getQueryParam('m')});
          var spectra = Spectra.find({projectId: FlowRouter.getParam("id"), 
            label: {$in: som.labels.map((item)=>{return item.tag})}}, {y: 1, label: 1}).fetch();
        
          // deserialize the model
          var k = new Kohonen();
          k.import(_.map(_.get('y'), spectra), this.mapLabels(spectra, som.labels), som.model);

          // set properties
          Template.instance().k.set(k);
          $('#learning_rate').val(som.model.maxLearningCoef)
          $('#steps').val(som.model.maxStep)
          $('#neighbourhood').val(som.model.maxNeighborhood)
          if (som.lvq) {
            $('#lvq').prop('checked', true)
          }
          $('.select-dropdown').val(som.gridSize + 'x' + som.gridSize)
          $('.chips').material_chip({data: som.labels})
          
          Template.instance().positions.set(k.mapping());
          Template.instance().somBuilt.set(true);
        }
      }
    });
});
