leftlayindex = null;
rightlayindex = null;
rightlayindexlittle = null;
$(() => {
    var XHRCONF = { withCredentials: true };
    let fsizeshiti = localStorage.getItem("font-size-shiti");
    let fsizeknowledge = localStorage.getItem("font-size-knowledge");
    if (typeof(ck) == "undefined" || ck == "null") {
        $("#testoverview").css("font-size", fsizeshiti);
        $(".knowledge-item").css("font-size", fsizeknowledge);
    }

    let adjusthheight = window.innerHeight - 77 - 40 - 45;
    $("#testoverview").css("height", adjusthheight);
    $("#checkpage").css("height", adjusthheight);
    $(window).resize(function(event) {
        window.innerHeight;
        window.innerWidth;
        adjusthheight = window.innerHeight - 77 - 40 - 45;
        $("#testoverview").css("height", adjusthheight);
        $("#checkpage").css("height", adjusthheight);
    });
    setprogressbar(70, 100);
    for (i = 0; i < 113; i++) {
        var item = $($("#test-item-container").find(".test-item")[0]).clone();
        $(item).find(".tihao-index").text(i + 1);
        let tttt = 100000000 + i
        if (i % 3 == 1) {
            tttt = '<span class="layui-badge-dot layui-bg-orange" style="margin-right:10px"></span>' + tttt + '<span style="display:inline-block;width:10px;height:1px;"></span>';
        } else {
            tttt = '<span style="margin-right:18px;"></span>' + tttt + '<span style="display:inline-block;width:10px;height:1px;"></span>';
        }
        $(item).find(".tihao-content").html(tttt);
        $(item).show();
        if (i == 5) {
            $(item).css("background", "tomato");
        }
        $("#test-item-container").append(item);
    }


    $.ajax({
            type: "GET",
            // url: apiconf.reportissuerecordview + "?testEntityId=100009990",
            url: apiconf.reportissuerecordview + "?testEntityId=100011714",
            xhrFields: XHRCONF,
        })
        .then((data) => {
            var x2js = new X2JS();
            var xmlText = data.data[0].entityxml;
            var jsonObj = x2js.xml_str2json(xmlText);
            $("#entity-content").empty();
            parseJson(jsonObj, 0);
        });

    $("#button-shitilist-show").hide();
    $("#button-shitilist-hide").css("display", "inline-block");
    leftlayindex = layer.open({
        id: "",
        type: 1,
        title: false,
        closeBtn: 0,
        shadeClose: true,
        skin: 'yourclass',
        shade: 0,
        offset: [window.innerHeight * 0.5 + 'px', '6px'],
        anim: 5,
        isOutAnim: false,
        content: $('#side-memu'),
        area: ['320px', window.innerHeight * 0.5 - 77 + 'px'],
        success: function() {
            $("#test-item-container").css("height", window.innerHeight * 0.5 - 77 - 80 + "px");
            $("#test-item-container").css("overflow-y", "auto");
        }
    })

    $(".click-hide-tihaolist").click(event => {
        // 缩小题号显示popup，并不不是隐藏
        $("#button-shitilist-show").show();
        $("#button-shitilist-hide").hide();
        layer.close(leftlayindex);
    });

    let backcolor = window.location.href.substring(window.location.href.indexOf("=") + 1);
    $("#progress-control").css("background-color", backcolor);
    $(".button-shitilist").click(event => {
        if (event.currentTarget.id == "button-shitilist-show") {
            $("#button-shitilist-show").hide();
            $("#button-shitilist-hide").css("display", "inline-block");
            let hei = window.innerHeight * 0.5 - 77;
            let titlett =
                leftlayindex = layer.open({
                    id: "",
                    type: 1,
                    title: false,
                    closeBtn: 0,
                    shadeClose: true,
                    skin: 'yourclass',
                    shade: 0,
                    offset: [window.innerHeight * 0.5 + 'px', '6px'],
                    anim: 5,
                    isOutAnim: false,
                    content: $('#side-memu'),
                    area: ['320px', hei + 'px'],
                    success: function() {
                        $("#test-item-container").css("height", hei - 80 + "px");
                        $("#test-item-container").css("overflow-y", "auto");
                    }
                });
        } else {
            $("#button-shitilist-show").css("display", "inline-block");
            $("#button-shitilist-hide").hide();
            layer.close(leftlayindex);
        }
    });
    $(".button-tihaolistdddddddddddddd").click(event => {
        if (event.currentTarget.id == "button-tihaolist-show") {
            $("#button-tihaolist-show").hide();
            $("#button-tihaolist-hide").show();
            let hei = 320; // window.innerHeight * 0.55;
            let wid = window.innerWidth - 140;
            rightlayindex = layer.open({
                id: "",
                type: 1,
                title: '<div style="text-align:center;font-family:kaiti;font-size:large"><b>题号</b></div>',
                closeBtn: 0,
                shadeClose: true,
                skin: 'yourclass',
                shade: 0,
                offset: ['100px', wid + 'px'],
                anim: 5,
                isOutAnim: false,
                content: $('#side-tihao-memu'),
                area: ['130px', hei + 'px'],
                zIndex: 998
            });
        } else {
            $("#button-tihaolist-show").show();
            $("#button-tihaolist-hide").hide();
            layer.close(rightlayindexlittle);
            layer.close(rightlayindex);
        }
    });

    //右键监听
    $('.knowledge-item').on("contextmenu", function(e) {
        // alert("dddddd");
        var data = { content: $(this).html() }
        var menu_data = [
            { 'data': { id: 1 }, 'type': 1, area: ["300px"], 'title': '错识别（知识点）' },
            { 'data': { id: 2 }, 'type': 2, 'title': '错识别（考点）' },
            { 'data': { id: 3 }, 'type': 3, 'title': '应为核心（非核心）考点' }

        ]
        let cconf = { area: "230px" };
        layui.mouseRightMenu.open(menu_data, cconf, function(d) {
            // layui.layer.alert(JSON.stringify(d));
        })
        return false;
    });

    let ttitle = '测试时间：<span  class="text-show">2021-04-24 10:30:06</span> 测试人：<span  class="text-show">孟繁雪</span> <b>（已审核）</b>';
    OpenDuiBi(ttitle);

    $(".banbenduibi").click(event => {
        let layerindex = layer.open({
            type: 1,
            shadeClose: false,
            shade: 0,
            closeBtn: 0,
            maxmin: true,
            area: ['41%', '85vh'],
            content: $("#popup-rec-history2"),
            btn: false,
            offset: ["55px", "3px"],
            resize: false,
            title: ttitle,
            zIndex: 1001, //重点1
            success: function(layero) {
                $(".layui-layer-max").css("display", "none");
                $(".banbenduibi").hide();
            },
            yes: function() {

            },
            min: function() {
                layui.layer.close(layerindex);
                $(".banbenduibi").show();
            },
            restore: function() {
                $(".layui-layer-max").css("display", "none");
            },
            end: function() {
                // layui.layer.closeAll();

                $("#header-bar").css({ "z-index": 1000 });
                $("#popup-detail-check").hide();
            }
        });
    });

    $("#rec-history2").click(event => {
        layer.open({
            type: 1,
            shadeClose: true,
            shade: 0,
            area: ['41%', '85vh'],
            content: $("#popup-rec-history2"),
            btn: ["确认审核"],
            offset: ["55px", "3px"],
            resize: false,
            title: "<b>识别历史</b>",
            zIndex: 1001, //重点1
            success: function(layero) {

            },
            yes: function() {

            },
            end: function() {
                $("#header-bar").css({ "z-index": 1000 });
                $("#popup-detail-check").hide();
            }
        });
    });

    layer.close(rightlayindex);

    let hei = window.innerHeight * 0.5;
    let wid = window.innerWidth - 65;
    $("#tihao-display2").css("height", hei - 40 + "px");
    rightlayindexlittle = layer.open({
        id: "",
        type: 1,
        title: false, //'<div style="font-family:kaiti;"><b>题号</b></div>',
        closeBtn: 0,
        shadeClose: true,
        skin: 'yourclass',
        shade: 0,
        offset: ['50px', wid + 'px'],
        anim: 5,
        isOutAnim: false,
        content: $('#side-tihao-memu2'),
        area: ['60px', hei + 'px'],
        zIndex: 998
    });
    $("#ceshi-area").click(event => {
        // layer.close(rightlayindex);

        // let hei = window.innerHeight * 0.5;
        // let wid = window.innerWidth - 65;
        // rightlayindexlittle = layer.open({
        //     id: "",
        //     type: 1,
        //     title: '<dsiv style="font-family:kaiti;">#</dsiv>',
        //     closeBtn: 0,
        //     shadeClose: true,
        //     skin: 'yourclass',
        //     shade: 0,
        //     offset: ['50px', wid + 'px'],
        //     anim: 5,
        //     isOutAnim: false,
        //     content: $('#side-tihao-memu2'),
        //     area: ['60px', hei + 'px'],
        //     zIndex: 998
        // });
    });
    $("#color-means").click(_ => {
        layer.open({
            type: 1,
            offset: "auto",
            id: 'color-explain',
            shadeClose: true,
            shade: 0,
            content: $("#color-means-popup"),
            btn: 'OK',
            btnAlign: 'r',
            title: "<b>颜色表示什么？</b>",
            area: ['800px', '450px'],
        });
    });

    $("#button-setting").click(function() {
        layer.open({
            type: 1,
            offset: "auto",
            id: 'color-explain',
            shadeClose: true,
            shade: 0,
            content: $("#setting-popup"),
            btn: 'OK',
            btnAlign: 'r',
            title: "<b>设置</b>",
            area: ['800px', '450px'],
            success: function() {
                layui.form.render();
            },
            end: function() {
                $("#setting-popup").hide();
            }
        });

    });
    $(".add-lose").click(event => {

        let addtype = "";
        if (event.currentTarget.id == "addhexinkaodian") {
            addtype = "核心考点";
        } else if (event.currentTarget.id == "addfeihexinkaodian") {
            addtype = "非核心考点";
        }
        layer.open({
            type: 1,
            offset: "auto",
            id: 'add-knowledge',
            shadeClose: true,
            shade: 0,
            content: $("#add-lose-content"),
            btn: 'OK',
            btnAlign: 'r',
            title: "<b>添加漏识别【" + addtype + "】</b>",
            area: ['560px', '470px'],
            success: function() {
                layui.table.render({
                    elem: '#add-knowledge-search-table',
                    data: [{
                        "knowledgename": "name"
                    }, {
                        "knowledgename": "name of"
                    }, {
                        "knowledgename": "name from"
                    }],
                    height: 215,
                    cols: [
                        [
                            { field: 'knowledgename', title: '知识点' },
                            { type: 'radio', title: "选择", width: 90 },
                        ]
                    ],
                });
            },
        });

    });

    RenderColorBlock();

});

function OpenDuiBi(title) {
    let layerindex = layer.open({
        type: 1,
        shadeClose: false,
        shade: 0,
        closeBtn: 0,
        maxmin: true,
        area: ['41%', '85vh'],
        content: $("#popup-rec-history2"),
        btn: false,
        offset: ["55px", "3px"],
        resize: false,
        title: title,
        zIndex: 1001, //重点1
        success: function(layero) {
            $(".layui-layer-max").css("display", "none");
        },
        yes: function() {
            $(".banbenduibi").hide();
        },
        min: function() {
            layui.layer.close(layerindex);
            $(".banbenduibi").show();
        },
        restore: function() {
            $(".layui-layer-max").css("display", "none");
        },
        end: function() {
            // layui.layer.closeAll();

            $("#header-bar").css({ "z-index": 1000 });
            $("#popup-detail-check").hide();
        }
    });
}

function RenderColorBlock() {
    // layui-field-box   blockquote   shenhequote shibiezhegnque
    // 遍历每个layui-field-box，确定正确的个数
    // 确定

    // 100px作为基准总色块像素；
    // 分别100px*XX 分别100px*XX 分别100px*XX 分别100px*XX 分别100px*XX 分别100px*XX
    $.each($(".layui-field-box"), (_, ele) => {
        let shibiezhegnquecount = 0,
            kaodiancuowucount = 0,
            zhishidiancuowucount = 0,
            kaodianloushibiecount = 0,
            zhishidianloushibecount = 0,
            weizhizhishidaincount = 0,
            sum = 0;
        $.each($(ele).children(), (_, item) => {
            let count = $(item).children().length;
            sum += count;
            if (item.classList.value.indexOf("shibiezhegnque") > -1) {
                shibiezhegnquecount = count;
            } else if (item.classList.value.indexOf("shibiecuowu-kaodiancuowu") > -1) {
                kaodiancuowucount = count;
            } else if (item.classList.value.indexOf("shibiecuowu-zhishidiancuowu") > -1) {
                zhishidiancuowucount = count;
            } else if (item.classList.value.indexOf("liushibie-kaodianloushibie") > -1) {
                kaodianloushibiecount = count;
            } else if (item.classList.value.indexOf("liushibie-zhishidianloushibe") > -1) {
                zhishidianloushibecount = count;
            } else if (item.classList.value.indexOf("liushibie-weizhizhishidain") > -1) {
                weizhizhishidaincount = count;
            }
        });
        $(ele).find(".shibiezhegnque").css("border-left-width", 100 * shibiezhegnquecount / sum + "px");
        $(ele).find(".shibiecuowu-kaodiancuowu").css("border-left-width", 100 * kaodiancuowucount / sum + "px");
        $(ele).find(".shibiecuowu-zhishidiancuowu").css("border-left-width", 100 * zhishidiancuowucount / sum + "px");
        $(ele).find(".liushibie-kaodianloushibie").css("border-left-width", 100 * kaodianloushibiecount / sum + "px");
        $(ele).find(".liushibie-zhishidianloushibe").css("border-left-width", 100 * zhishidianloushibecount / sum + "px");
        $(ele).find(".liushibie-weizhizhishidain").css("border-left-width", 100 * weizhizhishidaincount / sum + "px");
    });

}


var keyconf = {
    "TContent": "试题",
    "Quesbody": "试题Body",
    "QuesArticle": "试题篇章Article",
    "QuesChild": "小题",
    "QueStem": "题干Stem",
    "QuesOptionAsk": "题干Ask",
    "QuesOption": "选项",
    "QuesAnswer": "答案",
    "QuesAnalyze": "解析"
}

function isnotund(obj) { return typeof(obj) != "undefined"; }

function getmixval(obj) {
    if (typeof(obj) == "string") {
        return obj;
    } else if (typeof(obj) == "object") {
        if (isnotund(obj.__text)) {
            return obj.__text;
        }
    }
    return "";
}



function getspace(count) {
    if (count > 0) {
        space = "";
        for (ind = 0; ind < count; ind++) {
            space += "&nbsp;&nbsp;";
        }
        return space;
    }
    return "";
}



function entityappend(text, px) {
    if (isnotund(px)) {
        $("#entity-content").append('<div style="padding-left:' + px * 9 + 'px">' + text + "</div>");
    } else {
        $("#entity-content").append("<div>" + text + "</div>");
    }
}


// 试题节点解析及页面组织
function parseJson(obj, deep, tihao) {
    if (isnotund(obj.TContent)) {
        parseJson(obj.TContent, deep);
    } else {
        deep++;
        // 根节点
        if (isnotund(obj.QuesArticle) || isnotund(obj.Quesbody)) {
            // 读取obj.QuesArticle和obj.Quesbody的信息
            if (isnotund(obj.QuesArticle) && isnotund(obj.QuesArticle.__text)) {
                entityappend("题干Article：", deep);
                entityappend(obj.QuesArticle.__text, deep + 2);
            }
            if (isnotund(obj.Quesbody) && obj.Quesbody != "") {
                entityappend("题干Body：", deep);


                var body = "";
                var cccArr = obj.Quesbody.split("____");

                if (cccArr.length > 1) {
                    var body = cccArr[0];
                    for (j = 1; j < cccArr.length; j++) {
                        body = body + "__" + j + "__" + cccArr[j];
                    }
                    entityappend(body, deep + 2);
                } else {
                    entityappend(obj.Quesbody, deep + 2);
                }

            }
            if (isnotund(tihao)) {
                entityappend("<b>（" + tihao + "）</b>");
            }
            // 还有子小题
            if (isnotund(obj.QuesChild)) {
                if (obj.QuesChild instanceof Array) {
                    for (j = 0; j < obj.QuesChild.length; j++) {
                        parseJson(obj.QuesChild[j], deep, (j + 1).toString());
                    }
                } else {
                    parseJson(obj.QuesChild, deep);
                }
            }
        }
        // 非根节点
        else {
            if (isnotund(tihao)) {
                var tihao = (deep - 1).toString() + "-" + tihao;
                entityappend("<b>（" + tihao + "）</b>", deep);
            }
            // 读取QuesChild的属性信息QueStem；QuesAnalyze；QuesAnswer；QuesOption；QuesOptionAsk  显示的挨个读取
            let QueStem = getmixval(obj.QueStem);
            let QuesAnalyze = getmixval(obj.QuesAnalyze);
            let QuesAnswer = getmixval(obj.QuesAnswer);
            let QuesOptionAsk = getmixval(obj.QuesOptionAsk);
            if (QueStem != "") {
                entityappend("题干Stem：", deep);
                entityappend(QueStem, deep + 2);
            }
            if (QuesOptionAsk != "") {
                entityappend("题干Ask", deep);
                entityappend(QuesOptionAsk, deep + 2);
            }
            if (obj.QuesOption instanceof Array) {
                for (ii = 0; ii < obj.QuesOption.length; ii++) {
                    let ttt = "    选项【" + obj.QuesOption[ii]._index + "】 " + obj.QuesOption[ii].__text;
                    entityappend(ttt, deep + 4);
                }
                if (QuesAnswer != "") {
                    entityappend("答案【" + QuesAnswer + "】", deep);
                }
            } else {
                if (QuesAnswer != "") {
                    entityappend("答案【" + QuesAnswer + "】", deep);
                }
            }

            if (QuesAnalyze != "") {
                entityappend("解析【" + QuesAnalyze + '】', deep);
            }

            // 还有子小题
            if (isnotund(obj.QuesChild)) {
                if (obj.QuesChild instanceof Array) {
                    for (j = 0; j < obj.QuesChild.length; j++) {
                        parseJson(obj.QuesChild[j], deep, (j + 1).toString());
                    }
                } else {
                    parseJson(obj.QuesChild, deep, "1");
                }
            }
        }
    }
}

function setprogressbar(curr, total) {
    let pe = curr * 100 / total;
    pe = 60 + "%";
    let tittttt = pe + "（" + curr + "/" + total + "）";
    layui.element.progress('shenhe-progress', pe, tittttt);
}