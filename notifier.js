var request = require('request');
var url = require('url');

var destination = "https://hooks.slack.com/services/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";

var payload = {
    "text": "test!",
    "channel": "@symmaki"
}

var options = {
    url: destination,
    method: "POST",
    body: JSON.stringify(payload)
};
request(options, function(error, response, body){
    if(!error){
        console.log(body);
    }
});


