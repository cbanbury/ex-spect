Meteor.methods({
    'spectra:insert':function(name, fileData) {
        return Spectra.insert({
            name: name,
            x: fileData.x,
            y: fileData.y,
            uid: Meteor.userId(),
            file_meta: fileData.file_meta,
            created_at: new Date()
        });
    }
});
