
Template.upload.onCreated(function() {
    this.saveText = new ReactiveVar('save');
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
    },
    saveText: function() {
        return Template.instance().saveText.get();
    },
    saveDisabled: function() {
        if (Template.instance().saveText.get() === 'save') {
            return '';
        }

        return 'disabled';
    }
});

Template.upload.events({
    "submit .save-spectra": function(event) {
        Template.instance().saveText.set('Uploading...');
        event.preventDefault();
        var target = event.target;
        var files = event.target.spectraUpload.files;

        var numFiles = files.length;

        (function loop(i) {
            if (i >= numFiles) {
                FlowRouter.go('/projects/' + FlowRouter.getParam("id"));
            }

            if (i < numFiles) new Promise((resolve, reject) => {
                $('#upload').text(Math.floor((i / numFiles)*100) + '%');
                if (files[i].type !== 'text/plain') {
                    return resolve();
                }

                getFileData(files[i]).then(function(data) {
                    var doc = {
                        label: FlowRouter.getQueryParam('label'),
                        uid: Meteor.userId(),
                        projectId: FlowRouter.getParam("id"),
                        created_at: new Date(),
                        x: data.x,
                        y: data.y,
                        file_meta: data.fileMeta
                    }

                    Spectra.insert(doc, function(err) {
                        if (err) {
                            console.log(err);
                            console.log(Meteor.userId())
                            Materialize.toast('Error uploading some data.', 4000);
                        }
                        resolve();
                    });
                });
            }).then(loop.bind(null, i+1));
           
        })(0);
    }
});

function getFileData(file) {
    return new Promise(function (resolve, reject) {
        Plotly.d3.text(URL.createObjectURL(file), function(err, rawData) {
            if (err) {
                reject(err);
            }

            var x = [];
            var y = [];

            d3.tsv.parseRows(rawData, function(row) {
                x.push(+row[0]);
                y.push(+row[1]);
            });
            resolve({x, y, fileMeta: {name: file.name, lastModified: file.lastModified}});
        });
    });
}
