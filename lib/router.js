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
