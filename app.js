var express = require('express');
var bodyParser=require("body-parser");
var request=require('request');
var app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/tweet', function(req, res) {

  var tweet = req.body.tweet;
  var user="Ketul";
  var data= {
    "content": tweet,
    "user": user,
    "date": '12/21/1991',
    "approved": false,
    "like": [user]};

    request.post({url:'http://localhost:3000/posts', headers:{'Content-Type': 'application/json'},body: JSON.stringify(data)}, function(err,httpResponse,body)
    {
    var body=JSON.parse(body);
    res.send(body);
    })
});

app.get('/loadTweets', function(req, res) {

  request('http://localhost:3000/posts', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(JSON.parse(body));
    }
  })
});


app.get('/getVotes',function(req,res){

  var id=req.param("id");

  request('http://localhost:3000/posts/'+id, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(JSON.parse(body));
    }
  })

})

app.post('/login',function(req,res){



});





app.listen(9000);

console.log("Server started on port:9000");