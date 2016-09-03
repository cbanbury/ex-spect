// TODO: make this used generically everywhere
Template.spectrumGraph.onRendered(function() {
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

        var gd3 = d3.select('.graph' + this.data.id)
        .append('div')
        .style({
            width: WIDTH_IN_PERCENT_OF_PARENT + '%',
            'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

            height: 'auto',
            'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
        });

        var gd = gd3.node();

    Plotly.newPlot(gd, [{mode: 'lines', x: this.data.x, y: this.data.y}], layout);

    window.onresize = function() {
        Plotly.Plots.resize(gd);
    };
});
