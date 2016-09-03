Template.pca.onCreated(function() {
    this.loaded = new ReactiveVar(true);
});

Template.pca.helpers({
    loaded: function() {
        return Template.instance().loaded.get();
    }
});

Template.pca.events({
    'submit .computPCA': function(event) {
        event.preventDefault();
        doPCA(event.target.classes.value.split(','));
    }
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

        var groups = Object.keys(res);
        var plots = [];
        groups.forEach(function(group) {
            plots.push({
                x: res[group].x,
                y: res[group].y,
                name: group,
                type: 'scatter',
                mode:'markers',
                marker: {
                    size: 12,
                    opacity: 0.8
                }
            })
        });

        Plotly.newPlot('pcaPlot', plots, layout);
    });
}
