Template.mySpectra.helpers({
    spectra: function() {
        return Spectra.find({uid: Meteor.userId()});
    }
});

Template.mySpectra.events({
    'click .delete-spectrum': function(event, foo) {
        Meteor.call('spectra:remove', this._id, function(err) {
            console.log(err);
        });
    }
});
