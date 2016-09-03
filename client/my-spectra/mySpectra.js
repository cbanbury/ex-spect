Template.mySpectra.onCreated(function() {
    Meteor.subscribe('spectra');
});

Template.mySpectra.helpers({
    spectra: function() {
        return Spectra.find({uid: Meteor.userId()});
    }
});
