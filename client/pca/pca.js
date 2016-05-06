Template.pca.onCreated(function() {
    this.loaded = new ReactiveVar(false);
});

Template.pca.helpers({
    loaded: function() {
        return Template.instance().loaded.get();
    }
});

Template.pca.events({
    'blur input': function(event) {
        doPCA(event.target.value.split(','));
    }
});

Template.pca.onRendered(function() {
    doPCA(["healthy", "diseased"]);
});

function doPCA(tags) {
    var instance = Template.instance();
    Meteor.call('pca:get', tags, function(err, res) {
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

        keys = Object.keys(res);
        var plotData = [];

        for (i=0; i<keys.length; i++) {
            plotData.push({
                x: res[keys[i]].x,
                y: res[keys[i]].y,
                type: 'scatter',
                mode:'markers',
                name: keys[i]
            });
        }

        Plotly.newPlot('pcaPlot', plotData, layout);
    });
}
