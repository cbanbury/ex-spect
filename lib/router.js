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
        BlazeLayout.render("master_layout", {home: "home"});
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
    action: function() {
        BlazeLayout.render("master_layout", {projects: "upload"});
    }
});

var learnRoutes = FlowRouter.group({
    prefix: "/learn",
    name: "learn"
});

learnRoutes.route('/', {
    name: "learn",
    action: function() {
        BlazeLayout.render("master_layout", {learn: "som"});
    }
});

learnRoutes.route('/model/:id', {
    name: 'model',
    action: function() {
        BlazeLayout.render("master_layout", {learn: "somPlot"})
    }
});

AccountsTemplates.configureRoute('signIn');
