Meteor.methods({
    'spectra:insert':function(name, tag, fileData) {
        return Spectra.insert({
            name: name,
            tag: tag,
            x: fileData.x,
            y: fileData.y,
            uid: Meteor.userId(),
            file_meta: fileData.file_meta,
            created_at: new Date()
        });
    },
    'spectra:remove':function(id) {
        return Spectra.remove({
            uid: Meteor.userId(),
            _id: id
        });
    }
});
