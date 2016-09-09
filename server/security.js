Spectra.permit('insert').ifLoggedIn();
Spectra.permit('remove').ifLoggedIn();
Spectra.allow({
    'insert': function(userId, doc) {
        if (userId === Meteor.userId()) {
            if (doc.uid === Meteor.userId()) {
                return true;
            }
        }
    }
})
