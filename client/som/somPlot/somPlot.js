import { range } from 'd3-array';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { scaleLinear, scaleBand } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import * as d3 from 'd3';
import { line } from 'd3-shape';
import Kohonen, { hexagonHelper } from 'kohonen';
import _ from 'lodash/fp';


Template.somPlot.onCreated(function() {
	console.log(this.data)
	this.model = new ReactiveVar();
	
	// setup functions for animation
	this.stepX = 9

	this.scaleGrid = scaleLinear()
	  	.domain([0, 1])
	  	.range([0, this.stepX]);

	var classes = this.data.labels.map((item)=>{return item.id});
	 const scaleColor = scaleBand()
		.domain(classes)
		.range([1, 0]);

	this.scaleSize = scaleBand()
	    .domain(classes)
	    .range([10, 10]);

	this.getColor = _.flow(
		scaleColor,
		interpolateSpectral,
	);

	this.getX = _.flow(
	    _.get('[0]'),
	    _.map(Template.instance().scaleGrid),
	    _.get('[0]')
	);

	this.getY = _.flow(
	    _.get('[0]'),
	    _.map(Template.instance().scaleGrid),
	    _.get('[1]')
	);
});

Template.somPlot.onRendered(function() {
	$('ul.som-tabs').tabs();
	$('.tooltipped').tooltip({delay: 50});
});

Template.somPlot.helpers({
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
	neurons: function() {
		const haxagonsByLine = Math.sqrt(Template.instance().data.k.numNeurons);
		return hexagonHelper.generateGrid(haxagonsByLine, haxagonsByLine);
	},
	viewBoxSize: function() {
		return (Math.sqrt(Template.instance().data.k.numNeurons + 1)) * 13;
	},
	classes: function() {
		return Template.instance().data.labels;
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
		var nodes = Template.instance().data.positions;

		if (nodes && nodes.length > 0) {
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
		} else {
			Materialize.toast('Something went wrong. No data available for SOM', 4000, 'red')
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

		var results = Template.instance().data.positions;

		if (results && results.length > 0) {
			return results.map((item)=>{
				return {
					x: Template.instance().getX(item),
					y: Template.instance().getY(item),
					color: getFill(item)
				}
			});
		}
	}
});