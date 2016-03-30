/**
 * Created by Ketul on 3/22/2016.
 */

/* Create a new Tweet*/

var loginuser;
var loginname;

$("#tweetPost").submit(function(event){

    event.preventDefault();             /**Ketul**/

    var tweet=$("#tweet").val();
    var data={"tweet":tweet,
    "username":loginname,
    "userid":loginuser};

    $.ajax({
        url: "http://localhost:8000/tweet",
        type: "POST",
        data: data,
        dataType:"json",
        success: function (postData) {

            $("#tweet").val("");
            var likearr=postData.like;
            upcount=likearr.length;

            var dislikearr=postData.dislike;
            dcount=dislikearr.length;


            displayName(postData.id,postData.content,postData.user,postData.date,upcount,0,"up");
        }
    });
});

/*load all tweets*/
function loadTweets()
{
    $.ajax({
        url: "http://localhost:8000/loadTweets",     /*Ketul*/
        type: "GET",
        dataType:"json",
        success: function (postData) {

            loginuser+="";
            postData.forEach(function(postData) {
                var likearr=postData.like;
                upcount=likearr.length;

                var dislikearr=postData.dislike;
                dcount=dislikearr.length;

                if(likearr.indexOf(loginuser)!==-1)
                {
                    console.log("up");
                    var updown="up";
                }
                else if(dislikearr.indexOf(loginuser)!==-1)
                {
                    console.log("down");
                    var updown="down";
                }
                else
                {
                    console.log("no. Loginuser: "+loginuser+" Array up: "+likearr+" array down: "+dislikearr);
                    var updown="no";
                }
                displayName(postData.id,postData.content,postData.user,postData.date,upcount,dcount,updown);
            });
        }
    });
}

function displayName(id, tweet, user, date, up, down, upNoDown){

    var label1, label2;
    var labelupActive = "<label class=\"btn btn-default up active\">";     /*Sayali*/
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

$("#posts").delegate("label", "click",function(e) {

    var target = $(e.target);
    var lab = target.closest("label");

    if(lab.hasClass("active"))
        console.log("already selected");
    else
    {
        var like=0;
        var $div = target.closest("div.post-preview");
        var id = $div.attr("id");

        var up=0;
        var down=0;
        var likearr=[];
        var dislikearr=[];

        $.ajax({
            url: "http://localhost:8000/getVotes?id="+id,
            type: "GET",
            dataType:"json",
            success: function (postData) {

                likearr=postData.like;

                dislikearr=postData.dislike;

                var usern="";
                usern+=loginuser;


                if(target.hasClass("up")) {

                    if(dislikearr.indexOf(usern)!==-1)
                    {
                        dislikearr.splice(dislikearr.indexOf(usern), 1);
                    }
                    likearr.push(usern);

                    up=likearr.length;
                    down=dislikearr.length;

                    $div.find("span.upvotes").text(up);
                    $div.find("span.downvotes").text(down);

                    postData.like=likearr;
                    postData.dislike=dislikearr;

                    updatePost(postData);

                }
                else if(target.hasClass("down")){

                    var usern="";
                    usern+=loginuser;

                    if(likearr.indexOf(usern)!==-1)
                    {
                        likearr.splice(likearr.indexOf(usern), 1);
                    }
                    dislikearr.push(usern);

                    up=likearr.length;
                    down=dislikearr.length;

                    $div.find("span.upvotes").text(up);
                    $div.find("span.downvotes").text(down);

                    postData.like=likearr;
                    postData.dislike=dislikearr;

                    updatePost(postData);

                }
            }
        });
function updatePost(data)
{
   $.ajax({
        url: "http://localhost:8000/updatePost",
        type: "POST",
        contentType: "application/json",
        data:JSON.stringify(data),
        dataType: "json",
        success: function (updatedData) {
            var count=(updatedData.like).length;
            if(count===3)
            {
                postTweet(updatedData.content);

            }
        }
    });
}
    }
});

function postTweet(tweet)
{
    var data={"tweet":tweet};
    console.log("Inside postTweet client.js Tweet:"+tweet);

    $.ajax({
        url: "http://localhost:8000/postTwitter",
        type: "POST",
        contentType: "application/json",
        data:JSON.stringify(data),
        dataType: "json",
        success: function (updatedData) {
            $div.html("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"> " +
             "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
             "<span aria-hidden=\"true\">&times;</span></button> <strong>Great!</strong> " +
             "Tweet posted to your account. </div>");
        }
    });
}

$("#loginModal").delegate("#login",'click', function (event) {
    event.preventDefault();
    var username, passwrd;
    if( !$("#user-name").val()) {
        $(".divUser").addClass("has-error");
        $("div.username").append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>");
        $(".username").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else if(!$("#password").val()){
        $(".divPass").addClass("has-error");
        $("div.password").append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>");
        $(".password").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

    }
    else {
        username = $("#user-name").val();
        passwrd = $("#password").val();

        var data = {
            "user_name": username,
            "password": passwrd
        };
        $.ajax({
            url: "http://localhost:8000/login",
            type: "POST",
            data: JSON.stringify(data),
            dataType:"json",
            contentType: "application/json",
            success: function(data){

                $("#loginModal").modal("hide");
                loginname=data.user_name;
                loginuser=data.id;

                $("a#user").text(loginname);
                /*$("li.dropdown").removeClass("hide");*/
                $(".firstTask").addClass("hide");
                $(".loginDone").removeClass("hide");
                $(".userArea").removeClass("hide");

                loadTweets();

            },
            error: function(data){
                $(".alert").removeClass("hide");
                console.log("error: "+data);

            }
        });
    }
});

$("#user-name, #newUserName").keypress(function(){
    $(".divUser").removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");

});
$("#password, #newUserPass").keypress(function(){
    $(".divPass").removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");
});
$("#cnfrmPass").keypress(function(){
    $(".divcnfrmPass").removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");
});
$('.modal').on('hidden.bs.modal', function(){
    $(this).find('form')[0].reset();
    $(this).find(".divUser").removeClass("has-error");
    $(this).find(".divPass").removeClass("has-error");
    $(this).find(".divcnfrmPass").removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");
});

$("#newSignUp").on("click", function(event){

    event.preventDefault();
    var newUser, newPass, cnfrmPass;

    newUser = $("#newUserName").val();
    newPass = $("#newUserPass").val();
    cnfrmPass = $("#cnfrmPass").val();

    if(!newUser){
        $(".divUser").addClass("has-error");
        $("div.username").append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>");
        $(".username").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else if(!newPass){
        $(".divPass").addClass("has-error");
        $("div.password").append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>");
        $(".password").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else if(!cnfrmPass){
        $(".divcnfrmPass").addClass("has-error");
        $("div.cnfrmPass").append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>");
        $(".cnfrmPass").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else if(newPass !== cnfrmPass){
        $(".alert").removeClass("hide");
    }
    else{
        console.log("Password confirmed.");
        var data = {
            "user_name": newUser,
            "password": newPass
        };
        /*$.ajax({
         url: "http://localhost:8000/register",
         type: "POST",
         data: data,
         dataType:"json",
         success: function (data) {
         console.log("new user created. "+data.id);
         $("#signupModal").modal("hide");
         }
         });*/
    }

});


/*$("#login").on('click',function(event){

    event.preventDefault();
    var username, passwrd;
    if( !$("#user-name").val() || !$("#password").val() ) {
        $(".modal-body").append("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\"> " +
            "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
            "<span aria-hidden=\"true\">&times;</span></button> <strong>Alert</strong> " +
            "Empty fields </div>");
        $("#user-name").addClass("err");
    }
    else {

        username = $("#user-name").val();
        passwrd = $("#password").val();

        var data = {
            "user_name": username,
            "password": passwrd
        };
        $.ajax({
            url: "http://localhost:8000/login",
            type: "POST",
            data: JSON.stringify(data),
            dataType:"json",
            contentType: "application/json",
            success: function(data){

                $("#loginModal").modal("hide");
                loginname=data.user_name;
                loginuser=data.id;

                $(".firstTask").addClass("hide");
                $(".loginDone").removeClass("hide");
                $(".userArea").removeClass("hide");

                loadTweets();

            },
            error: function(data){
                console.log("error: "+data);
            }
        });
    }
});*/

$("#logout").on("click", function(){

    $(".firstTask").removeClass("hide");
    $(".loginDone").addClass("hide");
    $(".userArea").addClass("hide");

    location.reload();
});