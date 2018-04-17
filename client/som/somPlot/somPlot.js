import { range } from 'd3-array';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { scaleLinear, scaleBand } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import * as d3 from 'd3-selection';
import 'd3-selection-multi';
import { line } from 'd3-shape';
import { hexagonHelper } from 'kohonen';
import _ from 'lodash/fp';

const stepX = 10;
const scaleGrid = scaleLinear()
  .domain([0, 1])
  .range([0, stepX]);

Template.somPlot.helpers({
	generateHexagons: function(neuron) {
		const hexagonPoints = ([x,y]) => {
		  // compute the radius of an hexagon
		  const radius = (stepX / 2) / Math.cos(Math.PI / 6);
		  return range(-Math.PI / 2, 2 * Math.PI, 2 * Math.PI / 6)
		    .map(a => [x + Math.cos(a) * radius, y + Math.sin(a) * radius]);
		};

		const pathGenfunction = _.flow(
	    	_.map(scaleGrid),
	     	hexagonPoints,
	     	line()
	   	);

		return pathGenfunction(neuron);
	},
	neurons: function() {
		const haxagonsByLine = 7;
		return hexagonHelper.generateGrid(haxagonsByLine, haxagonsByLine);
	},
	classes: function() {
		return Template.instance().data.labels;
	},
	placeNeuron: function(index) {
		var position = index * 100;
		return 'translate(' + position + ' 0)'
	},
	circles: function() {
		const classes = Template.instance().data.labels;
		console.log(classes)

		const scaleColor = scaleBand()
		    .domain(classes)
		    .range([1, 0]);

		const getColor = _.flow(
			scaleColor,
		    interpolateSpectral,
		);

		const getX = _.flow(
			  _.get('[0]'),
			  _.map(scaleGrid),
			  _.get('[0]')
			);

		const getY = _.flow(
		  _.get('[0]'),
		  _.map(scaleGrid),
		  _.get('[1]')
		);

		const getFill = _.flow(
		  _.get('[1].label'),
		  getColor,
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