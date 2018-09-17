import { range } from 'd3-array';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { scaleLinear, scaleBand } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import * as d3 from 'd3';
import { line } from 'd3-shape';
import Kohonen, { hexagonHelper } from 'kohonen';
import _ from 'lodash/fp';


Template.somPlot.onCreated(function() {
	this.model = new ReactiveVar();
	this.positions = new ReactiveVar();
	var self = this;

	this.autorun(()=>{
		this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
		this.modelSubscription = this.subscribe('SOM:model', FlowRouter.getParam('modelId'));
		this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));
		if (this.modelSubscription.ready() && this.spectraSubscription.ready()) {
			var somModel = SOM.findOne({_id: FlowRouter.getParam('modelId')});
			var spectra = Spectra.find({projectId: FlowRouter.getParam("id")}, {y: 1, label: 1})
			somModel.model._data = {v: [], labels: [], somdi: []};
			spectra.map((spectrum)=>{
				somModel._data.v.push(spectrum.y);

				var match = somModel.model.labels.filter((item)=>{return item.tag === spectrum.label});
				somModel._data.labels.push(match[0].id);

				var somdi = new Array(somModel.model.labels.length).fill(0);
				somdi[match[0].id] = 1;
				somModel._data.somdi.push(somdi);
			});

			self.model.set(somModel);

			// deserialize the Kohonen model
			var k = new Kohonen();
			k.import(somModel.model);
			self.positions.set(k.mapping());

			// setup functions for animation
			self.stepX = 9

			self.scaleGrid = scaleLinear()
			  	.domain([0, 1])
			  	.range([0, self.stepX]);

			var classes = self.model.get().labels.map((item)=>{return item.id});
			 const scaleColor = scaleBand()
				.domain(classes)
				.range([1, 0]);

			self.scaleSize = scaleBand()
			    .domain(classes)
			    .range([10, 10]);

			self.getColor = _.flow(
				scaleColor,
				interpolateSpectral,
			);

			self.getX = _.flow(
			    _.get('[0]'),
			    _.map(Template.instance().scaleGrid),
			    _.get('[0]')
			);

			self.getY = _.flow(
			    _.get('[0]'),
			    _.map(Template.instance().scaleGrid),
			    _.get('[1]')
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
		var project = Projects.findOne({_id: FlowRouter.getParam("id")})
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
				path: '/projects/' + project._id + '/learn',
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
		// do force simulation to prevent circles from overlapping in neurons
		var nodes = Template.instance().positions.get();

		var simulation = d3.forceSimulation(nodes)
		  .force("x", d3.forceX(Template.instance().getX))
		  .force("y", d3.forceY(Template.instance().getY))
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
		    .attr('cx', _.get('x'))
		    .attr('cy', _.get('y'))

		  u.exit().remove()
		}
		  
	},
	circles: function() {
		// paint a circle for each spectrum into the map
		const getFill = _.flow(
		  _.get('[1].class'),
		  Template.instance().getColor,
		);

		const getSize = _.flow(
		  _.get('[1].class'),
		  Template.instance().scaleSize,
		);

		var results = Template.instance().positions.get();
		return results.map((item)=>{
			return {
				x: Template.instance().getX(item),
				y: Template.instance().getY(item),
				color: getFill(item)
			}
		});
	}
});