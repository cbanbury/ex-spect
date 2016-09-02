Meteor.methods({
    'pca:get': function(classes) {
        import pca from 'ml-pca';

        var spectra = Spectra.find({tag: {$in: ['RCA', 'diseased']}}).fetch();
        spectra = spectra.map(function(item) {
            return item.y;
        });
        var foo = new pca(spectra);
        var vectors = foo.getEigenvectors();

        return {x: vectors[0], y: vectors[1]};

        // var data = [];
        // var out = {};
        // spectra = Spectra.find({tag: {$in: classes}}).fetch();
        //
        // if (spectra.length > 0) {
        //     spectra.forEach(function(spectrum) {
        //         data.push(spectrum.y);
        //     });
        //
        //     var sylvester = Meteor.npmRequire('sylvester');
        //     var a = $M(data).transpose();
        //
        //     var pca = a.pcaProject(2);
        //
        //     scores = pca.U.elements;
        //
        //     for (i=1; i<spectra.length; i++) {
        //         var row = scores[i];
        //         if (!out[spectra[i].tag]) {
        //             out[spectra[i].tag] = {x: [], y: []};
        //         }
        //
        //         out[spectra[i].tag].x.push(row[0]);
        //         out[spectra[i].tag].y.push(row[1]);
        //     }
        // }
        // return out;
    }
});
