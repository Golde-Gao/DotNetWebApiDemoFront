$(() => LoadWholePage());
///Global Variable
XHRCONF = { withCredentials: true };

_SingleTestData = null; //试题xml，题型，体裁等信息，由接口加载而来的全局缓存
_TaskData = null; //任务信息，试题列表加载
_RecAndCheckData = {}; //试题识别与审核信息

CurrentShiTiList = [];
TASKID = null;
SHITIINDEX = null;

leftBottomShiTiListPopupLayerIndex = null;
rightlayindex = null;

SHOWTASKNAME = "";
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
    GlobalLoadIndex = layui.layer.load(0, { shade: 0.25 });

    SHOWTASKNAME = decodeURIComponent(getQueryVariable("taskname"));
    TASKID = getQueryVariable("backgroundtaskid");
    TASKID_popup = getQueryVariable("popuptaskid");
    USERID = getQueryVariable("backgrounduserid");
    USERID_popup = getQueryVariable("popupuserid");
    USERIDNAME = decodeURIComponent(getQueryVariable("backgroundusername"));
    USERIDNAME_popup = decodeURIComponent(getQueryVariable("popupusername"));
    SHITIINDEX = parseInt(getQueryVariable("shitiindex"));

    LoadData(LoadPageAfterData);
}
///通过URL访问，初次加载页面的数据加载操作
function LoadData(followsteps) {
    var firstshitiid = 0;
    var taskdetailurl = apiconf.n_taskdetail + "?taskId=" + TASKID + "&userId=" + USERID;
    $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, })
        .then(data => {
            _TaskData = data.data;
            firstshitiid = _TaskData.shiti[0].shitiID

            var reccheckurltmp = apiconf.n_shitiRecAndCheckResultContrast +
                "?testEntityId=" + firstshitiid +
                "&backgroundTaskId=" + TASKID +
                "&popupTaskId=" + TASKID_popup +
                "&popupAccountId=" + USERID_popup +
                "&backgroundAccountId=" + USERID;
            return $.ajax({ type: "GET", url: reccheckurltmp, xhrFields: XHRCONF, });
        }).then(reccheckdata => {
            _RecAndCheckData = reccheckdata.data;
            _RecAndCheckData.currentShiTiID = firstshitiid;

            LoadZhiShiDianAsync();
            followsteps();
        });
}

//通过URL访问，初次加载页面,完成加载数据后的界面渲染操作
function LoadPageAfterData() {
    //1-任务信息设置
    $("#title-taskname").text(SHOWTASKNAME);
    $("#task-zhunquelv").text(_TaskData.ratioZhunQue * 100);
    $("#task-keshibielv").text(_TaskData.ratioKeShiBie * 100);
    //2-加载题号信息，试题查看进度
    SetTiHaoListAndProgress("all", "all", _TaskData);
    //3-加载试题审核进度
    var _sum = $.grep(_TaskData.shiti, ele => ele.checkStatus == "已审核").length;
    SetProgressBarAndTaskEndButton(_sum, _TaskData.shiti.length);
    //4-试题基本信息（题型，体裁，学习阶段，试题XML）
    LoadQuestionEntity(_RecAndCheckData.currentShiTiID);
    //5-识别与审核信息
    // $("#background-test-status").text(_RecAndCheckData.backgroundResult.checkstatus);
    if (userinfo.roleid == 100) {
        $("#background-test-background-username b").text(USERIDNAME);
    } else {
        $("#background-test-background-username").hide();
    }

    $("#background-testtime").text(_RecAndCheckData.backgroundResult.testTime);
    InitBackgroundData(SHITIINDEX);

    layer.close(rightlayindex);
    //事件注册
    EventRegister();
}

function WindowSizeChangeEvent() {
    adjusthheight = calculateHeight()
    $("#testoverview").css("height", adjusthheight);
    $("#background-checkpage").css("height", adjusthheight);
    $(window).resize(_ => {
        adjusthheight = calculateHeight();
        $("#testoverview").css("height", adjusthheight);
        $("#background-checkpage").css("height", adjusthheight);
    });

    function calculateHeight() {
        return window.innerHeight - 77 - 40 - 45;;
    }
}

function EventRegister() {
    //background试题审核事件
    $("#button-background-check-submit").click(_ => {
        PostCheck(_RecAndCheckData.backgroundResult);
    });
    //popup试题审核事件
    $("#button-popup-check-submit").click(_ => {
        PopupPostCheck(_RecAndCheckData.popupResult);
    });
    //任务审核确认事件
    $("#button-background-task-submit").click(_ => {
        PostTaskCheck();
    });
    //浏览器窗体改变事件
    WindowSizeChangeEvent();
    //修改备注事件
    $("#button-memo").click(_ => {
        layer.open({
            id: "thismemeoid",
            type: 1,
            title: '<div><b>备注</b></div>',
            shadeClose: true,
            shade: 0,
            anim: 5,
            isOutAnim: false,
            content: $('#shiti-memo'),
            area: ['520px', '260px'],
            success: _ => {
                var queryUrl = apiconf.n_memoGet + "?testEntityID=" + _RecAndCheckData.currentShiTiID + "&userID=" + USERID + "&taskID=" + TASKID;
                $.ajax({ type: "GET", url: queryUrl, xhrFields: XHRCONF })
                    .then(_ => $("#textarea-memo").val(_.data));
            },
            end: _ => {
                var memoPost = {
                    "entityID": _RecAndCheckData.currentShiTiID,
                    "memo": $("#textarea-memo").val().trim(),
                    "taskID": TASKID,
                    "userID": USERID
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
        layui.layer.msg("待开发", {
            "time": 700
        });
    });
    //查看知识点识别结果button
    $("#button-zhishidian-reference").click(event => {
        layer.open({
            type: 1,
            id: 'zhishidian-reference',
            shadeClose: true,
            shade: 0.1,
            content: $("#popup-zhishidian-reference"),
            btn: [],
            title: "<b>参考知识点</b>",
            area: ['1200px', '700px'],
            success: function() {
                if (CACHE_ZhiShiDianResult_Background != null) {
                    if (CACHE_ZhiShiDianResult_Background[SHITIINDEX].allZhiShiDian.length + CACHE_ZhiShiDianResult_Background[SHITIINDEX].separateZhiShiDian.length == 0) {
                        $("#popup-zhishidian-reference-msg").text("未从数据库中查询到该题的知识点信息！");
                    } else {
                        $("#popup-zhishidian-reference-msg").text("");
                        $("#popup-zhishidian-reference-container").empty();
                    }

                    if (CACHE_ZhiShiDianResult_Background[SHITIINDEX].allZhiShiDian.length > 0) {
                        var container_item = $("#pupup-reference-item-template").clone();
                        $(container_item).attr("id", "");
                        $(container_item).show();
                        var zhishdiianlist = $.map(CACHE_ZhiShiDianResult_Background[SHITIINDEX].allZhiShiDian, ele => {
                            return ele.knowledgeName;
                        });
                        var text = zhishdiianlist.join(";  ");
                        $(container_item).find(".popup-reference-content").val(text);
                        $(container_item).find(".exampleText-title").text("说明");
                        $(container_item).find(".exampleText").val("下边是针对当前小题的所有知识点，临时效果，先将就看");
                        $(container_item).find(".popup-reference-title").text("所有知识点");
                        $("#popup-zhishidian-reference-container").append(container_item);
                    }
                    if (CACHE_ZhiShiDianResult_Background[SHITIINDEX].separateZhiShiDian.length > 0) {
                        $.each(CACHE_ZhiShiDianResult_Background[SHITIINDEX].separateZhiShiDian, (idx, ele) => {
                            var container_item = $("#pupup-reference-item-template").clone();
                            $(container_item).attr("id", "");
                            $(container_item).show();
                            var zhishdiianlist = $.map(ele.data, tt => {
                                return tt.knowledgeName;
                            });
                            var text = zhishdiianlist.join(";  ");
                            $(container_item).find(".exampleText-title").text("【" + (idx + 1) + "】" + ele.position);
                            $(container_item).find(".popup-reference-content").val(text);
                            $(container_item).find(".exampleText").val(ele.text);
                            $(container_item).find(".popup-reference-title").text("句子对应知识点");
                            $("#popup-zhishidian-reference-container").append(container_item);
                        })
                    }
                } else {
                    $("#popup-zhishidian-reference-msg").text("参考知识点尚未加载完成，请稍后再试")
                }
                $("#pupup-reference-item-template").hide();
            },
            end: function() {
                $("#popup-zhishidian-reference").hide();
            }
        });
    });
    //左下侧试题列表的打开关闭按钮的点击事件
    $(".button-shitilist").click(event => {
        if (event.currentTarget.id == "button-shitilist-show") {
            $("#button-shitilist-show").hide();
            $("#button-shitilist-hide").css("display", "inline-block");
            let hei = window.innerHeight * 0.5 - 77;
            leftBottomShiTiListPopupLayerIndex = layer.open({
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
                area: ['370px', hei + 'px'],
                success: function() {
                    $("#test-item-container").css("height", hei - 80 + "px");
                    $("#test-item-container").css("overflow-y", "auto");
                    //试题ID定位到可视区域
                    var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + _RecAndCheckData.currentShiTiID).offset().top - $("#test-item-container").offset().top - 100;
                    $("#test-item-container").scrollTop(topdistance);
                }
            });
        } else {
            $("#button-shitilist-show").css("display", "inline-block");
            $("#button-shitilist-hide").hide();
            layer.close(leftBottomShiTiListPopupLayerIndex);
        }
    });
    //左侧试题显示区域点击控制关闭左下侧试题列表弹窗
    $("#testoverview").click(() => {
        $("#button-shitilist-show").css("display", "inline-block");
        $("#button-shitilist-hide").hide();
        layer.close(leftBottomShiTiListPopupLayerIndex);
    });
    //左下侧试题列表的试题题号的点击事件
    $("#new-result-select,#check-result-select").change(ele => {
        var vv1 = $("#new-result-select").val();
        var vv2 = $("#check-result-select").val();
        SetTiHaoListAndProgress(vv1, vv2, _TaskData);
    });
    //上一题
    $("#button-shiti-previous").click(_ => {
        var changeid = null;
        $.each(CurrentShiTiList, (index, ele) => {
            if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
                if (index == 0) {
                    changeid = _RecAndCheckData.currentShiTiID;
                    layui.layer.msg("已经是第一个题了！", { "time": 400 });
                } else {
                    changeid = CurrentShiTiList[index - 1].shitiID;;
                }
            }
        })
        ChangeShiTi(changeid);
        var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + _RecAndCheckData.currentShiTiID).offset().top - $("#test-item-container").offset().top - 100;
        $("#test-item-container").scrollTop(topdistance);
    });
    //下一题
    $("#button-shiti-next").click(_ => NextOne());
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
            area: ['820px', '600px'],
            success: _ => layui.form.render(),
            end: _ => $("#manual-popup").hide()
        });
    });
    //添加漏识别考点、知识点弹框
    $(".add-lose").click(event => {
        var losetype = 0;
        var losereason = "考点识别原因";
        $("input[name=lose-reason][value=考点识别原因]").prop("checked", "true");
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
            area: ['670px', '500px'],
            success: function() {
                layui.table.render({
                    elem: '#add-zhuti-search-table',
                    data: knowledgeResultForZhuTi,
                    height: 320,
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
            },
            yes: function() {
                if (LoseZHUTI != null) {
                    var nname = LoseKaoDian.knowledgeName.replace(/"/g, '%22')
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
                            var jsonObj = JSON.parse(obj.children[0].innerHTML);
                            if (jsonObj.length == 1) {
                                var uniquecode = jsonObj[0].KlgUniqueId;
                                var appendtt =
                                    $('<span>', {
                                        "class": "check-item check-lose",
                                        "knowledgeUniqueCode": uniquecode,
                                        "knowledgeName": LoseZHUTI.knowledgeName
                                    }).text(LoseZHUTI.knowledgeName);

                                placeholderdiv = $(event.currentTarget).closest("fieldset").find(".loushibie-zhutilou");
                                $(placeholderdiv).append(appendtt);
                                RefreshArryData($(placeholderdiv).attr("id"), $(placeholderdiv).attr("data-route"));
                                RenderColorBlock();
                                RefreshEvent();
                            }
                        }
                    });
                } else {
                    layui.layer.msg("请选择一个需要添加的主题知识点！", () => {});
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
                LoseZHUTI = null;
                layui.table.on('radio(add-knowledge-search-table)', _ => CheckLose(_));
                layui.layer.close(loadIndex);
            }
        });
    });
    //添加漏识别主题知识点
    $("#button-add-zhuti-knowledge").click(_ => {
        var knowledgetypeurl = 'http://172.16.63.77:8011/Content/GetKnowledgeContent.asmx/WS_Klg_Content_GetKlgByLikeWithESP';
        var knowledgesearchname = $("#input-knowledge-search-zhuti").val().trim()
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
                    elem: '#add-zhuti-search-table',
                    data: knowledgeResultForZhuTi,
                    height: 320,
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
                layui.table.on('radio(add-zhuti-search-table)', _ => {
                    LoseZHUTI = _.data;
                });
                layui.layer.close(loadIndex);
            }
        });
    });
    //添加漏识别考点类型弹框
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
                    var appendtt = $('<span class="check-item check-lose"></span>').text(kaoleixingmingcheng);
                    $(event.currentTarget).closest("fieldset").find(".loushibie-kaochaleixinglou").append(appendtt);
                    RenderColorBlock();
                    RefreshEvent();
                } else {
                    layui.layer.msg("请出入要添加的考查类型名称！", () => {});
                }
            }
        });
    });
}

function NextOne() {
    var changeid = null;
    $.each(CurrentShiTiList, (index, ele) => {
        if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
            if (index == CurrentShiTiList.length - 1) {
                changeid = _RecAndCheckData.currentShiTiID;
                layui.layer.msg("已经是最后一个题了！", { "time": 400 });
            } else {
                changeid = CurrentShiTiList[index + 1].shitiID;;
            }
        }
    })
    ChangeShiTi(changeid);
    var topdistance = $("#test-item-container").scrollTop() + $('#tihao-index-' + _RecAndCheckData.currentShiTiID).offset().top - $("#test-item-container").offset().top - 100;
    $("#test-item-container").scrollTop(topdistance);
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

function PostTaskCheck() {
    var checkObj = {
        "userID": USERID,
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

function PostCheck(checkdata, callback) {
    var tmplayerindex = layui.layer.load(0, { shade: false, time: 90 });
    RecursionPostCheck(checkdata, callback, tmplayerindex, checkdata.data.length)
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
    var tmplayerindex = layui.layer.load(0, { shade: false, time: 90 });
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
                setTimeout(() => ChangeShiTi(_RecAndCheckData.currentShiTiID), 600);
            }
        });
    }
}

function InitBackgroundData(index) {
    if (_RecAndCheckData == null) {
        layui.layer.msg("该题识别结果为空！！！", () => {});
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
    PopupDataFill(index);

    //关闭全局加载动画
    layui.layer.close(GlobalLoadIndex);
    RenderColorBlock();
    RefreshEvent();
}

function PopupDataFill(index) {
    //组织popup里的新识别结果数据
    $("#popup-checkpage").find(".shenhequote").empty();
    if (_RecAndCheckData.popupResult == null) { return; }

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
}

//如果是第一次加载，则按选择的结果展示，如果不是第一次加载，则按上一次的历史展示
function SetTiHaoListAndProgress(resultnew, shenhe, initData) {
    var shitidata = initData.shiti;
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
    CurrentShiTiList = shitidata;
    $("#test-item-container").empty();
    $.each(shitidata, (ind, ele) => {
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
        if (ele.shitiID == _RecAndCheckData.currentShiTiID) {
            $(itemIndex).css("background", "tomato");
        }
        $("#test-item-container").append(itemIndex);
    });
    //设置当前试题ID
    $("#current-shitiID-progress").text("（" + 1 + "/" + CurrentShiTiList.length + "）");
    $("#current-shitiID").text(_RecAndCheckData.currentShiTiID);
    // 筛选的试题数量更新
    $("#total-shiti").text(shitidata.length);

    //注册选择小题的事件操作
    $(".test-item-index").click(event => {
        //切换当前试题ID；列表试题ID显示背景；左下角试题ID；试题区域试题信息
        var currentshitiid = parseInt($(event.currentTarget).attr("data"));

        ChangeShiTi(currentshitiid);
    });
    if (shitidata.length > 0) {
        ChangeShiTi(shitidata[0].shitiID);
    }
}

function ChangeShiTi(changtoshitiid) {
    if (_RecAndCheckData == null) {
        layui.layer.msg("该题识别结果为空！！！", () => {});
        return;
    }

    var shitiindexxx = 0;
    $.each(CurrentShiTiList, (_, ele) => {
        if (ele.shitiID == changtoshitiid) {
            shitiindexxx = _;
        }
    })
    $("#current-shitiID-progress").text("（" + (shitiindexxx + 1) + "/" + CurrentShiTiList.length + "）");

    var tmplayerindex = layer.load(0, { shade: false, time: 90 });
    _RecAndCheckData.currentShiTiID = changtoshitiid;
    var currentshitidiv = $("#test-item-container").find("#tihao-index-" + _RecAndCheckData.currentShiTiID);
    $(".test-item-index").css("background", "");
    $(currentshitidiv).css("background", "tomato");
    $("#current-shitiID").text(_RecAndCheckData.currentShiTiID);
    LoadQuestionEntity(_RecAndCheckData.currentShiTiID);

    //加载识别和审核信息
    var reccheckurltmp = apiconf.n_shitiRecAndCheckResultContrast +
        "?testEntityId=" + _RecAndCheckData.currentShiTiID +
        "&backgroundTaskId=" + TASKID +
        "&popupTaskId=" + TASKID_popup +
        "&popupAccountId=" + USERID_popup +
        "&backgroundAccountId=" + USERID;
    $.ajax({ type: "GET", url: reccheckurltmp, xhrFields: XHRCONF, }).then(reccheckdata => {
        _RecAndCheckData = reccheckdata.data;

        InitBackgroundData(0);

        // $("#background-test-status").text(_RecAndCheckData.backgroundResult.checkstatus);
        $("#background-test-background-username>b").text(USERIDNAME);
        $("#background-testtime").text(_RecAndCheckData.backgroundResult.testTime);
        layui.layer.close(tmplayerindex);

        LoadZhiShiDianAsync();

        var taskdetailurl = apiconf.n_taskdetail + "?taskId=" + TASKID + "&userId=" + USERID;
        return $.ajax({ type: "GET", url: taskdetailurl, xhrFields: XHRCONF, });
    }).then(tdata => {
        _TaskData = tdata.data;
        var _sum = $.grep(_TaskData.shiti, ele => ele.checkStatus == "已审核").length;
        SetProgressBarAndTaskEndButton(_sum, _TaskData.shiti.length);

        // 更新试题列表字段的结果更新情况和审核情况
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
                } else {
                    secondIndex++;
                }
            }
        }

        var ratiourl = apiconf.n_taskAndUserRatio + "?&taskId=" + TASKID + "&userId=" + USERID;
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

        var shitiurltmp = apiconf.n_memoGet + "?testEntityID=" + _RecAndCheckData.currentShiTiID + "&userID=" + USERID + "&taskID=" + TASKID;
        return $.ajax({ type: "GET", url: shitiurltmp, xhrFields: XHRCONF });
    }).then(_ => {
        if (_.data != null && _.data.length > 0) {
            $("#textarea-memo").val(_.data);
            $("#icon-memo").show();
        } else {
            $("#icon-memo").hide();
        }
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

function RefreshEvent() {
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

    $(".check-item").unbind("contextmenu", changeItemColor);
    $('.check-item').unbind("click", changeItemColor);
    $(".check-wrong,.check-lose,.check-correct").unbind("contextmenu");

    $('.check-item').on("contextmenu", changeItemColor);
    $('.check-item').on("click", changeItemColor);
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

function LoadZhiShiDianAsync() {
    //非阻塞加载知识点缓存
    CACHE_ZhiShiDianResult_Background = null;
    CACHE_ZhiShiDianResult_Popup = null;
    var backgroundurl = apiconf.n_shitiKaoDianReferenceZhiShiDian + "?testQuestionRecId=" + _RecAndCheckData.backgroundResult.ttu_TestQuestionRecID;
    $.ajax({ type: "GET", url: backgroundurl, xhrFields: XHRCONF })
        .then(_ => CACHE_ZhiShiDianResult_Background = _.data);

    if (_RecAndCheckData.popupResult != null) {
        var popupurl = apiconf.n_shitiKaoDianReferenceZhiShiDian + "?testQuestionRecId=" + _RecAndCheckData.popupResult.ttu_TestQuestionRecID;
        $.ajax({ type: "GET", url: popupurl, xhrFields: XHRCONF })
            .then(_ => CACHE_ZhiShiDianResult_Popup = _.data);
    }
}

function OpenNewResult() {
    RenderColorBlock();
    var new_testtime = _RecAndCheckData.popupResult.testTime;
    var new_checkstatus = _RecAndCheckData.popupResult.checkstatus;

    let ttitle = '<b style="margin-right:20px;">对比任务</b>' +
        '测试时间：<span  class="text-show">' + new_testtime + '</span> ';
    if (userinfo.roleid == 100) {
        ttitle += '<b>（' + USERIDNAME_popup + '）</b>';
    }
    // let ttitle = '<b style="margin-right:20px;">对比任务</b> 测试时间：<span  class="text-show">' + new_testtime + '</span>  <b>（' + new_checkstatus + '）</b>';

    let layerindex = layer.open({
        type: 1,
        shadeClose: false,
        shade: 0,
        closeBtn: 0,
        maxmin: true,
        area: ['41%', '85vh'],
        content: $("#popup-rec-history"),
        btn: [],
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
    if (yishenhe.length == _TaskData.shiti.length) {
        $("#button-background-check-submit").addClass("layui-btn-disabled");
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