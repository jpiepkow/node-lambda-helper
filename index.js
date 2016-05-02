var awsLambda = require('node-aws-lambda');
var AWS = require('aws-sdk');
var async = require('async');
module.exports = {
    deploy: function (zip_loc, config, callback) {
        var arn, aliasArn;
        var lambda, iot;
        async.series([
            function (callback) {
                if ("profile" in config) {
                    var credentials = new AWS.SharedIniFileCredentials({profile: config.profile});
                    AWS.config.credentials = credentials;

                }
                lambda = new AWS.Lambda({
                    region: config.region,
                    accessKeyId: "accessKeyId" in config ? config.accessKeyId : "",
                    secretAccessKey: "secretAccessKey" in config ? config.secretAccessKey : "",
                    sessionToken: "sessionToken" in config ? config.sessionToken : ""
                });
                iot = new AWS.Iot({
                    region: config.region,
                    accessKeyId: "accessKeyId" in config ? config.accessKeyId : "",
                    secretAccessKey: "secretAccessKey" in config ? config.secretAccessKey : "",
                    sessionToken: "sessionToken" in config ? config.sessionToken : ""
                });
                config.functionName = `${config.env}_${config.functionName}`;
                callback()
            },
            function (callback) {
                awsLambda.deploy(zip_loc, config, function () {
                    callback();
                })
            },
            function (callback) {
                if(config.version === 'current') {
                getWorkerInfo(config, lambda, function (err, r) {
                    if (err) {
                        return callback('could not get current version', null);
                    } else {
                        arn = r.arn;
                        var split = r.arn.split(':');
                        config.version = (config.version === 'current') ? split[split.length - 1] : config.version;
                        callback()
                    }
                });
                } else {
                    callback()
                }
            },
            function (callback) {
                config.version = (config.version === 'first') ? '$LATEST': config.version;
                if (config.alias) {
                    setAlias(config, lambda, function (err, r) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            aliasArn = r.arn;
                            callback();
                        }
                    })
                } else {
                    callback();
                }
            },
            function (callback) {
                var ruleArn = (aliasArn) ? aliasArn : arn;
                if (config.iot) {
                    setRule(config, ruleArn, iot, function (err, r) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            callback();
                        }
                    })
                } else {
                    callback()
                }

            }
        ], function (err, r) {
            if (err) {
                throw new Error(err.toString());
            } else {
                callback(null, {worked: true})
            }

        })


    }
};

var setAlias = function (config, lambda, callback) {
    lambda.getAlias({FunctionName: config.functionName, Name: config.alias}, function (err, data) {
        if (err) {
            lambda.createAlias({
                FunctionName: config.functionName,
                FunctionVersion: config.version,
                Name: config.alias,
                Description: config.aliasDescription
            }, function (err, r) {
                if (err) {
                    return callback({error: err}, null)
                } else {
                    return callback(null, {arn: r.AliasArn})
                }
            })
        } else {
            if (data.FunctionVersion != config.version) {
                lambda.updateAlias({
                    FunctionName: config.functionName,
                    FunctionVersion: config.version,
                    Name: config.alias,
                    Description: config.aliasDescription
                }, function (err, r) {
                    if (err) {
                        return callback({error: err}, null)
                    } else {
                        return callback(null, {arn: r.AliasArn})
                    }
                })
            } else {
                return callback(null, {arn: data.AliasArn})
            }
        }
    });
};
var getWorkerInfo = function (config, lambda, callback) {
    lambda.listVersionsByFunction({FunctionName: config.functionName, MaxItems: 1000}, function (err, r) {
        callback(null, {arn: r.Versions[r.Versions.length - 1].FunctionArn});
    })
}
var setRule = function (config, arn, iot, callback) {
    iot.getTopicRule({ruleName: config.iot.ruleName}, function (err, r) {
        if (err) {
            var payload = {
                ruleName: config.iot.ruleName,
                topicRulePayload: {
                    actions: [{lambda: {functionArn: arn}}],
                    sql: config.iot.sql,
                    ruleDisabled: config.iot.ruleDisabled,
                    description: config.iot.description || null
                }
            };
            iot.createTopicRule(payload, function (err, r) {
                if (err) {
                    callback('Could not create new rule', null);
                } else {

                    callback(null, null)
                }
            })
        } else if (r && config.iot.overWrite === true) {
            var payload = {
                ruleName: config.iot.ruleName,
                topicRulePayload: {
                    actions: [{lambda: {functionArn: arn}}],
                    sql: config.iot.sql,
                    ruleDisabled: config.iot.ruleDisabled,
                    description: config.iot.description || null
                }
            };
            iot.replaceTopicRule(payload, function (err, r) {
                if (err) {
                    callback('Could not replace rule', null);
                } else {

                    callback(null, null)
                }
            })
        }
    })
};

