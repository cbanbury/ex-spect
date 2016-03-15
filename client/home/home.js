Template.home.onCreated(function (){
    this.samples = new ReactiveVar;
    this.waveNumber = new ReactiveVar;
    this.waveNumber.set([]);
    this.samples.set([]);
});

Template.home.onRendered(function(){
    var chart = st.chart          // new chart
    .ir()                 // of type MS
    .xlabel("Wave Number")        // x-axis label
    .ylabel("Intensity") // y-axis label

    chart.render("#stgraph");     // render chart to id 'stgraph'
    var handle = st.data          // new handler
    .set()                    // of type set
    .ylimits([0, 1000])       // y-domain limits
    .x("peaks.mz")            // x-accessor
    .y("peaks.intensity");    // y-accessor
    chart.load(handle);

    // // // bind the data handler to the chart
    handle.add(
        {
            "spectrumId": "PR100729",
            "mzStart": 98.0598,
            "mzStop": 160.8423,
            "peaks": [
                {
                    "mz": 98.0598,
                    "intensity": 222.0
                },
                {
                    "mz": 116.0714,
                    "intensity": 820.0
                },
                {
                    "mz": 142.0505,
                    "intensity": 668.0
                },
                {
                    "mz": 160.061,
                    "intensity": 999.0
                },
                {
                    "mz": 160.8423,
                    "intensity": 781.0
                },
                {
                    "mz": 160.9,
                    "intensity": 800
                }
            ]
        }
    )
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
