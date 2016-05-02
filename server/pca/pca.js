Meteor.methods({
    'pca:get': function() {
        var data = [];
        spectra = Spectra.find();

        spectra.forEach(function(spectrum) {
            data.push(spectrum.y);
        });

        var sylvester = Meteor.npmRequire('sylvester');
        var a = $M(data).transpose();

        var pca = a.pcaProject(2);

        // TODO: do we need to transpose here?
        return pca.U.transpose();
    }
});
