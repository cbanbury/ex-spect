// Library of peak mappings provided by, doi: 10.1080/05704920701551530

var library = [
    {
        peak: 415,
        assignment: 'Phosphatidylinositol'
    },
    {
        peak: 418,
        assignment: 'Cholesterol'
    },
    {
        peak: 428,
        assignment: 'Symmetric stretching vibration of &#957;<sub>2</sub> PO<sub>4</sub><sup>3-</sup> (Phosphate of HA)'
    }
];

Meteor.startup(function () {
    library.forEach(function(item) {
        Peaks.update({peak: item.peak}, item, {upsert: true});
    });
    //
    // var data = [[1, 2], [3, 4], [5, 6], [1, 2]];
    // var pca = new PCA(data);
    //
    // var projected = pca.project(data, 2);
    // console.log(projected.getEigenvectors());
});
