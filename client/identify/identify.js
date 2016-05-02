Template.identify.onCreated(function() {
    this.searchResults = new ReactiveVar();
});

Template.identify.onRendered(function(){
    $(document).ready(function(){
        $('ul.tabs').tabs();
    });
});

Template.identify.events({
    'submit .wavenumber-search': function(event) {
        event.preventDefault();
        var target = event.target;

        var item = Peaks.find({peak: +target.wavenumber.value});
        Template.instance().searchResults.set(item);
    },
    'submit .wavenumber-range-search': function(event) {
        event.preventDefault();
        var target = event.target;

        var item = Peaks.find({
            $and: [
                { peak: { $gte: +target.wavenumber_lower.value } },
                { peak: { $lte: +target.wavenumber_upper.value } },
            ]
        }).fetch();
        Template.instance().searchResults.set(item);
    }
});

Template.identify.helpers({
    searchResults: function() {
        return Template.instance().searchResults.get();
    }
});
