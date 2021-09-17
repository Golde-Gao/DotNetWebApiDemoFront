$(function() {
    let ck = localStorage.getItem("userInfo");
    if (typeof(ck) == "undefined" || ck == "null") {
        window.location.href = "login.html";
    } else {
        userinfo = JSON.parse(ck);
        apiconf = JSON.parse(localStorage.getItem("apiconf"));
        $("#userInfo").append(userinfo.name);
        pageconf = JSON.parse(localStorage.getItem("pageconf"));
        $("title").text("考点测试v2.0");

        if (userinfo.roleid == 100) {
            $(".c-admin").show();
            $(".c-account").hide();
        } else {
            $(".c-account").show();
            $(".c-admin").hide();
        }
    }
})


function GetCheckpageIndex() {
    var ind = parseInt(localStorage.getItem("checkpageIndex"));
    localStorage.setItem("checkpageIndex", ind + 1);
    return ind;
}