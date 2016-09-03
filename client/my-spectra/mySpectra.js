Template.mySpectra.helpers({
    spectra: function() {
        return Spectra.find({uid: Meteor.userId()});
    }
});
