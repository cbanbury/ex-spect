Meteor.methods({
    'pca:get': function() {
        var sylvester = Meteor.npmRequire('sylvester');
        var a = $M(
            [1, 1, 1], [1, 0.5, 1], [1, 1, 0.5]
        );

        var pca = a.pcaProject(2);
        return pca;
    }
});
