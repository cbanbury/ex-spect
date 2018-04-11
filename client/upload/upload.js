TempFiles = new Mongo.Collection(null);

Template.upload.onRendered(function(){
    TempFiles.remove({});
});

Template.upload.onCreated(function() {
    this.autorun(() => {
      this.subscribe('project', FlowRouter.getParam("id"));
    });
});


Template.upload.helpers({
    labels: function() {
        return Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()}).labels;
    },
    crumbs: function() {
        var project = Projects.findOne({_id: FlowRouter.getParam("id"), uid: Meteor.userId()});
        return [
            {
                path: '/projects',
                title: 'Projects'
            },
            {
                path: '/projects/' + project._id,
                title: project.name
            },
            {
                path: '',
                title: FlowRouter.getQueryParam('label')
            },
            {
                path: '',
                title: 'Upload'
            }
        ]
    }
});

Template.upload.events({
    "submit .save-spectra": function(event) {
        event.preventDefault();
        var target = event.target;
        var instance = Template.instance();
        var fileData = TempFiles.find({flag: {$exists: false}}).fetch();

        fileData.forEach(function(item) {
            item.label = FlowRouter.getQueryParam('label');
            item.uid = Meteor.userId();
            item.projectId = FlowRouter.getParam("id");
            item.created_at = new Date()
            Spectra.insert(item, function(err) {
                if (err) {
                    console.log(err);
                    console.log(Meteor.userId())
                    Materialize.toast('Error uploading some data.', 4000);
                }
            });
        });
        FlowRouter.go('/projects/' + FlowRouter.getParam("id"));
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
