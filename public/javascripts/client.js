var loginuser;
var loginname;

/*Add user's new post*/
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

/*Post new group to server*/
$(".submitGroup").on("click", function(){
    var groupName = $("#groupName").val().toString();
    var data = {
        "group_Name": groupName,
        "members": [],
        "chat": [],
    };
    $.ajax({
        url: "http://localhost:8000/addGroup",
        type: "POST",
        data: data,
        dataType:"json",
        success: function(newData){
            console.log("Group posted succesfully");
        },
        error: function(){
            console.log("Error posting data");
        }
    });
});

/*Display posts with upvote, downvote*/
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

    var post = "<div id=\""+(id)+"\" class=\"post-preview \"> <h2 class=\"post-title\">"+tweet+" </h2> <p class=\"post-meta\">" +
        "Posted by <span class=\"username\">"+user+"</span> on <span class=\"date\">"+date+"</span></p> <div class=\"btn-group btn-group-sm upDown\" " +
        "data-toggle=\"buttons\">"+label1+"<input type=\"radio\" class= \"up\" autocomplete=\"off\"> " +
        "<span class=\"glyphicon glyphicon-thumbs-up up\" aria-hidden=\"true\"></span><span class=\"up upvotes\">"+up+"</span>" +
        " </label>"+label2+" <input type=\"radio\" class = \"down\" autocomplete=\"off\"><span class=\"glyphicon glyphicon-thumbs-down down\" aria-hidden=\"true\"></span></span><span class=\"down downvotes\">"
        +down+"</span> </label> </div><hr></div> ";

    /*prepend to show the latest post on top*/
    $("#posts").prepend(post);

}

/*Display group posts*/
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

                    if(up == 3){
                        postData.approved = true;
                    }
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

/*Upload post to twitter*/
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

/*Display field error*/
function err(sel){
    $pDiv = $(sel).parent();
    $pDiv.append("<span class=\"glyphicon glyphicon-remove form-control-feedback\"></span>");
    $pDiv.fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    $gpDiv = $pDiv.parent();
    $gpDiv.addClass("has-error");

}

/*Handle login*/
$("#loginModal").delegate("#login",'click', function (event) {
    event.preventDefault();
    var username, passwrd;
    if( !$("#user-name").val()) {
        err("#user-name");
    }
    else if(!$("#password").val()){
        err("#password");

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
                $("li.dropdown").removeClass("hide");
                $(".firstTask").addClass("hide");
                $(".loginDone").removeClass("hide");
                $(".userArea").removeClass("hide");

                $("button[type=submit]").prop('disabled',true);

                loadTweets();

            },
            error: function(data){
                $(".alert").removeClass("hide");
                console.log("error: "+data);

            }
        });
    }
});

/*Disable and enable submit button by checking the textarea contents*/
$('#tweet').keyup(function(){
    $("button[type=submit]").prop('disabled', this.value == "" ? true : false);
});

/*Remove field errors on keypress*/
$("#user-name, #newUserName, #password, #newUserPass, #cnfrmPass, #twitter, #groupName, #grpmembers, #adduser").on("click keypress", function(){
    $(this).parent().parent().removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");
});

/*Clear modal on close*/
$('.modal').on('hidden.bs.modal', function(){
    $(this).find('form')[0].reset();
    $(this).find("div.has-error").removeClass("has-error");
    $("span.glyphicon-remove").remove();
    $(".alert").addClass("hide");
    $("ul#tag-cloud").text("");
});

/*Handle new user sign-up*/
$("#newSignUp").on("click", function(event){

    event.preventDefault();
    var newUser, newPass, cnfrmPass;

    newUser = $("#newUserName").val();
    newPass = $("#newUserPass").val();
    cnfrmPass = $("#cnfrmPass").val();

    if(!newUser){
        err("#newUserName");
    }
    else if(!newPass){
        err("#newUserPass");
    }
    else if(!cnfrmPass){
        err("#cnfrmPass");
    }
    else if(newPass !== cnfrmPass){
        $(".alert").removeClass("hide");
        err("#newUserPass");
        err("#cnfrmPass");
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

/*Handle new group creation*/
$("#createGrp").on("click", function(event){
    event.preventDefault();
    var users = [], grpName, twitterAcnt;
    $("li.tag-cloud").each(function() { users.push($(this).text()) });
    grpName = $("#groupName").val();
    twitterAcnt = $("#twitter").val();
    if(!grpName){
        err("#groupName");
    }
    else if(users.length==0){
        $(".divMembers").addClass("has-error");
        $(".members").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    }
    else if(!twitterAcnt){
        err("#twitter");
    }
    else {

    }
});

/*Logout*/
$("#logout").on("click", function(){

    $(".firstTask").removeClass("hide");
    $(".loginDone").addClass("hide");
    $(".userArea").addClass("hide");

    location.reload();
});
