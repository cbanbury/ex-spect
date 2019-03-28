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
            color = event.target['color-' + label.id].value;
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
  },
  showSpectra: function() {
    return $("input[name='show-spectra']:checked").val();
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

        var instance = Template.instance();

        Meteor.call('SOM:compute', projectId, props);
        M.toast({html: 'Model building', displayLength: 2000});
        FlowRouter.go('models', {id: FlowRouter.getParam("id")});
    }

    import { scaleBand } from 'd3-scale';
    import * as d3 from 'd3';
    this.autorun(()=>{
      jscolor.installByClassName("jscolor");
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
          var instance = Template.instance();
          Meteor.call('SOM:getModel', FlowRouter.getQueryParam('m'), FlowRouter.getParam("id"), function (err, som) {
            instance.positions.set(som.positions);
            var temp = new Kohonen();

            temp.import([], [], som.model)
            instance.k.set(temp);
            instance.somBuilt.set(true);

            // set properties
            $('#learning_rate').val(som.model.maxLearningCoef)
            $('#steps').val(som.model.maxStep)
            $('#neighbourhood').val(som.model.maxNeighborhood)
            if (som.lvq) {
              $('#lvq').prop('checked', true)
            }
            $('#gridSize').val(som.gridSize)

            instance.labels.set(som.model.labelEnum);
            som.model.labelEnum.forEach((item)=>{
              document.getElementById('color-' + item.id).style.background = item.color;
            });
          });
        }
      }
    });
});
