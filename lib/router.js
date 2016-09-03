FlowRouter.route('/', {
    name: "home",
    action: function() {
        BlazeLayout.render("master_layout", {main: "plot"});
    }
});

FlowRouter.route('/identify', {
    name: "identify",
    action: function() {
        BlazeLayout.render("master_layout", {main: "identify"});
    }
});

FlowRouter.route('/pca', {
    name: "pca",
    action: function() {
        BlazeLayout.render("master_layout", {main: "pca"});
    }
});

FlowRouter.route('/som', {
    name: "some",
    action: function() {
        BlazeLayout.render("master_layout", {main: "somExample"});
    }
})

FlowRouter.route('/upload', {
    name: "upload",
    action: function() {
        BlazeLayout.render("master_layout", {main: "upload"});
    }
});

FlowRouter.route('/api', {
    name: "api",
    action: function() {
        window.location = 'http://docs.ramantools.apiary.io/';
    }
});
