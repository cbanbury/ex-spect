import { range } from 'd3-array';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { scaleLinear, scaleBand } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import * as d3 from 'd3';
import 'd3-selection-multi';
import { line } from 'd3-shape';
import { hexagonHelper } from 'kohonen';
import _ from 'lodash/fp';


Template.somPlot.onCreated(function() {
	this.model = new ReactiveVar();
	var that = this;

	this.autorun(()=>{
		this.modelSubscription = this.subscribe('SOM:model', FlowRouter.getParam('id'));
		if (this.modelSubscription.ready()) {
			that.model.set(SOM.findOne({_id: FlowRouter.getParam('id')}));

			that.stepX = 9

			that.scaleGrid = scaleLinear()
			  	.domain([0, 1])
			  	.range([0, that.stepX]);

			var classes = that.model.get().labels;
			 const scaleColor = scaleBand()
				.domain(classes)
				.range([1, 0]);

			that.scaleSize = scaleBand()
			    .domain(classes)
			    .range([10, 10]);

			that.getColor = _.flow(
				scaleColor,
				interpolateSpectral,
			);
		}
	});
});

Template.somPlot.onRendered(function() {
	$('ul.som-tabs').tabs();
	$('.tooltipped').tooltip({delay: 50});
});

Template.somPlot.helpers({
	crumbs: function() {
		return [
			{
				path: "/learn",
				title: 'Machine Learning'
			},
			{
				path: '',
				title: 'Self Organising Map (SOM)'
			}
		]
	},
	generateHexagons: function(neuron) {
		const hexagonPoints = ([x,y]) => {
		  // compute the radius of an hexagon
		  const radius = (Template.instance().stepX / 2) / Math.cos(Math.PI / 6);
		  return range(-Math.PI / 2, 2 * Math.PI, 2 * Math.PI / 6)
		    .map(a => [x + Math.cos(a) * radius, y + Math.sin(a) * radius]);
		};

		const pathGenfunction = _.flow(
	    	_.map(Template.instance().scaleGrid),
	     	hexagonPoints,
	     	line()
	   	);

		return pathGenfunction(neuron);
	},
	modelData: function() {
		var model = Template.instance().model.get();
		if (model) {
			model.trainingTime = (model.completed_at - model.created_at) / 1000;
		}
		return model;
	},
	neurons: function() {
		const haxagonsByLine = Template.instance().model.get().neurons;
		return hexagonHelper.generateGrid(haxagonsByLine, haxagonsByLine);
	},
	viewBoxSize: function() {
		return (Template.instance().model.get().neurons + 1) * 10;
	},
	classes: function() {
		return Template.instance().model.get().labels;
	},
	getColor: function(input) {
		return Template.instance().getColor(input);
	},
	placeNeuron: function(index) {
		var position = index * 100;
		return 'translate(' + position + ' 0)'
	},
	simulate: function() {
		const getX = _.flow(
		        _.get('[0]'),
		        _.map(Template.instance().scaleGrid),
		        _.get('[0]')
		      );

		      const getY = _.flow(
		        _.get('[0]'),
		        _.map(Template.instance().scaleGrid),
		        _.get('[1]')
		      );

		var nodes =  Template.instance().model.get().positions;

		var simulation = d3.forceSimulation(nodes)
		  .force("x", d3.forceX(getX))
		  .force("y", d3.forceY(getY))
		  .force('collision', d3.forceCollide().radius(function(d) {
		    return 0.5;
		  }))
		  .on('tick', ticked);

		function ticked() {
		  var u = d3.select('.som-grid')
		    .selectAll('circle')
		    .data(nodes)

		  u.enter()
		    .append('circle')
		    .attr('r', function(d) {
		      return 0.5
		    })
		    .merge(u)
		    .attrs({cx: _.get('x'), cy: _.get('y')});


		  u.exit().remove()
		}
		  
	},
	circles: function() {
		const getX = _.flow(
			  _.get('[0]'),
			  _.map(Template.instance().scaleGrid),
			  _.get('[0]')
			);

		const getY = _.flow(
		  _.get('[0]'),
		  _.map(Template.instance().scaleGrid),
		  _.get('[1]')
		);

		const getFill = _.flow(
		  _.get('[1].label'),
		  Template.instance().getColor,
		);

		const getSize = _.flow(
		  _.get('[1].class'),
		  Template.instance().scaleSize,
		);

		var results = Template.instance().model.get().positions;		

		return results.map((item)=>{
			return {
				x: getX(item),
				y: getY(item),
				color: getFill(item)
			}
		});
	}
});