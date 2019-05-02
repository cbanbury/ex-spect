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

TestSpectra.allow({
    'insert': function(userId, doc) {
        if (userId === Meteor.userId()) {
            if (doc.uid === Meteor.userId()) {
                return true;
            }
        }
    }
})


Projects.permit('insert').ifLoggedIn();
Projects.permit('remove').ifLoggedIn();
SOM.permit('remove').ifLoggedIn();
