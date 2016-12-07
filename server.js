var express = require('express');
var fs = require('fs');
var request = require('request');
var app = express();
var token = require("./token");
var Bot = require("slackbots");
var qs = require('querystring');

var botSettings = {
    token: token,
};

var bot = new Bot(botSettings);

var seen = null;
var sections = null;
var users = null;
var settings = null;

bot.on('start', function(){
    var messageParams = {
        as_user: 'true'
    };
    //    bot.postMessageToChannel('the-matrix', 'Hello channel!', params);
//    notifyUser("chuckdries","http://chuckdries.rocks","Chuck Dries","Chuck Dries: Executive Innovator");
});

//setup functions
function initialize(){
    loadSettings();
}
function loadData(){
    loadSeen(settings.arrayPath);
    loadSections(settings.sectionsPath);
    loadUsers(settings.usersPath);
}
function loadSettings(){
    fs.readFile("settings.json","utf8",function(err,data){
        if(err){
            console.log(err);
        } else {
            settings=JSON.parse(data);
            loadData();
        }
    })
}

//File IO functions for loading and saving information
//I know all these functions are the same, but I wanted to write them out by hand in case I ever end up doing anything different with them.
function loadSeen(fileName){
    fs.readFile(fileName,"utf8",function(err,data){
        if(err){
            console.log("loadArray failed");
            console.log(err);
            seen = new Set();
        } else {
            var array = JSON.parse(data);
            seen = new Set(array);
            console.log("loadArray success");
            console.log(seen);
        }
    });
}
function loadSections(fileName){
    fs.readFile(fileName,"utf8",function(err,data){
        if(err){
            console.log("loadSections");
            console.log(err);
        } else {
            sections = JSON.parse(data);
            console.log("loadSections success");
            console.log(sections);
        }
    });
}
function loadUsers(fileName){
    fs.readFile(fileName,"utf8",function(err,data){
        if(err){
            console.log("loadUsers");
            console.log(err);
        } else {
            users = JSON.parse(data);
            console.log("loadUsers success");
            console.log(users);
        }
    });
}
function saveArray(fileName){
    var data = JSON.stringify(Array.from(seen));
    console.log("saving array to " + fileName);
    console.log(data);
    fs.writeFile(fileName,data,"utf8",function(err){
        if(err){
            console.log(err);
        }
    }); 
}

//the meat function, the big kahuna. Checking if a new story has been published and dealing with it properly if it has
function checkSection(section, res, callback){
    //TODO: call this periodically
    //This should check against the array of known stories, add unknowns to the story, and if there is an unknown pass its details to another function to actually handle notification of the user
    var sectionUrl = sections[section];

    request(sectionUrl, function(error, response) {
        if (!error) {
            var articles = JSON.parse(response.body)[0].articles; //why is response body an array with one item in it? Who knows!
            console.log(articles);
            var string = "";
            for (index in articles){
                var uid = articles[index].uid;
                //check if the article has been seen before
                if (seen.has(uid)){
                    console.log("hit!");
                } else {
                    console.log("No hit, article is new"); 
                    seen.add(uid);
                }
                article = parseArticle(articles[index]);
                string = string + "Article \"" + article.headline + "\" has the subhead \"" + 
                    article.subhead + "\" and was written by " + article.authorName + 
                    " (also known as @" + article.userName + " on slack). ";
                notifyUser("chuckdries", article.url, article.headline, article.subhead);
            }
            res.status(200).send(string);
            saveArray(settings.arrayPath);
        }
    });


} 

//helper to return relevant information about an article
function parseArticle(article){
    var data = {
        headline: qs.unescape(article.headline),
        subhead: qs.unescape(article.subhead),
        url: qs.unescape(article.getURL),
        authorName: qs.unescape(article.getAuthor[0]),
    }
    data.userName = lookUpUser(data.authorName);
    return data;
}
//helper to return slack username from gryphon authorname
function lookUpUser(authorName){
    return users[authorName];
}
//helper function to send notifications to slack users
function notifyUser(username, artUrl, artHeadline, artSubhead){
    var message = {
        as_user: "true",
        "attachments": [
        {
            "title": artHeadline,
            "title_link": artUrl,
            "text": artSubhead
        }
        ]
    }
    bot.postTo(username,"You've been published, check it out!", message);
}

//web endpoints, mostly for testing and debugging
app.get('/test',function(req,res){
    res.status(200).send(sections);
    bot.getUserId("Chuck Dries").then(function(val){console.log(val);});
});


app.get('/scrape', function(req, res) {
    checkSection("politics", res);
/*
    url = 'http://www.statepress.com/section/politics.json';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html) {

        // First we'll check to make sure no errors occurred when making the request

        if (!error) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            var articles = JSON.parse(response.body)[0].articles;
            var string = "";
            for (index in articles){
                var uid = articles[index].uid;
                //check if the article has been seen before
                if (seen.has(uid)){
                    console.log("hit!");
                    string = string + ", " + lookUpUser(articles[index].getAuthor[0]);
                } else {
                    console.log("No hit, article is new"); 
                    seen.add(uid);
                    string = string + ", " + lookUpUser(articles[index].getAuthor[0]);
                }
                

            }

            res.status(200).send(string);
            saveArray(settings.arrayPath);
        }
    });
*/
});

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;

initialize();
//get things rolling! bots handles the actual slack connection init, this simply loads the serialized data we need to work correctly.
