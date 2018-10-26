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
    'spectra:remove':function(id) {
        return Spectra.remove({
            uid: Meteor.userId(),
            _id: id
        });
    },
});
