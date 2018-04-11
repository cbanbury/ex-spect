Template.viewer.helpers({
	'spectra': function() {
		return SelectedSpectra.find({});
	},
	'crumbs': function() {
		var project = Template.instance().projectData.get();
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
				path: '',
				title: 'Plot'
			}
		]
	}
});

Template.viewer.onCreated(function() {
	this.autorun(() => {
	  this.projectSubscription = this.subscribe('project', FlowRouter.getParam("id"));
	  this.spectraSubscription = this.subscribe('project:spectra', FlowRouter.getParam("id"));
	});

	this.projectData = new ReactiveVar({name: ''});
});

Template.viewer.onRendered(function(){
	this.autorun(()=>{
		if (this.projectSubscription.ready()) {
			Template.instance().projectData.set(Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}));
		}

		if (this.spectraSubscription.ready()) {
			var ids = SelectedSpectra.find({}).fetch().map((item)=>{return item._id});
			var spectra = Spectra.find({_id: {$in: ids}});
			spectra = spectra.map((item)=>{
				return {mode: 'lines', x: item.x, y: item.y, name: item.file_meta.name}
			});

			var layout = {
			    // autosize: true,
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

			Plotly.newPlot(gd, spectra, layout);

			window.onresize = function() {
			    Plotly.Plots.resize(gd);
			};
		}
	});
});