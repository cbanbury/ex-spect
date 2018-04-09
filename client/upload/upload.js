TempFiles = new Mongo.Collection(null);

Template.upload.onRendered(function(){
    $('ul.tabs').tabs();
    $('select').material_select();

    Template.instance().dataLabels.set(this.data.labels);
});

Template.upload.onCreated(function() {
    this.dataLabels = new ReactiveVar();
});

Template.upload.helpers({
    labels: function() {
        console.log(Template.instance().dataLabels.get())
        return Template.instance().dataLabels.get();
    }
});

Template.upload.events({
    "submit .save-spectra": function(event) {
        event.preventDefault();
        var target = event.target;
        var instance = Template.instance();
        var fileData = TempFiles.find({flag: {$exists: false}}).fetch();

        fileData.forEach(function(item) {
            item.tag = target.tag.value;
            item.uid = Meteor.userId();
            item.created_at = new Date()
            Spectra.insert(item, function(err) {
                if (err) {
                    console.log(err);
                    console.log(Meteor.userId())
                }
            });
        });
        FlowRouter.go("mySpectra");
    },
    "change .spectra-upload": function() {
        var files = event.target.files;
        var instance = Template.instance();

        for (i=0; i<files.length; i++) {
            getFileData(files[i], function(err, x, y, fileMeta) {
                TempFiles.insert({
                    x: x,
                    y: y,
                    file_meta: fileMeta
                });
            });
        }
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
