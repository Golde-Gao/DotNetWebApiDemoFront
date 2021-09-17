$(() => LoadWholePage());
///Global Variable
XHRCONF = { withCredentials: true };

_SingleTestData = null; //试题xml，题型，体裁等信息，由接口加载而来的全局缓存
_TaskData = null; //任务信息，试题列表加载
_RecAndCheckData = {}; //试题识别与审核信息

_TIXINGTYPE = []; //暂未实现
_TICAI = []; //暂未实现
_XUEXIJIEDUAN = []; //暂未实现
EscCloseIndex = [];
CurrentShiTiList = [];
CurrentShiTiListPage = [];
TASKID = null;
SHITIINDEX = null;

zhutitabIndex = 0;
LoseZHUTI = null;

leftBottomShiTiListPopupLayerIndex = null;
leftBottomShiTiListPopupLayerIndexAdvanced = null;

GlobalLoadIndex = 0;

knowledgeResultForZhuTi = [];
CACHE_ZhiShiDianResult_Background = null;
CACHE_ZhiShiDianResult_Popup = null;
LoseKaoDian = null;
knowledgeResultForKaoDian = [];
topRightTiHaoLayerIndex = [];

///通过URL访问，初次加载页面
function LoadWholePage() {
    TASKID = getQueryVariable("taskid");
    SHITIINDEX = parseInt(getQueryVariable("shitiindex"));
    //页面方法注册
    EventRegister();
    InitPage();
}

function InitPage() {
    function InitSelect(shitilist) {
        var tixing = [];
        var ticai = [];
        var xuexijieduan = [];
        $("#tixing-list-select").empty();
        $("#tixing-list-select").append('<option value="all">题型</option>');
        $("#ticai-list-select").empty();
        $("#ticai-list-select").append('<option value="all">体裁</option>');
        $("#xuexijieduan-list-select").empty();
        $("#xuexijieduan-list-select").append('<option value="all">学习阶段</option>');
        $.each(shitilist, (_, eele) => {
            if ($.grep(tixing, eee => eee == eele.questionType).length == 0) {
                tixing.push(eele.questionType);
                $("#tixing-list-select").append('<option value="' + eele.questionType + '" >' + eele.questionType + '</option>');
            }
            if ($.grep(ticai, eee => eee == eele.genre).length == 0) {
                if (eele.genre != null && eele.genre != "null") {
                    ticai.push(eele.genre);
                    $("#ticai-list-select").append('<option value="' + eele.genre + '" >' + eele.genre + '</option>');
                } else {
                    console.log(eele);
                }
            }
            if ($.grep(xuexijieduan, eee => eee == eele.version).length == 0) {
                xuexijieduan.push(eele.version);
                $("#xuexijieduan-list-select").append('<option value="' + eele.version + '" >' + eele.version + '</option>');
            }
        })
        var taskdetailurl = apiconf.n_tagQuery;
        $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
            .then(catedata => {
                $("#shiti-category-select").empty();
                $("#shiti-category-select").append('<option value="all">所有标签</option>');
                $.each(catedata.data, (_, eele) => {
                    if (eele.userid == userinfo.id && eele.subjectid == _TaskData.subjectId) {
                        $("#shiti-category-select").append('<option value="' + eele.id + '" >' + '【' + eele.id + '】' + eele.categoryname + '</option>');
                    }
                });
            });
    }
    //加载任务整体信息
    var taskdetailurl = apiconf.n_taskdetail + "?taskId=" + TASKID + "&userId=" + userinfo.id;
    $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
        .then(data => {
            _TaskData = data.data;
            CurrentShiTiListPage = _TaskData.shiti;
            //加载试题列表下的三个下拉框
            InitSelect(_TaskData.shiti)

            //初始化左下角题号列表
            InitLeftBottomShiTiList("putong", "all", "all", CurrentShiTiListPage, "all", "all", "all", "all", "all");

            //根据题号，定位到某一试题
            LocateToTiHao(_TaskData.shiti[0].shitiID);
            $("#title-taskname").text(_TaskData.taskName);
            $("#task-zhunquelv").text(_TaskData.ratioZhunQue * 100);
            $("#task-keshibielv").text(_TaskData.ratioKeShiBie * 100);

            //加载高级搜索的几个选择框
            return $.ajax({ type: "GET", url: apiconf.n_kaoDianStatus, xhrFields: XHRCONF, });
        }).then(statusData => {
            $.each(statusData.data, (__, item) => {
                $(".select-zhuangtai").append('<option value="' + item.id + '">' + item.name + '</option>');
            });
            layui.form.render();
        });
}

function EventRegister() {
    //浏览器窗体改变事件
    WindowSizeChangeEvent();

    function WindowSizeChangeEvent() {
        adjusthheight = window.innerHeight - 77 - 40 - 45;
        $("#testoverview").css("height", adjusthheight);
        $("#background-checkpage").css("height", adjusthheight);
        $(window).resize(_ => {
            adjusthheight = window.innerHeight - 77 - 40 - 45;
            $("#testoverview").css("height", adjusthheight);
            $("#background-checkpage").css("height", adjusthheight);
        });
    }

    //background试题审核事件
    $("#button-background-check-submit").click(_ => {
        PostCheck(_RecAndCheckData.backgroundResult);
    });

    function PostCheck(checkdata, callback) {
        var tmplayerindex = layui.layer.load(0, { shade: false, time: 90 });
        RecursionPostCheck(checkdata, callback, tmplayerindex, checkdata.data.length)
    }
    //popup试题审核事件
    $("#button-popup-check-submit").click(_ => PopupPostCheck(_RecAndCheckData.popupResult));

    //任务审核确认事件
    $("#button-background-task-submit").click(_ => {
        if (!$("#button-background-task-submit").hasClass("layui-btn-disabled")) {
            PostTaskCheck();
        } else {
            layui.layer.msg("不能提交任务");
        }
    });

    function PostTaskCheck() {
        var checkObj = {
            "userID": userinfo.id,
            "taskID": TASKID,
            "statusTaskID": 102,
        };
        var checkObjstring = JSON.stringify(checkObj);
        $.ajax({
            type: "POST",
            url: apiconf.n_taskAndUserCheck,
            contentType: "application/json",
            xhrFields: XHRCONF,
            data: checkObjstring
        }).then(_ => {
            if (_.code = 200) { layui.layer.msg("提交审核成功！", { "time": 600 }); }
        });
    }

    //修改备注事件
    $("#button-memo").click(_ => {
        layui.layer.open({
            type: 1,
            title: '<div><b>备注</b></div>',
            shadeClose: true,
            shade: 0,
            anim: 5,
            isOutAnim: false,
            content: $('#shiti-memo'),
            area: ['520px', '260px'],
            success: _ => {
                var queryUrl = apiconf.n_memoGet + "?testEntityID=" + _RecAndCheckData.currentShiTiID + "&userID=" + userinfo.id + "&taskID=" + TASKID;
                $.ajax({ type: "GET", url: queryUrl, xhrFields: XHRCONF }).then(_ => $("#textarea-memo").val(_.data));
            },
            end: _ => {
                var memoPost = {
                    "entityID": _RecAndCheckData.currentShiTiID,
                    "memo": $("#textarea-memo").val().trim(),
                    "taskID": TASKID,
                    "userID": userinfo.id
                };
                var memoPostString = JSON.stringify(memoPost);
                $.ajax({
                    type: "POST",
                    url: apiconf.n_memoUpdate,
                    contentType: "application/json",
                    xhrFields: XHRCONF,
                    data: memoPostString
                }).then(_ => {
                    if (_.data != null && $("#textarea-memo").val().trim().length > 0) {
                        $("#icon-memo").show();
                    } else {
                        $("#icon-memo").hide();
                    }
                });
            }
        });
    });

    //重新识别事件
    $("#button-chongxinshibie").click(event => {
        var indexxx = layui.layer.load(0, { shade: 0.25 });
        var taskdetailurl = apiconf.n_shitiRetestdetail + "?taskId=" + TASKID + "&userId=" + userinfo.id + "&testEntityId=" + _RecAndCheckData.currentShiTiID;
        $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
            .then(data => {
                layui.layer.close(indexxx);

                if (data.data == "重新识别完毕!") {
                    layui.layer.msg("重新识别完成，正在刷新当前界面", { time: 1000, offset: ["38%", "46%"] });
                    LocateToTiHao(_RecAndCheckData.currentShiTiID);
                } else if (data.data == "初次识别的错误数据已刷新!") {
                    layui.layer.msg(data.data, { time: 1200, offset: ["46%", "46%"] });
                    LocateToTiHao(_RecAndCheckData.currentShiTiID);
                } else {
                    layui.layer.msg(data.data, { time: 800, offset: ["46%", "46%"] });
                }
            }, error => {
                layui.layer.close(indexxx);
                layui.layer.msg("识别代码报错了！！！", _ => {});
            })
    });


    function changeIndexReference(refIndex) {
        if (CACHE_ZhiShiDianResult_Background != null) {
            $("#popup-zhishidian-reference-container").empty();
            $("#popup-zhishidian-reference-msg").text("");
            if (CACHE_ZhiShiDianResult_Background[refIndex].allZhiShiDian.length + CACHE_ZhiShiDianResult_Background[refIndex].separateZhiShiDian.length == 0) {
                $("#popup-zhishidian-reference-msg").text("未从数据库中查询到该题的知识点信息！");
            }

            if (CACHE_ZhiShiDianResult_Background[refIndex].allZhiShiDian.length > 0) {
                var container_item = $("#pupup-reference-item-template").clone();
                $(container_item).attr("id", "");
                $(container_item).show();
                var containerDiv = $("<div></div>");
                $.each(CACHE_ZhiShiDianResult_Background[refIndex].allZhiShiDian, (__, ele) => {
                    $(containerDiv).append("<div class='kp-element'>" + ele.knowledgeName + "</div>");
                });

                $(container_item).find(".popup-reference-content").append(containerDiv);
                $(container_item).find(".exampleText-title").text("说明");
                $(container_item).find(".exampleText").text("本题所有知识点");
                // $(container_item).find(".popup-reference-title").text("对应知识点");
                $("#popup-zhishidian-reference-container").append(container_item);
            }
            if (CACHE_ZhiShiDianResult_Background[refIndex].separateZhiShiDian.length > 0) {
                $.each(CACHE_ZhiShiDianResult_Background[refIndex].separateZhiShiDian, (idx, ele) => {
                    var container_item = $("#pupup-reference-item-template").clone();
                    $(container_item).attr("id", "");
                    $(container_item).show();
                    var containerDiv = $("<div></div>");
                    $.each(ele.data, (__, tt) => $(containerDiv).append('<div class="kp-element" title="' + tt.knowledgeFeature + '" >' + tt.knowledgeName + '</div>'));


                    $(container_item).find(".exampleText-title").text("【" + (idx + 1) + "】" + ele.position);
                    $(container_item).find(".popup-reference-content").append(containerDiv);
                    $(container_item).find(".exampleText").text(ele.text);
                    // $(container_item).find(".popup-reference-title").text("对应知识点");
                    $("#popup-zhishidian-reference-container").append(container_item);
                })
            }
        } else {
            $("#popup-zhishidian-reference-msg").text("参考知识点尚未加载完成，请稍后再试")
        }
        $("#pupup-reference-item-template").hide();
    }
    //查看识别过程信息
    $("#button-zhishidian-reference").click(event => {
        layer.open({
            type: 1,
            id: 'zhishidian-reference',
            shadeClose: true,
            shade: 0.1,
            content: $("#popup-zhishidian-reference"),

            title: "<b>识别过程信息</b>",
            area: ['1200px', '700px'],
            success: function() {

                changeIndexReference(SHITIINDEX);

                if (_RecAndCheckData.backgroundResult.data.length > 1) {
                    $("#popup-zhishidian-reference-button").show();
                    $("#popup-ref-tihao").empty();
                    $.each(_RecAndCheckData.backgroundResult.data, (idx, ele) => {
                        if (idx == SHITIINDEX) {
                            $("#popup-ref-tihao").append($('<button type="button" class="layui-btn layui-btn-sm ref-button-tihao" style="background-color: rgb(225, 255, 234);color:black;margin: 0 4px;"></button>')
                                .css("background", "tomato")
                                .attr("index", idx)
                                .text(ele.indexTitle));
                        } else {
                            $("#popup-ref-tihao").append($('<button type="button" class="layui-btn layui-btn-sm ref-button-tihao" style="background-color: rgb(225, 255, 234);color:black;margin: 0 2px;padding:0 5px;"></button>')
                                .attr("index", idx)
                                .text(ele.indexTitle));
                        }
                    });
                    //为了给陈瑞方便操作，强行加的下一题转跳。这个地方不该这样的
                    changshitiEVENTNext();
                    ///注销事件
                    $(".ref-button-tihao").unbind("click", changshitiEVENT);
                    $("#reference-button-next").unbind("click", changshitiEVENTNext);
                    $("#reference-button-previous").unbind("click", changshitiEVENTPrevious);
                    ///添加事件
                    $(".ref-button-tihao").bind("click", changshitiEVENT);
                    $("#reference-button-next").bind("click", changshitiEVENTNext);
                    $("#reference-button-previous").bind("click", changshitiEVENTPrevious);

                    function changshitiEVENTNext(event) {
                        var buttons = $("#popup-ref-tihao button");
                        var currentII = 0;
                        $.each(buttons, (_, eel) => {
                            var dd = $(eel).css("background-color");
                            if (dd != "rgb(225, 255, 234)") {
                                currentII = parseInt($(eel).attr("index"));
                            }
                        });
                        currentII = currentII + 1;
                        if (currentII == buttons.length) {
                            layui.layer.msg("已经是最后一个题了！", { "time": 400 });
                            currentII = buttons.length - 1;
                        }
                        changeIndexReference(currentII);
                        changtihaocolor(currentII);
                    }

                    function changshitiEVENTPrevious(event) {
                        var buttons = $("#popup-ref-tihao button");
                        var currentII = 0;
                        $.each(buttons, (_, eel) => {
                            var dd = $(eel).css("background-color");
                            if (dd != "rgb(225, 255, 234)") {
                                currentII = $(eel).attr("index");
                            }
                        });
                        currentII = currentII - 1;
                        if (currentII < 0) {
                            layui.layer.msg("已经是第一个题了！", { "time": 400 });
                            currentII = 0;
                        }
                        changeIndexReference(currentII);
                        changtihaocolor(currentII);
                    }

                    function changshitiEVENT(event) {
                        var inndex = $(event.currentTarget).attr("index");
                        changeIndexReference(inndex);
                        changtihaocolor(inndex);
                    }

                    function changtihaocolor(inndex) {
                        var buttons = $("#popup-ref-tihao button");
                        $.each(buttons, (_, eel) => {
                            var iddd = $(eel).attr("index");
                            if (iddd == inndex) {
                                $(eel).css("background-color", "tomato");
                            } else {
                                $(eel).css("background-color", "rgb(225, 255, 234)");
                            }
                        });

                    }
                } else {
                    $("#popup-zhishidian-reference-button").hide();
                }
                $("#popup-zhishidian-reference-button").show();
            },
            end: function() {
                $("#popup-zhishidian-reference").hide();
            }
        });
    });

    //左下侧试题列表的打开关闭按钮的点击事件
    $(".button-shitilist").click(event => {
        if (event.currentTarget.id == "button-shitilist-show") {
            layer.close(leftBottomShiTiListPopupLayerIndexAdvanced);
            $("#button-shitilist-show").hide();
            $("#button-shitilist-hide").css("display", "inline-block");
            let hei = window.innerHeight * 0.5;
            leftBottomShiTiListPopupLayerIndex = layer.open({
                id: "",
                type: 1,
                title: false,
                closeBtn: 0,
                shadeClose: true,
                skin: 'yourclass',
                shade: 0,
                offset: [window.innerHeight * 0.5 - 170 + 'px', '6px'],

                anim: 5,
                isOutAnim: false,
                content: $('#side-memu'),
                area: ['370px', hei + 90 + 'px'],
                success: function() {
                    $("#test-item-container").css("height", hei + "px");
                    $("#test-item-container").css("overflow-y", "auto");
                    //试题ID定位到可视区域
                    if (_RecAndCheckData.currentShiTiID > 0) {
                        var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + _RecAndCheckData.currentShiTiID).offset().top - $("#test-item-container").offset().top - 100;
                        $("#test-item-container").scrollTop(topdistance);
                    }
                }
            });
        } else {
            $("#button-shitilist-show").css("display", "inline-block");
            $("#button-shitilist-hide").hide();
            layer.close(leftBottomShiTiListPopupLayerIndex);
        }
    });

    $("#button-gaojisousuo").click(event => {
        layer.close(leftBottomShiTiListPopupLayerIndex);

        $("#button-shitilist-show").hide();
        $("#button-shitilist-hide").css("display", "inline-block");

        leftBottomShiTiListPopupLayerIndexAdvanced = layer.open({
            type: 1,
            shade: false,
            title: false, //不显示标题
            offset: ['250px', '12px'],
            area: [(window.innerWidth * 0.4) + 'px', (window.innerHeight - 90 - 250) + 'px'],
            content: $('#side-memu-gaoji'), //捕获的元素，注意：最好该指定的元素要存放在body最外层，否则可能被其它的相对元素所影响
            success: function() {
                $("#test-item-container2").css("height", (window.innerHeight - 90 - 250 - 160) + 'px');
            },
            cancel: function() {
                layer.close(leftBottomShiTiListPopupLayerIndexAdvanced);
                $("#button-shitilist-show").hide();
                $("#button-shitilist-hide").css("display", "inline-block");
                let hei = window.innerHeight * 0.5;
                leftBottomShiTiListPopupLayerIndex = layer.open({
                    id: "",
                    type: 1,
                    title: false,
                    closeBtn: 0,
                    shadeClose: true,
                    skin: 'yourclass',
                    shade: 0,
                    offset: [window.innerHeight * 0.5 - 170 + 'px', '6px'],
                    anim: 5,
                    isOutAnim: false,
                    content: $('#side-memu'),
                    area: ['370px', hei + 90 + 'px'],
                });
            }
        });
    });

    $("#button-jiansuo-gaoji").click(_ => {
        var hexinkaodianstatus = $("#select-zhuangtai-hexin").val();
        var feihexinkaodianstatus = $("#select-zhuangtai-feihexin").val();
        var zhutizhishidianstatus = $("#select-zhuangtai-zhutizhishidian").val();
        var kaochaleixingstatus = $("#select-zhuangtai-kaochaleixing").val();
        var hexinkaodian = $("#text-hexinkaodian").val();
        var feihexinkaodian = $("#text-feihexinkaodian").val();
        var zhutizhishidian = $("#text-zhutizhishidian").val();
        var kaochaleixing = $("#text-kaochaleixing").val();

        var textstem = $("#text-stem").val();
        var textoption = $("#text-option").val();
        var textanswer = $("#text-answer").val();
        var textanalysis = $("#text-analysis").val();

        var taskdetailurl = apiconf.n_taskdetail + "?taskId=" + TASKID + "&userId=" + userinfo.id +
            "&hexinkaodian=" + hexinkaodian +
            "&hexinkaodianstatus=" + hexinkaodianstatus +
            "&feihexinkaodian=" + feihexinkaodian +
            "&feihexinkaodianstatus=" + feihexinkaodianstatus +
            "&kaochaleixingstatus=" + kaochaleixingstatus +
            "&zhuti=" + zhutizhishidian +
            "&zhutistatus=" + zhutizhishidianstatus +
            "&stem=" + textstem +
            "&kaochaleixing=" + kaochaleixing +
            "&answer=" + textanswer +
            "&analysis=" + textanalysis +
            "&option=" + textoption;
        $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
            .then(data => {
                CurrentShiTiListPage = data.data.shiti;
                $("#new-result-select").val("all");
                $("#check-result-select").val("all");
                $("#inside-searchid").val("");
                $("#tixing-list-select").val("all");
                $("#ticai-list-select").val("all");
                $("#xuexijieduan-list-select").val("all");
                InitLeftBottomShiTiList("gaoji", "all", "all", CurrentShiTiListPage, "all", "all", "all", "all", "all");

                $("#test-item-container2").empty();
                $.each(CurrentShiTiList, (ind, ele) => {
                    var itemIndex = $('<div class="test-item-index" style="display: none;"><div class="layui-row"><div class="layui-col-xs4 tihao-index" style="text-align: left;padding-left: 15px;">0</div><div class="layui-col-xs8 tihao-content" style="text-align: left;">12345676543</div></div></div>');
                    $(itemIndex).find(".tihao-index").text(ind + 1);
                    $(itemIndex).attr("id", "tihao-index-" + ele.shitiID);
                    $(itemIndex).attr("data", ele.shitiID);
                    let tttt = ele.shitiID;

                    var hasNewResult = '<span class="hasNewResult"><span class="layui-badge-dot layui-bg-orange" style="margin-right:10px"></span></span>' +
                        '<span class="noNewResult" style="display:none;"><span style="margin-right:18px;"></span></span>';
                    var noNewResult = '<span class="hasNewResult" style="display:none;"><span class="layui-badge-dot layui-bg-orange" style="margin-right:10px"></span></span>' +
                        '<span class="noNewResult"><span style="margin-right:18px;"></span></span>';

                    var CheckedIcon = '<span class="CheckedIcon"><span style="display:inline-block;width:10px;margin-left:10px;"><i class="layui-icon layui-icon-ok" style="font-size: 30px; color: #1E9FFF;font-size:x-small"></i></span></span>' +
                        '<span class="notCheckedIcon"  style="display:none;"><span style="display:inline-block;width:10px;height:1px;"></span></span>';
                    var notCheckedIcon = '<span class="CheckedIcon"  style="display:none;"><span style="display:inline-block;width:10px;margin-left:10px;"><i class="layui-icon layui-icon-ok" style="font-size: 30px; color: #1E9FFF;font-size:x-small"></i></span></span>' +
                        '<span class="notCheckedIcon"><span style="display:inline-block;width:10px;height:1px;"></span></span>';

                    if (ele.hasNewResult == 'true' && ele.checkID == 101) {
                        tttt = hasNewResult + tttt + CheckedIcon;
                    } else if (ele.checkID == 101) {
                        tttt = noNewResult + tttt + CheckedIcon;
                    } else if (ele.hasNewResult == 'true') {
                        tttt = hasNewResult + tttt + notCheckedIcon;
                    } else {
                        tttt = noNewResult + tttt + notCheckedIcon;
                    }
                    $(itemIndex).find(".tihao-content").html(tttt);
                    $(itemIndex).show();
                    // if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
                    //     $(itemIndex).css("background", "tomato");
                    // }
                    $("#test-item-container2").append(itemIndex);
                });
                $("#innershowshiticount").show();
            })
    });
    var select_items =
        "#new-result-select," +
        "#check-result-select," +
        "#tixing-list-select," +
        "#ticai-list-select," +
        "#shiti-category-select," +
        "#xuexijieduan-list-select";
    $(select_items).change(event => {
        var vv1 = $("#new-result-select").val();
        var vv2 = $("#check-result-select").val();
        var sid = $("#inside-searchid").val();
        var stixing = $("#tixing-list-select").val();
        var sticai = $("#ticai-list-select").val();
        var sversion = $("#xuexijieduan-list-select").val();
        var category = $("#shiti-category-select").val();
        InitLeftBottomShiTiList("putong", vv1, vv2, CurrentShiTiListPage, sid, stixing, sticai, sversion, category);
    });
    $("#inside-searchid").keyup(function() {
        var vv1 = $("#new-result-select").val();
        var vv2 = $("#check-result-select").val();
        var sid = $("#inside-searchid").val();
        var stixing = $("#tixing-list-select").val();
        var sticai = $("#ticai-list-select").val();
        var sversion = $("#xuexijieduan-list-select").val();
        var category = $("#shiti-category-select").val();
        InitLeftBottomShiTiList("putong", vv1, vv2, CurrentShiTiListPage, sid, stixing, sticai, sversion, category);
    });


    //左侧试题显示区域点击控制关闭左下侧试题列表弹窗
    $("#testoverview").click(_ => {
        $("#button-shitilist-show").css("display", "inline-block");
        $("#button-shitilist-hide").hide();
        layer.close(leftBottomShiTiListPopupLayerIndex);
    });

    //上一题
    $(".button-shiti-previous").click(_ => {
        var GoToShiTiID = null;
        $.each(CurrentShiTiList, (index, ele) => {
            if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
                if (index == 0) {
                    GoToShiTiID = _RecAndCheckData.currentShiTiID;
                    layui.layer.msg("已经是第一个题了！", { "time": 400 });
                } else {
                    GoToShiTiID = CurrentShiTiList[index - 1].shitiID;;
                }
            }
        })
        LocateToTiHao(GoToShiTiID);
        var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + _RecAndCheckData.currentShiTiID).offset().top - $("#test-item-container").offset().top - 100;
        $("#test-item-container").scrollTop(topdistance);
    });

    $("#side-shitiCategory").click(_ => {
        var cateindex = layer.open({
            type: 1,
            offset: "auto",
            id: 'color-explain',
            shadeClose: true,
            shade: 0,
            content: $("#popup-shiticategory"),
            btnAlign: 'r',
            title: "<b>试题标签</b>",
            area: ['1000px', '600px'],
            success: _ => {
                $("#input-categoryName").val("");
                var taskdetailurl = apiconf.n_tagQuery;
                $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
                    .then(data => {
                        $("#catgegory-pannel").empty();
                        var idddd = 0;
                        $.each(data.data, (idx, eee) => {
                            if (eee.userid == userinfo.id && eee.subjectid == _TaskData.subjectId) {
                                var categoryItem = $("#categoryitemprotototype").clone();
                                $(categoryItem).removeAttr("id");
                                $(categoryItem).css("display", "inline-block");
                                $(categoryItem).find(".category-popup-circle").css("border-color", GetColorString(idddd++));
                                $(categoryItem).find(".category-popup-circle").before($('<span style="font-weight: bold;">【' + idddd + '】</span>'));
                                $(categoryItem).find("input").attr("title", eee.categoryname);
                                $(categoryItem).find("input").attr("catetoryID", eee.id);
                                $(categoryItem).find("input").attr("name", "category[" + eee.categoryname + "]");
                                if ($("#side-shitiCategory").find("div[categoryid='" + eee.id + "']").length > 0) {
                                    $(categoryItem).find("input").attr("checked", '""');
                                }
                                $("#catgegory-pannel").append(categoryItem);
                            }
                        });
                        layui.form.render();

                        RightClickCategory();
                        //多选框事件，需要刷新页面的侧边栏
                        layui.form.on('checkbox(check-category)', function(data) {
                            // 提交更新标签状态
                            var updateobject = {
                                "entityId": _RecAndCheckData.currentShiTiID,
                                "taskId": TASKID,
                                "userId": userinfo.id,
                                "shiTiCategoryId": []
                            };
                            $.each($("#catgegory-pannel > div"), (idx, eee) => {
                                if ($(eee).find(".layui-form-checkbox").hasClass("layui-form-checked")) {
                                    updateobject.shiTiCategoryId.push($(eee).find("input").attr("catetoryID"));
                                }
                            });

                            var pushData = JSON.stringify(updateobject);
                            var tmpurl = apiconf.n_tagShiTiQuery;
                            $.ajax({
                                type: "POST",
                                url: tmpurl,
                                contentType: "application/json",
                                xhrFields: XHRCONF,
                                data: pushData
                            }).then(_ => {});


                            $("#side-shitiCategory").empty();
                            var idddd = 0;
                            $.each($("#catgegory-pannel > div"), (idx, eee) => {
                                var titlename = $(eee).find("input").attr("title");
                                var cateid = $(eee).find("input").attr("catetoryID");
                                if ($(eee).find(".layui-form-checkbox").hasClass("layui-form-checked")) {
                                    var categoryItem = $("#side-circle-template").clone();
                                    $(categoryItem).removeAttr("id");
                                    $(categoryItem).attr("title", titlename);
                                    $(categoryItem).attr("categoryid", cateid);
                                    $(categoryItem).css("display", "block");
                                    $(categoryItem).css("border-color", GetColorString(idddd));
                                    $("#side-shitiCategory").append(categoryItem);
                                }
                                idddd++
                            });
                            layui.form.render();
                            RightClickCategory();
                        });
                    });
            },
            end: _ => {
                // 提交更新标签状态
                var updateobject = {
                    "entityId": _RecAndCheckData.currentShiTiID,
                    "taskId": TASKID,
                    "userId": userinfo.id,
                    "shiTiCategoryId": []
                };
                $.each($("#catgegory-pannel > div"), (idx, eee) => {
                    if ($(eee).find(".layui-form-checkbox").hasClass("layui-form-checked")) {
                        updateobject.shiTiCategoryId.push($(eee).find("input").attr("catetoryID"));
                    }
                });

                var pushData = JSON.stringify(updateobject);
                var tmpurl = apiconf.n_tagShiTiQuery;
                $.ajax({
                    type: "POST",
                    url: tmpurl,
                    contentType: "application/json",
                    xhrFields: XHRCONF,
                    data: pushData
                }).then(_ => {});

                $("#popup-shiticategory").hide();
            }
        });
        EscCloseIndex.push(cateindex);
    });

    $("#button-addCategory").click(_ => {
        var title = $("#input-categoryName").val().trim();
        if (title != "") {
            if ($("input[title='" + title + "']").length > 0) {
                layui.layer.msg("不能添加重复标签");
                return;
            }

            var tmpurl = apiconf.n_tagCreate;

            var createobj = {
                "categoryname": title,
                "userid": userinfo.id,
                "subjectid": _TaskData.subjectId
            };
            $.ajax({
                type: "POST",
                url: tmpurl,
                contentType: "application/json",
                xhrFields: XHRCONF,
                data: JSON.stringify(createobj)
            }).then(data => {
                $.ajax({ type: "GET", url: apiconf.n_tagQuery, xhrFields: XHRCONF, })
                    .then(data => {
                        $("#catgegory-pannel").empty();
                        var idddd = 0;
                        $.each(data.data, (idx, eee) => {
                            if (eee.userid == userinfo.id && eee.subjectid == _TaskData.subjectId) {
                                var categoryItem = $("#categoryitemprotototype").clone();
                                $(categoryItem).removeAttr("id");
                                $(categoryItem).css("display", "inline-block");
                                $(categoryItem).find(".category-popup-circle").css("border-color", GetColorString(idddd++));
                                $(categoryItem).find(".category-popup-circle").before($('<span style="font-weight: bold;">【' + idddd + '】</span>'));
                                $(categoryItem).find("input").attr("title", eee.categoryname);
                                $(categoryItem).find("input").attr("catetoryID", eee.id);
                                $(categoryItem).find("input").attr("subjectid", eee.subjectid);
                                $(categoryItem).find("input").attr("name", "category[" + eee.categoryname + "]");
                                if ($("#side-shitiCategory").find("div[title='" + eee.categoryname + "']").length > 0) {
                                    $(categoryItem).find("input").attr("checked", '""');
                                }
                                $("#catgegory-pannel").append(categoryItem);
                            }
                        });
                        layui.form.render();
                        RightClickCategory();
                    });
            });
        }
    });
    //多窗口模式 - esc 键
    $(document).on('keyup', function(e) {
        if (e.keyCode === 27) {
            $.each(EscCloseIndex, (i, nnn) => {
                layer.close(nnn);
            });
            EscCloseIndex = [];
        }
        if (e.keyCode === 33) {
            var GoToShiTiID = null;
            $.each(CurrentShiTiList, (index, ele) => {
                if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
                    if (index == 0) {
                        GoToShiTiID = _RecAndCheckData.currentShiTiID;
                        layui.layer.msg("已经是第一个题了！", { "time": 400 });
                    } else {
                        GoToShiTiID = CurrentShiTiList[index - 1].shitiID;;
                    }
                }
            })
            LocateToTiHao(GoToShiTiID);
            var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + _RecAndCheckData.currentShiTiID).offset().top - $("#test-item-container").offset().top - 100;
            $("#test-item-container").scrollTop(topdistance);
        }
        if (e.keyCode === 34) {
            NextOne();
        }
    });
    //下一题
    $(".button-shiti-next").click(_ => NextOne());
    //打开审核说明
    $("#button-manual").click(function() {
        layer.open({
            type: 1,
            offset: "auto",
            id: 'color-explain',
            shadeClose: true,
            shade: 0,
            content: $("#manual-popup"),
            btnAlign: 'r',
            title: "<b>审核说明</b>",
            area: ['820px', '700px'],
            success: _ => layui.form.render(),
            end: _ => $("#manual-popup").hide()
        });
    });
    //添加漏识别考点、知识点弹框
    $(".add-lose").click(event => {
        var losetype = 0;
        var losereason = "知识点识别原因";
        $("input[name=lose-reason][value=" + losereason + "]").prop("checked", "true");
        layui.form.render();
        let addtype = $(event.currentTarget).prev("b").text();
        layer.open({
            type: 1,
            offset: [100, 50],
            id: 'add-knowledge',
            shadeClose: true,
            shade: 0,
            content: $("#add-lose-content"),
            btn: "+添加",
            btnAlign: 'r',
            title: "<b>添加漏识别【" + addtype + "】</b>",
            area: ['470px', '640px'],
            success: function() {
                layui.table.render({
                    elem: '#add-knowledge-search-table',
                    data: knowledgeResultForKaoDian,
                    height: 300,
                    cols: [
                        [
                            { type: 'numbers', title: '序号' },
                            { field: 'knowledgeTypeName', title: '类型', align: "center" },
                            { field: 'knowledgeName', title: '知识点', align: "center" },
                            { type: 'radio', title: "选择", width: 50 },
                        ]
                    ],
                    page: { layout: ['limit', 'count', 'prev', 'next', 'page', 'skip'] }
                });
                $("#add-lose-textarea").val("");

                layui.table.on('radio(add-knowledge-search-table)', _ => CheckLose(_));
                layui.form.on('radio(add-knowledge-losereason)', _ => {
                    losereason = _.value;
                });
                layui.element.on('tab(add-knowledge-tab)', _ => {
                    losetype = _.index;
                });
                //数据大于0，加载筛选下拉框
                if (knowledgeResultForKaoDian.length > 0) {

                }
            },
            yes: function() {
                //先判断漏的考点是不是已经存在，或者有已经被添加好了
                if (losetype == 0) {
                    if (LoseKaoDian != null) {
                        var container_ = $(event.currentTarget).closest("fieldset");
                        if ($(container_).find('span[knowledgeName="' + LoseKaoDian.knowledgeName + '"]').length > 0) {
                            layui.layer.msg("此考点已经存在！请检查", () => {})
                        } else {
                            var loadindextmp = layer.load(0, { shade: 0.25 });
                            var nname = LoseKaoDian.knowledgeName.replace(/"/g, '%22')
                                .replace(/#/g, '%23')
                                .replace(/%/g, '%25')
                                .replace(/&/g, '%26')
                                .replace(/\+/g, '%2B');
                            var nndata = 'SubjectCode=C&KnowledgeName=["' + nname + '"]';
                            var uniquecodeurl = "http://172.16.63.77:8011/KlgUniqueID/GetKlgUniqueID.asmx/WS_KlgUniquenID_GetUniquenIdByKlgName";
                            $.ajax({
                                type: "POST",
                                url: uniquecodeurl,
                                contentType: "application/x-www-form-urlencoded",
                                data: nndata
                            }).then(obj => {
                                var jsonObj = JSON.parse(obj.children[0].innerHTML);
                                if (jsonObj.length == 1) {
                                    var uniquecode = jsonObj[0].KlgUniqueId;
                                    var placeholderdiv = null;
                                    if (losereason == "考点识别原因") {
                                        //新增考点原因漏识别的核心考点或非核心考点
                                        var appendtt = $('<span class="check-item check-lose"></span>')
                                            .attr("knowledgeUniqueCode", uniquecode)
                                            .attr("knowledgeName", LoseKaoDian.knowledgeName).text(LoseKaoDian.knowledgeName);
                                        placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-kaodianloushibie");
                                    } else if (losereason == "知识点识别特征原因") {
                                        //新增知识点原因漏识别的核心考点或非核心考点
                                        var appendtt = $('<span class="check-item check-lose"></span>')
                                            .attr("knowledgeUniqueCode", uniquecode)
                                            .attr("knowledgeName", LoseKaoDian.knowledgeName).text(LoseKaoDian.knowledgeName);
                                        placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-zhishidiantezheng");
                                    } else {
                                        //新增知识点原因漏识别的核心考点或非核心考点
                                        var appendtt = $('<span class="check-item check-lose"></span>')
                                            .attr("knowledgeUniqueCode", uniquecode)
                                            .attr("knowledgeName", LoseKaoDian.knowledgeName).text(LoseKaoDian.knowledgeName);
                                        placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-zhishidianloushibe");
                                    }
                                    $(placeholderdiv).append(appendtt);
                                    RefreshArryData($(placeholderdiv).attr("id"), $(placeholderdiv).attr("data-route"));
                                    RenderColorBlock();
                                    RefreshEvent();
                                    layui.layer.close(loadindextmp);
                                }
                            }, _ => {
                                layui.layer.close(loadindextmp);
                                layui.layer.msg("知识点接口查询失败", { "time": 1000 });
                            });
                        }
                    } else {
                        layui.layer.msg("请选择一个需要添加的知识点！", () => {});
                    }
                } else {
                    //新增知识点库缺失的知识点
                    var knowledgenn = $("#add-lose-textarea").val().trim();
                    var container_ = $(event.currentTarget).closest("fieldset");
                    if ($(container_).find('span[knowledgeName="' + knowledgenn + '"]').length > 0) {
                        layui.layer.msg("此考点已经存在！请检查", () => {})
                    } else {
                        if (knowledgenn.length == 0) {
                            layui.layer.msg("知识点名称不能为空！", () => {});
                        } else {
                            var loadindextmp = layer.load(0, { shade: 0.25 });
                            var nname = knowledgenn.replace(/"/g, '%22')
                                .replace(/#/g, '%23')
                                .replace(/%/g, '%25')
                                .replace(/&/g, '%26')
                                .replace(/\+/g, '%2B');
                            var nndata = 'SubjectCode=C&KnowledgeName=["' + nname + '"]';
                            var uniquecodeurl = "http://172.16.63.77:8011/KlgUniqueID/GetKlgUniqueID.asmx/WS_KlgUniquenID_GetUniquenIdByKlgName";
                            $.ajax({
                                type: "POST",
                                url: uniquecodeurl,
                                contentType: "application/x-www-form-urlencoded",
                                data: nndata
                            }).then(obj => {
                                var jsonObj = JSON.parse(obj.children[0].innerHTML);
                                if (jsonObj.length == 1) {
                                    layui.layer.msg("知识点库已存在此知识点！", () => {});
                                } else {
                                    var appendtt = $('<span class="check-item check-lose check-lose-weizhizhishidian-msg"></span>')
                                        .attr("knowledgeType", $("#add-lose-knowledgeType").val().trim())
                                        .attr("knowledgeVersion", $("#add-lose-version").val().trim())
                                        .attr("exampleText", $("#add-lose-exampleText").val().trim())
                                        .attr("knowledgeName", knowledgenn)
                                        .text(knowledgenn);

                                    placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-weizhizhishidian");
                                    $(placeholderdiv).append(appendtt);
                                    RefreshArryData($(placeholderdiv).attr("id"), $(placeholderdiv).attr("data-route"));
                                    RenderColorBlock();
                                    RefreshEvent();
                                    layui.layer.close(loadindextmp);
                                }
                            }, _ => {
                                layui.layer.close(loadindextmp);
                                layui.layer.msg("知识点接口查询失败", { "time": 1000 });
                            });
                        }
                    }
                }
            }
        });
    });
    //添加漏识别主题弹框
    $(".add-lose-zhuti").click(event => {
        let addtype = $(event.currentTarget).prev("b").text();
        layer.open({
            type: 1,
            offset: [100, 50],
            id: 'add-zhuti',
            shadeClose: true,
            shade: 0,
            content: $("#add-lose-content-zhuti"),
            btn: "+添加",
            btnAlign: 'r',
            title: "<b>添加漏识别【" + addtype + "】</b>",
            area: ['670px', '660px'],
            success: function() {
                layui.table.render({
                    elem: '#add-zhuti-search-table2',
                    data: [],
                    height: 412,
                    cols: [
                        [
                            { type: 'numbers', title: '序号' },
                            { field: 'knowledgeTypeName', title: '类型', align: "center" },
                            { field: 'knowledgeName', title: '知识点', align: "center" },
                            { type: 'radio', title: "选择", width: 50 },
                        ]
                    ],
                    page: { layout: ['limit', 'count', 'prev', 'next', 'page', 'skip'] }
                });
                var taskdetailurl = apiconf.n_conf_zhutiCandidate;
                $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
                    .then(dd => {

                        var searchCond = $("#input-knowledge-search-zhuti").val().trim();
                        var taabledata = dd.data;
                        if (searchCond != "") {
                            taabledata = $.grep(dd.data, ele => {
                                return ele.knowledgename.indexOf(searchCond) > -1 || ele.knowledgechs.indexOf(searchCond) > -1;
                            });
                        }

                        layui.table.render({
                            elem: '#add-zhuti-search-table',
                            id: "zhutidatatable",
                            data: taabledata,
                            height: 412,
                            cols: [
                                [
                                    { type: 'numbers', title: '序号' },
                                    { field: 'knowledgename', title: '主题英文名称', align: "center" },
                                    { field: 'knowledgechs', title: '主题中文名称', align: "center" },
                                    { type: 'checkbox' },
                                ]
                            ],
                            limit: 700,
                            page: { layout: ['count', 'prev', 'next', 'page', 'skip'] }
                        });
                    });
            },
            yes: function() {
                if (zhutitabIndex == 0) {
                    var checkStatus = layui.table.checkStatus('zhutidatatable'); //idTest 即为基础参数 id 对应的值
                    $.each(checkStatus.data, (ind, ele) => {
                        var ddd = $(event.currentTarget).closest("fieldset").find("span[knowledgeChs='" + ele.knowledgechs + "']");
                        if (ddd.length == 0) {
                            var appendtt =
                                $('<span>', {
                                    "class": "check-item check-lose",
                                    "knowledgeName": ele.knowledgename
                                });

                            $(appendtt).attr("knowledgeChs", ele.knowledgechs);
                            $(appendtt).text(ele.knowledgechs + " / " + ele.knowledgename);
                            placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-zhutilou");
                            $(placeholderdiv).append(appendtt);
                            RefreshArryData($(placeholderdiv).attr("id"), $(placeholderdiv).attr("data-route"));
                            RenderColorBlock();
                            RefreshEvent();
                        } else {
                            layui.layer.msg("此知识点【" + ele.knowledgechs + "】已经存在");
                        }

                    });
                } else {
                    if (LoseZHUTI != null) {
                        var nname = LoseZHUTI.knowledgeName.replace(/"/g, '%22')
                            .replace(/#/g, '%23')
                            .replace(/%/g, '%25')
                            .replace(/&/g, '%26')
                            .replace(/\+/g, '%2B');
                        var ppdata = 'SubjectCode=C&KnowledgeName=["' + nname + '"]';

                        var uniquecodeurl = "http://172.16.63.77:8011/KlgUniqueID/GetKlgUniqueID.asmx/WS_KlgUniquenID_GetUniquenIdByKlgName";
                        $.ajax({
                            type: "POST",
                            url: uniquecodeurl,
                            contentType: "application/x-www-form-urlencoded",
                            data: ppdata,
                            success: function(obj) {
                                var ddd = $(event.currentTarget).closest("fieldset").find("span[knowledgeChs='" + LoseZHUTI.knowledgeName + "']");
                                if (ddd.length == 0) {
                                    var jsonObj = JSON.parse(obj.children[0].innerHTML);
                                    if (jsonObj.length == 1) {
                                        var uniquecode = jsonObj[0].KlgUniqueId;
                                        var appendtt =
                                            $('<span>', {
                                                "class": "check-item check-lose",
                                                "knowledgeUniqueCode": uniquecode,
                                                "knowledgeName": LoseZHUTI.knowledgeName
                                            }).text(LoseZHUTI.knowledgeName);
                                        $(appendtt).attr("knowledgeChs", LoseZHUTI.knowledgeName);
                                        placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-zhutilou");
                                        $(placeholderdiv).append(appendtt);
                                        RefreshArryData($(placeholderdiv).attr("id"), $(placeholderdiv).attr("data-route"));
                                        RenderColorBlock();
                                        RefreshEvent();

                                    }
                                } else {
                                    layui.layer.msg("此知识点【" + LoseZHUTI.knowledgeName + "】已经存在");
                                }
                            }
                        });
                    } else {
                        layui.layer.msg("请选择一个需要添加的主题知识点！", () => {});
                    }
                }

            }
        });
    });
    //弹框查找知识点
    $("#button-search-zhishidian").click(() => {
        var knowledgetypeurl = 'http://172.16.63.77:8011/Content/GetKnowledgeContent.asmx/WS_Klg_Content_GetKlgByLikeWithESP';
        var knowledgesearchname = $("#input-knowledge-search").val().trim()
            .replace(/"/g, '%22')
            .replace(/#/g, '%23')
            .replace(/%/g, '%25')
            .replace(/&/g, '%26')
            .replace(/\+/g, '%2B');
        let querytext = 'SubjectCode=C&VersionCode=&Content=' + knowledgesearchname + '&Page=1&Number=10000';
        var loadIndex = layer.load(0, { shade: 0.25 });
        $.ajax({
            type: "POST",
            url: knowledgetypeurl,
            contentType: "application/x-www-form-urlencoded",
            data: querytext,
            success: function(obj) {
                // xml转json，根据knowledgename去重
                var x2js = new X2JS();
                var jsonObj = x2js.xml_str2json(obj.children[0].innerHTML);
                knowledgeResultForKaoDian = [];
                if (jsonObj == null || typeof(jsonObj.SearchStr.Knowledge) == "undefined") {
                    layui.layer.msg("未查询到知识点", () => {});
                } else {
                    if (jsonObj.SearchStr.Knowledge instanceof Array) {
                        $.each(jsonObj.SearchStr.Knowledge, (index, ele) => {
                            if ($.grep(knowledgeResultForKaoDian, _ => _.knowledgeName == ele.__text).length == 0) {
                                knowledgeResultForKaoDian.push({
                                    "knowledgeCode": ele._Code,
                                    "knowledgeName": ele.__text,
                                    "knowledgeTypeName": ele._TypeName,
                                    "knowledgeTypeCode": ele._TypeCode
                                });
                            }
                        });
                    } else {
                        knowledgeResultForKaoDian.push({
                            "knowledgeCode": jsonObj.SearchStr.Knowledge._Code,
                            "knowledgeName": jsonObj.SearchStr.Knowledge.__text,
                            "knowledgeTypeName": jsonObj.SearchStr.Knowledge._TypeName,
                            "knowledgeTypeCode": jsonObj.SearchStr.Knowledge._TypeCode
                        });
                    }
                }
                //数据大于0，加载筛选下拉框
                if (knowledgeResultForKaoDian.length > 0) {
                    var knowledgetypes = [];
                    var obj = {};
                    for (var i = 0; i < knowledgeResultForKaoDian.length; i++) {
                        if (!obj[knowledgeResultForKaoDian[i].knowledgeTypeName]) {
                            obj[knowledgeResultForKaoDian[i].knowledgeTypeName] = 1;
                            knowledgetypes.push({
                                "knowledgeTypeName": knowledgeResultForKaoDian[i].knowledgeTypeName,
                                "knowledgeTypeCode": knowledgeResultForKaoDian[i].knowledgeTypeCode
                            });
                        }
                    }
                    $("#select-knowledgetypefilter1").empty();
                    $("#select-knowledgetypefilter1").append('<option value="">' + '选择类型' + '</option>');
                    $.each(knowledgetypes, (__, item) => {
                        let html = '<option value="' + item.knowledgeTypeCode + '">' + item.knowledgeTypeName + '</option>';
                        $("#select-knowledgetypefilter1").append(html);
                    });
                    layui.form.on('select(select-knowledgetypefilter1)', function(data) {
                        knowledgeResultForKaoDianTmp = knowledgeResultForKaoDian;
                        if (data.value != "") {
                            var knowledgeResultForKaoDianTmp = $.grep(knowledgeResultForKaoDian, ele => ele.knowledgeTypeCode == data.value);
                        }
                        layui.table.render({
                            elem: '#add-knowledge-search-table',
                            data: knowledgeResultForKaoDianTmp,
                            height: 320,
                            cols: [
                                [
                                    { type: 'numbers', title: '序号' },
                                    { field: 'knowledgeTypeName', title: '类型', align: "center" },
                                    { field: 'knowledgeName', title: '知识点', align: "center" },
                                    { type: 'radio', title: "选择", width: 50 },

                                ]
                            ],
                            page: { layout: ['limit', 'count', 'prev', 'next', 'page', 'skip'] },
                            limit: 1000,
                            limits: [50, 100, 400, 600, 1000]
                        });
                        layui.table.on('radio(add-knowledge-search-table)', _ => CheckLose(_));
                    });
                    layui.form.render();
                } else {
                    $("#select-knowledgetypefilter1").empty();
                    layui.form.render();
                }
                layui.table.render({
                    elem: '#add-knowledge-search-table',
                    data: knowledgeResultForKaoDian,
                    height: 320,
                    cols: [
                        [
                            { type: 'numbers', title: '序号' },
                            { field: 'knowledgeTypeName', title: '类型', align: "center" },
                            { field: 'knowledgeName', title: '知识点', align: "center" },
                            { type: 'radio', title: "选择", width: 50 },
                        ]
                    ],
                    page: { layout: ['limit', 'count', 'prev', 'next', 'page', 'skip'] },
                    limit: 1000,
                    limits: [50, 100, 400, 600, 1000]
                });
                layui.table.on('radio(add-knowledge-search-table)', _ => CheckLose(_));
                layui.layer.close(loadIndex);
            }
        });
    });

    layui.element.on('tab(add-knowledge-zhuti-tab)', function(data) {
        zhutitabIndex = data.index;
    });
    $("#button-search-zhuti-knowledge2").click(_ => {
        var knowledgetypeurl = 'http://172.16.63.77:8011/Content/GetKnowledgeContent.asmx/WS_Klg_Content_GetKlgByLikeWithESP';
        var knowledgesearchname = $("#input-knowledge-search-zhuti2").val().trim()
            .replace(/"/g, '%22')
            .replace(/#/g, '%23')
            .replace(/%/g, '%25')
            .replace(/&/g, '%26')
            .replace(/\+/g, '%2B');
        let querytext = 'SubjectCode=C&VersionCode=&Content=' + knowledgesearchname + '&Page=1&Number=1000';
        var loadIndex = layer.load(0, { shade: 0.25 });
        $.ajax({
            type: "POST",
            url: knowledgetypeurl,
            contentType: "application/x-www-form-urlencoded",
            data: querytext,
            success: function(obj) {
                // xml转json，根据knowledgename去重
                var x2js = new X2JS();
                var jsonObj = x2js.xml_str2json(obj.children[0].innerHTML);
                knowledgeResultForZhuTi = [];
                if (jsonObj == null || typeof(jsonObj.SearchStr.Knowledge) == "undefined") {
                    layui.layer.msg("未查询到知识点", () => {});
                } else {
                    if (jsonObj.SearchStr.Knowledge instanceof Array) {
                        $.each(jsonObj.SearchStr.Knowledge, (index, ele) => {
                            if ($.grep(knowledgeResultForZhuTi, _ => _.knowledgeName == ele.__text).length == 0) {
                                knowledgeResultForZhuTi.push({
                                    "knowledgeCode": ele._Code,
                                    "knowledgeName": ele.__text,
                                    "knowledgeTypeName": ele._TypeName,
                                    "knowledgeTypeCode": ele._TypeCode
                                });
                            }
                        });
                    } else {
                        knowledgeResultForZhuTi.push({
                            "knowledgeCode": jsonObj.SearchStr.Knowledge._Code,
                            "knowledgeName": jsonObj.SearchStr.Knowledge.__text,
                            "knowledgeTypeName": jsonObj.SearchStr.Knowledge._TypeName,
                            "knowledgeTypeCode": jsonObj.SearchStr.Knowledge._TypeCode
                        });
                    }
                }

                layui.table.render({
                    elem: '#add-zhuti-search-table2',
                    data: knowledgeResultForZhuTi,
                    height: 412,
                    cols: [
                        [
                            { type: 'numbers', title: '序号' },
                            { field: 'knowledgeTypeName', title: '类型', align: "center" },
                            { field: 'knowledgeName', title: '知识点', align: "center" },
                            { type: 'radio', title: "选择", width: 50 },
                        ]
                    ],
                    page: { layout: ['limit', 'count', 'prev', 'next', 'page', 'skip'] }
                });
                LoseZHUTI = null;
                layui.table.on('radio(add-zhuti-search-table2)', _ => {
                    LoseZHUTI = _.data;
                });
                layui.layer.close(loadIndex);
            }
        });

    });
    //添加漏识别主题知识点
    $("#button-search-zhuti-knowledge").click(_ => {
        var taskdetailurl = apiconf.n_conf_zhutiCandidate;
        $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
            .then(dd => {

                var searchCond = $("#input-knowledge-search-zhuti").val().trim();
                var taabledata = dd.data;
                if (searchCond != "") {
                    taabledata = $.grep(dd.data, ele => {
                        return ele.knowledgename.indexOf(searchCond) > -1 || ele.knowledgechs.indexOf(searchCond) > -1;
                    });
                }

                layui.table.render({
                    elem: '#add-zhuti-search-table',
                    id: "zhutidatatable",
                    data: taabledata,
                    height: 412,
                    cols: [
                        [
                            { type: 'numbers', title: '序号' },
                            { field: 'knowledgename', title: '主题英文名称', align: "center" },
                            { field: 'knowledgechs', title: '主题中文名称', align: "center" },
                            { type: 'checkbox' },
                        ]
                    ],
                    limit: 700,
                    page: { layout: ['count', 'prev', 'next', 'page', 'skip'] }
                });
            });
    });
    //添加漏识别考查类型弹框
    $(".add-lose-kaochaleixing").click(event => {
        let addtype = $(event.currentTarget).prev("b").text();
        layer.open({
            type: 1,
            id: 'add-kaochaleixing',
            shadeClose: true,
            shade: 0,
            content: $("#add-lose-content-kaochaleixing"),
            btn: "+添加",
            btnAlign: 'r',
            title: "<b>添加漏识别【" + addtype + "】</b>",
            area: ['470px', '220px'],
            success: function() { $("#add-lose-kaochaleixing-textarea").val(""); },
            yes: function() {
                var kaoleixingmingcheng = $("#add-lose-kaochaleixing-textarea").val().trim();
                if (kaoleixingmingcheng != "") {
                    var ddd = $(event.currentTarget).closest("fieldset").find("span[name='" + kaoleixingmingcheng + "']");
                    if (ddd.length == 0) {
                        var appendtt = $('<span class="check-item check-lose"></span>').text(kaoleixingmingcheng);
                        $(appendtt).attr("name", kaoleixingmingcheng);
                        placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-kaochaleixinglou");
                        $(placeholderdiv).append(appendtt);
                        RefreshArryData($(placeholderdiv).attr("id"), $(placeholderdiv).attr("data-route"));
                        RenderColorBlock();
                        RefreshEvent();
                    } else {
                        layui.layer.msg("该考查类型已存在");
                    }
                } else {
                    layui.layer.msg("请出入要添加的考查类型名称！", () => {});
                }
            }
        });
    });
}

function CheckLose(elementdata) {
    LoseKaoDian = elementdata.data;
    var contained = false;
    for (var i = 0; i < CACHE_ZhiShiDianResult_Background[SHITIINDEX].allZhiShiDian.length; i++) {
        if (CACHE_ZhiShiDianResult_Background[SHITIINDEX].allZhiShiDian[i].knowledgeName == LoseKaoDian.knowledgeName) {
            contained = true;
            break;
        }
    }
    if (!contained) {
        for (var j = 0; j < CACHE_ZhiShiDianResult_Background[SHITIINDEX].separateZhiShiDian.length; j++) {
            for (var k = 0; k < CACHE_ZhiShiDianResult_Background[SHITIINDEX].separateZhiShiDian[j].data.length; k++) {
                if (CACHE_ZhiShiDianResult_Background[SHITIINDEX].separateZhiShiDian[j].data[k].knowledgeName == LoseKaoDian.knowledgeName) {
                    contained = true;
                    break;
                }
            }
            if (contained) { break; }
        }
    }
    if (contained) {
        layui.layer.msg("知识点识别中存在此识别结果", () => {});
    }
}

function NextOne() {
    var ToToShiTiID = null;
    $.each(CurrentShiTiList, (index, ele) => {
        if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
            if (index == CurrentShiTiList.length - 1) {
                ToToShiTiID = _RecAndCheckData.currentShiTiID;
                layui.layer.msg("已经是最后一个题了！", { "time": 400 });
            } else {
                ToToShiTiID = CurrentShiTiList[index + 1].shitiID;;
            }
        }
    });
    LocateToTiHao(ToToShiTiID);
    var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + _RecAndCheckData.currentShiTiID).offset().top - $("#test-item-container").offset().top - 100;
    $("#test-item-container").scrollTop(topdistance);
}

function RecursionPostCheck(checkdata, callback, closeindex, dataCount) {
    if (dataCount > 0) {
        var onedata = checkdata.data.shift();;
        var checkObj = {
            "taskId": TASKID,
            "taskCreateTime": checkdata.taskCreateTime,
            "ttuTestQuestionIndexId": onedata.ttu_TestQuestionIndexID,
            "checkResultHeXin": onedata.checkResultHeXin,
            "checkResultFeiHeXin": onedata.checkResultFeiHeXin,
            "checkResultZhuTi": onedata.checkResultZhuTi,
            "checkResultKaoChaLeiXing": onedata.checkResultKaoChaLeiXing
        };
        var checkObjstring = JSON.stringify(checkObj);
        $.ajax({
            type: "POST",
            url: apiconf.n_shitiRecPostCheck,
            contentType: "application/json",
            xhrFields: XHRCONF,
            data: checkObjstring
        }).then(_ => {
            RecursionPostCheck(checkdata, callback, closeindex, dataCount - 1);
            if (dataCount == 1) {
                layui.layer.close(closeindex);
                layui.layer.closeAll();
                $("#button-shitilist-show").css("display", "inline-block");
                $("#button-shitilist-hide").hide();

                layui.layer.msg("审核成功，下一题...", { time: 500 });
                setTimeout(() => {
                    NextOne();
                }, 600);
            }
        });
    }
}

function PopupPostCheck(checkdata, callback) {
    var tmplayerindex = layui.layer.load(0, { shade: 0.25 });
    PopupRecursionPostCheck(checkdata, callback, tmplayerindex, checkdata.data.length)
}

function PopupRecursionPostCheck(checkdata, callback, closeindex, dataCount) {
    if (dataCount > 0) {
        var onedata = checkdata.data.shift();;
        var checkObj = {
            "taskId": TASKID,
            "taskCreateTime": checkdata.taskCreateTime,
            "ttuTestQuestionIndexId": onedata.ttu_TestQuestionIndexID,
            "checkResultHeXin": onedata.checkResultHeXin,
            "checkResultFeiHeXin": onedata.checkResultFeiHeXin,
            "checkResultZhuTi": onedata.checkResultZhuTi,
            "checkResultKaoChaLeiXing": onedata.checkResultKaoChaLeiXing
        };
        var checkObjstring = JSON.stringify(checkObj);
        $.ajax({
            type: "POST",
            url: apiconf.n_shitiRecPostCheck,
            contentType: "application/json",
            xhrFields: XHRCONF,
            data: checkObjstring
        }).then(_ => {
            PopupRecursionPostCheck(checkdata, callback, closeindex, dataCount - 1);
            if (dataCount == 1) {
                layui.layer.close(closeindex);
                layui.layer.closeAll();
                $("#button-shitilist-show").css("display", "inline-block");
                $("#button-shitilist-hide").hide();

                layui.layer.msg("审核成功", { time: 500 });
                setTimeout(() => LocateToTiHao(_RecAndCheckData.currentShiTiID), 600);
            }
        });
    }
}

function InitBackgroundData(index) {
    $("#background-checkpage").find(".shenhequote").empty();
    if (_RecAndCheckData == null || _RecAndCheckData.backgroundResult.data.length == 0) {
        layui.layer.msg("该题识别结果为空！！！", () => {});
        layui.layer.close(GlobalLoadIndex);
        return;
    }

    if (_RecAndCheckData.popupResult != null) {
        $("#button-zuixinjieguo").show();
        $("#button-zuixinjieguo").click(_ => OpenNewResult());
    } else {
        $("#button-zuixinjieguo").hide();
    }

    //题号信息
    $("#tihao-display").empty();

    if (_RecAndCheckData.backgroundResult.data.length > 1) {
        $("#tihao-title").show();
        $.each(_RecAndCheckData.backgroundResult.data, (idx, ele) => {
            if (idx == index) {
                $("#tihao-display").append($('<span class="right-top-tihao"></span>').css("background", "tomato").attr("index", idx).text(ele.indexTitle));
            } else {
                $("#tihao-display").append($('<span class="right-top-tihao"></span>').attr("index", idx).text(ele.indexTitle));
            }
        });
        let hei = window.innerHeight * 0.5;
        let x_left = window.innerWidth - 65;
        $("#tihao-display").css("height", hei - 40 + "px");

        var topRightTiHaoLayerIndexTmp = layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            shade: 0,
            offset: ['50px', x_left + 'px'],
            content: $('#side-tihao-memu'),
            area: ['60px', hei + 'px'],
            zIndex: 900,
            end: function() {
                $('#side-tihao-memu').hide();
            }
        });
        topRightTiHaoLayerIndex.push(topRightTiHaoLayerIndexTmp);

        $("#tihao-display").find(".right-top-tihao").click(event => {
            layer.load(0, { shade: false, time: 90 });
            SHITIINDEX = $(event.currentTarget).attr("index")
            $(".right-top-tihao").css("background", "");
            $(event.currentTarget).css("background", "tomato");
            InitBackgroundData(SHITIINDEX);
            RenderColorBlock();
        });
        $("#single-shiti-title").text("");
    } else if (_RecAndCheckData.backgroundResult.data.length == 1) {
        $.each(topRightTiHaoLayerIndex, (_, ele) => layui.layer.close(ele));
        topRightTiHaoLayerIndex.length = 0;
        $("#single-shiti-title").text(_RecAndCheckData.backgroundResult.data[0].indexTitle);
    }



    function _WrongElement(knowledgeName, knowledgeUniqueCode, databaseRowID) {
        return $('<span>', {
            "class": "check-item check-wrong func-copy",
            "originpositionid": "background-hexinkaodian",
            "originclass": "check-item check-correct",
            "moveid": "background-hexinkaodian-" + knowledgeName.replace(/[^a-zA-Z]/g, ''),
            "knowledgeUniqueCode": knowledgeUniqueCode,
            "knowledgeName": knowledgeName,
            "databaseRowID": databaseRowID
        }).text(knowledgeName);
    }

    function _LoseElement(knowledgeName, knowledgeUniqueCode, databaseRowID) {
        return $('<span>', {
            "class": "check-item check-lose func-copy",
            "knowledgeUniqueCode": knowledgeUniqueCode,
            "knowledgeName": knowledgeName,
            "databaseRowID": databaseRowID
        }).text(knowledgeName);
    }

    //background核心
    if (_RecAndCheckData.backgroundResult.data[index].checkResultHeXin != null) {
        var originArr = [];
        if (_RecAndCheckData.popupResult != null) {
            originArr = $.merge(
                _RecAndCheckData.popupResult.data[index].checkResultHeXin.correct,
                _RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonKaoDian);
            originArr = $.merge(originArr, _RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonZhiShiDian);
            originArr = $.merge(originArr, _RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian);
        }

        $("#background-hexinkaodian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-correct");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-correct  func-copy",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-hexinkaodian").append(_element);
        });
        $("#background-hexinkaodian-wrongReasonKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-wrongReasonKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonKaoDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-hexinkaodian-wrongReasonKaoDian").append(_element);
        });
        $("#background-hexinkaodian-wrongReasonZhiShiDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-wrongReasonZhiShiDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonZhiShiDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-hexinkaodian-wrongReasonZhiShiDian").append(_element);
        });
        $("#background-hexinkaodian-wrongReasonFeiHeXinKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-wrongReasonFeiHeXinKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-hexinkaodian-wrongReasonFeiHeXinKaoDian").append(_element);
        });
        $("#background-hexinkaodian-loseReasonKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonKaoDian, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-hexinkaodian-loseReasonKaoDian").append(_element);
        });
        $("#background-hexinkaodian-loseReasonZhiShiDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDian, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-hexinkaodian-loseReasonZhiShiDian").append(_element);
        });
        $("#background-hexinkaodian-loseReasonZhiShiDianKu")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDianKu");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $(_element).addClass("check-lose-weizhizhishidian-msg");
            $(_element).attr("knowledgeType", ele.knowledgeType);
            $(_element).attr("knowledgeVersion", ele.knowledgeVersion);
            $(_element).attr("exampleText", ele.exampleText);
            $("#background-hexinkaodian-loseReasonZhiShiDianKu").append(_element);
        });
        $("#background-hexinkaodian-loseReasonZhiShiDianTeZheng")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDianTeZheng");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-hexinkaodian-loseReasonZhiShiDianTeZheng").append(_element);
        });
        $("#background-hexinkaodian-loseReasonFeiHeXinKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonFeiHeXinKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose  func-copy",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-hexinkaodian-loseReasonFeiHeXinKaoDian").append(_element);
        });
    }

    //background非核心
    if (_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin != null) {
        var originArr = [];
        if (_RecAndCheckData.popupResult != null) {
            originArr = $.merge(
                _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.correct,
                _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian);
            originArr = $.merge(originArr, _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian);
            originArr = $.merge(originArr, _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonHeXinKaoDian);
        }

        $("#background-feihexinkaodian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-correct");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-correct  func-copy",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-feihexinkaodian").append(_element);
        });
        $("#background-feihexinkaodian-wrongReasonKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-wrongReasonKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-feihexinkaodian-wrongReasonKaoDian").append(_element);
        });
        $("#background-feihexinkaodian-wrongReasonZhiShiDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-wrongReasonZhiShiDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-feihexinkaodian-wrongReasonZhiShiDian").append(_element);
        });
        $("#background-feihexinkaodian-wrongReasonHeXinKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-wrongReasonHeXinKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem && _RecAndCheckData.popupResult != null) {
                $(_element).addClass("remove-point");
            }
            $("#background-feihexinkaodian-wrongReasonHeXinKaoDian").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonKaoDian")
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose  func-copy",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-feihexinkaodian-loseReasonKaoDian").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonZhiShiDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose  func-copy",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-feihexinkaodian-loseReasonZhiShiDian").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonZhiShiDianKu")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDianKu");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose  func-copy",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $(_element).addClass("check-lose-weizhizhishidian-msg");
            $(_element).attr("knowledgeType", ele.knowledgeType);
            $(_element).attr("knowledgeVersion", ele.knowledgeVersion);
            $(_element).attr("exampleText", ele.exampleText);
            $("#background-feihexinkaodian-loseReasonZhiShiDianKu").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonZhiShiDianTeZheng")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDianTeZheng");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-feihexinkaodian-loseReasonZhiShiDianTeZheng").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonHeXinKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonHeXinKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "background-hexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-hexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#background-feihexinkaodian-loseReasonHeXinKaoDian").append(_element);
        });
    }

    //主题
    if (_RecAndCheckData.backgroundResult.data[index].checkResultZhuTi != null) {
        function _ZhuTiElement(classstring, knowledgeName, knowledgeUniqueCode, databaseRowID) {
            return $('<span>', {
                "class": classstring,
                "knowledgeUniqueCode": knowledgeUniqueCode,
                "knowledgeName": knowledgeName,
                "databaseRowID": databaseRowID
            });
        }
        //background主题
        $("#background-zhuti-correct")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultZhuTi-correct");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultZhuTi.correct, (_, ele) => {
            var _element = _ZhuTiElement("check-item check-correct func-copy", ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            if (ele.knowledgeName == null && ele.knowledgeChs != null) {
                $(_element).text(ele.knowledgeChs);
            }
            if (ele.knowledgeChs == null && ele.knowledgeName != null) {
                $(_element).text(ele.knowledgeName);
            }
            if (ele.knowledgeChs != null && ele.knowledgeName != null) {
                if (ele.knowledgeChs == ele.knowledgeName) {
                    $(_element).text(ele.knowledgeChs);
                } else {
                    $(_element).text(ele.knowledgeChs + " / " + ele.knowledgeName);
                }
            }
            $("#background-zhuti-correct").append(_element);
        });
        $("#background-zhuti-wrong")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultZhuTi-wrong");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultZhuTi.wrong, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "background-zhuti-correct",
                "originclass": "check-item check-correct",
                "moveid": "background-zhuti-correct-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            });
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            if (ele.knowledgeName == null && ele.knowledgeChs != null) {
                $(_element).text(ele.knowledgeChs);
            }
            if (ele.knowledgeChs == null && ele.knowledgeName != null) {
                $(_element).text(ele.knowledgeName);
            }
            if (ele.knowledgeChs != null && ele.knowledgeName != null) {
                if (ele.knowledgeChs == ele.knowledgeName) {
                    $(_element).text(ele.knowledgeChs);
                } else {
                    $(_element).text(ele.knowledgeChs + " / " + ele.knowledgeName);
                }
            }
            $("#background-zhuti-wrong").append(_element);
        });

        $("#background-zhuti-lose")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultZhuTi-lose");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultZhuTi.lose, (_, ele) => {
            var _element = _ZhuTiElement("check-item check-lose func-copy", ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            if (ele.knowledgeName == null && ele.knowledgeChs != null) {
                $(_element).text(ele.knowledgeChs);
            }
            if (ele.knowledgeChs == null && ele.knowledgeName != null) {
                $(_element).text(ele.knowledgeName);
            }
            if (ele.knowledgeChs != null && ele.knowledgeName != null) {
                if (ele.knowledgeChs == ele.knowledgeName) {
                    $(_element).text(ele.knowledgeChs);
                } else {
                    $(_element).text(ele.knowledgeChs + " / " + ele.knowledgeName);
                }
            }
            $("#background-zhuti-lose").append(_element);
        });
    }
    //考查类型
    if (_RecAndCheckData.backgroundResult.data[index].checkResultKaoChaLeiXing != null) {
        //background考查类型
        $("#background-kaochaleixing-correct")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultKaoChaLeiXing-correct");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultKaoChaLeiXing.correct, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-correct func-copy",
                "name": ele.name,
                "databaseRowID": ele.databaseRowID
            }).text(ele.name);
            $("#background-kaochaleixing-correct").append(_element);
        });
        $("#background-kaochaleixing-wrong")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultKaoChaLeiXing-wrong");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultKaoChaLeiXing.wrong, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "background-kaochaleixing-correct",
                "originclass": "check-item check-correct",
                "moveid": "background-kaochaleixing-correct-" + ele.name.replace(/[^a-zA-Z]/g, ''),
                "databaseRowID": ele.databaseRowID
            }).text(ele.name);
            $("#background-kaochaleixing-wrong").append(_element);
        });

        $("#background-kaochaleixing-lose")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultKaoChaLeiXing-lose");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultKaoChaLeiXing.lose, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose func-copy",
                "name": ele.name,
                "databaseRowID": ele.databaseRowID
            }).text(ele.name);
            $("#background-kaochaleixing-lose").append(_element);
        });
    }

    PopupDataFill(index);
}

//放在加载完了所有知识点后再加载这个
function PopupDataFill(index) {
    //组织popup里的新识别结果数据
    $("#popup-checkpage").find(".shenhequote").empty();
    if (_RecAndCheckData.popupResult == null) {
        RenderColorBlock();
        RefreshEvent();
        return;
    }

    //取交集
    function _intersect(arr1, arr2) {
        return $.grep(arr1, ccc => {
            var hadCount = $.grep(arr2, ddd => ddd.knowledgeName == ccc.knowledgeName).length;
            return hadCount > 0;
        });
    }
    //取差集
    function _minus(arr1, arr2) {
        return $.grep(arr1, ccc => {
            var hadCount = $.grep(arr2, ddd => ddd.knowledgeName == ccc.knowledgeName).length;
            return hadCount == 0;
        });
    }
    //去重取并集
    function _merge(arr1, arr2) {
        var minus = $.grep(arr1, ccc => {
            var hadCount = $.grep(arr2, ddd => ddd.knowledgeName == ccc.knowledgeName).length;
            return hadCount == 0;
        });
        return $.merge(arr2, minus);
    }
    //审核popup里的数据
    // 把原来检查识别结果，把原来三种类型错的还搞到错的里边
    var AllK = [];
    for (var iid = 0; iid < CACHE_ZhiShiDianResult_Popup.length; iid++) {
        AllK = _merge(CACHE_ZhiShiDianResult_Popup[iid].allZhiShiDian, AllK);
        for (var iij = 0; iij < CACHE_ZhiShiDianResult_Popup[iid].separateZhiShiDian.length; iij++) {
            AllK = _merge(CACHE_ZhiShiDianResult_Popup[iid].separateZhiShiDian[iij].data, AllK);
        }
    }
    var HeXinIni = _RecAndCheckData.popupResult.data[index].checkResultHeXin.correct;
    var FeiHeXinIni = _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.correct;
    var t1 = [],
        t2 = [],
        t3 = [],
        t4 = [],
        t5 = [],
        t6 = [],
        t7 = [],
        t8 = [],
        t9 = [];
    // 核心考点
    //正确考点
    t1 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonKaoDian);
    t2 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonZhiShiDian);
    t3 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian);
    t4 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct);
    t5 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonKaoDian);
    t6 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian);
    t7 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu);
    t8 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng);
    t9 = _minus(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian);
    var tt = _intersect(t1, t2)
    tt = _intersect(tt, t3)
    tt = _intersect(tt, t4)
    tt = _intersect(tt, t5)
    tt = _intersect(tt, t6)
    tt = _intersect(tt, t7)
    tt = _intersect(tt, t8)
    tt = _intersect(tt, t9)
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.correct = tt;
    //错误类型1
    t1 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonKaoDian);
    t1 = _minus(t1, AllK);
    t2 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonZhiShiDian);
    t2 = _minus(t2, AllK);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonKaoDian = _merge(t1, t2);
    //错误类型2
    t1 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonKaoDian);
    t1 = _intersect(t1, AllK);
    t2 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonZhiShiDian);
    t2 = _intersect(t2, AllK);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonZhiShiDian = _merge(t1, t2);
    //错误类型3
    t1 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian);
    t2 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct);
    t3 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonKaoDian);
    t4 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian);
    t5 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu);
    t6 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng);
    t7 = _intersect(HeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian = _merge(_merge(_merge(_merge(t1, t2), _merge(t3, t4)), _merge(t5, t6)), t7);


    //遗漏类型1
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonKaoDian, HeXinIni);
    t1 = _intersect(t1, AllK);
    t1 = _minus(t1, FeiHeXinIni);
    t2 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDian, HeXinIni);
    t2 = _intersect(t2, AllK);
    t2 = _minus(t2, FeiHeXinIni);
    t3 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, HeXinIni);
    t3 = _intersect(t3, AllK);
    t3 = _minus(t3, FeiHeXinIni);
    t4 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct, HeXinIni);
    t4 = _intersect(t4, AllK);
    t4 = _minus(t4, FeiHeXinIni);
    t5 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian, HeXinIni);
    t5 = _minus(t5, FeiHeXinIni);
    t5 = _minus(t5, AllK);

    _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonKaoDian = _merge(_merge(_merge(t1, t2), _merge(t3, t4)), t5);

    //遗漏类型2
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonKaoDian, HeXinIni);
    t1 = _minus(t1, AllK);
    t1 = _minus(t1, FeiHeXinIni);
    t2 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDian, HeXinIni);
    t2 = _minus(t2, AllK);
    t2 = _minus(t2, FeiHeXinIni);
    // t3 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu, HeXinIni);
    // t3 = _minus(t3, AllK);
    // t3 = _minus(t3, FeiHeXinIni);
    // t4 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, HeXinIni);
    // t4 = _minus(t4, AllK);
    // t4 = _minus(t4, FeiHeXinIni);
    t5 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct, HeXinIni);
    t5 = _minus(t5, AllK);
    t5 = _minus(t5, FeiHeXinIni);
    t6 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian, HeXinIni);
    t6 = _minus(t6, FeiHeXinIni);
    t6 = _intersect(t6, AllK);
    // _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDian = _merge(_merge(t1, t2), _merge(t3, _merge(t4, t5)));
    // _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDian = _merge(_merge(_merge(t1, t2), _merge(t4, t5)), t6);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDian = _merge(_merge(t1, t2), _merge(t6, t5));

    //遗漏类型3
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu, HeXinIni);
    t1 = _minus(t1, AllK);
    t1 = _minus(t1, FeiHeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu = t1;

    //遗漏类型4
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, HeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng = t1;

    //遗漏类型5
    t1 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian, FeiHeXinIni);
    t2 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonKaoDian, FeiHeXinIni);
    t3 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDian, FeiHeXinIni);
    t4 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu, FeiHeXinIni);
    t5 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, FeiHeXinIni);
    t6 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct, FeiHeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian = _merge(_merge(_merge(t1, t2), _merge(t3, t4)), _merge(t5, t6));

    // 非核心考点
    //正确考点
    t1 = _minus(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian);
    t2 = _minus(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian);
    t3 = _minus(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonHeXinKaoDian);
    t4 = _minus(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.correct = _intersect(_intersect(t1, t2), _intersect(t3, t4));
    //错误类型1
    t1 = _intersect(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian);
    t1 = _minus(t1, AllK);
    t2 = _intersect(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian);
    t2 = _minus(t2, AllK);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian = _merge(t1, t2);
    //错误类型2
    t1 = _intersect(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian);
    t1 = _intersect(t1, AllK);
    t2 = _intersect(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian);
    t2 = _intersect(t2, AllK);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian = _merge(t1, t2);
    //错误类型3
    t1 = _intersect(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonHeXinKaoDian);
    t2 = _intersect(FeiHeXinIni, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonHeXinKaoDian = _merge(t1, t2);


    //遗漏类型1
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonKaoDian, FeiHeXinIni);
    t1 = _intersect(t1, AllK);
    t1 = _minus(t1, HeXinIni);
    t2 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian, FeiHeXinIni);
    t2 = _intersect(t2, AllK);
    t2 = _minus(t2, HeXinIni);
    t3 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, FeiHeXinIni);
    t3 = _intersect(t3, AllK);
    t3 = _minus(t3, HeXinIni);
    t4 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct, FeiHeXinIni);
    t4 = _intersect(t4, AllK);
    t4 = _minus(t4, HeXinIni);

    t5 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian, FeiHeXinIni);
    t5 = _minus(t5, HeXinIni);
    t5 = _minus(t5, AllK);

    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonKaoDian = _merge(_merge(_merge(t1, t2), _merge(t3, t4)), t5);

    //遗漏类型2
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonKaoDian, FeiHeXinIni);
    t1 = _minus(t1, AllK);
    t1 = _minus(t1, HeXinIni);
    t2 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian, FeiHeXinIni);
    t2 = _minus(t2, AllK);
    t2 = _minus(t2, HeXinIni);
    // t3 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu, FeiHeXinIni);
    // t3 = _minus(t3, AllK);
    // t3 = _minus(t3, HeXinIni);
    // t4 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, FeiHeXinIni);
    // t4 = _minus(t4, AllK);
    // t4 = _minus(t4, HeXinIni);
    t5 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct, FeiHeXinIni);
    t5 = _minus(t5, AllK);
    t5 = _minus(t5, HeXinIni);
    t6 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian, HeXinIni);
    t6 = _minus(t6, FeiHeXinIni);
    t6 = _intersect(t6, AllK);
    // _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian = _merge(_merge(t1, t2), _merge(t3, _merge(t4, t5)));
    // _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian = _merge(_merge(_merge(t1, t2), _merge(t4, t5)), t6);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian = _merge(_merge(t1, t2), _merge(t6, t5));

    //遗漏类型3
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu, FeiHeXinIni);
    t1 = _minus(t1, AllK);
    t1 = _minus(t1, HeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu = t1;

    //遗漏类型4
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, FeiHeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng = t1;

    //遗漏类型5
    t1 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian, HeXinIni);
    t2 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonKaoDian, HeXinIni);
    t3 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian, HeXinIni);
    t4 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu, HeXinIni);
    t5 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, HeXinIni);
    t6 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct, HeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian = _merge(_merge(_merge(t1, t2), _merge(t3, t4)), _merge(t5, t6));

    function _WrongElement(knowledgeName, knowledgeUniqueCode, databaseRowID) {
        return $('<span>', {
            "class": "check-item check-wrong",
            "originpositionid": "popup-hexinkaodian",
            "originclass": "check-item check-correct",
            "moveid": "popup-hexinkaodian-" + knowledgeName.replace(/[^a-zA-Z]/g, ''),
            "knowledgeUniqueCode": knowledgeUniqueCode,
            "knowledgeName": knowledgeName,
            "databaseRowID": databaseRowID
        }).text(knowledgeName);
    }

    function _LoseElement(knowledgeName, knowledgeUniqueCode, databaseRowID) {
        return $('<span>', {
            "class": "check-item check-lose",
            "knowledgeUniqueCode": knowledgeUniqueCode,
            "knowledgeName": knowledgeName,
            "databaseRowID": databaseRowID
        }).text(knowledgeName);
    }

    //popup核心
    if (_RecAndCheckData.popupResult.data[index].checkResultHeXin != null) {
        var originArr = [];
        originArr = $.merge(
            _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct,
            _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonKaoDian);
        originArr = $.merge(originArr, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonZhiShiDian);
        originArr = $.merge(originArr, _RecAndCheckData.backgroundResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian);

        $("#popup-hexinkaodian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-correct");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.correct, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-correct",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem) {
                $(_element).addClass("new-point");
            }
            $("#popup-hexinkaodian").append(_element);
        });
        $("#popup-hexinkaodian-wrongReasonKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-wrongReasonKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonKaoDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-wrongReasonKaoDian").append(_element);
        });
        $("#popup-hexinkaodian-wrongReasonZhiShiDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-wrongReasonZhiShiDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonZhiShiDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-wrongReasonZhiShiDian").append(_element);
        });
        $("#popup-hexinkaodian-wrongReasonFeiHeXinKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-wrongReasonFeiHeXinKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-wrongReasonFeiHeXinKaoDian").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonKaoDian, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-loseReasonKaoDian").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonZhiShiDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDian, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-loseReasonZhiShiDian").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonZhiShiDianKu")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDianKu");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).addClass("check-lose-weizhizhishidian-msg");
            $(_element).attr("knowledgeType", ele.knowledgeType);
            $(_element).attr("knowledgeVersion", ele.knowledgeVersion);
            $(_element).attr("exampleText", ele.exampleText);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-loseReasonZhiShiDianKu").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonZhiShiDianTeZheng")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDianTeZheng");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-loseReasonZhiShiDianTeZheng").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonFeiHeXinKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonFeiHeXinKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose",
                "originpositionid": "popup-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "popup-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-hexinkaodian-loseReasonFeiHeXinKaoDian").append(_element);
        });
    }

    //popup非核心
    if (_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin != null) {
        var originArr = [];
        originArr = $.merge(
            _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct,
            _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian);
        originArr = $.merge(originArr, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian);
        originArr = $.merge(originArr, _RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.wrongReasonHeXinKaoDian);

        $("#popup-feihexinkaodian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-correct");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.correct, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-correct",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            var hasItem = $.grep(originArr, ddd => ddd.knowledgeName == ele.knowledgeName).length == 0;
            if (hasItem) {
                $(_element).addClass("new-point");
            }
            $("#popup-feihexinkaodian").append(_element);
        });
        $("#popup-feihexinkaodian-wrongReasonKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-wrongReasonKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong",
                "originpositionid": "popup-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "popup-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-feihexinkaodian-wrongReasonKaoDian").append(_element);
        });
        $("#popup-feihexinkaodian-wrongReasonZhiShiDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-wrongReasonZhiShiDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonZhiShiDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong",
                "originpositionid": "popup-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "popup-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-feihexinkaodian-wrongReasonZhiShiDian").append(_element);
        });
        $("#popup-feihexinkaodian-wrongReasonHeXinKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-wrongReasonHeXinKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.wrongReasonHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong",
                "originpositionid": "popup-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "popup-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-feihexinkaodian-wrongReasonHeXinKaoDian").append(_element);
        });
        $("#popup-feihexinkaodian-loseReasonKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-loseReasonKaoDian")
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-feihexinkaodian-loseReasonKaoDian").append(_element);
        });
        $("#popup-feihexinkaodian-loseReasonZhiShiDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-feihexinkaodian-loseReasonZhiShiDian").append(_element);
        });
        $("#popup-feihexinkaodian-loseReasonZhiShiDianKu")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDianKu");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $(_element).addClass("check-lose-weizhizhishidian-msg");
            $(_element).attr("knowledgeType", ele.knowledgeType);
            $(_element).attr("knowledgeVersion", ele.knowledgeVersion);
            $(_element).attr("exampleText", ele.exampleText);
            $("#popup-feihexinkaodian-loseReasonZhiShiDianKu").append(_element);
        });
        $("#popup-feihexinkaodian-loseReasonZhiShiDianTeZheng")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDianTeZheng");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-feihexinkaodian-loseReasonZhiShiDianTeZheng").append(_element);
        });
        $("#popup-feihexinkaodian-loseReasonHeXinKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultFeiHeXin-loseReasonHeXinKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong",
                "originpositionid": "popup-hexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "popup-hexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            $("#popup-feihexinkaodian-loseReasonHeXinKaoDian").append(_element);
        });
    }

    //popup主题
    if (_RecAndCheckData.popupResult.data[index].checkResultZhuTi != null) {
        function _ZhuTiElement(classstring, knowledgeName, knowledgeUniqueCode, databaseRowID) {
            return $('<span>', {
                "class": classstring,
                "knowledgeUniqueCode": knowledgeUniqueCode,
                "knowledgeName": knowledgeName,
                "databaseRowID": databaseRowID
            });
        }
        $("#popup-zhuti-correct")
            .attr("data-route", "popupResult-data-" + index + "-checkResultZhuTi-correct");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultZhuTi.correct, (_, ele) => {
            var _element = _ZhuTiElement("check-item check-correct func-copy", ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            if (ele.knowledgeName == null && ele.knowledgeChs != null) {
                $(_element).text(ele.knowledgeChs);
            }
            if (ele.knowledgeChs == null && ele.knowledgeName != null) {
                $(_element).text(ele.knowledgeName);
            }
            if (ele.knowledgeChs != null && ele.knowledgeName != null) {
                if (ele.knowledgeChs == ele.knowledgeName) {
                    $(_element).text(ele.knowledgeChs);
                } else {
                    $(_element).text(ele.knowledgeChs + " / " + ele.knowledgeName);
                }
            }
            $("#popup-zhuti-correct").append(_element);
        });
        $("#popup-zhuti-wrong")
            .attr("data-route", "popupResult-data-" + index + "-checkResultZhuTi-wrong");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultZhuTi.wrong, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "popup-zhuti-correct",
                "originclass": "check-item check-correct",
                "moveid": "popup-zhuti-correct-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            });
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            if (ele.knowledgeName == null && ele.knowledgeChs != null) {
                $(_element).text(ele.knowledgeChs);
            }
            if (ele.knowledgeChs == null && ele.knowledgeName != null) {
                $(_element).text(ele.knowledgeName);
            }
            if (ele.knowledgeChs != null && ele.knowledgeName != null) {
                if (ele.knowledgeChs == ele.knowledgeName) {
                    $(_element).text(ele.knowledgeChs);
                } else {
                    $(_element).text(ele.knowledgeChs + " / " + ele.knowledgeName);
                }
            }
            $("#popup-zhuti-wrong").append(_element);
        });

        $("#popup-zhuti-lose")
            .attr("data-route", "popupResult-data-" + index + "-checkResultZhuTi-lose");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultZhuTi.lose, (_, ele) => {
            var _element = _ZhuTiElement("check-item check-lose func-copy", ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $(_element).attr("knowledgeChs", ele.knowledgeChs);
            if (ele.knowledgeName == null && ele.knowledgeChs != null) {
                $(_element).text(ele.knowledgeChs);
            }
            if (ele.knowledgeChs == null && ele.knowledgeName != null) {
                $(_element).text(ele.knowledgeName);
            }
            if (ele.knowledgeChs != null && ele.knowledgeName != null) {
                if (ele.knowledgeChs == ele.knowledgeName) {
                    $(_element).text(ele.knowledgeChs);
                } else {
                    $(_element).text(ele.knowledgeChs + " / " + ele.knowledgeName);
                }
            }
            $("#popup-zhuti-lose").append(_element);
        });
    }

    //考查类型
    if (_RecAndCheckData.popupResult.data[index].checkResultKaoChaLeiXing != null) {
        //popup考查类型
        $("#popup-kaochaleixing-correct")
            .attr("data-route", "popupResult-data-" + index + "-checkResultKaoChaLeiXing-correct");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultKaoChaLeiXing.correct, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-correct func-copy",
                "name": ele.name,
                "databaseRowID": ele.databaseRowID
            }).text(ele.name);
            $("#popup-kaochaleixing-correct").append(_element);
        });
        $("#popup-kaochaleixing-wrong")
            .attr("data-route", "popupResult-data-" + index + "-checkResultKaoChaLeiXing-wrong");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultKaoChaLeiXing.wrong, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong  func-copy",
                "originpositionid": "popup-kaochaleixing-correct",
                "originclass": "check-item check-correct",
                "moveid": "popup-kaochaleixing-correct-" + ele.name.replace(/[^a-zA-Z]/g, ''),
                "databaseRowID": ele.databaseRowID
            }).text(ele.name);
            $("#popup-kaochaleixing-wrong").append(_element);
        });

        $("#popup-kaochaleixing-lose")
            .attr("data-route", "popupResult-data-" + index + "-checkResultKaoChaLeiXing-lose");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultKaoChaLeiXing.lose, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose func-copy",
                "name": ele.name,
                "databaseRowID": ele.databaseRowID
            }).text(ele.name);
            $("#popup-kaochaleixing-lose").append(_element);
        });
    }
}

//如果是第一次加载，则按选择的结果展示，如果不是第一次加载，则按上一次的历史展示
function InitLeftBottomShiTiList(flg, resultnew, shenhe, shitiList, stihao, stixing, sticai, sversion, category) {
    var shitidata = shitiList;
    if (resultnew == "nodifferent") {
        shitidata = $.grep(shitidata, _ => _.hasNewResult == "false");
    } else if (resultnew == "different") {
        shitidata = $.grep(shitidata, _ => _.hasNewResult == "true");
    }
    if (shenhe == "checked") {
        shitidata = $.grep(shitidata, _ => _.checkID == 101);
    } else if (shenhe == "unchecked") {
        shitidata = $.grep(shitidata, _ => _.checkID == 100);
    }
    if (typeof(stihao) != "undefined" && stihao.trim() != "" && stihao.trim() != "all") {
        shitidata = $.grep(shitidata, _ => (_.shitiID + "").indexOf(stihao.trim()) > -1);
    }
    if (typeof(stixing) != "undefined" && stixing != "all") {
        shitidata = $.grep(shitidata, _ => _.questionType == stixing);
    }
    if (typeof(category) != "undefined" && category != "all") {
        shitidata = $.grep(shitidata, _ => {
            if (_.categoryTagId.length == 0) {
                return false;
            } else {
                return $.grep(_.categoryTagId, cat => cat == category).length > 0;
            }
        });
    }
    if (typeof(sticai) != "undefined" && sticai != "all") {
        shitidata = $.grep(shitidata, _ => _.genre == sticai);
    }
    if (typeof(sversion) != "undefined" && sversion != "all") {
        shitidata = $.grep(shitidata, _ => _.version == sversion);
    }

    if (flg == "gaoji") {
        CurrentShiTiListPage = shitidata;
    }
    CurrentShiTiList = shitidata;

    if (shitidata != null && shitidata.length > 0) {
        _RecAndCheckData.currentShiTiID = shitidata[0].shitiID;
        LocateToTiHao(_RecAndCheckData.currentShiTiID);
    } else {
        _RecAndCheckData.currentShiTiID = 0;
    }
    $("#test-item-container").empty();
    $.each(shitidata, (ind, ele) => {
        var temphtml =
            '<div class="test-item-index" style="display: none;">' +
            '  <div class="layui-row">' +
            '    <div class="layui-col-xs3 tihao-index" style="text-align: left;padding-left: 15px;"></div>' +
            '    <div class="layui-col-xs4 tihao-content" style="text-align: left;"></div>' +
            '    <div class="layui-col-xs5 category-content" style="text-align: left;"></div>' +
            '  </div>' +
            '</div>';
        var itemIndex = $(temphtml);
        $(itemIndex).find(".tihao-index").text(ind + 1);
        $(itemIndex).attr("id", "tihao-index-" + ele.shitiID);
        $(itemIndex).attr("data", ele.shitiID);
        let tttt = ele.shitiID;

        var hasNewResult = '<span class="hasNewResult"><span class="layui-badge-dot layui-bg-orange" style="margin-right:10px"></span></span>' +
            '<span class="noNewResult" style="display:none;"><span style="margin-right:18px;"></span></span>';
        var noNewResult = '<span class="hasNewResult" style="display:none;"><span class="layui-badge-dot layui-bg-orange" style="margin-right:10px"></span></span>' +
            '<span class="noNewResult"><span style="margin-right:18px;"></span></span>';

        var CheckedIcon = '<span class="CheckedIcon"><span style="display:inline-block;width:10px;margin-left:10px;"><i class="layui-icon layui-icon-ok" style="font-size: 30px; color: #1E9FFF;font-size:x-small"></i></span></span>' +
            '<span class="notCheckedIcon"  style="display:none;"><span style="display:inline-block;width:10px;height:1px;"></span></span>';
        var notCheckedIcon = '<span class="CheckedIcon"  style="display:none;"><span style="display:inline-block;width:10px;margin-left:10px;"><i class="layui-icon layui-icon-ok" style="font-size: 30px; color: #1E9FFF;font-size:x-small"></i></span></span>' +
            '<span class="notCheckedIcon"><span style="display:inline-block;width:10px;height:1px;"></span></span>';

        if (ele.hasNewResult == 'true' && ele.checkID == 101) {
            tttt = hasNewResult + tttt + CheckedIcon;
        } else if (ele.checkID == 101) {
            tttt = noNewResult + tttt + CheckedIcon;
        } else if (ele.hasNewResult == 'true') {
            tttt = hasNewResult + tttt + notCheckedIcon;
        } else {
            tttt = noNewResult + tttt + notCheckedIcon;
        }
        $(itemIndex).find(".tihao-content").html(tttt);
        $(itemIndex).show();
        if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
            $(itemIndex).css("background", "tomato");
        }
        $(itemIndex).find(".category-content").html('<span>' + ele.categoryTagId + '</span>');

        $("#test-item-container").append(itemIndex);
    });
    $(".total-shiti").text(shitidata.length);

    //注册选择小题的事件操作
    $(".test-item-index").click(event => {
        //切换当前试题ID；列表试题ID显示背景；左下角试题ID；试题区域试题信息
        var currentshitiid = parseInt($(event.currentTarget).attr("data"));

        LocateToTiHao(currentshitiid);
    });
}

function LocateToTiHao(changtoshitiid) {
    $(".zhishidianjiansuo").val();
    $("#input-knowledge-search").val();
    $("#input-knowledge-search-zhuti").val();
    $("#add-lose-kaochaleixing-textarea").val();
    GlobalLoadIndex = layui.layer.load(0, { shade: 0.25 });
    //进入某小题审核结果的入口方法
    //缓存存在试题列表信息则直接使用，否则字形重新加载
    if (CurrentShiTiList != null && CurrentShiTiList.length > 0) {
        _RecAndCheckData.currentShiTiID = changtoshitiid;
        //当前试题所处的Index
        var _currentShiTiIndex = 0;
        $.each(CurrentShiTiList, (idx, ele) => {
            if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
                _currentShiTiIndex = idx;
            }
        });
        //设置Index信息等
        $("#current-shitiID-progress").text("（" + (_currentShiTiIndex + 1) + "/" + CurrentShiTiList.length + "）");
        var currentshitidiv = $("#test-item-container").find("#tihao-index-" + _RecAndCheckData.currentShiTiID);
        $(".test-item-index").css("background", "");
        $(currentshitidiv).css("background", "tomato");
        $("#current-shitiID").text(_RecAndCheckData.currentShiTiID);
        $("#show-shitiId").text(_RecAndCheckData.currentShiTiID);

        LoadQuestionEntity(_RecAndCheckData.currentShiTiID);

        //加载试题审核进度的信息
        var taskdetailurl = apiconf.n_taskdetail + "?taskId=" + TASKID + "&userId=" + userinfo.id;
        $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
            .then(data => {
                _TaskData = data.data;
                for (var ii = 0; ii < CurrentShiTiList.length; ii++) {
                    for (var jj = 0; jj < _TaskData.shiti.length; jj++) {
                        if (CurrentShiTiList[ii].shitiID == _TaskData.shiti[jj].shitiID) {
                            CurrentShiTiList[ii] = _TaskData.shiti[jj];
                            break;
                        }
                    }
                }
                //审核进度
                var _sum = $.grep(_TaskData.shiti, ele => ele.checkStatus == "已审核").length;
                SetProgressBarAndTaskEndButton(_sum, _TaskData.shiti.length);

                // 更新试题列表字段的结果更新情况和审核情况；更新内存中试题列表
                var indexshitilist = $("#test-item-container").children();
                var secondIndex = 0;
                for (idx = 0; idx < indexshitilist.length; idx++) {
                    var shitiID = $(indexshitilist[idx]).attr("data");
                    for (idx2 = secondIndex; idx2 < _TaskData.shiti.length; idx2++) {
                        if (shitiID == _TaskData.shiti[idx2].shitiID) {
                            if (_TaskData.shiti[idx2].hasNewResult == "true") {
                                $(indexshitilist[idx]).find(".hasNewResult").show();
                                $(indexshitilist[idx]).find(".noNewResult").hide();
                            } else {
                                $(indexshitilist[idx]).find(".noNewResult").show();
                                $(indexshitilist[idx]).find(".hasNewResult").hide();
                            }
                            if (_TaskData.shiti[idx2].checkStatus == "已审核") {
                                $(indexshitilist[idx]).find(".CheckedIcon").show();
                                $(indexshitilist[idx]).find(".notCheckedIcon").hide();
                            } else {
                                $(indexshitilist[idx]).find(".notCheckedIcon").show();
                                $(indexshitilist[idx]).find(".CheckedIcon").hide();
                            }
                            secondIndex++;
                            break;
                        }
                        secondIndex++;
                    }
                }

                var reccheckurltmp = apiconf.n_shitiRecAndCheckResult +
                    "?testEntityId=" + _RecAndCheckData.currentShiTiID +
                    "&taskId=" + TASKID +
                    "&userId=" + userinfo.id;
                return $.ajax({ type: "GET", url: reccheckurltmp, xhrFields: XHRCONF, });
            }).then(reccheckdata => {
                _RecAndCheckData = reccheckdata.data;

                $("#background-test-status").text(_RecAndCheckData.backgroundResult.checkstatus);
                $("#background-testtime").text(_RecAndCheckData.backgroundResult.testTime);
                CACHE_ZhiShiDianResult_Background = null;
                var backgroundurl = apiconf.n_shitiKaoDianReferenceZhiShiDian + "?testQuestionRecId=" + _RecAndCheckData.backgroundResult.ttu_TestQuestionRecID;
                return $.ajax({ type: "GET", url: backgroundurl, xhrFields: XHRCONF })
            }).then(_ => {
                CACHE_ZhiShiDianResult_Background = _.data;

                ttu_TestQuestionRecID = 0;
                if (_RecAndCheckData.popupResult != null) {
                    ttu_TestQuestionRecID = _RecAndCheckData.popupResult.ttu_TestQuestionRecID;
                }

                var popupurl = apiconf.n_shitiKaoDianReferenceZhiShiDian + "?testQuestionRecId=" + ttu_TestQuestionRecID;
                return $.ajax({ type: "GET", url: popupurl, xhrFields: XHRCONF });
            }).then(_ => {
                CACHE_ZhiShiDianResult_Popup = _.data;

                InitBackgroundData(0);

                var ratiourl = apiconf.n_taskAndUserRatio + "?&taskId=" + TASKID + "&userId=" + userinfo.id;
                return $.ajax({ type: "GET", url: ratiourl, xhrFields: XHRCONF });
            }).catch(_ => {
                CACHE_ZhiShiDianResult_Popup = null;

                InitBackgroundData(0);

                var ratiourl = apiconf.n_taskAndUserRatio + "?&taskId=" + TASKID + "&userId=" + userinfo.id;
                return $.ajax({ type: "GET", url: ratiourl, xhrFields: XHRCONF });
            }).then(ratioData => {
                var zhunque = parseFloat(ratioData.data.ratioZhunQue) * 100;
                var keshibie = parseFloat(ratioData.data.ratioKeShiBie) * 100;
                var patt = new RegExp("[0-9]+\\\.[0-9]{2}");
                var zhunqueC = patt.exec(zhunque);
                var keshibieC = patt.exec(keshibie);

                zhunqueC = zhunqueC == null ? zhunque : zhunqueC;
                keshibieC = keshibieC == null ? keshibie : keshibieC;

                $("#task-zhunquelv").text(zhunqueC);
                $("#task-keshibielv").text(keshibieC);

                var shitiurltmp = apiconf.n_memoGet + "?testEntityID=" + _RecAndCheckData.currentShiTiID + "&userID=" + userinfo.id + "&taskID=" + TASKID;
                return $.ajax({ type: "GET", url: shitiurltmp, xhrFields: XHRCONF });
            }).then(_ => {
                if (_.data != null && _.data.length > 0) {
                    $("#textarea-memo").val(_.data);
                    $("#icon-memo").show();
                } else {
                    $("#icon-memo").hide();
                }
                LoadLeftSideCategory();
                RenderColorBlock();
                RefreshEvent();
            });
    } else {
        //提示：当前试题列表为空
    }
}

// 查询标记类型表。查询试题标记表，并且给侧标标签填充数据
function LoadLeftSideCategory() {
    var data1 = null;
    $.ajax({ type: "GET", url: apiconf.n_tagQuery, xhrFields: XHRCONF, })
        .then(data => {
            data1 = data.data;

            var queryUrl = apiconf.n_tagShitTiMogify + "?taskId=" + TASKID + "&userId=" + userinfo.id + "&entityId=" + _RecAndCheckData.currentShiTiID;
            return $.ajax({ type: "GET", url: queryUrl, xhrFields: XHRCONF, });
        }).then(data2 => {
            $("#side-shitiCategory").empty();
            var idddd = 0;

            $.each(data1, (idx, eee) => {
                if (eee.userid == userinfo.id && eee.subjectid == _TaskData.subjectId) {
                    if ($.grep(data2.data, ddd => ddd.categoryName == eee.categoryname).length > 0) {
                        var categoryItem = $("#side-circle-template").clone();
                        $(categoryItem).removeAttr("id");
                        $(categoryItem).attr("title", eee.categoryname);
                        $(categoryItem).attr("categoryid", eee.id);
                        $(categoryItem).css("display", "block");
                        $(categoryItem).css("border-color", GetColorString(idddd));
                        $("#side-shitiCategory").append(categoryItem);
                    }
                    idddd++
                }
            });
            layui.form.render();

        });
}

function LoadQuestionEntity(testEntityId) {
    var loadUrl = apiconf.n_shitidetail + "?testEntityId=" + testEntityId
    $.ajax({ type: "GET", url: loadUrl, xhrFields: XHRCONF, })
        .then(data => {
            _SingleTestData = data.data;
            var x2js = new X2JS();
            var xmlText = _SingleTestData.xml;
            if (xmlText == null) {
                layui.layer.msg("注意！！！该题的试题内容是空的！！！", () => {});
            } else {
                var jsonObj = x2js.xml_str2json(xmlText);
                parseJsonAndRendXML(jsonObj, 0);
            }
            $("#shiti-tixing").text(_SingleTestData.tixing);
            $("#shiti-genre").text(_SingleTestData.genre);
            $("#shiti-version").text(_SingleTestData.version);
        });
}

function RefreshArryData(elementid, dataroute) {
    var checkitems = $("#" + elementid).children();
    var _recAndCheckRouteData = JSONInsight(_RecAndCheckData, dataroute);
    _recAndCheckRouteData.length = 0;
    if (dataroute.indexOf("KaoChaLeiXing") > 0) {
        $.each(checkitems, (_, ele) => {
            _recAndCheckRouteData.push({
                "name": $(ele).attr("name"),
                "databaseRowID": $(ele).attr("databaseRowID")
            });
        });
    } else {
        $.each(checkitems, (_, ele) => {
            _recAndCheckRouteData.push({
                "knowledgeChs": $(ele).attr("knowledgeChs"),
                "knowledgeName": $(ele).attr("knowledgeName"),
                "knowledgeType": $(ele).attr("knowledgeType"),
                "knowledgeVersion": $(ele).attr("knowledgeVersion"),
                "exampleText": $(ele).attr("exampleText"),
                "knowledgeUniqueCode": $(ele).attr("knowledgeUniqueCode"),
                "databaseRowID": $(ele).attr("databaseRowID")
            });
        });
    }

    //以字符串形式访问JSON节点，以“-”做route分隔
    function JSONInsight(jsonData, route) {
        var tailElement = jsonData;
        var splits = route.split('-')
        $.each(splits, (_, ele) => tailElement = tailElement[ele])
        return tailElement;
    }
}

function RefreshEvent() {
    layui.layer.close(GlobalLoadIndex);
    $('.check-lose-weizhizhishidian-msg').click(event => {
        var msg = '【类型】' + $(event.currentTarget).attr("knowledgeType") +
            '<br>【学习阶段】' + $(event.currentTarget).attr("knowledgeVersion") +
            '<br>【示例文本】' + $(event.currentTarget).attr("exampleText");
        layui.layer.tips(msg, event.currentTarget, {
            tips: [1, '#3595CC'],
            time: 7000,
            shadeClose: true,
            shade: 0.06
        });
    });

    $(".check-item").unbind("contextmenu");
    $('.check-item').unbind("click");
    $('.func-copy').unbind("click");
    $(".check-wrong,.check-lose,.check-correct").unbind("contextmenu");

    $('.check-item').on("contextmenu", changeItemColor);
    $('.check-item').on("click", changeItemColor);
    $('.func-copy').on("click", clipboardCopy);


    //右键监听
    $('.check-correct').on("contextmenu", function(e) {
        var menu_data = null;
        if ($(e.currentTarget).closest('#fieldset-hexin').length > 0) {
            menu_data = [
                { 'data': { targetClass: ".shibiecuowu-kaodiancuowu" }, 'type': 1, 'title': '错识别（考点）' },
                { 'data': { targetClass: ".shibiecuowu-zhishidiancuowu" }, 'type': 2, 'title': '错识别（知识点）' },
                { 'data': { targetClass: ".shibiecuowu-shouldbefeihexin", oppositeClass: "#fieldset-feihexin .loushibie-shouldbefeihexin" }, 'type': 3, 'title': '应为 “非核心” 考点' }
            ];
        } else if ($(e.currentTarget).closest('#fieldset-feihexin').length > 0) {
            menu_data = [
                { 'data': { targetClass: ".shibiecuowu-kaodiancuowu" }, 'type': 1, 'title': '错识别（考点）' },
                { 'data': { targetClass: ".shibiecuowu-zhishidiancuowu" }, 'type': 2, 'title': '错识别（知识点）' },
                { 'data': { targetClass: ".shibiecuowu-shouldbehexin", oppositeClass: "#fieldset-hexin .loushibie-shouldbehexin" }, 'type': 3, 'title': '应为 “核心” 考点' }
            ];
        } else if ($(e.currentTarget).closest('#fieldset-zhuti').length > 0) {
            menu_data = [{ 'data': { targetClass: ".shibiecuowu-zhuticuowu" }, 'type': 1, 'title': '错识别' }];
        } else if ($(e.currentTarget).closest('#fieldset-kaochaleixing').length > 0) {
            menu_data = [{ 'data': { targetClass: ".shibiecuowu-kaochaleixingcuowu" }, 'type': 1, 'title': '错识别' }];
        } else if ($(e.currentTarget).closest('#popup-fieldset-hexin').length > 0) {
            menu_data = [
                { 'data': { targetClass: ".shibiecuowu-kaodiancuowu" }, 'type': 1, 'title': '错识别（考点）' },
                { 'data': { targetClass: ".shibiecuowu-zhishidiancuowu" }, 'type': 2, 'title': '错识别（知识点）' },
                { 'data': { targetClass: ".shibiecuowu-shouldbefeihexin", oppositeClass: "#popup-fieldset-feihexin .loushibie-shouldbefeihexin" }, 'type': 3, 'title': '应为 “非核心” 考点' }
            ];
        } else if ($(e.currentTarget).closest('#popup-fieldset-feihexin').length > 0) {
            menu_data = [
                { 'data': { targetClass: ".shibiecuowu-kaodiancuowu" }, 'type': 1, 'title': '错识别（考点）' },
                { 'data': { targetClass: ".shibiecuowu-zhishidiancuowu" }, 'type': 2, 'title': '错识别（知识点）' },
                { 'data': { targetClass: ".shibiecuowu-shouldbehexin", oppositeClass: "#popup-fieldset-hexin .loushibie-shouldbehexin" }, 'type': 3, 'title': '应为 “核心” 考点' }
            ];
        } else if ($(e.currentTarget).closest('#popup-fieldset-zhuti').length > 0) {
            menu_data = [{ 'data': { targetClass: ".shibiecuowu-zhuticuowu" }, 'type': 1, 'title': '错识别' }];
        } else if ($(e.currentTarget).closest('#popup-fieldset-kaochaleixing').length > 0) {
            menu_data = [{ 'data': { targetClass: ".shibiecuowu-kaochaleixingcuowu" }, 'type': 1, 'title': '错识别' }];
        }

        let cconf = {};
        layui.mouseRightMenu.open(menu_data, cconf, function(event) {
            if (event.data.targetClass.indexOf("kaochaleixing") > 0) {
                var textt = $(e.currentTarget).text();
                var boxdiv = $(e.currentTarget).closest('.layui-field-box');
                var pboxdiv = $(e.currentTarget).closest('.div-check-area');
                var pid = $(e.currentTarget).parent().attr("id");
                var originclass = $(e.currentTarget).attr("class");
                var name = $(e.currentTarget).attr("name");
                var databaseRowID = $(e.currentTarget).attr("databaseRowID");
                var currentParentDiv = $(e.currentTarget).parent();
                $(e.currentTarget).remove();
                var appendSampAreaElement = $('<span class="check-item check-wrong"></span>')
                    .attr("originPositionId", pid)
                    .attr("originclass", originclass)
                    .attr("name", name)
                    .attr("databaseRowID", databaseRowID)
                    .attr("moveid", pid + '-' + textt.replace(/[^a-zA-Z]/g, ''))
                    .text(textt);
                $(boxdiv).find(event.data.targetClass).append(appendSampAreaElement);
                //最简单的，每个动作后，内存数据对应节点的数组类型数据直接替换做当前的数据。简单粗暴，但是容易理解，不易出错
                RefreshArryData($(currentParentDiv).attr("id"), $(currentParentDiv).attr("data-route"));
                RefreshArryData($(boxdiv).find(event.data.targetClass).attr("id"), $(boxdiv).find(event.data.targetClass).attr("data-route"));
                if (event.data.oppositeClass) {
                    var appendtt = $('<span class="check-item check-wrong"></span>')
                        .attr("name", name)
                        .attr("databaseRowID", databaseRowID)
                        .attr("originPositionId", pid)
                        .attr("originclass", originclass)
                        .attr("moveid", pid + '-' + textt.replace(/[^a-zA-Z]/g, ''))
                        .text(textt);
                    $(pboxdiv).find(event.data.oppositeClass).append(appendtt);
                    //最简单的，每个动作后，内存数据对应节点的数组类型数据直接替换做当前的数据。简单粗暴，但是容易理解，不易出错
                    RefreshArryData($(pboxdiv).find(event.data.oppositeClass).attr("id"), $(pboxdiv).find(event.data.oppositeClass).attr("data-route"));
                }
            } else {
                var textt = $(e.currentTarget).text();
                var boxdiv = $(e.currentTarget).closest('.layui-field-box');
                var pboxdiv = $(e.currentTarget).closest('.div-check-area');
                var pid = $(e.currentTarget).parent().attr("id");
                var originclass = $(e.currentTarget).attr("class");
                var knowledgeUniqueCode = $(e.currentTarget).attr("knowledgeUniqueCode");
                var knowledgeName = $(e.currentTarget).attr("knowledgeName");
                var databaseRowID = $(e.currentTarget).attr("databaseRowID");
                var currentParentDiv = $(e.currentTarget).parent();
                $(e.currentTarget).remove();
                var appendSampAreaElement = $('<span class="check-item check-wrong"></span>')
                    .attr("originPositionId", pid)
                    .attr("originclass", originclass)
                    .attr("knowledgeUniqueCode", knowledgeUniqueCode)
                    .attr("knowledgeName", knowledgeName)
                    .attr("databaseRowID", databaseRowID)
                    .attr("moveid", pid + '-' + textt.replace(/[^a-zA-Z]/g, ''))
                    .text(textt);
                $(boxdiv).find(event.data.targetClass).append(appendSampAreaElement);
                //最简单的，每个动作后，内存数据对应节点的数组类型数据直接替换做当前的数据。简单粗暴，但是容易理解，不易出错
                RefreshArryData($(currentParentDiv).attr("id"), $(currentParentDiv).attr("data-route"));
                RefreshArryData($(boxdiv).find(event.data.targetClass).attr("id"), $(boxdiv).find(event.data.targetClass).attr("data-route"));
                if (event.data.oppositeClass) {
                    var appendtt = $('<span class="check-item check-wrong"></span>')
                        .attr("knowledgeUniqueCode", knowledgeUniqueCode)
                        .attr("knowledgeName", knowledgeName)
                        .attr("databaseRowID", databaseRowID)
                        .attr("originPositionId", pid)
                        .attr("originclass", originclass)
                        .attr("moveid", pid + '-' + textt.replace(/[^a-zA-Z]/g, ''))
                        .text(textt);
                    $(pboxdiv).find(event.data.oppositeClass).append(appendtt);
                    //最简单的，每个动作后，内存数据对应节点的数组类型数据直接替换做当前的数据。简单粗暴，但是容易理解，不易出错
                    RefreshArryData($(pboxdiv).find(event.data.oppositeClass).attr("id"), $(pboxdiv).find(event.data.oppositeClass).attr("data-route"));
                }
            }

            RenderColorBlock();
            RefreshEvent();
        })
        return false;
    });
    // 撤销审核
    $('.check-wrong,.check-lose').on("contextmenu", function(e) {
        layer.msg('要撤销此审核吗？', {
            time: 0,
            btn: ['是', '否'],
            offset: [$(e.currentTarget).offset().top + 'px', $(e.currentTarget).offset().left + 120 + 'px'],
            yes: function(index) {
                layer.close(index);
                var bo1 = $($(e.currentTarget).parent()).hasClass("loushibie-kaodianloushibie");
                var bo2 = $($(e.currentTarget).parent()).hasClass("loushibie-zhishidianloushibe");
                var bo3 = $($(e.currentTarget).parent()).hasClass("loushibie-weizhizhishidian");
                var bo4 = $($(e.currentTarget).parent()).hasClass("loushibie-zhishidiantezheng");
                var bo5 = $($(e.currentTarget).parent()).hasClass("loushibie-kaochaleixinglou");
                var bo6 = $($(e.currentTarget).parent()).hasClass("loushibie-zhutilou");

                if (bo1 || bo2 || bo3 || bo4 || bo5 || bo6) {
                    var currentParentDiv = $(e.currentTarget).parent();
                    $(e.currentTarget).remove();
                    RefreshArryData($(currentParentDiv).attr("id"), $(currentParentDiv).attr("data-route"));
                } else {
                    var originid = $(e.currentTarget).attr('originPositionId');
                    var mvid = $(e.currentTarget).attr('moveid');
                    var originclass = $(e.currentTarget).attr('originclass');
                    var knowledgeUniqueCode = $(e.currentTarget).attr("knowledgeUniqueCode");
                    var knowledgeName = $(e.currentTarget).attr("knowledgeName");
                    var databaseRowID = $(e.currentTarget).attr("databaseRowID");
                    var textt = $(e.currentTarget).text();
                    var currentParentDiv = $("span[moveid='" + mvid + "']").parent();
                    $("span[moveid='" + mvid + "']").remove();
                    $.each($(currentParentDiv), (_, ele) => {
                        RefreshArryData($(ele).attr("id"), $(ele).attr("data-route"));
                    });
                    var appele = $('<span>')
                        .attr("class", originclass)
                        .attr("knowledgeUniqueCode", knowledgeUniqueCode)
                        .attr("knowledgeName", knowledgeName)
                        .attr("databaseRowID", databaseRowID)
                        .attr("originPositionId", originid).text(textt);

                    $('#' + originid).append(appele);
                    RefreshArryData($('#' + originid).attr("id"), $('#' + originid).attr("data-route"));
                }
                RenderColorBlock();
                RefreshEvent();
            }
        });
        return false;
    });

    function clipboardCopy(event) {
        var selection = window.getSelection();
        selection.removeAllRanges();
        var range = document.createRange();
        range.selectNodeContents(event.currentTarget);
        selection.addRange(range);
        document.execCommand('copy');
        layui.layer.msg($(event.currentTarget).text() + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;复制成功", { time: 700 });
    }

    function changeItemColor(e) {
        if (e.type == "click") {
            if ($(e.currentTarget).hasClass('shenhequote-select')) {
                $('.check-item').removeClass('shenhequote-select')
            } else {
                $('.check-item').removeClass('shenhequote-select')
                $(e.currentTarget).addClass('shenhequote-select')
            }
        } else {
            $('.check-item').removeClass('shenhequote-select')
            $(e.currentTarget).addClass('shenhequote-select')
        }
        return false;
    }
}


function OpenNewResult() {
    RenderColorBlock();
    var new_testtime = _RecAndCheckData.popupResult.testTime;
    var new_checkstatus = _RecAndCheckData.popupResult.checkstatus;

    let ttitle = '<b style="margin-right:20px;">最新结果</b> 测试时间：<span  class="text-show">' + new_testtime + '</span>  <b>（' + new_checkstatus + '）</b>';

    let layerindex = layer.open({
        type: 1,
        shadeClose: false,
        shade: 0,
        closeBtn: 0,
        maxmin: true,
        area: ['41%', '85vh'],
        content: $("#popup-rec-history"),
        btn: "确认审核",
        offset: ["55px", "3px"],
        resize: true,
        title: ttitle,
        success: function(layero) {
            $(".layui-layer-max").css("display", "none");
            $("#button-zuixinjieguo").hide();
            RefreshEvent();
        },
        yes: _ => PopupPostCheck(_RecAndCheckData.popupResult),
        min: _ => {
            layui.layer.close(layerindex);
            $("#button-zuixinjieguo").show();
        },
        restore: _ => $(".layui-layer-max").css("display", "none"),
        end: _ => {
            $("#header-bar").css({ "z-index": 1000 });
            $("#popup-detail-check").hide();
        }
    });
}

//表示数量的色块大小控制，还有popup里区分新识别的还是
function RenderColorBlock() {
    $.each($(".layui-field-box"), (_, ele) => {
        let sum = 0;
        $.each($(ele).children(), (_, item) => sum += $(item).find("blockquote").children().length);
        $.each($(ele).children(), (_, item) => {
            var count = 80 * $(item).find("blockquote").children().length;
            var wid = "1px";
            if (count > 0) {
                wid = count / sum < 10 ? 10 : count / sum + "px";
                $(item).show();
                $(item).find("blockquote").css("border-left-width", wid);
            } else {
                $(item).hide();
            }
        });
    });
}

function SetProgressBarAndTaskEndButton(curr, total) {
    let pe = curr * 100 / total;
    var patt = new RegExp("[0-9]+\\\.[0-9]{2}");
    if (patt.test(pe + "00")) { pe = patt.exec(pe + "00"); }
    pe = pe + "%";
    let ratioNumber = pe + "（" + curr + "/" + total + "）";
    var yishenhe = $.grep(_TaskData.shiti, ele => ele.checkStatus == "已审核");
    var hasNew = $.grep(_TaskData.shiti, ele => ele.hasNewResult == "true");
    if (yishenhe.length == _TaskData.shiti.length && hasNew.length == 0) {
        $("#button-background-task-submit").removeClass("layui-btn-disabled");
    } else {
        $("#button-background-check-submit").removeClass("layui-btn-disabled");
        $("#button-background-task-submit").addClass("layui-btn-disabled");
    }
    setTimeout(_ => layui.element.progress('shenhe-progress', pe, ratioNumber), 400);
}

function parseJsonAndRendXML(obj, deep, tihao) {
    $("#entity-content").empty();
    pJsonInner(obj, deep, tihao);

    function pJsonInner(obj, deep, tihao) {
        if (isnotund(obj.TContent)) {
            pJsonInner(obj.TContent, deep);
        } else {
            deep++;
            if (isnotund(obj.QuesArticle) || isnotund(obj.Quesbody) || isnotund(obj.QuesLead) || isnotund(obj.Quesbody)) {
                if (isnotund(obj.QuesArticle) && isnotund(obj.QuesArticle.__text)) {
                    entityappend("<b>题干Article：</b>", deep);
                    entityappend(obj.QuesArticle.__text, deep + 2);
                }
                if (isnotund(obj.Quesbody) && obj.Quesbody != "") {
                    entityappend("<b>题干Body：</b>", deep);
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


                if (isnotund(obj.QuesLead) || isnotund(obj.QuesGroupBody)) {
                    if (isnotund(obj.QuesLead) && obj.QuesLead != "") {
                        entityappend("<b></b>", deep);
                        entityappend(obj.QuesLead, deep + 2);
                    }
                    if (isnotund(obj.QuesGroupBody) && obj.QuesGroupBody != "") {
                        entityappend("<b></b>", deep);
                        entityappend(obj.QuesGroupBody, deep + 2);
                    }
                }

                if (isnotund(obj.QuesChild)) {
                    if (isnotund(tihao)) {
                        if (obj.QuesChild instanceof Array) {
                            for (j = 0; j < obj.QuesChild.length; j++) {
                                pJsonInner(obj.QuesChild[j], deep + 1, tihao + "-" + (j + 1).toString());
                            }
                        } else {
                            pJsonInner(obj.QuesChild, deep, tihao + "-" + 1);
                        }
                    } else {
                        if (obj.QuesChild instanceof Array) {
                            for (jj = 0; jj < obj.QuesChild.length; jj++) {
                                pJsonInner(obj.QuesChild[jj], deep + 1, (jj + 1).toString());
                            }
                        } else {
                            pJsonInner(obj.QuesChild, deep);
                        }
                    }
                }
                if (isnotund(obj.QuesGroup)) {
                    if (obj.QuesGroup instanceof Array) {
                        for (jjj = 0; jjj < obj.QuesGroup.length; jjj++) {
                            pJsonInner(obj.QuesGroup[jjj], deep, jjj + 1);
                        }
                    } else {
                        pJsonInner(obj.QuesGroup, deep, deep);
                    }
                }
            } else {
                if (isnotund(tihao)) {
                    entityappend("<b>（" + tihao + "）</b>", deep);
                }
                let QueStem = getmixval(obj.QueStem);
                let QuesAnalyze = getmixval(obj.QuesAnalyze);
                let QuesAnswer = getmixval(obj.QuesAnswer);
                let QuesOptionAsk = getmixval(obj.QuesOptionAsk);
                if (QueStem != "") {
                    entityappend("<b>题干Stem：</b>", deep);
                    entityappend(QueStem, deep + 2);
                }
                if (QuesOptionAsk != "") {
                    entityappend("<b>题干Ask:</b>", deep);
                    entityappend(QuesOptionAsk, deep + 2);
                }

                if (obj.QuesOptionAsk instanceof Array) {
                    entityappend("<b>选项</b>", deep + 4);
                    for (ii = 0; ii < obj.QuesOptionAsk.length; ii++) {
                        let ttt = "<b>  [" + obj.QuesOptionAsk[ii]._index + "]：</b> " + obj.QuesOptionAsk[ii].__text;
                        entityappend(ttt, deep + 4);
                    }
                }
                if (obj.QuesAnswer instanceof Array) {
                    entityappend("<b>答案</b>", deep + 4);
                    for (ii = 0; ii < obj.QuesAnswer.length; ii++) {
                        let ttt = "<b>  [" + (ii + 1) + "]：</b> " + obj.QuesAnswer[ii].QuesAnswerChild.__text;
                        entityappend(ttt, deep + 4);
                    }
                }
                if (obj.QuesAnalyze instanceof Array) {
                    entityappend("<b>解析</b>", deep + 4);
                    for (ii = 0; ii < obj.QuesAnalyze.length; ii++) {
                        if (isnotund(obj.QuesAnalyze[ii].__text)) {
                            let ttt = "<b>  [" + (ii + 1) + "]：</b> " + obj.QuesAnalyze[ii].__text;
                            entityappend(ttt, deep + 4);
                        } else {
                            let ttt = "<b>  [" + (ii + 1) + "]：</b> " + obj.QuesAnalyze[ii];
                            entityappend(ttt, deep + 4);
                        }
                    }
                }
                if (isnotund(obj.QuesAnswer.QuesAnswerChild)) {
                    let ttt = "<b>答案：</b>" + obj.QuesAnswer.QuesAnswerChild.__text;
                    entityappend(ttt, deep + 4);
                }

                if (obj.QuesOption instanceof Array) {
                    entityappend("<b>选项</b>", deep + 4);
                    for (ii = 0; ii < obj.QuesOption.length; ii++) {
                        let ttt = "<b>   选项[" + obj.QuesOption[ii]._index + "]：</b>" + obj.QuesOption[ii].__text;
                        entityappend(ttt, deep + 4);
                    }
                    if (QuesAnswer != "") {
                        entityappend("<b>答案：</b>" + QuesAnswer, deep);
                    }
                } else {
                    if (QuesAnswer != "") {
                        entityappend("<b>答案：</b>" + QuesAnswer, deep);
                    }
                }
                if (QuesAnalyze != "") {
                    entityappend("<b>解析：</b>" + QuesAnalyze, deep);
                }
                if (isnotund(obj.QuesChild)) {
                    if (obj.QuesChild instanceof Array) {
                        for (j = 0; j < obj.QuesChild.length; j++) {
                            pJsonInner(obj.QuesChild[j], deep, (j + 1).toString());
                        }
                    } else {
                        pJsonInner(obj.QuesChild, deep, "1");
                    }
                }
            }
        }
    }
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

function isnotund(obj) {
    var bb1 = typeof(obj) != "undefined";
    var bb2 = obj != null;;
    return bb1 && bb2
}

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

function entityappend(text, px) {
    if (isnotund(px)) {
        $("#entity-content").append('<div class="shiti-content" style="padding-left:' + px * 9 + 'px">' + text + "</div>");
    } else {
        $("#entity-content").append('<div class="shiti-content" >' + text + "</div>");
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function GetColorString(indd) {
    var colors = ["red", "orange", "yellow", "green", "blue", "#00ffff", "violet", "black"];
    return colors[indd % 8];
}

function RightClickCategory() {
    $('.layui-form-checkbox').on("contextmenu", function(revent) {
        var innput = $(revent.currentTarget).prev();
        var ddd = { categoryID: $(innput).attr("catetoryID"), tegoryName: $(innput).attr("title") }
        menu_data = [
            { 'data': ddd, 'type': 1, 'title': '删除' },
            { 'data': ddd, 'type': 2, 'title': '修改' }
        ];
        let cconf = {};
        layui.mouseRightMenu.open(menu_data, cconf, function(event) {
            if (event.title == "删除") {
                $.ajax({
                    type: "POST",
                    url: apiconf.n_tagDelete,
                    contentType: "application/json",
                    xhrFields: XHRCONF,
                    data: '{"categoryname":"' + event.data.tegoryName + '","userid":' + userinfo.id + ',"id":' + event.data.categoryID + '}'
                }).then(deleD => {
                    if (deleD.data == 0) {
                        layui.layer.msg("存在与该标签关联的试题，不能删除！");
                    } else {
                        $(revent.currentTarget).parent().remove();
                    }

                })
            } else if (event.title == "修改") {
                layer.prompt({ title: '修改标签（原标签：' + event.data.tegoryName + '）', formType: 2 }, function(text, index) {
                    var ctitle = text;
                    if (ctitle != "") {
                        if ($("input[title='" + ctitle + "']").length > 0) {
                            layui.layer.msg("存在此名称标签，不允许修改为此名称");
                        } else {
                            var createobj = {
                                "categoryname": ctitle,
                                "userid": userinfo.id,
                                "id": event.data.categoryID,
                                "subjectid": _TaskData.subjectId
                            };
                            $.ajax({
                                type: "POST",
                                url: apiconf.n_tagChange,
                                contentType: "application/json",
                                xhrFields: XHRCONF,
                                data: JSON.stringify(createobj)
                            }).then(deleD => {
                                layer.msg('修改成功');
                                $(revent.currentTarget).prev().attr("title", ctitle);
                                $(revent.currentTarget).prev().attr("catetoryID", event.data.categoryID);
                                layui.form.render();
                                RightClickCategory();
                                layui.layer.close(index);
                            })
                        }
                    }
                });
            }
        });
        return false;
    });
}