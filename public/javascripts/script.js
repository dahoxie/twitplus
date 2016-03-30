var active_user= undefined;
var upUser , dUser, uid, grp = 1 ;
var users ={
    "id": 2,
    "name": "test",
    "password": "password",
    "votes": {
        "up": [
        ],
        "down": [
        ]
        },
    "member_of": []
    };

uid = users.id;
/*upUser = users.votes.up;
dUser = users.votes.down;*/
$(document).ready(function(){
    $.ajax({
        url: "http://localhost:3000/posts",
        dataType: "json",
        type: "GET",
        cache: false,
        success: function(data){
            $(data).each(function(index, value){

                /*Only show posts which have not been posted to twitter*/
                if(value.approved == false) {
                    /*console.log(users.votes.up);
                     console.log(users.votes.down);*/

                    users.votes.up = $.map(users.votes.up, function(el) { return el });
                     users.votes.down = $.map(users.votes.down, function(el) { return el });

                    console.log(value.id);


                    if(users.votes.up.indexOf(value.id)>=0){
                        console.log("up");
                        /*if present, keep the downvote button selected for that user's page*/
                        displayName(value.id,value.text,value.author,value.date, value.upCount, value.dCount, value.group,"up");
                    }
                    else if(users.votes.down.indexOf(value.id)>=0){
                        console.log("down");
                        /*if present, keep the downvote button selected for that user's page*/
                        displayName(value.id,value.text,value.author,value.date, value.upCount,value.dCount,value.group,"down");
                    }
                    else{
                        /*the user has not yet upvoted or downvoted the post*/
                        console.log("no");
                        displayName(value.id,value.text,value.author,value.date, value.upCount, value.dCount,value.group,"no");
                    }

                }
            });
        }
    });
});

$("#posts").delegate("label", "click",function(e){
    var upcount, dcount,group, approved = false;

    /*Get the element which triggered the function*/
    var target = $(e.target);
    var lab = target.closest("label");

    /*check if the radio button was already selected*/
    if(lab.hasClass("active")){
        /*if selected then don't do anythung'*/
        console.log("already selected");
    }
    else{
        /*Fetch values required to make a PUT request*/
        var $div = target.closest("div.post-preview");
        var id = $div.attr("id");

        /*get current upvote and downvote count*/
        upcount = $div.find("span.upvotes").text();
        dcount= $div.find("span.downvotes").text();
        group = $div.find("span#grp").text();

        /*Check if the user clicked upvote button*/
        if(target.hasClass("up")){
            upcount++;
            /*Set upvote count*/
            $div.find("span.upvotes").text(upcount);

            /*if the user had previously downvoted the post, then remove its userid from dUsers list*/
            if(users.votes.down.indexOf(id)>=0){
                dcount--;
                $div.find("span.downvotes").text(dcount);
                users.votes.down.splice(users.votes.down.indexOf(id),1);
                /*users.votes.down = $.grep(users.votes.down, function(value) {
                    return value != id;
                });*/
            }
            /*Add userId to the upUsers list*/
            users.votes.up.push(id);
            console.log("comment upvoted: "+users.votes.up);
        }

        /*check if the user clicked downvote button*/
        else if(target.hasClass("down")){
            dcount++;

            /*set downvote count*/
            $div.find("span.downvotes").text(dcount);

            /*if the user had previously upvoted the post, then remove its userid from dUsers list.*/
            if(users.votes.up.indexOf(id)>=0){
                upcount--;
                $div.find("span.upvotes").text(upcount);
                users.votes.up.splice(users.votes.up.indexOf(id),1);
                /*users.votes.up = $.grep(users.votes.up, function(value) {
                    return value != id;
                });*/

            }
            /*add userid to dUsers list*/
            users.votes.down.push(id);
            console.log("comment downvoted: "+users.votes.down);
        }

        /*fetch other required information to make PUT request*/
        var author = $div.find("span.username").html();
        var date = $div.find("span.date").html();
        var tweet = $div.find("h2.post-title").html();

        /*if upvotes are more than 5 (assumed 5, need to decide it afterwards)*/
        if(upcount > 5){
            approved = true;

            /*Add code to post the tweet to twitter here*/

            /*remove the posted tweet from the page and show message*/
            $div.html("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"> " +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button> <strong>Great!</strong> " +
                "Tweet posted to your account. </div>");
        }

        /*preparing data*/
        var data = {
            text: tweet,
             author: author,
             date: date,
            upCount: upcount,
            dCount: dcount,
            group: group,
            approved: approved
        };
        changeUserVote();
        /*Make put request*/
        $.ajax({
            url: "http://localhost:3000/posts/" + id,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function() {
                console.log("Data updated");
            },
            error: function(e){
                console.log(e);
            }
        });
    }
});
function changeUserVote(){
    /*users.votes.up = upUser;
    users.votes.down = dUser;*/
    $.ajax({
       url: "http://localhost:3000/users/" + users.id,
        type: "PATCH",
        contentType: "application/json",
    dataType: "json",
        data: JSON.stringify({"votes": users.votes}),
        success:function(){
            console.log("data updated");
        },
        error: function () {
            console.log("error");
        }

    });
}
/*add user's post to json and display on page*/
$(".tweetPost").on("click", function(){
    var tweet = $("#userTweet").val().toString();
    var data = {
        text: tweet,
        group:grp, //grp id to be fetched
        author: getUser(),
        date: getDate(),
        upCount: 0,
        dCount: 0,
        approved: false
    };
    $.ajax({
        url: "http://localhost:3000/posts",
        type: "POST",
        data: data,
        success: function(newData){
            displayName(newData.id,newData.text,newData.author, newData.date, 0, 0, grp, "no");
            $("#userTweet").val("");
        },
        error: function(){
            console.log("Error posting data");
        }
    });

});

/*display user's posts in separate divs*/
function displayName(id, tweet, user, date, up, down, group, upNoDown){
    var label1, label2;
    var labelupActive = "<label class=\"btn btn-default up active\">";
    var labelDownActive = "<label class=\"btn btn-default down active\">"
    var labelUp = "<label class=\"btn btn-default up\">";
    var labelDown = "<label class=\"btn btn-default down \">";

    /*if user has upvoted the post, then set class = active to label to keep button selected.*/
    if(upNoDown==="up"){
        label1 = labelupActive;
        label2 = labelDown;
    }
    /*if user has downvoted the post, then set class = active to label to keep button selected.*/
    else if(upNoDown==="down"){
        label1 = labelUp;
        label2 = labelDownActive;
    }
    /*not yet upvoted/downvoted.Both buttons unselected*/
    else{
        label1 = labelUp;
        label2 = labelDown;
    }

    var post = "<div id=\""+(id)+"\" class=\"post-preview\"> <h2 class=\"post-title\">"+tweet+" </h2> <p class=\"post-meta\">" +
        "Posted by <span class=\"username\">"+user+"</span> on <span class=\"date\">"+date+"</span></p> <div class=\"btn-group btn-group-sm upDown\" " +
        "data-toggle=\"buttons\">"+label1+"<input type=\"radio\" class= \"up\" autocomplete=\"off\"> " +
        "<span class=\"glyphicon glyphicon-thumbs-up up\" aria-hidden=\"true\"></span><span class=\"up upvotes\">"+up+"</span>" +
        " </label>"+label2+" <input type=\"radio\" class = \"down\" autocomplete=\"off\"><span class=\"glyphicon glyphicon-thumbs-down down\" aria-hidden=\"true\"></span></span><span class=\"down downvotes\">"
        +down+"</span> <span id=\"grp\" class=\"hide\">"+group+"</span></label> </div><hr></div> ";
    /*console.log(post);*/
    /*prepend to show the latest post on top*/
    $("#posts").prepend(post);
}


function getUser(){
    var user = "demo";
    return user;
}

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

$("#login").on("click", function(){
    var username, passwrd;
    username = $("#user-name").val();
    passwrd = $("#password").val();
    var data = {
        "user_name": username,
        "password": passwrd
    };
    $.ajax({
        url: "http://localhost:8000/login",
        type: "POST",
        data: data,
        contentType: "json",
        success: function(data){
            console.log("User data: "+data.id+" "+data.user_name+" "+data.password+" "+data.member_of);
        },
        error: function(data){
            console.log("error: "+data);
        }
    });

    $(".firstTask").addClass("hide");
    $(".loginDone").removeClass("hide");
    $(".userArea").removeClass("hide");
});

$("#logout").on("click", function(){
    $(".firstTask").removeClass("hide");
    $(".loginDone").addClass("hide");
    $(".userArea").addClass("hide");
});