import Kohonen, { hexagonHelper } from 'kohonen';

Template.somdi.onCreated(function () {
	this.x = new ReactiveVar();
	// remember arrow functions do not bind this!
	this.autorun(()=>{
		this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));
		this.somdi = new ReactiveVar();

		if (this.spectraSubscription.ready()) {
			this.x.set(Spectra.findOne({projectId: FlowRouter.getParam("id")}, {x: 1}).x);

			var out = [];
			this.data.k.labelEnum.forEach((label)=>{
				out.push({
					mode: 'lines',
					x: this.x.get(),
					y: this.data.k.SOMDI(label.id).somdi,
					name: label.tag
				});
			});
			
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
		}
	});
});