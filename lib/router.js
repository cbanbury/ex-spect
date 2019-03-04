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

FlowRouter.route('/api', {
    name: "api",
    action: function() {
        window.location = 'http://docs.ramantools.apiary.io/';
    }
});


// new routes
var homeRoutes = FlowRouter.group({
    prefix: '/',
    name: 'home'
});

homeRoutes.route('/', {
    name: "home",
    action: function() {
        if (Meteor.userId()) {
            FlowRouter.go('projects');
        } else {
            BlazeLayout.render("master_layout", {home: "home"});
        }
    }
});

var projectsRoutes = FlowRouter.group({
    prefix: "/projects",
    name: "projects"
});

projectsRoutes.route('/', {
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    name: "projects",
    subscriptions: function(params, queryParam) {
        this.register('projects', Meteor.subscribe('projects'));
    },
    action: function() {
        BlazeLayout.render("master_layout", {projects: "projects"});
    }
});

projectsRoutes.route('/create', {
    name: "newProject",
    action: function() {
        BlazeLayout.render("master_layout", {projects: "newProject"});
    }
});

projectsRoutes.route('/:id', {
    name: "project",
    subscriptions: function(params, queryParams) {
        this.register('projectSub', Meteor.subscribe('project', params.id));
        this.register('spectraSub', Meteor.subscribe('project:spectra:meta', params.id));
    },
    action: function() {
        BlazeLayout.render("master_layout", {projects: "project"});
    }
});

projectsRoutes.route('/:id/plot', {
    name: "plot",
    action: function() {
        BlazeLayout.render("master_layout", {projects: "viewer"});
    }
});

projectsRoutes.route('/:id/upload', {
    name: "projectUpload",
    subscriptions: function(params, queryParams) {
        this.register('projectSub', Meteor.subscribe('project', params.id));
    },
    action: function() {
        BlazeLayout.render("master_layout", {projects: "upload"});
    }
});

projectsRoutes.route('/:id/settings', {
    name: "projectSettings",
    subscriptions: function(params, queryParams) {
        this.register('projectSub', Meteor.subscribe('project', params.id));
    },
    action: function() {
        BlazeLayout.render("master_layout", {projects: "projectSettings"});
    }
});

projectsRoutes.route('/:id/models', {
    name: "models",
    subscriptions: function(params, queryParams) {
        this.register('projectSub', Meteor.subscribe('project', params.id));
        this.register('somModel', Meteor.subscribe('SOM'));
    },
    action: function() {
        BlazeLayout.render("master_layout", {projects: "somModels"});
    }
});

projectsRoutes.route('/:id/learn', {
    name: 'learn',
    subscriptions: function(params, queryParams) {
        this.register('projectSub', Meteor.subscribe('project', params.id));
        this.register('spectraSub', Meteor.subscribe('project:spectra:meta', params.id));
        this.register('spectra', Meteor.subscribe('project:spectra', params.id));
        this.register('testSpectra', Meteor.subscribe('project:test:spectra', params.id));

        if (queryParams.m) {
            this.register('model', Meteor.subscribe('SOM:model', queryParams.m));
        }
    },
    action: function() {
        BlazeLayout.render("master_layout", {projects: "som"})
    }
});

AccountsTemplates.configureRoute('signIn');
