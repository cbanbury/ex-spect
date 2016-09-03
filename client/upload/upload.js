TempFiles = new Mongo.Collection(null);

Template.upload.onRendered(function(){
    $(document).ready(function(){
        $('ul.tabs').tabs();
    });
});

Template.upload.events({
    "submit .save-spectrum": function(event) {
        event.preventDefault();
        var target = event.target;
        var instance = Template.instance();
        var fileData = TempFiles.findOne({flag: 'single'});

        Meteor.call('spectra:insert', target.name.value, fileData, function(err) {
            if (err) {
                Materialize.toast('Unable to upload file. Please try again later.')
            }
            FlowRouter.go("mySpectra");
        });

    },
    "submit .save-spectra": function(event) {
        event.preventDefault();
        var target = event.target;
        var instance = Template.instance();
        var fileData = TempFiles.find({flag: {$exists: false}}).fetch();
        toUpload = fileData.length;

        for (i=0; i<fileData.length; i++) {
            Spectra.insert({tag: target.tag.value, x: fileData[i].x, y: fileData[i].y}, function(err, res) {
                toUpload--;

                if (toUpload === 0) {
                    FlowRouter.go("mySpectra");
                }
            });
        }
    },
    "change .spectra-upload": function() {
        var files = event.target.files;
        var instance = Template.instance();

        for (i=0; i<files.length; i++) {
            getFileData(files[i], function(err, x, y) {
                TempFiles.insert({
                    x: x,
                    y: y
                });
            });
        }
    },
    "change .spectrum-upload": function() {
        var files = event.target.files;
        var instance = Template.instance();
        getFileData(files[0], function(err, x, y, fileMeta) {
            var layout = {
                xaxis: {
                    title: 'Wavenumber (cm / -1)'
                },
                yaxis: {
                    title: 'Intensity'
                }
            };

            TempFiles.insert({
                x: x,
                y: y,
                file_meta: fileMeta,
                flag: 'single'
            });
            Plotly.newPlot('graph', [{mode: 'lines', x: x, y: y}], layout);
        });
    }
});

function getFileData(file, callback) {
    Plotly.d3.text(URL.createObjectURL(file), function(err, rawData) {
        if (err) {
            return callback(err);
        }

        var x = [];
        var y = [];

        d3.tsv.parseRows(rawData, function(row) {
            x.push(+row[0]);
            y.push(+row[1]);
        });
        return callback(null, x, y, {name: file.name, lastModified: file.lastModified});
    });
}
