Template.identify.onCreated(function() {
    this.searchResults = new ReactiveVar();
    this.displayResults = new ReactiveVar('bonds');
});

Template.identify.onRendered(function(){
    $(document).ready(function(){
        $('ul.tabs').tabs();
    });

    $(document).ready(function() {
        $('select').material_select();
    });
});

Template.identify.events({
    'submit .wavenumber-range-search': function(event) {
        event.preventDefault();
        var target = event.target;
        var results = getResults(event.target.filter_results.value, target.wavenumber_lower.value, target.wavenumber_upper.value);
        Template.instance().searchResults.set(results);
        Template.instance().displayResults.set(event.target.filter_results.value);
    }
});

Template.identify.helpers({
    searchResults: function() {
        return Template.instance().searchResults.get();
    },
    displayBio: function() {
        return Template.instance().displayResults.get() === 'bio';
    },
    displayBonds: function() {
        return Template.instance().displayResults.get() === 'bonds';
    }
});

function getResults(type, lower, upper) {
    if (type === 'bio') {
        return Peaks.find({
            $and: [
                { peak: { $gte: +lower } },
                { peak: { $lte: +upper } },
                { category: 'bio'}
            ]
        }).fetch();
    }

    if (type === 'bonds') {
        return Peaks.find({
            $and: [
                {'peak.lower': {$gte: +lower}},
                {category: 'bond'}
            ]
        });
    }
}
