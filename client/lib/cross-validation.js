import _ from 'lodash';

window.cv = {
	folds: function(spectra, labels, labelEnum, k) {
		var features = [
		{
			label: 0,
			ids: [
				'1234',
				'5678'
			]
		},
		{
			label: 1,
			ids: [
				'5666',
				'9999'
			]
		}
		];

		var numClasses = 2;


		var foldSize = Math.floor(features[0].ids.length / k);

		var foldDefintions = [
			{
				id: 0,
				spectra: [
					[123, 456]
				],
				labels: [
					0
				]
			},
			{
				id: 1,
				spectra: [
					[123, 456]
				],
				labels: [
					0
				]
			}
		]

		for (var i=0; i<foldDefintions.length; i++) {
			// window.setTimeout(function(){
				//var testData = foldDefintions.filter((item)=>{return item.id === i});
				var trainingData = [];
				for (var j=0; j<foldDefintions.length; j++) {
						if (j !== i) {
							console.log('inside fold')
							console.log('using ' + i + ' as test set for ' + j)
							// trainingData = trainingData.concat()
						}				
				}
			// }, 0);
		}
	}
}