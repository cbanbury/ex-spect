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
    name: "som",
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

var projectRoutes = FlowRouter.group({
    prefix: "/projects",
    name: "projects"
});

projectRoutes.route('/create', {
    name: "newProject",
    action: function() {
        BlazeLayout.render("master_layout", {main: "newProject"});
    }
});

projectRoutes.route('/edit/:id', {
    name: "editProject",
    subscriptions: function(params, queryParam) {
        this.register('project', Meteor.subscribe('project', params.id))
    },
    action: function() {
        BlazeLayout.render("master_layout", {main: "editProject"});
    }
});

projectRoutes.route('/', {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    name: "projects",
    subscriptions: function(params, queryParam) {
        this.register('projects', Meteor.subscribe('projects'));
    },
    action: function() {
        BlazeLayout.render("master_layout", {main: "projects"});
    }
});

AccountsTemplates.configureRoute('signIn');
