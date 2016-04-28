var awsLambda = require('./index.js');
var path = require('path');
awsLambda.deploy('./dist.zip', require( path.join(process.cwd(), "lambda-config.js") ), function(){});

