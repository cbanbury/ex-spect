// library of bond assignments from Infrared and Raman Spectroscopy: Principles and Spectral Interpretation, P. Larkin
// use peak.lower property only to add a specific peak
// use peak.lower and peak.upper to add a peak range

var library = [
    // aliphatic groups
    {
        peak: {
            lower: 2975,
            upper: 2950
        },
        intensity: 'very strong',
        group: 'R-CH<sub>3</sub> ',
        assignment: 'o.ph. str.<sup>2</sup>',
        category: 'bond'
    },
    {
        peak: {
            lower: 2885,
            upper: 2860
        },
        intensity: 'very strong',
        group: 'R-CH<sub>3</sub> ',
        assignment: 'i.ph. str.<sup>2</sup>',
        category: 'bond'
    }
];

Meteor.startup(function () {
    library.forEach(function(item) {
        Peaks.update({peak: item.peak}, item, {upsert: true});
    });
});
