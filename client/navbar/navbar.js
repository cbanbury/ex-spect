Template.navbar.rendered = function() {
    $(".dropdown-button").dropdown({
        hover: false
    });

    $(".button-collapse").sideNav({
        closeOnClick: true
    });

    $('ul.tabs').tabs({
    	onShow: function(param) {
    		if (param.selector === '#projects') {
    			console.log('doing the thing')
    			FlowRouter.go('projects');
    		} else {
    			FlowRouter.go('home');
    		}
    	}
    });
};

Template.navbar.helpers({
    isActive: function(name) {
        if (FlowRouter.current().route.group.name === name) {
            return "active";
        }
    }
});