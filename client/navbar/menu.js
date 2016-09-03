Template.navbar_menu.helpers({
    activeIfNameIs: function(name) {
        if (FlowRouter.getRouteName() === name) {
            return "active";
        }
    }
});

Template.navbar_menu.rendered = function() {
    $(".dropdown-button").dropdown({
        hover: false
    });
};

Template.navbar_menu.events({
    'click .logout': function() {
        AccountsTemplates.logout();
        FlowRouter.go('home');
    }
})
