Template.pca.onRendered(function() {
    Meteor.call('pca:get', function(err, res) {
        if (err) {
            console.log(err);
        }

        var scores = res.elements;

        var layout = {
            xaxis: {
                title: 'PC1'
            },
            yaxis: {
                title: 'PC2'
            }
        };
        console.log(scores);
        Plotly.newPlot('pcaPlot', [{x:scores[scores.length], y:scores[scores.length-1], mode:'markers', type: 'scatter'}], layout);
    });
});
