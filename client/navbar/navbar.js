Template.navbar.rendered = function() {
    $(".dropdown-button").dropdown({
        hover: false
    });

    $(".button-collapse").sideNav({
        closeOnClick: true
    });

    var name = FlowRouter.current().route.group.name;
    $('ul.tabs').tabs({
    	onShow: function(param) {
    		if (param.selector === '#projects') {
    			FlowRouter.go('projects');
    		} else {
    			FlowRouter.go('home');
    		}
    	}
    });
};

Template.navbar.helpers({
    isActive: function(name) {
        if (FlowRouter.current().route.group.name === name || FlowRouter.current().route.group.parent.name === name) {
            return "active";
        }
    }
});