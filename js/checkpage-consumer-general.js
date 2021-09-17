$(() => LoadWholePage());
///Global Variable
XHRCONF = { withCredentials: true };
currentShiTiIndex = 0;

staticQuestionTypeID = "";
staticKnowledgeType = "";
staticKnowledgeID = "";
_SingleTestData = null; //试题xml，题型，体裁等信息，由接口加载而来的全局缓存
_TaskData = null; //任务信息，试题列表加载
_RecAndCheckData = {}; //试题识别与审核信息

_TIXINGTYPE = []; //暂未实现
_TICAI = []; //暂未实现
_XUEXIJIEDUAN = []; //暂未实现

CurrentShiTiList = [];
CurrentShiTiListPage = [];
TASKID = null;
SHITIINDEX = null;

leftBottomShiTiListPopupLayerIndex = null;
leftBottomShiTiListPopupLayerIndexAdvanced = null;

GlobalLoadIndex = 0;
LoseZHUTI = null;
knowledgeResultForZhuTi = [];
CACHE_ZhiShiDianResult_Background = null;
CACHE_ZhiShiDianResult_Popup = null;
LoseKaoDian = null;
knowledgeResultForKaoDian = [];
topRightTiHaoLayerIndex = [];

///通过URL访问，初次加载页面
function LoadWholePage() {
    staticQuestionTypeID = getQueryVariable("SQuestionTypeID");
    staticKnowledgeType = getQueryVariable("KnowledgeTypeName");
    staticKnowledgeID = getQueryVariable("sKnowledgeID");
    statictitle = decodeURIComponent(getQueryVariable("stitle"));
    $("#span-stitle").text(statictitle);
    //页面方法注册
    EventRegister();
    InitPage();
}

function InitPage() {
    // GlobalLoadIndex = layui.layer.load(0, { shade: 0.25 });
    //加载任务整体信息
    var taskdetailurl = apiconf.n_staticQuestionDetailLoseQuery + "?sQuestionTypeId=" + staticQuestionTypeID + "&knowledgeType=" + staticKnowledgeType;
    //确实是根据错识别还是漏识别定位
    var stp = getQueryVariable("stype");
    //确定是根绝考点定位还是考点类型定位，两个页面
    var statictp = getQueryVariable("staticType");
    if (statictp == "kptype") {
        if (stp == "wrong") {
            taskdetailurl = apiconf.n_staticQuestionDetailWrongQuery + "?sQuestionTypeId=" + staticQuestionTypeID + "&knowledgeType=" + staticKnowledgeType;
        }
    } else {
        taskdetailurl = apiconf.n_staticQuestionDetailLoseQueryKnowledge + "?sKnowledgeId=" + staticKnowledgeID;
        if (stp == "wrong") {
            taskdetailurl = apiconf.n_staticQuestionDetailWrongQueryKnowledge + "?sKnowledgeId=" + staticKnowledgeID;
        }
    }

    $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF })
        .then(data => {
            _TaskData = data.data;
            // layui.layer.close(tmpLoadIndex);
            CurrentShiTiListPage = _TaskData;

            InitLeftBottomShiTiList(_TaskData, 0);
            LocateToTiHao(0);
            layui.form.render();
        });
}

function EventRegister() {
    //浏览器窗体改变事件
    WindowSizeChangeEvent();

    function WindowSizeChangeEvent() {
        adjusthheight = window.innerHeight - 77 - 40 - 45 - 23;
        $("#testoverview").css("height", adjusthheight);
        $("#background-checkpage").css("height", adjusthheight);
        $(window).resize(_ => {
            adjusthheight = window.innerHeight - 77 - 40 - 45;
            $("#testoverview").css("height", adjusthheight);
            $("#background-checkpage").css("height", adjusthheight);
        });
    }

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
                area: ['430px', hei + 90 + 'px'],
                success: function() {
                    $("#test-item-container").css("height", hei + 42 + "px");
                    $("#test-item-container").css("overflow-y", "auto");
                    //试题ID定位到可视区域
                    var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + currentShiTiIndex).offset().top - $("#test-item-container").offset().top - 100;
                    $("#test-item-container").scrollTop(topdistance);
                }
            });
        } else {
            $("#button-shitilist-show").css("display", "inline-block");
            $("#button-shitilist-hide").hide();
            layer.close(leftBottomShiTiListPopupLayerIndex);
        }
    });

    var select_items = "#new-result-select";
    $(select_items).change(event => {
        var vv1 = $("#new-result-select").val();
        InitLeftBottomShiTiList(CurrentShiTiListPage, 0, vv1);
    });

    //左侧试题显示区域点击控制关闭左下侧试题列表弹窗
    $("#testoverview").click(_ => {
        $("#button-shitilist-show").css("display", "inline-block");
        $("#button-shitilist-hide").hide();
        layer.close(leftBottomShiTiListPopupLayerIndex);
    });

    //上一题
    $("#button-shiti-previous").click(_ => {
        if (currentShiTiIndex == 0) {
            layui.layer.msg("已经是第一个题了！", { "time": 400 });
        } else {
            currentShiTiIndex -= 1;
        }
        LocateToTiHao(currentShiTiIndex);
        var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + currentShiTiIndex).offset().top - $("#test-item-container").offset().top - 100;
        $("#test-item-container").scrollTop(topdistance);
    });
    //下一题
    $("#button-shiti-next").click(_ => NextOne());
}

function NextOne() {
    if (currentShiTiIndex == CurrentShiTiList.length - 1) {
        layui.layer.msg("已经是最后一个题了！", { "time": 400 });
    } else {
        currentShiTiIndex += 1;
    }
    LocateToTiHao(currentShiTiIndex);
    var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + currentShiTiIndex).offset().top - $("#test-item-container").offset().top - 100;
    $("#test-item-container").scrollTop(topdistance);
}

function InitBackgroundData(index) {
    $("#background-checkpage").find(".shenhequote").empty();
    if (_RecAndCheckData == null || _RecAndCheckData.backgroundResult.data.length == 0) {
        layui.layer.msg("该题识别结果为空！！！", () => {});
        layui.layer.close(GlobalLoadIndex);
        return;
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
            "class": "check-item check-wrong",
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
            "class": "check-item check-lose",
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
                "class": "check-item check-correct",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
            $("#background-hexinkaodian-loseReasonKaoDian").append(_element);
        });
        $("#background-hexinkaodian-loseReasonZhiShiDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDian, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $("#background-hexinkaodian-loseReasonZhiShiDian").append(_element);
        });
        $("#background-hexinkaodian-loseReasonZhiShiDianKu")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDianKu");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
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
            $("#background-hexinkaodian-loseReasonZhiShiDianTeZheng").append(_element);
        });
        $("#background-hexinkaodian-loseReasonFeiHeXinKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultHeXin-loseReasonFeiHeXinKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
                "class": "check-item check-correct",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
                "class": "check-item check-wrong",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
                "class": "check-item check-wrong",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
                "class": "check-item check-wrong",
                "originpositionid": "background-feihexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-feihexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
                "class": "check-item check-lose",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $("#background-feihexinkaodian-loseReasonKaoDian").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonZhiShiDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
            $("#background-feihexinkaodian-loseReasonZhiShiDian").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonZhiShiDianKu")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonZhiShiDianKu");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-lose",
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
            $("#background-feihexinkaodian-loseReasonZhiShiDianTeZheng").append(_element);
        });
        $("#background-feihexinkaodian-loseReasonHeXinKaoDian")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultFeiHeXin-loseReasonHeXinKaoDian");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian, (_, ele) => {
            var _element = $('<span>', {
                "class": "check-item check-wrong",
                "originpositionid": "background-hexinkaodian",
                "originclass": "check-item check-correct",
                "moveid": "background-hexinkaodian-" + ele.knowledgeName.replace(/[^a-zA-Z]/g, ''),
                "knowledgeUniqueCode": ele.knowledgeUniqueCode,
                "knowledgeName": ele.knowledgeName,
                "databaseRowID": ele.databaseRowID
            }).text(ele.knowledgeName);
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
            }).text(knowledgeName);
        }
        //background主题
        $("#background-zhuti-correct")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultZhuTi-correct");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultZhuTi.correct, (_, ele) => {
            var _element = _ZhuTiElement("check-item check-correct", ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $("#background-zhuti-correct").append(_element);
        });
        $("#background-zhuti-wrong")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultZhuTi-wrong");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultZhuTi.wrong, (_, ele) => {
            var _element = _ZhuTiElement("check-item check-wrong", ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $("#background-zhuti-wrong").append(_element);
        });
        $("#background-zhuti-lose")
            .attr("data-route", "backgroundResult-data-" + index + "-checkResultZhuTi-lose");
        $.each(_RecAndCheckData.backgroundResult.data[index].checkResultZhuTi.lose, (_, ele) => {
            var _element = _ZhuTiElement("check-item check-lose", ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $("#background-zhuti-lose").append(_element);
        });
    }
    layui.layer.close(GlobalLoadIndex);
    RenderColorBlock();
}

//如果是第一次加载，则按选择的结果展示，如果不是第一次加载，则按上一次的历史展示
function InitLeftBottomShiTiList(shitiList, cindex) {

    var shitidata = shitiList;

    CurrentShiTiList = shitidata;

    if (shitidata != null && shitidata.length > 0) {
        _RecAndCheckData.currentShiTiID = shitidata[0].testEntityId;
        LocateToTiHao(0);
    }
    $("#test-item-container").empty();
    $.each(shitidata, (ind, ele) => {
        var temphtml =
            '<div class="test-item-index" style="display: none;">' +
            '  <div class="layui-row">' +
            '    <div class="layui-col-xs2 tihao-index" style="text-align: left;padding-left: 15px;"></div>' +
            '    <div class="layui-col-xs4 tihao-content" style="text-align: left;"></div>' +
            '    <div class="layui-col-xs6 category-content" style="text-align: left;"></div>' +
            '  </div>' +
            '</div>';
        var itemIndex = $(temphtml);
        $(itemIndex).find(".tihao-index").text(ind + 1);
        $(itemIndex).attr("id", "tihao-index-" + ind);
        $(itemIndex).attr("data", ind);
        let tttt = ele.testEntityId;

        var noNewResult = '<span class="hasNewResult" style="display:none;"><span class="layui-badge-dot layui-bg-orange" style="margin-right:10px"></span></span>' +
            '<span class="noNewResult"><span style="margin-right:18px;"></span></span>';

        var notCheckedIcon = '<span class="CheckedIcon"  style="display:none;"><span style="display:inline-block;width:10px;margin-left:10px;"><i class="layui-icon layui-icon-ok" style="font-size: 30px; color: #1E9FFF;font-size:x-small"></i></span></span>' +
            '<span class="notCheckedIcon"><span style="display:inline-block;width:10px;height:1px;"></span></span>';


        tttt = noNewResult + tttt + notCheckedIcon;
        $(itemIndex).find(".tihao-content").html(tttt);
        $(itemIndex).show();
        if (ind == cindex) {
            $(itemIndex).css("background", "tomato");
        }
        $(itemIndex).find(".category-content").html('<span>' + ele.checkKaoDianStatus + '</span>');

        $("#test-item-container").append(itemIndex);
    });
    $(".total-shiti").text(shitidata.length);

    //注册选择小题的事件操作
    $(".test-item-index").click(event => {
        //切换当前试题ID；列表试题ID显示背景；左下角试题ID；试题区域试题信息
        var indexxx = parseInt($(event.currentTarget).attr("data"));
        currentShiTiIndex = indexxx;
        LocateToTiHao(indexxx);
    });
}

function LocateToTiHao(shitiIndex) {
    GlobalLoadIndex = layui.layer.load(0, { shade: 0.25 });
    //进入某小题审核结果的入口方法
    //缓存存在试题列表信息则直接使用，否则字形重新加载
    if (CurrentShiTiList != null && CurrentShiTiList.length > 0) {
        $("#shiti-account").text(_TaskData[shitiIndex].userName);
        $("#shiti-task").attr("title", _TaskData[shitiIndex].taskName);
        $("#shiti-task").text(_TaskData[shitiIndex].taskName);
        if (_TaskData[shitiIndex].taskName.length > 24) {
            var staskname = _TaskData[shitiIndex].taskName.substring(0, 24);
            $("#shiti-task").text(staskname);
        }

        _RecAndCheckData.currentShiTiID = _TaskData[shitiIndex].testEntityId;
        //设置Index信息等
        $("#current-shitiID-progress").text("（" + (shitiIndex + 1) + "/" + CurrentShiTiList.length + "）");
        var currentshitidiv = $("#test-item-container").find("#tihao-index-" + shitiIndex);
        $(".test-item-index").css("background", "");
        $(currentshitidiv).css("background", "tomato");
        $("#current-shitiID").text(_RecAndCheckData.currentShiTiID);
        $("#show-shitiId").text(_RecAndCheckData.currentShiTiID);

        LoadQuestionEntity(_RecAndCheckData.currentShiTiID);

        var reccheckurltmp = apiconf.n_shitiRecAndCheckResult +
            "?testEntityId=" + _TaskData[shitiIndex].testEntityId +
            "&taskId=" + _TaskData[shitiIndex].taskId +
            "&userId=" + _TaskData[shitiIndex].userId;
        $.ajax({ type: "GET", url: reccheckurltmp, xhrFields: XHRCONF, }).then(reccheckdata => {
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
            InitBackgroundData(0);
            RenderColorBlock();
        });
    }
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
    $.each(checkitems, (_, ele) => {
        _recAndCheckRouteData.push({
            "knowledgeName": $(ele).attr("knowledgeName"),
            "knowledgeType": $(ele).attr("knowledgeType"),
            "knowledgeVersion": $(ele).attr("knowledgeVersion"),
            "exampleText": $(ele).attr("exampleText"),
            "knowledgeUniqueCode": $(ele).attr("knowledgeUniqueCode"),
            "databaseRowID": $(ele).attr("databaseRowID")
        });
    });
    //以字符串形式访问JSON节点，以“-”做route分隔
    function JSONInsight(jsonData, route) {
        var tailElement = jsonData;
        var splits = route.split('-')
        $.each(splits, (_, ele) => tailElement = tailElement[ele])
        return tailElement;
    }
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

function parseJsonAndRendXML(obj, deep, tihao) {
    $("#entity-content").empty();
    pJsonInner(obj, deep, tihao);

    function pJsonInner(obj, deep, tihao) {
        if (isnotund(obj.TContent)) {
            pJsonInner(obj.TContent, deep);
        } else {
            deep++;
            if (isnotund(obj.QuesArticle) || isnotund(obj.Quesbody)) {
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
                if (isnotund(obj.QuesChild)) {
                    if (obj.QuesChild instanceof Array) {
                        for (j = 0; j < obj.QuesChild.length; j++) {
                            pJsonInner(obj.QuesChild[j], deep, (j + 1).toString());
                        }
                    } else {
                        pJsonInner(obj.QuesChild, deep);
                    }
                }
            } else {
                if (isnotund(tihao)) {
                    var tihao = (deep - 1).toString() + "-" + tihao;
                    entityappend("<b>（" + tihao + "）</b>", deep);
                }
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

function entityappend(text, px) {
    if (isnotund(px)) {
        $("#entity-content").append('<div style="padding-left:' + px * 9 + 'px">' + text + "</div>");
    } else {
        $("#entity-content").append("<div>" + text + "</div>");
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