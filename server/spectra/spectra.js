import lodash from 'lodash';

Meteor.methods({
    'spectra:insert':function(tag, fileData) {
        fileData.forEach(function(item) {
            item._id = new Meteor.Collection.ObjectID();
            item.tag = tag;
            item.uid = Meteor.userId();
            item.created_at = new Date()
        });

        console.log(fileData.length + 'files')
        return Spectra.insert(fileData);
    },
    'spectra:truncate': function(from, to, projectId) {
        var temp = Spectra.findOne({projectId: projectId}, {fields: {x:1}});
        temp = temp.x;

        var minX = temp.filter((item)=>{return item<=from}).length -1;
        var maxX = temp.filter((item)=>{return item>=to})[0];
        maxX = temp.indexOf(maxX);

        var spectra = Spectra.find({projectId: projectId}, {fields: {x:1, y:1}});
        spectra.forEach(function(spectrum) {
            Spectra.update({_id: spectrum._id}, {$set:
                {
                    x: spectrum.x.slice(minX, maxX),
                    y: spectrum.y.slice(minX, maxX),
                }
            })
        });

        var testData = TestSpectra.find({projectId: projectId}, {fields: {x:1, y:1}});
        testData.forEach(function(spectrum) {
            TestSpectra.update({_id: spectrum._id}, {$set:
                {
                    x: spectrum.x.slice(minX, maxX),
                    y: spectrum.y.slice(minX, maxX),
                }
            })
        });

        return true;
    },
    'spectra:flatten': function(projectId) {
        console.log('flattening data');
        var temp = Spectra.findOne({projectId: projectId}, {fields: {x:1}});

        var minX = temp.x[0];
        var maxX = temp.x[temp.x.length -1];

        var spectra = Spectra.find({projectId: projectId}, {fields: {x:1, y:1}});
        spectra.forEach(function(spectrum) {
            // define gradient
            var minY = spectrum.y[0];
            var maxY = spectrum.y[spectrum.y.length-1];
            var m = (maxY - minY) / (maxX - minX);

            spectrum.y.forEach((element, index)=>{
                spectrum.y[index] =(spectrum.y[index] - (m*spectrum.x[index]));
            });

            Spectra.update({_id: spectrum._id}, {$set:
                {
                    y: spectrum.y,
                }
            });
        });

        console.log('finishing flattening data');

        return true;
    },
    'spectra:xrange': function(projectId) {
        var spectrum = Spectra.findOne({projectId: projectId}, {fields: {x:1}});
        if (spectrum.x) {
            return {min: Math.ceil(lodash.min(spectrum.x)), max: Math.floor(lodash.max(spectrum.x))};
        }

        return {min: -1, max: -1};
    },
    'spectra:remove':function(id) {
        return Spectra.remove({
            uid: Meteor.userId(),
            _id: id
        });
    },
    'spectra:pluck:test': function(projectId) {
      var project = Projects.findOne({_id: projectId});
      var split = Spectra.find({projectId: projectId, label: project.labels[0].tag}).count() * 0.2;
      console.log('got split ' + split)
      project.labels.forEach((label)=> {
        // add to test data
        const collection = Spectra.rawCollection();
        const aggregate = Meteor.wrapAsync(collection.aggregate, collection)
        var spectra = Spectra.rawCollection().aggregate([
          {$match:{label: label.tag, projectId: projectId}},
          {$sample:{size: split}}
        ]).toArray();

        spectra.then((result)=>{
          console.log('plucking data ' + result.length);
          result.forEach((spectrum)=>{
              var temp = spectrum._id;
              // spectrum._id = new Meteor.Collection.ObjectID();
              TestSpectra.insert(spectrum);
              Spectra.remove({_id: temp});
          });
        })

      });
      return true;
    }
});
