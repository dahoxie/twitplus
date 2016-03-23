/**
 * Created by Ketul on 3/22/2016.
 */

/* Create a new Tweet*/

$("#tweetPost").submit(function(event){

    event.preventDefault();             /**Ketul**/

    var tweet=$("#tweet").val();
    var data={"tweet":tweet};

    $.ajax({
        url: "http://localhost:9000/tweet",
        type: "POST",
        data: data,
        dataType:"json",
        success: function (postData) {
            var likearr=postData.like;
            upcount=likearr.length;
            displayName(postData.id,postData.content,postData.user,postData.date,upcount,0,"up");
        }
    });
});

/*load all tweets*/
$(document).ready(function()
{
    $.ajax({
        url: "http://localhost:9000/loadTweets",     /*Ketul*/
        type: "GET",
        dataType:"json",
        success: function (postData) {

            postData.forEach(function(postData) {
                var likearr=postData.like;
                upcount=likearr.length;
                displayName(postData.id,postData.content,postData.user,postData.date,upcount,0,"up");
            });
        }
    });
});

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
            url: "http://localhost:9000/getVotes?id="+id,
            type: "GET",
            dataType:"json",
            success: function (postData) {

                likearr=postData.like;
                up=likearr.length;
                dislikearr=postData.dislike;
                down=dislikearr.length;

                if(target.hasClass("up")) {

                    if(dislikearr.indexOf("Ketul")!==-1)
                    {
                        dislikearr.splice(dislikearr.indexOf("Ketul"), 1);
                    }
                    likearr.push("demo");

                }
                else if(target.hasClass("down")){

                    if(likearr.indexOf("Ketul")!==-1)
                    {
                        likearr.splice(dislikearr.indexOf("Ketul"), 1);
                    }
                    dislikearr.push("demo");
                }

                alert(likearr+"-"+dislikearr);

            }
        });






            



        }
});




