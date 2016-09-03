Meteor.publish("spectra", function () {
    return Spectra.find();
});
