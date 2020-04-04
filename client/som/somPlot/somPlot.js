import { range } from 'd3-array';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { scaleLinear, scaleBand } from 'd3-scale';
import { interpolateSpectral } from 'd3-scale-chromatic';
import * as d3 from 'd3';
import { line } from 'd3-shape';
import Kohonen, { hexagonHelper } from 'kohonen';
import _ from 'lodash/fp';
import domtoimage from 'dom-to-image';

Template.somPlot.onCreated(function() {
	this.model = new ReactiveVar();

	// setup functions for animation
	this.stepX = 9

	this.scaleGrid = scaleLinear()
	  	.domain([0, 1])
	  	.range([0, this.stepX]);

	var classes = this.data.k.labelEnum.map((item)=>{return item.id});
	var colorValues = this.data.k.labelEnum.map(function(item) {
		return d3.rgb(item.color)
	});

	this.scaleSize = scaleBand()
	    .domain(classes)
	    .range([1, 1]);

	this.getColor = (id)=>{
		var match = this.data.k.labelEnum.filter((item)=>{
			return item.id === id;
		});

		return d3.rgb(match[0].color);
	}

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

	// find circle size based on number of spectra in neuron
	var positions = Template.instance().data.positions;
	positions = positions.map((item)=>{return item[0].toString();});

	var count = {};
	var max = 0;
	positions.forEach((item)=>{
		if (!count[item]) {
			count[item] = 1
		} else {
			count[item] += 1
		}
		if (count[item] > max) {
			max = count[item];
		}
	});

	const hexagonRadius = (Template.instance().stepX / 2) / Math.cos(Math.PI / 6);

	this.scaleFactor = Math.sqrt(0.4 * Math.pow(hexagonRadius, 2) / max);
});

Template.somPlot.onRendered(function() {
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
	showSpectra: function() {
		if (+Template.instance().data.showSpectra === 1) {
			return true;
		}
		return false;
	},
	neurons: function() {
		const haxagonsByLine = Math.sqrt(Template.instance().data.k.neurons.length);
		return hexagonHelper.generateGrid(haxagonsByLine, haxagonsByLine);
	},
	hexagonColor: function(pos) {
		var classes = Template.instance().data.k.labelEnum;
		var positions = Template.instance().data.positions;
		var matches = positions.filter((item) => {
			return item[0][0] === pos[0] && item[0][1] === pos[1];
		});

		if (matches.length === 0) {
			return '#FFF';
		}

		var color = '#FFF';
		var winner = 0;
		classes.forEach((item) => {
			var classMatch = matches.filter((match)=>{return match[1].class === item.id});
			if (classMatch.length > winner) {
				winner = classMatch.length;
				color = item.color
			}
		});

		return color;
	},
	hexagonOpacity: function(pos) {
		var classes = Template.instance().data.k.labelEnum;
		var positions = Template.instance().data.positions;
		var matches = positions.filter((item) => {
			return item[0][0] === pos[0] && item[0][1] === pos[1];
		});

		var color = '#FFF';
		var winner = 0;
		classes.forEach((item, index) => {
			var classMatch = matches.filter((match)=>{return match[1].class === item.id});
			if (classMatch.length > winner) {
				winner = classMatch.length;
				//color = item.color
			}
		});

		ratio = 1;

		if (matches.length > 0) {
			var ratio = winner / matches.length;
		}

		return ratio;
	},
	viewBoxSize: function() {
		return (Math.sqrt(Template.instance().data.k.numNeurons)) * 10 + 10;
	},
	classes: function() {
		return Template.instance().data.k.labelEnum;
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
		const radius = (Template.instance().stepX / 2) / Math.cos(Math.PI / 6);
		if (nodes && nodes.length > 0) {
			var simulation = d3.forceSimulation(nodes)
			  .force("x", d3.forceX(Template.instance().getX))
			  .force("y", d3.forceY(Template.instance().getY))
			  // .force("charge", d3.forceManyBody().strength(-0.04).distanceMax(Template.instance().scaleFactor))
			  .force('collision', d3.forceCollide().radius(function(d) {
			    return Template.instance().scaleFactor;
			  }))
			  .on('tick', ticked);

			function ticked() {
			  var u = d3.select('.som-grid')
			    .selectAll('circle')
			    .data(nodes)

			  u.enter()
			    .append('circle')
			    .attr('r', function(d) {
			      return Template.instance().scaleFactor
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
	circleSize: function() {
		return Template.instance().scaleFactor; //(Template.instance().stepX / 2) / Math.cos(Math.PI / 6) / Template.instance().scaleFactor;
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
					color: getFill(item),
				}
			});
		}
	}
});
