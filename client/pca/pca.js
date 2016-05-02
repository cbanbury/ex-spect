Template.pca.onRendered(function() {
    Plotly.d3.csv('/examples/pca.csv', function(err, rawData) {
        if (err) {
            console.log(err);
        }
        console.log(rawData[1]);
    });

    Meteor.call('pca:get', function(err, res) {
        if (err) {
            console.log(err);
        }

        console.log(res);
    });
});
