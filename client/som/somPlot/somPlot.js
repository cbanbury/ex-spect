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
	// var positions = Template.instance().data.positions;
	// positions = positions.map((item)=>{return item[0].toString();});

	// var count = {};
	// var max = 0;
	// positions.forEach((item)=>{
	// 	if (!count[item]) {
	// 		count[item] = 1
	// 	} else {
	// 		count[item] += 1
	// 	}
	// 	if (count[item] > max) {
	// 		max = count[item];
	// 	}
	// });

	// const hexagonRadius = (Template.instance().stepX / 2) / Math.cos(Math.PI / 6);

	// this.scaleFactor = Math.sqrt(0.4 * Math.pow(hexagonRadius, 2) / max);
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
		return Template.instance().data.k.neurons;
		// return hexagonHelper.generateGrid(haxagonsByLine, haxagonsByLine);
	},
	hexagonColor: function(hits) {
		var classes = Template.instance().data.k.labelEnum;
		var color = '#FFF';

		function convertHex(hex,opacity){
		    hex = hex.replace('#','');
		    r = parseInt(hex.substring(0,2), 16);
		    g = parseInt(hex.substring(2,4), 16);
		    b = parseInt(hex.substring(4,6), 16);

		    return [r, g, b];
		}

		function componentToHex(c) {
			c = Math.floor(c);
  			var hex = c.toString(16);
  			return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(color) {
			var r = color[0]; g = color[1]; b = color[2];
  			return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}
		var max = Math.max(...hits);
		if (max === 0) {
			return '#FFF';
		}

		var total = 0;
		hits.forEach((item) =>{
			total += item
		});
		
		var mixed = [0, 0, 0];
		classes.forEach((item) => {
			var ratio = hits[item.id] / total;
			var rgb = convertHex(item.color);
			// console.log(rgb);
			mixed.forEach((item, index) => {
				mixed[index] += ratio * rgb[index]
			})
		});
		// console.log(mixed);
		// console.log(rgbToHex(mixed));

		console.log(mixed);
		console.log(rgbToHex(mixed));
		return rgbToHex(mixed);

		var max = Math.max(...hits);
		if (max === 0) {
			return color;
		}
		

		var total = 0;
		hits.forEach((item) =>{
			total += item
		});
		var ratio = max / total;
		if (ratio < 0.5) {
			return '#FFF';
		}

		var winningIndex = hits.indexOf(max);
		var res = classes.filter((item) => {
			return item.id === winningIndex;
		});

		if (res[0] && res[0].color) {
			return res[0].color;
		}

		return color;
	},
	hexagonOpacity: function(hits) {
		var total = 0;
		var winner = 0;
		hits.forEach((item) =>{
			total += item
			if (item > winner) {
				winner = item;
			}
		});
		if (winner === total) {
			return 0.8;
		}

		return 0.5;


		var ratio = winner / total;

		if (ratio < 0.5) {
			return 0.2;
		}

		// return ratio - 0.3;
		// if (ratio < 0.5) {
		// 	return ratio
		// }

		var opacity = 0.2 + (winner * 0.01);

		if (opacity > 0.8) {
			opacity = 0.8;
		}

		return opacity;
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
