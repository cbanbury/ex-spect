import _ from 'lodash/fp';

const { fork } = require('child_process');
const path = require('path');

Meteor.methods({
    'SOM:delete': function(id) {
        var result = SOM.remove({uid: Meteor.userId(), _id: id});
    },
    'SOM:compute': function(projectId, props) {
      console.log('New call to build SOM');
      // Resolve proper application path based on dev or prod
      let root = path.resolve('../../../..');
      if (path.basename(root) === '.meteor') { // development
        root = path.resolve(`${root}/..`);
      }

      // Import data
      const child = fork(`${root}/server/som/worker.js`);

      child.on('message', function(m) {
        // Receive results from child process
        console.log('got here ' + m.foo);
        return;
        // child.send('test');
      });

      // Send child process some work
      child.send('Please up-case this string');

        // var somID = SOM.insert({
        //     status: 0,
        //     // _id: somID,
        //     uid: Meteor.userId(),
        //     projectId: projectId,
        //     gridSize: props.gridSize,
        //     created_at: new Date(),
        //     description: props.description
        // });
        // console.log(somID)
        // Jobs.run("buildSOM", projectId, props, somID, Meteor.userId(), {singular: true});
    },
    'SOM:cross-validate': function(projectId, props) {
      console.log('New call for cross validation');
      var somID = SOM.insert({
          status: 0,
          uid: Meteor.userId(),
          projectId: projectId,
          gridSize: props.gridSize,
          created_at: new Date(),
          description: props.description
      });

      Jobs.run("crossValidation", projectId, props, somID, Meteor.userId());
    },
    'SOM:getModel': function(somId, projectId) {
      var project = Projects.findOne({_id: projectId});
      var som = SOM.findOne({_id: somId});
      som.model.labelEnum.map((item)=>{
          var match = project.labels.filter((label)=>{
            return label.tag === item.tag;
          })

          if (match && match[0]) {
            item.color = match[0].color;
          }
      })
      return som;
    },
    'SOM:getX': function(projectId) {
      return Spectra.findOne({projectId: projectId}, {x: 1}).x
    }
})
