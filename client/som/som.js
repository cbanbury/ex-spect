Template.som.onRendered(function() {
    import Kohonen, {hexagonHelper} from 'kohonen';
    import _ from 'lodash-fp';
    import d3 from 'd3';

    var data = [
        [255, 0 , 0],
        [180, 0 , 0],
        [150, 0 , 0],
        [80, 0 , 0],
        [100, 0 , 0],
        [0, 255, 0],
        [0, 0, 255],
        [50, 0, 0],
        [0, 100, 0],
        [0, 120, 0]
    ];

    // setup the self organising map
    var hexagonData = hexagonHelper.generateGrid(6, 6);
    const k = new Kohonen({data, neurons: hexagonData});
    k.training();
    var somData = k.mapping();

    // the umatrix is a greyscale map that allows automatic visualisations.
    // not using it here to let us define colours based on how they are defined
    // in the data.
    var umatrix = k.umatrix();

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
                return value === currentHexagon.pos;
            });

            // set colour to match the RGB value from the datas
            if (foo) {
                return 'rgb(' + data[index][0] + ',' + data[index][1] + ',' + data[index][2] + ')';
            }
            return 'rgb(255, 255, 255)';
       })
       .attr('stroke', '#ccc');

       var chart2 = d3.select("#chart2").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       const mGrid = chart2.append('g')
       .attr('id', 'g-grid');

       const grid2 = mGrid.selectAll('.grid').data(hexagonData);
       grid2.enter().append('path')
       .attr('class', 'grid')
       .attr('d', function(center) {
           return d3.line()(hexagonPath(center.pos.map(scaleGrid)));
       })
       .attr('fill', function(currentHexagon) {
           // find the element in our data that matches the current co-ordinate
            var index = 0;
            var foo = somData.find(function(value, i) {
                index = i;
                return value === currentHexagon.pos;
            });

            // set colour to match the RGB value from the datas
            if (foo && data[index][0] > 50) {
                return 'rgb(255, 214, 0)';
            }
            return 'rgb(93, 64, 55)';
       })
       .attr('stroke', '#ccc');
});
