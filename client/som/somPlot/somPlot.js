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
	this.stepX = 7

	this.scaleGrid = scaleLinear()
  		.domain([0, 1])
  		.range([0, this.stepX]);

  	var classes = Template.instance().data.labels;
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
});

Template.somPlot.onRendered(function() {
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
		const haxagonsByLine = Template.instance().data.gridSize;
		return hexagonHelper.generateGrid(haxagonsByLine, haxagonsByLine);
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
		var width = 400, height = 400

		console.log('simulating')

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

		var nodes =  Template.instance().data.results;

		var simulation = d3.forceSimulation(nodes)
		  .force("x", d3.forceX(getX))
		  .force("y", d3.forceY(getY))
		  .force('collision', d3.forceCollide().radius(function(d) {
		    return 0.5;
		  }))
		  .on('tick', ticked);

		function ticked() {
		  var u = d3.select('svg')
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

		var results = Template.instance().data.results;		

		return results.map((item)=>{
			return {
				x: getX(item),
				y: getY(item),
				color: getFill(item)
			}
		});
	}
});