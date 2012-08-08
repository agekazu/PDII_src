var http = require('http');

process.on('SIGTERM', function () {
  console.log('Got SIGTERM, exiting...');
  process.exit(0);
});

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var output = "Hello World!\n";
  output += "\nVersions:\n";
  for (k in process.versions) { 
    output += k + '=' + process.versions[k] + '\n'; 
  }
  output += "\nHeaders:\n";
  for (k in req.headers) { 
    output += k + '=' + req.headers[k] + '\n'; 
  }
  res.end(output);
}).listen(process.env['PORT_WWW'] || 8080);
