var express = require('express');
var bodyParser=require("body-parser");
var cookieParser = require('cookie-parser')
var session = require("express-session");
var request=require('request');
var Twitter = require('twitter');
var app = express();

var sess;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(
    {
        secret: '1234567890QWERTY',
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false}
    }
));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post("/register", function (req, res) {
    var data = {
       "user_name": req.body.user_name,
       "password": req.body.password,
       "member_of": []
    };
    request.post({
        url: "http://localhost:3000/users",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    },
    function(err, httpResponse, body){
        var body = JSON.parse(body);
        res.send(body);
    });

});
app.post('/tweet', function(req, res) {

  var tweet = req.body.tweet;
  var user=req.body.username;
  var userid=req.body.userid;
  var data= {
    "content": tweet,
    "user": user,
    "date": getDate(),
    "approved": false,
    "like": [userid],
    "dislike":[]};

    request.post({url:'http://localhost:3000/posts', headers:{'Content-Type': 'application/json'},body: JSON.stringify(data)}, function(err,httpResponse,body)
    {
    var body=JSON.parse(body);
    res.send(body);
    })
});

app.get('/loadTweets', function(req, res) {
    console.log(sess.userid);
    if(sess.userid){
        request('http://localhost:3000/posts', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(JSON.parse(body));
            }
        })
    }
    else {
        console.log("please login");
        res.render("public/index.html");
    }

});

app.post('/addGroup', funtion(req, res) {
    var groupName = req.body.groupname;
    var data = {
        group_Name: groupName,
        members: [],
        chat: [],
    };

    request.post({url:'http://localhost:3000/groups', header:{'Content-Type': 'application/json'}, body: JSON.stringify(data)}, function(error, response, body) {
        var body = JSON.parse(body);
        res.send(body);
    })
});


app.get('/getVotes',function(req,res){
    /*if(sess.userid){*/
        var id=req.param("id");

        request('http://localhost:3000/posts/'+id, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(JSON.parse(body));
            }
        })
   /* }
    else {
        console.log("please login");
        res.render("public/index.html");
    }*/

});

app.post('/login',function(req,res){

    var unm, pwrd;

    sess = req.session;

    user=req.body.user_name;
    pass=req.body.password;

    request('http://localhost:3000/users', function (error, response, body) {

            if (!error && response.statusCode == 200) {

                var flag=false;
                var data=JSON.parse(body);


                for (var i = 0; i < data.length; i++) {

                    unm = data[i].user_name;
                    pwrd = data[i].password;

                    if(user === unm && pass  === pwrd)
                    {
                        flag=true;
                        res.send(data[i]);
                        sess.userid = data[i].id;
                        console.log("session id: "+sess.userid);
                    }
                }
                if(flag==false)
                    res.status(401).json({ error: 'message' });
            }
        });

  });

app.post('/updatePost',function(req,res){
    /*if(sess.userid){*/
        var data=req.body;

        var id=data.id;

        request({ url: 'http://localhost:3000/posts/'+id, method: 'PUT', json: data}, function(err,httpResponse,body){

            res.send(body);

        });
   /* }
    else {
        console.log("please login");
        res.render("public/index.html");
    }*/


});

app.post("/postTwitter",function(req,res){
    /*if(sess.userid){*/
        console.log("response: "+res.body);
        var tweet=req.body.tweet;

        var client = new Twitter({
            consumer_key: 'wdupZpyaeLjCvqhsrJsDp20ix',
            consumer_secret:'xsAzRqdU32W59Ow2OjhAtyex7WozQwWClc1Vf7bOYoIYTKHHYs',
            access_token_key:'706613428790566912-BYASC0htSA2V2bcB2Ps4OmQdpwj3s40',
            access_token_secret:'L8SL9Na2RwZ6c12r4HlxVJkXQnC5CqHn60GQjoWxYINmT'
        });

        var params = {screen_name: 'cpsc473'};


        client.post('statuses/update', {status: tweet},  function(error, tweet, response){
            if(error) throw error;
            console.log(tweet);  // Tweet body.
            console.log(response);  // Raw response object.
            return;
        });
    /*}
    else {
        console.log("please login");
        res.render("public/index.html");
    }*/


});

/*Get today's date. Format: MonthName day, year */
function getDate(){
  var d = new Date();
  var month = d.getMonth()+1;
  var day = d.getDate();
  var output = GetMonthName(month)+ " "+day+", "+ d.getFullYear();
  return output;
}

/*get month name*/
function GetMonthName(monthNumber) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNumber - 1];
}
app.listen(8000);

console.log("Server started on port:8000");
