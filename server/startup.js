Meteor.startup(function () {
  if (process.env.CLUSTER) {
    if (process.env.MASTER) {
      Jobs.configure({autoStart: false});
    }
  }
})
