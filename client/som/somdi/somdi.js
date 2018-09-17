import Kohonen, { hexagonHelper } from 'kohonen';

Template.somdi.onCreated(function () {
	this.model = new ReactiveVar();
	this.somdi = new ReactiveVar();
	this.x = new ReactiveVar();
	// remember arrow functions do not bind this!
	this.autorun(()=>{
		this.modelSubscription = this.subscribe('SOM:model', FlowRouter.getParam('modelId'));
		this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
		this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));
		this.somdi = new ReactiveVar();

		if (this.spectraSubscription.ready()) {
			this.x.set(Spectra.findOne({projectId: FlowRouter.getParam("id")}, {x: 1}).x);

			if (this.modelSubscription.ready()) {
				var somModel = SOM.findOne({_id: FlowRouter.getParam('modelId')});
				this.model.set(somModel);

				var k = new Kohonen();
				k.import(somModel.model);
				var out = [];
				somModel.labels.forEach((label)=>{
					out.push({
						mode: 'lines',
						x: this.x.get(),
						y: k.SOMDI(label.id, 0.9).somdi,
						name: label.tag
					});
				});

				console.log(out)

				var layout = {
				    autosize: true,
				    // width: 350,
				    // height: 250,
				    xaxis: {
				        title: 'Wavenumber (cm / -1)'
				    },
				    yaxis: {
				        title: 'Intensity'
				    },
				    plot_bgcolor: '#eeeeee',
				    paper_bgcolor: '#eeeeee'
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
		}
	});
});

Template.somdi.onRendered(function() {

})

Template.somdi.helpers({	
});