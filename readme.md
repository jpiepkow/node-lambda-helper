Node-lambda-helper
===
description: aws lambda helper that includes making an alias, updating workers/creating workers and making iot rules attached to worker/alias arn. Used currently for yo generator-lambda-publish

###Getting started:

	npm install node-lambda-helper
	
Next:

	var awsLambda = require('./index.js');
	var path = require('path');
	awsLambda.deploy('./dist.zip', require( path.join(process.cwd(), 	"lambda-config.js") ), function(){});


lambda-config.js

	var pack = require('./package.json');
	module.exports = {
    profile: 'profile with permissions to publish',
    iot: { //optional
        ruleName: 'rule name',
        sql: "iot sql for rule activation",
        overWrite:'boolean for if rule should get overwrote on change' ,
        ruleDisabled:'if rule is active or not, false=active',
        description:'rule description'
    },
    region: 'us-east-1',
    version: 'version to set in alias (current,$LATEST,[1-9]) $LATEST must be used on first push',
    alias: 'aliasName',
    aliasDescription: 'alias description',
    env: 'dev',
    publish: true, //this will be used to auto version any changes
    handler: 'handler.index', //function entry
    role: 'arn:aws:iam::684684635435:role/lambda_basic_execution',
    functionName: 'functionName',
    timeout: 10,
    memorySize: 128
	};



	
