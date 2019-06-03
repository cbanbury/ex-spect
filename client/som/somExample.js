Template.somExample.onRendered(function() {
    import Kohonen, {hexagonHelper} from 'kohonen';
    import _ from 'lodash-fp';
    import d3 from 'd3';

    var data = [
        // reds
        [255, 0 , 0],
        [229,57,53],
        [183,28,28],
        [255,205,210],
        [255,23,68],
        [213,0,0],
        // greens
        [0, 255, 0],
        [27,94,32],
        [0,200,83],
        [200,230,201],
        [118,255,3],
        [56,142,60],
        // blues
        [0, 0, 255],
        [187,222,251],
        [13,71,161],
        [41,98,255],
        [130,177,255],
        [24,255,255]
    ];

    var labels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // setup the self organising map
    var hexagonData = hexagonHelper.generateGrid(6, 6);
    const k = new Kohonen({
        data: data,
        labels: labels,
        neurons: hexagonData,
        maxStep: 100,
        maxLearningCoef: 0.1,
        minLearningCoef: 0.001,
        maxNeighborhood: 6,
        minNeighborhood: 1,
        norm: 'max'
    });
    k.learn();
    var somData = k.mapping();

    // scale up the hexagons so we can visualise it on screen
    const stepX = 25;
    const scaleGrid = d3.scaleLinear()
        .domain([0, 1])
        .range([0, stepX]);


    // D3 View stuff
    //svg sizes and margins
    var margin = {
        top: 10,
        right: 0,
        bottom: 0,
        left: 10
    },
    width = 300,
    height = 200;

    //Create SVG element
    var svg = d3.select("#chart").append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       const hexagonPath = function([x, y]) {
           // compute the radius of an hexagon
           const radius = (stepX / 2) / Math.cos(Math.PI / 6);
           return d3.range(-Math.PI / 2, 2 * Math.PI, 2 * Math.PI / 6)
           .map(a => [x + Math.cos(a) * radius, y + Math.sin(a) * radius]);
       }

       const gGrid = svg.append('g')
       .attr('id', 'g-grid');

       const grid = gGrid.selectAll('.grid').data(hexagonData);
       grid.enter().append('path')
       .attr('class', 'grid')
       .attr('d', function(center) {
           return d3.line()(hexagonPath(center.pos.map(scaleGrid)));
       })
       .attr('fill', function(currentHexagon) {
           // find the element in our data that matches the current co-ordinate
            var index = 0;
            var foo = somData.find(function(value, i) {
                index = i;
                return value[0] === currentHexagon.pos;
            });

            // set colour to match the RGB value from the datas
            if (foo) {
                return 'rgb(' + data[index][0] + ',' + data[index][1] + ',' + data[index][2] + ')';
            }
            return 'rgb(255, 255, 255)';
       })
       .attr('stroke', '#ccc');
});
