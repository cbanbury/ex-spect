Template.som.onRendered(function() {
    import Kohonen, {hexagonHelper} from 'kohonen';

    var data = [
        [255, 0 , 0],
        [0, 255, 0],
        [0, 0, 255],
        [50, 0, 0],
        [0, 100, 0]
    ];

    var myGrid = [
            {pos: [0, 0]},
            {pos: [0, 1]},
            {pos: [0, 2]},
            {pos: [1, 0]},
            {pos: [1, 1]},
            {pos: [1, 2]},
            {pos: [2, 0]},
            {pos: [2, 1]},
            {pos: [2, 2]},
    ];

    const k = new Kohonen({data, neurons: myGrid});
    k.training();
    var myPositions = k.mapping();

    var plotData = [];
    myPositions.forEach(function(item, iteration) {
        var foo = {
            x: [item[0]],
            y: [item[1]],
            mode: 'markers',
            marker: {
                color: 'rgb(' + data[iteration][0] + ',' + data[iteration][1] + ',' + data[iteration][2] + ')'
            },
        };
        plotData.push(foo);
    });
    
    Plotly.newPlot('chart', plotData);
});
