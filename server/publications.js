Meteor.publish("spectra", function () {
    return Spectra.find({uid: this.userId});
});
