Template.home.onCreated(function (){
    this.samples = new ReactiveVar;
    this.waveNumber = new ReactiveVar;
    this.waveNumber.set([]);
    this.samples.set([]);
});

Template.home.helpers({
    numSamples: function() {
        return Template.instance().samples.get().length;
    }
});

Template.home.events({
    "change input[type='file']": function(event) {
        var files = event.currentTarget.files;

        var template = Template.instance();
        var waveNumber = [];
        var sample = [];

        for (var i = 0; i < files.length; i++) {
            var reader = new FileReader();
            reader.onload = function(progressEvent){
                // By lines
                var lines = this.result.split('\n');
                thisSample = [];
                for(var line = 0; line < lines.length; line++) {
                    data = lines[line].split('\u0009');
                    waveNumber[line] = data[0];
                    thisSample[line] = data[1];
                }

                template.waveNumber.set(waveNumber);
                template.samples.set(sample);
            };
            reader.readAsText(files[i]);
        }
    }
});
