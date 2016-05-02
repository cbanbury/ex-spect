Template.plot.onRendered(function() {
    var rawDataURL = 'http://localhost:3000/examples/polystyrene-irug.csv';
    var xField = 'Wavenumber';
    var yField = 'Intensity';

    var selectorOptions = {
        buttons: [{
            step: 'month',
            stepmode: 'backward',
            count: 1,
            label: '1m'
        }, {
            step: 'month',
            stepmode: 'backward',
            count: 6,
            label: '6m'
        }, {
            step: 'year',
            stepmode: 'todate',
            count: 1,
            label: 'YTD'
        }, {
            step: 'year',
            stepmode: 'backward',
            count: 1,
            label: '1y'
        }, {
            step: 'all',
        }],
    };

    Plotly.d3.csv(rawDataURL, function(err, rawData) {
        if(err) throw err;

        var data = prepData(rawData);
        var layout = {
            xaxis: {
                title: 'Wavenumber (cm / -1)'
            },
            yaxis: {
                title: 'Intensity'
            }
        };

        Plotly.newPlot('graph', data, layout);
    });

    function prepData(rawData) {
        var x = [];
        var y = [];

        rawData.forEach(function(datum, i) {

            x.push(datum[xField]);
            y.push(datum[yField]);
        });

        return [{
            mode: 'lines',
            x: x,
            y: y
        }];
    }
});
