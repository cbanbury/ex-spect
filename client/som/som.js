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
  k: function() {
    return Template.instance().k.get();
  },
  positions: function() {
    return Template.instance().positions.get();
  },
  somBuilt: function () {
    return Template.instance().somBuilt.get();
  },
})

Template.som.onCreated(function() {
  this.projectData = new ReactiveVar({name: ''});
  this.k = new ReactiveVar();
  this.positions = new ReactiveVar();
  this.somBuilt = new ReactiveVar(false);
});

Template.som.onRendered(function() {
    import materialize from 'materialize-css';
    import { scaleBand } from 'd3-scale';
    import * as d3 from 'd3';

    M.Tabs.init(document.getElementById('som-tabs'));

    this.autorun(()=>{
      if (FlowRouter.subsReady('projectSub')) {
        Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
      }

      if (FlowRouter.subsReady()) {
        if (FlowRouter.getQueryParam('m')) {
          var instance = Template.instance();
          Meteor.call('SOM:getModel', FlowRouter.getQueryParam('m'), FlowRouter.getParam("id"), function (err, som) {
            instance.positions.set(som.positions);
            var temp = new Kohonen();

            temp.import([], [], som.model)
            instance.k.set(temp);
            instance.somBuilt.set(true);
            // som.model.labelEnum.forEach((item)=>{
            //   document.getElementById('color-' + item.id).style.background = item.color;
            // });
          });
        }
      }
    });
});
