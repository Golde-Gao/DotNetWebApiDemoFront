let ANIMATETIME = 200;
var XHRCONF = { withCredentials: true };
var CURRTABLE = null;
var CURRDATA = null;
var ACCOUNTS = null;
var KNOWLEDGETYPE = null;
var DROPBOXCONF = []

// 请求必要的初始化数据，然后调用实际的加载方法
$(function() {
    if (userinfo.roleid == 101) $("#button-add-record").show();

    $.ajax({ type: "GET", url: apiconf.issuetype, xhrFields: XHRCONF, })
        .then((data) => {
            let issuetype = { name: "issuetype", elementclass: "issueType-select", title: "问题类别", data: data.data, }
            DROPBOXCONF.push(issuetype);

            return $.ajax({ type: "GET", url: apiconf.solvetype, xhrFields: XHRCONF, });
        }).then((data) => {
            let solvetype = { name: "solvetype", elementclass: "solveType-select", title: "解决状态", data: data.data, };
            DROPBOXCONF.push(solvetype);

            return $.ajax({ type: "GET", url: apiconf.checktype, xhrFields: XHRCONF, });
        }).then((data) => {
            let checktype = { name: "checktype", elementclass: "checkType-select", title: "审核状态", data: data.data, };
            DROPBOXCONF.push(checktype);

            return $.ajax({ type: "GET", url: apiconf.knowledgetype, xhrFields: XHRCONF, });
        })
        .then((data) => {
            let knowledgetype = { name: "knowledgetype", elementclass: "knowledgeType-select", title: "知识点类型", data: data.data, };
            DROPBOXCONF.push(knowledgetype);
            KNOWLEDGETYPE = data.data;

            return $.ajax({ type: "GET", url: apiconf.findalluser, xhrFields: XHRCONF, });
        }).then((data) => {
            ACCOUNTS = data.data;

            loadpage();
        });
});

function loadpage() {
    // 加载初始页面搜索用的下拉框，及时间选择框
    loaddropbox();
    // 初始页面相关事件注册
    eventregister();
    // 查询数据填充table，及table相关渲染操作
    queryanrendertable();
}

function materialeventregister() {
    let knowledgetypeurl = "http://172.16.63.77:8011/Content/GetKnowledgeContent.asmx/WS_Klg_Content_GetKlgCodeAndTypeByKlgName";
    // 相响应当前的change事件，修改对应的knowledgetype选择框
    $(".popup-report-knowledgepoint").focusout(ele => {
        //请求接口；修改对应的知识点类型
        let currentdiv = $(ele.currentTarget)
        let knowledgename = encodeURIComponent(currentdiv.val().trim());
        if (knowledgename != "") {
            let querytext = "SubjectCode=C&" + 'KnowledgeNameJson=["' + knowledgename + '"]';
            $.ajax({
                type: "POST",
                url: knowledgetypeurl,
                contentType: "application/x-www-form-urlencoded",
                data: querytext,
                success: function(data) {
                    if (data.Data.length == 1) {
                        let typecode = data.Data[0].KnowledgeType[0];
                        let change = false;
                        $.each(KNOWLEDGETYPE, (_, item) => {
                            if (item.code == typecode) {
                                $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val(item.id);
                                layui.form.render();
                                change = true;
                            }
                        })
                        if (change == false) {
                            $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
                            layui.form.render();
                        }
                    } else {
                        $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
                        layui.form.render();
                    }
                },
                error: function() {
                    $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
                    layui.form.render();
                }
            });
        } else {
            $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
            layui.form.render();
        }
    });
    $(".popup-report-knowledgepoint").change(ele => {
        //请求接口；修改对应的知识点类型
        let currentdiv = $(ele.currentTarget)
        let knowledgename = encodeURIComponent(currentdiv.val().trim());
        if (knowledgename != "") {
            let querytext = "SubjectCode=C&" + 'KnowledgeNameJson=["' + knowledgename + '"]';
            $.ajax({
                type: "POST",
                url: knowledgetypeurl,
                contentType: "application/x-www-form-urlencoded",
                data: querytext,
                success: function(data) {
                    if (data.Data.length == 1) {
                        let typecode = data.Data[0].KnowledgeType[0];
                        let change = false;
                        $.each(KNOWLEDGETYPE, (_, item) => {
                            if (item.code == typecode) {
                                $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val(item.id);
                                layui.form.render();
                                change = true;
                            }
                        })
                        if (change == false) {
                            $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
                            layui.form.render();
                        }
                    } else {
                        $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
                        layui.form.render();
                    }
                },
                error: function() {
                    $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
                    layui.form.render();
                }
            });
        } else {
            $(currentdiv).closest(".popup-report-knowledge").find(".popup-report-knowledgetype").val("");
            layui.form.render();
        }
    });

    // subtraction按钮点击
    $(".linetail-button-sub").children("button").click(ele => {
        let current = $(ele.currentTarget).closest(".popup-report-knowledge");
        let prediv = $(current).prev(".popup-report-knowledge");
        let preprediv = $(prediv).prev(".popup-report-knowledge");
        let nextdiv = $(current).next(".popup-report-knowledge");
        let nextnextdiv = $(nextdiv).next(".popup-report-knowledge");
        if (current.length > 0) {
            // 所在层popup-report-knowledge，不存在上层popup-report-knowledge，不存在下层popup-report-knowledge
            // 这个按钮将不会存在，也就不用有任何操作
            if (prediv.length == 0 && nextdiv.length == 0) {}
            // 所在层popup-report-knowledge，不存在上层popup-report-knowledge，存在下层popup-report-knowledge,存在下下层popup-report-knowledge
            // 删除当前层popup-report-knowledge
            else if (prediv.length == 0 && nextdiv.length > 0 && nextnextdiv.length > 0) {
                current.hide(ANIMATETIME, _ => current.remove());
            }
            // 所在层popup-report-knowledge，不存在上层popup-report-knowledge，存在下层popup-report-knowledge,不存在下下层popup-report-knowledge
            // 删除当前层popup-report-knowledge
            else if (prediv.length == 0 && nextdiv.length > 0 && nextnextdiv.length == 0) {
                nextdiv.find(".linetail-button-sub").hide();
                current.hide(ANIMATETIME, _ => current.remove());
            }
            // 所在层popup-report-knowledge，存在上层popup-report-knowledge，存在上上层popup-report-knowledge，存在下层popup-report-knowledge
            // 删除当前层popup-report-knowledge
            else if (prediv.length > 0 && preprediv.length > 0 && nextdiv.length > 0) {
                current.hide(ANIMATETIME, _ => current.remove());
            }
            // 所在层popup-report-knowledge，存在上层popup-report-knowledge，存在上上层popup-report-knowledge，不存在下层popup-report-knowledge
            // 删除当前层popup-report-knowledge，显示上层addition
            else if (prediv.length > 0 && preprediv.length > 0 && nextdiv.length == 0) {
                current.hide(ANIMATETIME, _ => current.remove());
                prediv.find(".linetail-button-add").show();
            }
            // 所在层popup-report-knowledge，存在上层popup-report-knowledge，不存在上上层popup-report-knowledge，存在下层popup-report-knowledge
            // 删除当前层popup-report-knowledge
            else if (prediv.length > 0 && preprediv.length == 0 && nextdiv.length > 0) {
                current.hide(ANIMATETIME, _ => current.remove());
            }
            // 所在层popup-report-knowledge，存在上层popup-report-knowledge，不存在上上层popup-report-knowledge，不存在下层popup-report-knowledge
            // 删除当前层popup-report-knowledge，把上层popup-report-knowledge的subtraction按钮隐藏，把上层popup-report-knowledge显示
            else if (prediv.length > 0 && preprediv.length == 0 && nextdiv.length == 0) {
                current.hide(ANIMATETIME, _ => current.remove());
                prediv.find(".linetail-button-sub").hide(ANIMATETIME);
                prediv.find(".linetail-button-add").show(ANIMATETIME);
            }
        }
        layui.form.render();
    });
    // addition按钮点击，只能在下一层不存在是添加新层
    $(".linetail-button-add").children("button").click(ele => {
        let current = $(ele.currentTarget).closest(".popup-report-knowledge");
        let nextdiv = $(current).next(".popup-report-knowledge");
        if (current.length > 0) {
            // 所在层popup-report-knowledge，不存在上层popup-report-knowledge，不存在下层popup-report-knowledge
            // 当前层+隐藏；添加新层
            if (nextdiv.length == 0) {
                current.find(".linetail-button-add").hide(ANIMATETIME);
                current.find(".linetail-button-sub").show(ANIMATETIME);
                let addelement = current.clone(true);
                addelement.find("input").val("");
                addelement.find(".linetail-button-sub").show(ANIMATETIME);
                addelement.find(".linetail-button-add").show(ANIMATETIME);
                current.after(addelement);
                addelement.hide();
                addelement.show(ANIMATETIME);
            }
        }
        layui.form.render();
    });
}



function loaddropbox() {
    $.each(DROPBOXCONF, (_, ele) => {
        var selectelement = $('.' + ele.elementclass);
        $(selectelement).empty();
        $(selectelement).append($('<option>', { "value": "" }).text(ele.title));
        $.each(ele.data, (_, item) => $(selectelement).append($('<option>', { "value": item.id }).text(item.name)));
    });

    layui.laydate.render({ elem: '#reportTime', type: 'datetime', range: true });
    layui.laydate.render({ elem: '#solveTime', type: 'datetime', range: true });
    layui.form.render();
}

function addrecordregister() {
    $("#button-add-record").click(() => {
        if (userinfo.roleid != 101) {
            let temppop = { skin: "layui-layer-molv", content: "抱歉，您不能做添加操作", time: 1200 }
            layer.open(temppop);
            return;
        }
        // 打开新增记录popup
        layer.open({
            type: 1,
            offset: "auto",
            id: 'record-edit',
            content: $("#div-add-record"),
            btn: 'OK',
            btnAlign: 'r',
            title: '<div style="text-align:center;"><b>新增反馈信息</b></div>',
            area: ['1200px', '600px'],
            success: function() {
                // 根据回复用户，加载选项卡控件
                let solveaccounts = ACCOUNTS.filter(_ => _.roleid == 102);
                if(solveaccounts.length>0){
                    $.each(solveaccounts, (_, item) => {
                        // 清空原有tab项
                        layui.element.tabDelete("add-edit-tabcontrol", item.id);
                        // 准备tab内容页;
                        let tabpageclone = $("#popup-material").children(".popup-tab-frame").clone();
                        $(tabpageclone).attr("id", item.id);
                        $(tabpageclone).find(".lose-content").append($("#popup-material").children(".popup-tab-lose-bar").clone());
                        $(tabpageclone).find(".wrong-content").append($("#popup-material").children(".popup-tab-wrong-bar").clone());
    
                        // 新增tab项目
                        var tabobject = { title: item.name, content: tabpageclone.prop("outerHTML"), id: item.id }
                        layui.element.tabAdd("add-edit-tabcontrol", tabobject);
                    });
                    // 给tabpage中的+-功能注册事件；给知识点输入框添加change事件
                    materialeventregister();
                    // 设置默认选中的那个选项卡
                    layui.element.tabChange("add-edit-tabcontrol", solveaccounts[0].id);
                    // 初始化所有的反馈知识点类型下拉框
                    let knowledgetypeconf = DROPBOXCONF.filter(_ => _.name == "knowledgetype")[0];
                    let knoeledgetypeselectelements = $(".popup-report-knowledgetype");
                    $.each(knoeledgetypeselectelements, (_1, item) => {
                        $(item).empty();
                        $(item).append('<option value="">' + knowledgetypeconf.title + '</option>');
                        $.each(knowledgetypeconf.data, (_2, ele) => {
                            $(item).append('<option value="' + ele.id + '">' + ele.name + '</option>');
                        });
                    });
                    // 注册输入的试题ID和句子事件，同步所有选项卡
                    $(".popup-report-entityid").change(event => $(".popup-report-entityid").val(event.currentTarget.value));
                    $(".popup-report-sentence").change(event => $(".popup-report-sentence").val(event.currentTarget.value));
                    // layui控件渲染，防止出现失效空间，下拉框等
                    layui.form.render();
                }
               else{
                   layui.layer.msg("未查询到相关信息");
               }
            },
            yes: function() {
                let insertdataarr = [];
                let check = true;
                let framearr = $(".popup-tab-frame").filter((_, ele) => ele.id != "");
                $.each(framearr, (ind, ele) => {
                    let reporttime = moment().format("YYYY-MM-DD HH:mm:ss");
                    let reportaccountid = userinfo.id;
                    let solveaccountid = $(ele).attr("id").trim();
                    let eitityid = $(ele).find(".popup-report-entityid").val().trim();
                    let sentence = $(ele).find(".popup-report-sentence").val().trim();
                    if (eitityid == "" || sentence == "") {
                        check = false;
                        return;
                    }
                    let knowledgelose = $(ele).find(".popup-report-knowledgelose").find(".popup-report-knowledge");
                    let knowledgewrong = $(ele).find(".popup-report-knowledgewrong").find(".popup-report-knowledge");
                    $.each(knowledgelose, (idx, item) => {
                        let knowledge = $(item).find(".popup-report-knowledgepoint").val().trim();
                        let knowledgetypeid = $(item).find(".popup-report-knowledgetype").val().trim();
                        let knowledgememo = $(item).find(".popup-report-knowledge-memo").val().trim();

                        let insertobject = {
                            "issuetypeid": 101,
                            "checktypeid": 100,
                            "sentence": sentence,
                            "sentenceresult": "",
                            "reporttime": reporttime,
                            "reportaccountid": reportaccountid,
                            "solveaccountid": solveaccountid,
                            "solvetypeid": 100,
                            "testentityid": eitityid,
                            "knowledge": knowledge,
                            "knowledgetypeid": knowledgetypeid,
                            "knowledgereply": "",
                            "knowledgememo": knowledgememo,
                        };
                        if (knowledge != "" && knowledgetypeid != "" && knowledgetypeid > 0) {
                            insertdataarr.push(insertobject);
                        }
                    })
                    $.each(knowledgewrong, (idx, item) => {
                        let knowledge = $(item).find(".popup-report-knowledgepoint").val().trim();
                        let knowledgetypeid = $(item).find(".popup-report-knowledgetype").val().trim();
                        let knowledgememo = $(item).find(".popup-report-knowledge-memo").val().trim();
                        let insertobject = {
                            "issuetypeid": 100,
                            "checktypeid": 100,
                            "sentence": sentence,
                            "sentenceresult": "",
                            "reporttime": reporttime,
                            "reportaccountid": reportaccountid,
                            "solveaccountid": solveaccountid,
                            "solvetypeid": 100,
                            "testentityid": eitityid,
                            "knowledge": knowledge,
                            "knowledgetypeid": knowledgetypeid,
                            "knowledgereply": "",
                            "knowledgememo": knowledgememo
                        };
                        if (knowledge != "" && knowledgetypeid != "" && knowledgetypeid > 0) {
                            insertdataarr.push(insertobject);
                        }
                    })
                });

                if (check == false || insertdataarr.length == 0) {
                    let popupconf = { skin: "layui-layer-molv", content: "输入信息不完整，请检查。", time: 900 };
                    layer.open(popupconf);
                    return;
                }
                let insertdata = JSON.stringify(insertdataarr);
                $.ajax({
                    type: "POST",
                    url: apiconf.issuerecordlistcreate,
                    contentType: "application/json",
                    data: insertdata,
                    xhrFields: XHRCONF,
                    success: function(data) {
                        if (data.code == 200) {
                            layer.closeAll();
                            queryanrendertable();

                        } else {
                            layer.msg("规则限制，添加失败");
                        }
                    },
                    error(err) {
                        layer.open({
                            skin: "layui-layer-molv",
                            content: "代码报错啦，请联系管理员",
                            time: 0
                        });
                    }
                });
            }
        });
    });
}


function eventregister() {
    addrecordregister();

    $(".btn-search-condition").click(event => {
        let anatime = 200;
        if (event.currentTarget.id == "btn-search-condition-more") {
            $("#second-searchbar").show(anatime);
            $("#btn-search-condition-less").show();
            $("#btn-search-condition-more").hide();
        } else if (event.currentTarget.id == "btn-search-condition-less") {
            $("#second-searchbar").hide(anatime);
            $("#btn-search-condition-less").hide();
            $("#btn-search-condition-more").show();
        }
    });

    $("#ordercondition").click(ele => {
        layer.open({
            type: 1,
            shadeClose: true,
            shade: 0,
            maxmin: true,
            area: ['600px', '570px'],
            content: $("#ordercondition-select-panel"),
            btn: 'OK',
            btnAlign: 'r',
            title: '<b>选择排序条件</b>',
            zIndex: 1001, //重点1
            success: function(layero) {
                var data1 = [
                    { "cond": "asc", "name": "OldPlatFromID", "value": "OldPlatFromID", "title": "试题ID(正序)" },
                    { "cond": "desc", "name": "OldPlatFromID", "value": "OldPlatFromID2", "title": "试题ID(倒序)" },
                    { "cond": "asc", "name": "IssueTypeName", "value": "IssueTypeName", "title": "问题类别(正序)" },
                    { "cond": "desc", "name": "IssueTypeName", "value": "IssueTypeName2", "title": "问题类别(倒序)" },
                    { "cond": "asc", "name": "SolveTypeName", "value": "SolveTypeName", "title": "解决状态(正序)" },
                    { "cond": "desc", "name": "SolveTypeName", "value": "SolveTypeName2", "title": "解决状态(倒序)" },
                    { "cond": "asc", "name": "CheckTypeName", "value": "CheckTypeName", "title": "审核状态(正序)" },
                    { "cond": "desc", "name": "CheckTypeName", "value": "CheckTypeName2", "title": "审核状态(倒序)" },
                    { "cond": "asc", "name": "KnowledgeTypeName", "value": "KnowledgeTypeName", "title": "知识点类型(正序)" },
                    { "cond": "desc", "name": "KnowledgeTypeName", "value": "KnowledgeTypeName2", "title": "知识点类型(倒序)" },
                    { "cond": "asc", "name": "Knowledge", "value": "Knowledge", "title": "知识点(正序)" },
                    { "cond": "desc", "name": "Knowledge", "value": "Knowledge2", "title": "知识点(倒序)" },
                    { "cond": "asc", "name": "KnowledgeReply", "value": "KnowledgeReply", "title": "识别回复(正序)" },
                    { "cond": "desc", "name": "KnowledgeReply", "value": "KnowledgeReply2", "title": "识别回复(倒序)" },
                    { "cond": "asc", "name": "KnowledgeMemo", "value": "KnowledgeMemo", "title": "识别备注(正序)" },
                    { "cond": "desc", "name": "KnowledgeMemo", "value": "KnowledgeMemo2", "title": "识别备注(倒序)" },
                    { "cond": "asc", "name": "ReportTime", "value": "ReportTime", "title": "报告时间(正序)" },
                    { "cond": "desc", "name": "ReportTime", "value": "ReportTime2", "title": "报告时间(倒序)" },
                    { "cond": "asc", "name": "ReportTime", "value": "ReportTime", "title": "回复时间(正序)" },
                    { "cond": "desc", "name": "ReportTime", "value": "ReportTime2", "title": "回复时间(倒序)" },
                    { "cond": "asc", "name": "Sentence", "value": "Sentence", "title": "识别文本(正序)" },
                    { "cond": "desc", "name": "Sentence", "value": "Sentence2", "title": "识别文本(倒序)" },
                    { "cond": "asc", "name": "SentenceResult", "value": "SentenceResult", "title": "文本识别结果(正序)" },
                    { "cond": "desc", "name": "SentenceResult", "value": "SentenceResult2", "title": "文本识别结果(倒序)" }
                ];
                let initdata = null;
                try {
                    initdata = JSON.parse($("#ordercondition").val());
                    if (initdata instanceof Array) {
                        initdata = $.map(initdata, function(ele) {
                            let valuee = $.grep(data1, item => item.name == ele.name && item.cond == ele.ordertype)[0];
                            return valuee.value;
                        });
                    }
                } catch (e) {
                    initdata = null;
                }

                layui.transfer.render({
                    elem: $("#ordercondition-select"),
                    title: ['候选排序条件', '已选排序条件'],
                    data: data1,
                    value: initdata,
                    height: 820,
                    id: "allorderconditions"
                });
            },
            yes: function() {
                var getData = layui.transfer.getData('allorderconditions'); //获取右侧数据
                var conditiondata = $.map(getData, function(ele) {
                    return { "name": ele.name, "ordertype": ele.cond };
                });
                if (conditiondata.length > 0) {
                    $(ele.currentTarget).val("");
                    var text = JSON.stringify(conditiondata);
                    $("#ordercondition").val(text);
                } else {
                    $(ele.currentTarget).val("");
                }
                layer.closeAll();
            }
        });


    });


    $("#btn-search").click(() => {
        let querysuffix = "?";

        querysuffix += "testEntityId=" + $("#testEntityId").val().trim();
        querysuffix += "&issueTypeId=" + $("#issueType-select").val().trim();
        querysuffix += "&solveTypeId=" + $("#solveType-select").val().trim();
        querysuffix += "&checkTypeId=" + $("#checkType-select").val().trim();
        querysuffix += "&knowledgeTypeId=" + $("#knowledgeType-select").val().trim();
        querysuffix += "&knowledge=" + $("#knowledge").val().trim();
        querysuffix += "&knowledgeReply=" + $("#knowledgeReply").val().trim();
        querysuffix += "&knowledgeMemo=" + $("#knowledgeMemo").val().trim();
        querysuffix += "&checkReply=" + $("#checkReply").val().trim();
        querysuffix += "&reportTime=" + $("#reportTime").val().trim();
        querysuffix += "&solveTime=" + $("#solveTime").val().trim();
        querysuffix += "&sentence=" + $("#sentence").val().trim();
        querysuffix += "&sentenceResult=" + $("#sentenceResult").val().trim();
        querysuffix += "&reportAccountName=" + $("#reportAccountName").val().trim();
        querysuffix += "&solveAccountName=" + $("#solveAccountName").val().trim();
        querysuffix += "&orders=" + $("#ordercondition").val().trim();

        window.location.href = "navigation-8.html" + querysuffix;
    });

    $("#btn-exportfile").click(() => {
        let dtext = moment().format("YYYY-MM-DD  HH:mm");
        let xlsname = "英语测试知识点问题反馈" + dtext + ".xls";
        layui.table.exportFile(CURRTABLE.config.id, CURRDATA, xlsname);
    });
    layui.form.on('submit(btn-checkassist)', function(data) {
        console.log(data);
        return false;
    });
    layui.form.on('submit(btn-search)', function(data) {
        console.log(data.field);
    });
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

function queryanrendertable() {
    // 读取页面输入参数
    let testEntityId = getQueryVariable("testEntityId");
    testEntityId = testEntityId == false ? "" : decodeURIComponent(testEntityId);

    let issueTypeId = getQueryVariable("issueTypeId");
    issueTypeId = issueTypeId == false ? "" : decodeURIComponent(issueTypeId);
    let solveTypeId = getQueryVariable("solveTypeId");
    solveTypeId = solveTypeId == false ? "" : decodeURIComponent(solveTypeId);
    let checkTypeId = getQueryVariable("checkTypeId");
    checkTypeId = checkTypeId == false ? "" : decodeURIComponent(checkTypeId);

    let knowledge = getQueryVariable("knowledge");
    knowledge = knowledge == false ? "" : decodeURIComponent(knowledge).replace(/\+/g, '%2B').replace(/:/g, '%3A');
    let knowledgeTypeId = getQueryVariable("knowledgeTypeId");
    knowledgeTypeId = knowledgeTypeId == false ? "" : decodeURIComponent(knowledgeTypeId);
    let knowledgeReply = getQueryVariable("knowledgeReply");
    knowledgeReply = knowledgeReply == false ? "" : decodeURIComponent(knowledgeReply);
    let knowledgeMemo = getQueryVariable("knowledgeMemo");
    knowledgeMemo = knowledgeMemo == false ? "" : decodeURIComponent(knowledgeMemo);

    let checkReply = getQueryVariable("checkReply");
    checkReply = checkReply == false ? "" : decodeURIComponent(checkReply);
    let reportTime = getQueryVariable("reportTime");
    reportTime = reportTime == false ? "" : decodeURIComponent(reportTime);
    let solveTime = getQueryVariable("solveTime");
    solveTime = solveTime == false ? "" : decodeURIComponent(solveTime);

    let sentence = getQueryVariable("sentence");
    sentence = sentence == false ? "" : decodeURIComponent(sentence);
    let sentenceResult = getQueryVariable("sentenceResult");
    sentenceResult = sentenceResult == false ? "" : decodeURIComponent(sentenceResult);

    let reportAccountName = getQueryVariable("reportAccountName");
    reportAccountName = reportAccountName == false ? "" : decodeURIComponent(reportAccountName);


    let solveAccountName = getQueryVariable("solveAccountName");
    solveAccountName = solveAccountName == false ? "" : decodeURIComponent(solveAccountName);

    let orders = getQueryVariable("orders");
    orders = orders == false ? "" : decodeURIComponent(orders);


    // url参数编辑
    let querytext = "?";
    // 要处理一下两个输入
    let idparam = testEntityId.length < 9 ? "oldPlatFromId" : "testEntityId";
    querytext += idparam + "=" + testEntityId;
    querytext += "&issueTypeId=" + issueTypeId;
    querytext += "&solveTypeId=" + solveTypeId;
    querytext += "&checkTypeId=" + checkTypeId;
    querytext += "&knowledgeTypeId=" + knowledgeTypeId;
    querytext += "&knowledge=" + knowledge;
    querytext += "&knowledgeReply=" + knowledgeReply;
    querytext += "&knowledgeMemo=" + knowledgeMemo;
    querytext += "&checkReply=" + checkReply;
    querytext += "&reportTime=" + reportTime;
    querytext += "&solveTime=" + solveTime;
    querytext += "&sentence=" + sentence;
    querytext += "&sentenceResult=" + sentenceResult;
    querytext += "&reportAccountName=" + reportAccountName;
    querytext += "&solveAccountName=" + solveAccountName;
    querytext += "&orders=" + orders;


    // 页面赋值历史
    $("#testEntityId").val(testEntityId);
    $("#issueType-select").val(issueTypeId);
    $("#solveType-select").val(solveTypeId);
    $("#checkType-select").val(checkTypeId);
    $("#knowledgeType-select").val(knowledgeTypeId);
    $("#knowledge").val(knowledge.replace(/%2B/g, '+').replace(/%3A/g, ':'));
    $("#knowledgeReply").val(knowledgeReply);
    $("#knowledgeMemo").val(knowledgeMemo);
    $("#checkReply").val(checkReply);
    $("#reportTime").val(reportTime);
    $("#solveTime").val(solveTime);
    $("#sentence").val(sentence);
    $("#sentenceResult").val(sentenceResult);
    $("#reportAccountName").val(reportAccountName);
    $("#solveAccountName").val(solveAccountName);
    $("#ordercondition").val(orders);
    layui.form.render();


    // 角色信息配置
    var confArr = [{
            type: "front",
            page: null,
            buttonid: "",
            url: apiconf.reportissuerecordviewpagelist,
            toolbar: null,
            colsconf: [
                [
                    { field: 'index', title: '序号', width: 60 },
                    { field: 'testentityid', title: '试题ID', width: 110  },
                    { field: 'sentence', title: '识别文本', width: 300 },
                    { field: 'knowledge', title: '知识点', sort: true, width: 160 },
                    { field: 'issuetypename', title: '问题类型' },
                    { field: 'issuememo', title: '备注', width: 160 },
                    { field: 'solvetypename', title: '解决状态' },
                    { field: 'knowledgereply', title: '回复', width: 300 },
                    { field: 'checktypename', title: '复核状态' },
                    { field: 'checkreply', title: '审核备注', width: 300 },
                    { field: 'reportaccountname', title: '反馈人', width: 160 },
                    { field: 'solveaccountname', title: '回复人', width: 160 },
                    { field: 'reporttime', title: '反馈时间', width: 160 },
                    { field: 'solvetime', title: '回复时间', width: 160 },
                ]
            ],
            title: "账号信息管理",
            startpage: 1,
            pagesize: 12,
            roleid: 100,
            height: "full-230"
        },
        {
            type: "front",
            page: null,
            buttonid: "",
            url: apiconf.reportissuerecordviewpagelist,
            toolbar: null,
            colsconf: [
                [
                    { field: 'index', title: '序号', width: 60 },
                    { field: 'testentityid', title: '试题ID', width: 110 },
                    { field: 'issuetypename', title: '类型', sort: true, width: 80 },
                    { field: 'sentence', title: '识别文本', width: 300 },
                    { field: 'knowledge', title: '知识点', sort: true, width: 160 },
                    { field: 'knowledgetypename', title: '知识点类型' },
                    { field: 'knowledgememo', title: '备注' },
                    { field: 'knowledgereply', title: '回复', width: 300 },
                    { field: 'solveaccountname', title: '回复人' },
                    { field: 'solvetypename', title: '解决状态' },
                    { field: 'checkreply', title: '审核备注', width: 300 },
                    { field: 'reporttime', title: '反馈时间', width: 160, sort: true },
                    { field: 'solvetime', title: '回复时间', width: 160 },
                    { fixed: 'right', title: '操作', toolbar: '#side-bar1', width: 130 }
                ]
            ],
            title: "账号信息管理",
            startpage: 1,
            pagesize: 12,
            roleid: 101,
            height: "full-230"
        },
        {
            toolbar: '#solve-assistant',
            type: "front",
            page: null,
            buttonid: "",
            url: apiconf.reportissuerecordviewpagelist,
            colsconf: [
                [
                    { type: 'checkbox', fixed: 'left' },
                    { field: 'index', title: '序号', width: 70 },
                    { field: 'oldplatfromid', title: '旧ID', width: 100 },
                    { field: 'sentence', title: '识别文本', width: 300 },
                    { field: 'sentenceresult', title: '重测结果', width: 300 },
                    { field: 'knowledge', title: '知识点', sort: true, width: 300 },
                    { field: 'knowledgetypename', title: '类型' },
                    { field: 'issuetypename', title: '问题类型' },
                    { field: 'solvetypename', title: '解决状态', width: 110, templet: '#solve-staus-intable', unresize: true },
                    { field: 'knowledgereply', title: '回复' },
                    { field: 'reportaccountname', title: '反馈人' },
                    { field: 'reporttime', title: '反馈时间' },
                    { field: 'solvetime', title: '回复时间' },
                    { fixed: 'right', title: '操作', toolbar: '#side-bar2', width: 130 }
                ]
            ],
            title: "账号信息管理",
            startpage: 1,
            pagesize: 12,
            roleid: 102,
            height: "full-230"
        }
    ];
    var conf = $.grep(confArr, function(item) { return item.roleid == userinfo.roleid; })[0];
    let backurl = querytext != "?" ? conf.url + querytext : conf.url;

    let pagenumber = conf.startpage;
    let pagesize = conf.pagesize;
    let backurlpage = backurl == conf.url ?
        backurl + "?pageNum=" + pagenumber + "&pageSize=" + pagesize : backurl + "&pageNum=" + pagenumber + "&pageSize=" + pagesize;
    $.ajax({
        type: "GET",
        url: backurlpage,
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
            if (data.code == 200) {
                let tabledata = $.map(data.data.list, (item, ind) => {
                    item.index = (pagenumber - 1) * pagesize + ind + 1;
                    return item;
                });
                layui.table.render({
                    elem: '#paging-table',
                    cellMinWidth: 80,
                    height: conf.height,
                    cols: conf.colsconf,
                    limit: pagesize,
                    data: tabledata,
                    even: true
                });

                layui.laypage.render({
                    elem: 'paging',
                    count: data.data.total,
                    limit: pagesize,
                    layout: ['count', 'prev', 'next', 'page', 'skip'],
                    jump: function(obj) {
                        pagenumber = obj.curr;
                        let backurlpage2 = backurl == conf.url ?
                            backurl + "?pageNum=" + pagenumber + "&pageSize=" + pagesize : backurl + "&pageNum=" + pagenumber + "&pageSize=" + pagesize;
                        $.ajax({
                            type: "GET",
                            url: backurlpage2,
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function(data) {
                                let tabledata = $.map(data.data.list, (item, ind) => {
                                    item.index = (pagenumber - 1) * pagesize + ind + 1;
                                    return item;
                                });
                                layui.table.render({
                                    elem: '#paging-table',
                                    cellMinWidth: 80,
                                    height: conf.height,
                                    cols: conf.colsconf,
                                    limit: pagesize,
                                    data: tabledata,
                                    even: true
                                });
                            }
                        });
                    }
                });

                layui.table.on('rowDouble(paging-table)', function(obj) {
                    // 显示试题信息
                    var loadUrl = apiconf.n_shitidetail + "?testEntityId=" + obj.data.testentityid;
                    $.ajax({ type: "GET", url: loadUrl, xhrFields: XHRCONF, })
                        .then(data => {
                            _SingleTestData = data.data;
                            var x2js = new X2JS();
                            var xmlText = _SingleTestData.xml;
                            if (xmlText == null) {
                                layui.layer.msg("注意！！！该题的试题内容是空的！！！", () => {});
                            } else {
                                var jsonObj = x2js.xml_str2json(xmlText);
                                $("#entity-content").empty();
                                parseJson(jsonObj, 0);
                            }


                            layer.open({
                                type: 1,
                                shadeClose: true,
                                shade: 0,
                                maxmin: true,
                                area: ['800px', '450px'],
                                content: $("#display-entity"),
                                btn: 'OK',
                                btnAlign: 'r',
                                title: "<b>查看试题</b>",
                                zIndex: 1001, //重点1
                                success: function(layero) {
                                    $("#header-bar").css({ "z-index": 900 });
                                },
                                end: function() {
                                    $("#header-bar").css({ "z-index": 1000 });
                                }
                            });
                        });

                });

                //监听行工具事件
                layui.table.on('tool(paging-table)', function(obj) {
                    var data = obj.data;
                    // 删除记录
                    if (obj.event === 'del') {
                        let record = "试题新ID：" + data.testentityid + "    试题旧ID：" + data.oldplatfromid + "<br>" + data.sentence;
                        let msg1 = '确定要删除这条反馈记录吗？<br>相关信息：<br>' + record + '<br>';

                        layer.confirm(msg1, function() {
                            let deletedata = '{"id":' + data.issueid + '}';
                            $.ajax({
                                type: "POST",
                                url: apiconf.issuerecorddelete,
                                contentType: "application/json",
                                data: deletedata,
                                xhrFields: XHRCONF,
                                success: function() {
                                    queryanrendertable();
                                    layer.closeAll();
                                },
                                error: function() {
                                    layer.open({
                                        skin: "layui-layer-molv",
                                        content: "删除失败，请联系管理员",
                                        time: 2000
                                    });
                                    layer.closeAll();
                                }
                            });
                        });
                    }
                    // 编辑记录 
                    else if (obj.event === 'edit') {
                        layer.open({
                            type: 1,
                            maxmin: true,
                            area: ['900px', '580px'],
                            content: $("#popup-record-edit"),
                            btn: 'OK',
                            btnAlign: 'r',
                            title: "<b>编辑反馈记录</b>",
                            success: function() {
                                var selectelement = $('#zhipaigei');
                                $(selectelement).empty();
                                $(selectelement).append('<option value="">' + '指派给' + '</option>');
                                $.each(ACCOUNTS, (__, item) => {
                                    if (item.roleid == 102) {
                                        let html = '<option value="' + item.id + '">' + item.name + '</option>';
                                        $(selectelement).append(html);
                                    }
                                });
                                $("#shitiid").val(data.testentityid);
                                $("#zhipaigei").val(data.solveaccountid);
                                $("#wentileixing").val(data.issuetypeid);
                                $("#fankuijuzi").val(data.sentence);
                                $("#zhishidian").val(data.knowledge);
                                $("#zhishidianleixing").val(data.knowledgetypeid);
                                $("#beizhu").val(data.knowledgememo);
                                $("#span-huifu").text(data.knowledgereply);
                                $("#shenhebeizhu").val(data.checkreply);
                                layui.form.render();
                            },
                            yes: function() {
                                let id = data.issueid;
                                let testentityid = $("#shitiid").val();
                                let solveaccountid = $("#zhipaigei").val();
                                let issuetypeid = $("#wentileixing").val();
                                let sentence = $("#fankuijuzi").val();
                                let knowledge = $("#zhishidian").val();
                                let knowledgetypeid = $("#zhishidianleixing").val();
                                let knowledgememo = $("#beizhu").val();
                                let checkreply = $("#shenhebeizhu").val();

                                var updateObj = {
                                    'id': id,
                                    'testentityid': testentityid,
                                    'solveaccountid': solveaccountid,
                                    'issuetypeid': issuetypeid,
                                    'sentence': sentence,
                                    'knowledge': knowledge,
                                    'knowledgetypeid': knowledgetypeid,
                                    'knowledgememo': knowledgememo,
                                    'checkreply': checkreply
                                };
                                var updatedata = JSON.stringify(updateObj);
                                $.ajax({
                                    type: "POST",
                                    url: apiconf.issuerecordupdate,
                                    contentType: "application/json",
                                    data: updatedata,
                                    xhrFields: XHRCONF,
                                    success: function(data) {
                                        if (data.code == 200) {
                                            layer.closeAll();
                                            obj.update({
                                                testentityid: updateObj.testentityid,
                                                solveaccountid: updateObj.solveaccountid,
                                                issuetypeid: updateObj.issuetypeid,
                                                sentence: updateObj.sentence,
                                                knowledge: updateObj.knowledge,
                                                knowledgetypeid: updateObj.knowledgetypeid,
                                                knowledgememo: updateObj.knowledgememo,
                                                checkreply: updateObj.checkreply
                                            });
                                        } else {
                                            layer.open({
                                                skin: "layui-layer-molv",
                                                content: "规则限制，更新失败",
                                                time: 0
                                            });
                                        }
                                    },
                                    error(_) {
                                        layer.open({
                                            skin: "layui-layer-molv",
                                            content: "代码报错啦，请联系管理员",
                                            time: 0
                                        });
                                    }
                                });
                            }
                        });

                    }
                });

                $("#table-title").empty();
                $("#table-title").append("<b>" + conf.title + "</b>");

            } else {
                layer.open({
                    skin: "layui-layer-molv",
                    content: "暂无权限查看",
                    time: 1200
                });
            }
        },
        error() {
            layer.open({
                skin: "layui-layer-molv",
                content: "代码报错啦，请联系管理员",
                time: 0
            });
        }
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


function functest() {
    this.sex = "unclear";
    return "functest";
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
                entityappend("题号（" + tihao + "）");
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
                entityappend("题号（" + tihao + "）", deep);
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