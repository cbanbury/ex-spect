Meteor.methods({
    'pca:get': function(classes) {
        import PCA from 'ml-pca';

        var groups = {};
        var pcaInput = [];
        classes.forEach(function(className) {
            temp = Spectra.find({uid: Meteor.userId(), tag: className}).fetch();
            groups[className] = temp.map(function(item) {
                console.log(item.y.length);
                return item.y;
            });
            pcaInput = pcaInput.concat(groups[className]);
        });

        var pca = new PCA(pcaInput, {scale: true});
        var vectors = pca.getEigenvectors();

        var output = {};
        var skip = 0;
        var offset = groups[classes[0]].length;
        for (var i=0; i<classes.length; i++) {
            output[classes[i]] = {x: [], y: []};

            for (var j=skip; j<offset; j++) {
                output[classes[i]].x.push(vectors[0][j])
                output[classes[i]].y.push(vectors[1][j])
            }
            skip = skip + classes[i].length;

            if (i !== classes.length - 1) {
                offset = groups[classes[i+1]].length;
            }
        }

        return output;
    }
});
