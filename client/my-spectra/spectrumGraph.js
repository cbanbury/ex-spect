// TODO: make this used generically everywhere
Template.spectrumGraph.onRendered(function() {
    var layout = {
        autosize: false,
        width: 350,
        height: 250,
        xaxis: {
            title: 'Wavenumber (cm / -1)'
        },
        yaxis: {
            title: 'Intensity'
        },
    };

    Plotly.newPlot('graph' + this.data.id, [{mode: 'lines', x: this.data.x, y: this.data.y}], layout);
});
