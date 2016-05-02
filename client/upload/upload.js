Template.upload.onCreated(function() {
    this.xdata = new ReactiveVar([]);
    this.ydata = new ReactiveVar([]);
});

Template.upload.helpers({
    xdata: function() {
        return Template.instance().xdata.get();
    },
    ydata: function() {
        return Template.instance().ydata.get();
    }
});

Template.upload.events({
    "submit .save-spectrum": function(event) {
        event.preventDefault();
        var target = event.target;
        var instance = Template.instance();

        Spectra.insert({name: target.name.value, x: instance.xdata.get(), y: instance.ydata.get()});
        FlowRouter.go("");
    },
    "change input[type='file']": function() {
        var files = event.target.files;
        var instance = Template.instance();

        Plotly.d3.text(URL.createObjectURL(files[0]), function(err, rawData) {
            var x = [];
            var y = [];
            d3.tsv.parseRows(rawData, function(row) {
                x.push(+row[0]);
                y.push(+row[1]);
            });

            instance.xdata.set(x);
            instance.ydata.set(y);

            var layout = {
                xaxis: {
                    title: 'Wavenumber (cm / -1)'
                },
                yaxis: {
                    title: 'Intensity'
                }
            };

            Plotly.newPlot('graph', [{mode: 'lines', x: x, y: y}], layout);
        });

        // if (files.length === 1) {
        //     BlockUI.block();
        //
        //     Cloudinary.upload(files, null, function(err, res) {
        //         BlockUI.unblock();
        //         if (err) {
        //             Materialize.toast('Image upload failed. Please try again later.', 4000, 'red');
        //         }
        //
        //         var doc = {};
        //         doc['images.' + image] = res.url;
        //         Meteor.call(that.collection + '.update', that.context._id, doc, false);
        //     });
        // }
    }
});
