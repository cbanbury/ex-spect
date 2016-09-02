Meteor.methods({
    'pca:get': function(classes) {
        import PCA from 'ml-pca';

        var healthy = Spectra.find({tag: 'RCA'}).fetch();
        var diseased = Spectra.find({tag: 'diseased'}).fetch();

        healthy = healthy.map(function(item) {
            return item.y;
        });

        diseased = diseased.map(function(item) {
            return item.y;
        });

        var total = healthy.concat(diseased);
        var pca = new PCA(total);
        var vectors = pca.getEigenvectors();

        var healthyOut = {
            x: [], y: []
        };

        for (var i=0; i<healthy.length; i++) {
            healthyOut.x.push(vectors[0][i])
            healthyOut.y.push(vectors[1][i])
        }

        var diseasedOut = {
            x: [], y: []
        };

        for (var i=healthy.length; i<total.length; i++) {
            diseasedOut.x.push(vectors[0][i])
            diseasedOut.y.push(vectors[1][i])
        }

        return {healthy: healthyOut, diseased: diseasedOut};

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
