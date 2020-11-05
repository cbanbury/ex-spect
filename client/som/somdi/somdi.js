import Kohonen, { hexagonHelper } from 'kohonen';

Template.somdi.onCreated(function () {
	// remember arrow functions do not bind this!
	this.autorun(()=>{
		this.somdi = new ReactiveVar();
		var template = Template.instance();

		Meteor.call('SOM:getX', FlowRouter.getParam("id"), (err, x)=> {
			var out = [];
			this.data.k.labelEnum.forEach((label)=>{
				out.push({
					mode: 'lines',
					x: x,
					y: this.data.k.SOMDI(label.id).somdi,
					line: {
						color: label.color
					},
					name: label.tag
				});
			});

			template.somdi.set(out);

			var layout = {
			    autosize: true,
			    // width: 350,
			    // height: 250,
			    xaxis: {
			        title: 'Raman Shift (cm' + String.fromCharCode(8315) + String.fromCharCode(185) + ')'
			    },
			    yaxis: {
			        title: 'Intensity'
			    },
			};

			var d3 = Plotly.d3;

			var WIDTH_IN_PERCENT_OF_PARENT = 100,
			    HEIGHT_IN_PERCENT_OF_PARENT = 100;

			    var gd3 = d3.select('.graph')
			    .append('div')
			    .style({
			        width: WIDTH_IN_PERCENT_OF_PARENT + '%',
			        'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

			        height: 'auto',
			        'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
			    });

			    var gd = gd3.node();

			Plotly.newPlot(gd, out, layout);

			window.onresize = function() {
			    Plotly.Plots.resize(gd);
			};
		})
	});
});

Template.somdi.events({
	'click .export': function(event) {
		event.preventDefault();

		var somdi = Template.instance().somdi.get();
		var columns = 0;

		// set headers
		var headers = 'Raman Shift (cm^-1)'
		somdi.forEach(item=>{
			columns++;
			headers = headers + ',' + item.name;
		});
		headers = headers + '\r\n';


		let csvContent = "data:text/csv;charset=utf-8,";
		csvContent = csvContent + headers;

		if (columns > 0) {
			var x = somdi[0].x;

			for (var j=0; j<x.length; j++) {
				var row = x[j].toString();
				for (var i=0; i<columns; i++) {
					row = row + ',' + somdi[i].y[j];
				}

				csvContent += row + '\r\n';
			}

			var encodedUri = encodeURI(csvContent);
			window.open(encodedUri);
		}
	}
})
