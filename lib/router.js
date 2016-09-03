FlowRouter.route('/', {
    name: "home",
    action: function() {
        BlazeLayout.render("master_layout", {main: "home"});
    }
});

FlowRouter.route('/identify', {
    name: "identify",
    action: function() {
        BlazeLayout.render("master_layout", {main: "identify"});
    }
});

FlowRouter.route('/pca', {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
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
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    name: "upload",
    action: function() {
        BlazeLayout.render("master_layout", {main: "upload"});
    }
});

FlowRouter.route('/spectra', {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    subscriptions: function(params, queryParams) {
        page = parseInt(queryParams.page) || 0;
        limit = 10;
        offset = page*limit;

        this.register('spectra', Meteor.subscribe('spectra', offset, limit));
    },
    name: "mySpectra",
    action: function() {
        BlazeLayout.render("master_layout", {main: "mySpectra"});
    }
});

FlowRouter.route('/api', {
    name: "api",
    action: function() {
        window.location = 'http://docs.ramantools.apiary.io/';
    }
});

AccountsTemplates.configureRoute('signIn');
