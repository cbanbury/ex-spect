Template.navbar_menu.helpers({
    activeIfNameIs: function(name) {
        if (FlowRouter.getRouteName() === name) {
            return "active";
        }
    }
});
