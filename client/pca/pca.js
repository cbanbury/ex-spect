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
        console.log(res)
        Plotly.newPlot('pcaPlot', [{
            x:res.healthy.x,
            y: res.healthy.y,
            type: 'scatter',
            mode:'markers',
            marker: {
                size: 12,
                opacity: 0.8
            }
        },
        {
            x:res.diseased.x,
            y: res.diseased.y,
            type: 'scatter',
            mode:'markers',
            marker: {
                size: 12,
                opacity: 0.8
            }
        }
    ], layout);
    });
}
