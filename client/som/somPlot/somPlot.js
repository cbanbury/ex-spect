import { range } from 'd3-array';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { scaleLinear, scaleBand } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import * as d3 from 'd3-selection';
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

	this.getColor = _.flow(
		scaleColor,
		interpolateSpectral,
	);
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