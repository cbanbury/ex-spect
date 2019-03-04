import Kohonen, {hexagonHelper} from 'kohonen';
import _ from 'lodash/fp';

Template.som.events({
    'submit .compute-som': function(event, instance) {
        event.preventDefault();
        var labels = Template.instance().labels.get();

        var labelEnum = [];
        labels.forEach(function(label) {
          var enabled = event.target['label-' + label.tag].checked;
          if (enabled) {
            color = event.target['colour-' + label.id].value;
            labelEnum.push({tag: label.tag, id: label.id, color: color});
          }
        });

        var props = {
          labels: labelEnum,
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
        $('#lvq').is(':checked')
      );
      M.toast({html: 'Model saved', displayLength: 2000});
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
    return Template.instance().labels.get();
  },
  somBuilt: function () {
    return Template.instance().somBuilt.get();
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
  this.labels = new ReactiveVar();
});

Template.som.onRendered(function() {
    import materialize from 'materialize-css';
    M.Tabs.init(document.getElementById('som-tabs'));

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
            projectId: projectId, label: {$in: props.labels.map((item)=>{return item.tag})}}, {y: 1, label: 1, labelId: 1}).fetch();

        if (spectra.length < 1) {
          M.toast({html: 'No data found, please try again.', displayLength: 2000})
          $('#runButton').text('run');
          $('#runButton').attr('disabled', null)
          return null;
        }

        // var suggestedGridSize = Math.sqrt(5*Math.sqrt(spectra.length));
        // Materialize.toast('Suggested grid size: ' + Math.round(suggestedGridSize), 2000);

        // setup the self organising map
        var neurons = hexagonHelper.generateGrid(props.gridSize, props.gridSize);
        const k = new Kohonen({
          data: _.map(_.get('y'), spectra),
          labels: this.mapLabels(spectra, props.labels),
          labelEnum: props.labels,
          neurons, 
          maxStep: props.steps,
          maxLearningCoef: props.learningRate,
          minLearningCoef: 0.001,
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
                // Materialize.toast('Running LVQ', 2000)
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

    import { scaleBand } from 'd3-scale';
    import * as d3 from 'd3';
    this.autorun(()=>{
      if (FlowRouter.subsReady('projectSub')) {
        Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
        
        // define ids for labels
        var labels = Template.instance().projectData.get().labels;
        labels = labels.map(function(item, index) {
          return {tag: item.tag, id: index}
        });

        // set default colours
        var classes = labels.map((item)=>{return item.id});
        const colorScale = scaleBand().domain(classes).range([1, 0]);
        const getColor = _.flow(colorScale, d3.scaleOrdinal(d3.schemeCategory10));
        labels.map((item, index)=>{
          item.color = getColor (index);
          return item; 
        })

        Template.instance().labels.set(labels);
      }

      if (FlowRouter.subsReady()) {
        Session.set('data-loaded', true);

        if (FlowRouter.getQueryParam('m')) {
          var som = SOM.findOne({_id: FlowRouter.getQueryParam('m')});
          var spectra = Spectra.find({projectId: FlowRouter.getParam("id"), 
            label: {$in: som.model.labelEnum.map((item)=>{return item.tag})}}, {y: 1, label: 1}).fetch();
          
          // deserialize the model
          var k = new Kohonen();
          k.import(_.map(_.get('y'), spectra), this.mapLabels(spectra, som.model.labelEnum), som.model);

          // set properties
          Template.instance().k.set(k);
          $('#learning_rate').val(som.model.maxLearningCoef)
          $('#steps').val(som.model.maxStep)
          $('#neighbourhood').val(som.model.maxNeighborhood)
          if (som.lvq) {
            $('#lvq').prop('checked', true)
          }
          $('#gridSize').val(som.gridSize)

          // figure out how to set chips enabled
          Template.instance().labels.set(som.model.labelEnum);
          //$('.chips').chips({data: som.model.labelEnum})

          Template.instance().positions.set(k.mapping());
          Template.instance().somBuilt.set(true);
        }
      }
    });
});
