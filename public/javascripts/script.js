var upUser , dUser, userId = 2;
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

                    upUser = $.map(value.upUsers, function(el) { return el });
                    dUser = $.map(value.dUsers, function(el) { return el });


                    if($.inArray(userId, upUser) !== -1){

                        displayName(value.id,value.content,value.user,value.date, value.upCount, value.dCount,"up");
                    }
                    else if($.inArray(userId, dUser) !== -1){

                        displayName(value.id,value.content,value.user,value.date, value.upCount, value.dCount,"down");
                    }
                    else
                    {
                        console.log("no");
                        displayName(value.id,value.content,value.user,value.date, value.upCount, value.dCount,"no");
                    }
                }
            });
        }
    });
});

    $("#posts").delegate("label", "click",function(e){

    var upcount, dcount, approved = false;
    -+

    var lab = target.closest("label");
    if(lab.hasClass("active"))
    {
        console.log("already selected");
    }
    else
    {
        var like=0;
        var $div = target.closest("div.post-preview");
        var id = $div.attr("id");

        upcount = $div.find("span.upvotes").text();
        dcount= $div.find("span.downvotes").text();

        if(target.hasClass("up")){

           like=1;

            upcount++;
            $div.find("span.upvotes").text(upcount);

            /*if the user had previously downvoted the post, then remove its userid from dUsers list*/
            if($.inArray(userId, dUser) !== -1){
                dUser = jQuery.grep(dUser, function(value) {
                    return value != userId;
                });
            }

            /*Add userId to the upUsers list*/
            upUser.push(userId);
            console.log("comment upvoted: "+upUser);
        }

        /*check if the user clicked downvote button*/
        else if(target.hasClass("down")){

            like=-1;
            dcount++;
            /*set downvote count*/
            $div.find("span.downvotes").text(dcount);

            /*if the user had previously upvoted the post, then remove its userid from dUsers list.*/
            if($.inArray(userId, upUser) !== -1){
                upUser = jQuery.grep(upUser, function(value) {
                    return value != userId;
                });
            }

            /*add userid to dUsers list*/
            dUser.push(userId);
            console.log("comment downvoted: "+dUser);
        }

        /*fetch other required information to make PUT request*/
        var user = $div.find("span.username").html();
        var date = $div.find("span.date").html();
        var tweet = $div.find("h2.post-title").html();

        /*if upvotes are more than 5 (assumed 5, need to decide it afterwards)*/
        if(upcount > 5){
            approved = true;

            $div.html("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"> " +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
                "<span aria-hidden=\"true\">&times;</span></button> <strong>Great!</strong> " +
                "Tweet posted to your account. </div>");
        }
        /*preparing data*/

        var data = {
            user: user,
            post:id,
            id:"d0c2011c-bdbd-4bde-9f63-5816f3f594ef",
            vote:like,
        };

        $.ajax({
            url: "http://localhost:3000/votes",
            type: "PUT",
            data: data,
            success: function() {
                alert("success");
            }
        });
    }
});

/*add user's post to json and display on page*/
$(".tweetPost").on("click", function(){
    var tweet = $("#userTweet").val().toString();
    var data = {
        content: tweet,
        user: getUser(),
        date: getDate(),
        approved: false
    };
    $.ajax({
        url: "http://localhost:3000/posts",
        type: "POST",
        data: data,
        success: function(postData){

            var postid=postData.id;
            var user=postData.user;
            var like=1;
            var data = {
                user: user,
                post: postid,
                vote: like
            };
            $.ajax({
                url: "http://localhost:3000/votes",
                type: "POST",
                data: data,
                success:function(data)
                {

                }});
            displayName(postData.id,postData.content,postData.user, postData.date, 0, 0);
            $("#userTweet").val("");
        },
        error: function(){
            console.log("Error posting data");
        }
    });

});

/*display user's posts in separate divs*/
function displayName(id, tweet, user, date, up, down, upNoDown){
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
        +down+"</span> </label> </div><hr></div> ";

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

