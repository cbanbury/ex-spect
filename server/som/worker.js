process.on('message', function(m) {
  // Do work  (in this case just up-case the string

  // Pass results back to parent process
  process.send({foo: 'bar'});
});
