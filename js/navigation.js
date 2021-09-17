$(function() {
    // 默认li都是不显示的，配有哪一个就把哪一个给现实出来
    let pconf = $(pageconf).filter((_, item) => {
        return item.roleid == userinfo.roleid;
    })[0];
    if (pconf.pageshowidconf.length == 0) {
        $(".layui-header").find("ul").first().find("li").show();
    } else {
        $.each($(".layui-header").find("ul").first().find("li"), (__, lili) => {
            let bo = $(pconf.pageshowidconf).filter((_, confitem) => {
                return $(lili).find("a").attr("href").indexOf(confitem) >= 0;
            }).length > 0
            if (bo) {
                $(lili).show();
            }
        });
    }
})

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}