Template.pca.onCreated(function() {
    this.loaded = new ReactiveVar(false);
});

Template.pca.helpers({
    loaded: function() {
        return Template.instance().loaded.get();
    }
});

Template.pca.onRendered(function() {
    var instance = Template.instance();
    Meteor.call('pca:get', function(err, res) {
        if (err) {
            console.log(err);
        }
        instance.loaded.set(true);

        var layout = {
            xaxis: {
                title: 'PC1'
            },
            yaxis: {
                title: 'PC2'
            }
        };
        var healthy = res.healthy;
        var diseased = res.diseased;
        Plotly.newPlot('pcaPlot', [
            {x:healthy.x, y:healthy.y, mode:'markers', type: 'scatter', name: 'healthy'},
            {x:diseased.x, y:diseased.y, mode:'markers', type: 'scatter', name: 'diseased'}
        ], layout);
    });
});
