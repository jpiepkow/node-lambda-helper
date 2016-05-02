var pack = require('./package.json');
module.exports = {
    profile: '',
    iot: {
        ruleName: '',
        sql: "",
        overWrite:true ,
        ruleDisabled:true,
        description:''
    },
    region: '',
    version: '',
    alias: '',
    aliasDescription: '',
    env: '',
    publish: true,
    handler: '',
    role: '',
    functionName: '',
    timeout: 10,
    memorySize: 128/*,
     eventSource: {
     EventSourceArn: <event source such as kinesis ARN>,
     BatchSize: 200,
     StartingPosition: "TRIM_HORIZON"
     }*/
};


