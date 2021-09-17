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

function InitBackgroundData(index) {
    // 初步数据检查
    if (_RecAndCheckData == null) {
        layui.layer.msg("该题识别结果为空！！！", () => {});
        return;
    }
    //控制button显示/隐藏
    $("#button-zuixinjieguo").hide();
    if (_RecAndCheckData.popupResult != null) {
        $("#button-zuixinjieguo").show();
        $("#button-zuixinjieguo").click(_ => OpenNewResult());
    }


    $("#background-checkpage").find(".shenhequote").empty();

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
    RenderColorBlock();
    PopupDataFill(index);

    //关闭全局加载动画
    layui.layer.close(GlobalLoadIndex);
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
    var AllK = CACHE_ZhiShiDianResult_Popup[index].allZhiShiDian
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
    t4 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, HeXinIni);
    t4 = _minus(t4, AllK);
    t4 = _minus(t4, FeiHeXinIni);
    t5 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.correct, HeXinIni);
    t5 = _minus(t5, AllK);
    t5 = _minus(t5, FeiHeXinIni);
    t6 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonFeiHeXinKaoDian, HeXinIni);
    t6 = _minus(t6, FeiHeXinIni);
    t6 = _intersect(t6, AllK);
    // _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDian = _merge(_merge(t1, t2), _merge(t3, _merge(t4, t5)));
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDian = _merge(_merge(_merge(t1, t2), _merge(t4, t5)), t6);

    //遗漏类型3
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu, HeXinIni);
    t1 = _minus(t1, AllK);
    t1 = _minus(t1, FeiHeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDianKu = t1;

    //遗漏类型4
    t1 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, HeXinIni);
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
    t4 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, FeiHeXinIni);
    t4 = _minus(t4, AllK);
    t4 = _minus(t4, HeXinIni);
    t5 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.correct, FeiHeXinIni);
    t5 = _minus(t5, AllK);
    t5 = _minus(t5, HeXinIni);
    t6 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonHeXinKaoDian, HeXinIni);
    t6 = _minus(t6, FeiHeXinIni);
    t6 = _intersect(t6, AllK);
    // _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian = _merge(_merge(t1, t2), _merge(t3, _merge(t4, t5)));
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDian = _merge(_merge(_merge(t1, t2), _merge(t4, t5)), t6);

    //遗漏类型3
    t1 = _minus(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu, FeiHeXinIni);
    t1 = _minus(t1, AllK);
    t1 = _minus(t1, HeXinIni);
    _RecAndCheckData.popupResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianKu = t1;

    //遗漏类型4
    t1 = _intersect(_RecAndCheckData.backgroundResult.data[index].checkResultFeiHeXin.loseReasonZhiShiDianTeZheng, FeiHeXinIni);
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
            $("#popup-hexinkaodian-wrongReasonKaoDian").append(_element);
        });
        $("#popup-hexinkaodian-wrongReasonZhiShiDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-wrongReasonZhiShiDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonZhiShiDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $("#popup-hexinkaodian-wrongReasonZhiShiDian").append(_element);
        });
        $("#popup-hexinkaodian-wrongReasonFeiHeXinKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-wrongReasonFeiHeXinKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.wrongReasonFeiHeXinKaoDian, (_, ele) => {
            var _element = _WrongElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $("#popup-hexinkaodian-wrongReasonFeiHeXinKaoDian").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonKaoDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonKaoDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonKaoDian, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
            $("#popup-hexinkaodian-loseReasonKaoDian").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonZhiShiDian")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDian");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDian, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
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
            $("#popup-hexinkaodian-loseReasonZhiShiDianKu").append(_element);
        });
        $("#popup-hexinkaodian-loseReasonZhiShiDianTeZheng")
            .attr("data-route", "popupResult-data-" + index + "-checkResultHeXin-loseReasonZhiShiDianTeZheng");
        $.each(_RecAndCheckData.popupResult.data[index].checkResultHeXin.loseReasonZhiShiDianTeZheng, (_, ele) => {
            var _element = _LoseElement(ele.knowledgeName, ele.knowledgeUniqueCode, ele.databaseRowID);
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
            $("#popup-feihexinkaodian-loseReasonHeXinKaoDian").append(_element);
        });
    }

    //popup主题
    $.each(_RecAndCheckData.popupResult.data[index].checkResultZhuTi.correct, (_, ele) => {
        $("#popup-zhuti-correct").append($('<span class="check-item check-correct"></span>').text(ele.knowledgeName));
    });
    $.each(_RecAndCheckData.popupResult.data[index].checkResultZhuTi.wrong, (_, ele) => {
        $("#popup-zhuti-wrong").append($('<span class="check-item check-wrong"></span>').text(ele.knowledgeName));
    });
    $.each(_RecAndCheckData.popupResult.data[index].checkResultZhuTi.lose, (_, ele) => {
        $("#popup-zhuti-lose").append($('<span class="check-item check-lose"></span>').text(ele.knowledgeName));
    });
    RenderColorBlock();
    RefreshEvent();

}