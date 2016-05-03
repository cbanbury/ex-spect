Meteor.methods({
    'pca:get': function() {
        var data = [];
        spectra = Spectra.find({tag: {$exists: true}}).fetch();

        spectra.forEach(function(spectrum) {
            data.push(spectrum.y);
        });

        var sylvester = Meteor.npmRequire('sylvester');
        var a = $M(data).transpose();

        var pca = a.pcaProject(2);

        scores = pca.U.elements;

        healthy = {
            x: [],
            y: []
        };
        diseased = {
            x: [],
            y: []
        };

        // just doing first two principal components for classes of diseased and
        // healthy. Add code here to support arbitary classes and higher components
        for (i=1; i<spectra.length; i++) {
            var row = scores[i];
            if (spectra[i].tag == 'healthy') {
                healthy.x.push(row[0]);
                healthy.y.push(row[1])
            }

            if (spectra[i].tag == 'diseased') {
                diseased.x.push(row[0]);
                diseased.y.push(row[1]);
            }
        }
        return {healthy: healthy, diseased: diseased};
    }
});
