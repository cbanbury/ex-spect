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
});
