Meteor.publish("spectra", function (skip, limit) {
    Counts.publish(this, 'total_spectra', Spectra.find());
    if (skip < 0) {
        skip = 0;
    }
    return Spectra.find({uid: this.userId}, {
        skip: skip,
        limit: 10
    });
});
