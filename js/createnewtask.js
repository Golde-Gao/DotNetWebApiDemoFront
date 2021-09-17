//本页面还缺少：选择去重任务后，缓存设置剩余题量的缓存
//选择题型-学习阶段-体裁后的去重后题量的设置
//试题总量缓存
//整合抽题条件数据，调用抽题接口。
var XHRCONF = {
    withCredentials: true
};
let ACCOUNTS = [];
let TIXING_CONF = null;
let TASK_CONF = [];
let checkedtasknamearr = [];
let checkedtaskname = [];
let checkedaccountnamearr = [];
let tixingcache = [];
let _SELECT_ACCOUNTS = [];
let _QUCHONG_TASKS = [];
let QUCHONGTASKINFO = [];

// 抽题设置
let task_subjectcode = 'C';
let task_parentTask = null;
let task_StrategyID = 0;
let task_assignmentCount = 0;
let task_assignmentAccount = [];
let task_assignmentAccountNames = [];
let task_testConf = 0;
let task_excludeTask = 0;
let tableheight = 0;
$(() => {
    tableheight = window.innerHeight - 121;
    $("#tree-tixing-version-ticai").css("height", window.innerHeight - 152);

    datainit();

    eventRegister();
});





function eventRegister() {
    // 抽题策略选择
    layui.form.on('select(choutimoshi-select)', event => {
        task_StrategyID = parseInt(event.value);
        $("#step-4-title").text("4. 题目类型及数量设置");
        $("#testquestion-cate-1").show();
        $("#testquestion-cate-2").hide();
        if (task_StrategyID == 102) {
            $("#quchongrenwu").show();
            $("#chongcerenwu").hide();
        } else if (task_StrategyID == 100) {
            $("#quchongrenwu").hide();
            $("#chongcerenwu").hide();
        } else {
            $("#testquestion-cate-1").hide();
            $("#testquestion-cate-2").show();
            $("#step-4-title").text("4. 试题ID设置");
        }
    });

    // 选择试题分配的人数
    layui.form.on('select(shiti-assignment)', event => task_assignmentCount = parseInt(event.value));

    // 任务名称非重复验证
    $("#input-taskname").focusout(event => {
        var taskname = $(event.target).val().trim();
        let checkUrl = apiconf.checkTestName + "?taskName=" + taskname;
        $.ajax({
                type: "GET",
                url: checkUrl,
                xhrFields: XHRCONF,
            })
            .then(data => {
                if (data.code == 200 && data.data == 1) {
                    layer.msg('任务名称 “' + taskname + '” 已经存在，请换一个');
                    $(event.target).css("border-color", "red");
                } else {
                    $(event.target).css("border-color", "");
                }
            });
    });

    // 选择不同学科
    layui.form.on('select(select-subject)', event => {
        // 设置当前测试学科
        task_subjectcode = event.value;

        //加载树控件的渲染数据
        var xueketreeconf = $.grep(TIXING_CONF, item => item.subjectcode == task_subjectcode);

        loadTreeConf(xueketreeconf);

        initEmptyTable();
    });



    testAccountChose();

    testQuChongChose();

    initEmptyTable();

    taskConfirm();
}

// 开始抽题
function taskConfirm() {
    function getTail(ddconf) {
        var tixing = "";
        var tail = ""
        $.each(ddconf, (_, dd) => {
            if (tixing != dd.tixing) {
                if (tixing != "") {
                    tail += "；"
                }
                tail += dd.tixing + "---";
                tail += dd.tixing + dd.genre + ", ";

                tixing = dd.tixing;
            } else {
                tail += dd.tixing + dd.genre + ", ";
            }
        })
        return tail;
    }
    $("#btn-confirm-task").click(_ => {

        let taskconf = {};
        // 先填充，后验证
        taskconf.taskName = $("#input-taskname").val().trim();
        taskconf.memo = $("#input-memo").val().trim();
        taskconf.subjectCode = task_subjectcode;
        taskconf.assignConf = {
            assignAccounts: task_assignmentAccount,
            assignCount: task_assignmentCount
        };
        taskconf.taskStrategyID = task_StrategyID;
        if (taskconf.taskStrategyID == 102) {
            taskconf.excludeTask = $.map(checkedtasknamearr, _ => _.taskid); //需要去重的任务
        }
        if (taskconf.taskStrategyID == 103) {
            var shitiidinput = $("#textarea-shitiID").val();
            var shitilist = shitiidinput.match(/[1-9][0-9]+/ig);
            if (shitilist == null || shitilist.length == 0) {
                layer.msg('请正确输入要测试的试题ID');
                return;
            }
            taskconf.testConf_EntityIDs = shitilist;
        } else {
            taskconf.testConf = tixingcache;

            if (taskconf.taskName == "") {
                layer.msg('任务名称不能为空');
                return;
            }
            if (task_assignmentAccount.length == 0) {
                layer.msg('请选择参与的测试人员，及试题分配方式');
                return;
            }
            if (task_StrategyID == 0) {
                layer.msg('请选择抽题模式');
                return;
            }
            if (tixingcache.length == 0) {
                layer.msg('请设置题目类型及数量');
                return;
            }
            if (taskconf.taskStrategyID == 102) {
                if (taskconf.excludeTask == null || taskconf.excludeTask.length == 0) {
                    layer.msg('请选择要去重的任务');
                    return;
                }
            }
        }


        let checkUrl = apiconf.checkTestName + "?taskName=" + taskconf.taskName;
        $.ajax({
                type: "GET",
                url: checkUrl,
                xhrFields: XHRCONF,
            })
            .then(data => {
                if (data.code == 200 && data.data == 1) {
                    layer.msg('任务名称 “' + taskconf.taskName + '” 已经存在，请换一个');
                } else {
                    layer.open({
                        type: 1,
                        title: "<b>请确认抽题信息</b>",
                        area: ['800px', '570px'],
                        shade: false,
                        id: 'chouticonfirm',
                        btn: ['确认', '再想想'],
                        btnAlign: 'r',
                        content: $('#data-confirm'),
                        success: function() {
                            // var tail = getTail(tixingcache);

                            // var tmptaskName = taskconf.taskName + "【" + tail + "】";


                            $("#confirm-taskName").text(taskconf.taskName);

                            var celue = "随机抽题";
                            if (taskconf.taskStrategyID == 102) {
                                celue = "去重抽题";
                                celue = celue + "（已选去重任务数量：" + taskconf.excludeTask.length + "）";
                            } else if (taskconf.taskStrategyID == 103) {
                                celue = "精准抽题";
                            }
                            $("#confirm-taskStrategy").text(celue);


                            $("#confirm-accounts").text(task_assignmentAccountNames);
                            $("#confirm-assign").text(taskconf.assignConf.assignCount);
                            $("#confirm-memo").text(taskconf.memo);
                            if (taskconf.taskStrategyID == 103) {
                                $("#confirm--div-ids").text(taskconf.testConf_EntityIDs);
                                $("#confirm-table").hide();
                                $("#confirm--div-ids").show();
                            } else {
                                $("#confirm-table").show();
                                $("#confirm--div-ids").hide();
                                layui.table.render({
                                    elem: '#confirm-table',
                                    cellMinWidth: 80,
                                    cols: [
                                        [{
                                                type: 'numbers',
                                                title: '序号'
                                            },
                                            {
                                                field: 'tixing',
                                                title: '题型'
                                            },
                                            {
                                                field: 'genre',
                                                title: '体裁'
                                            },
                                            {
                                                field: 'version',
                                                title: '学习阶段'
                                            },
                                            {
                                                field: 'count',
                                                title: '抽题数量'
                                            }
                                        ]
                                    ],
                                    data: taskconf.testConf,
                                    height: 270,
                                    id: "confirmtable",
                                    limit: 70,
                                    page: true
                                });
                            }
                        },
                        yes: function() {
                            // var tail = getTail(tixingcache);

                            // taskconf.taskName = taskconf.taskName + "【" + tail + "】";
                            let createobjtext = JSON.stringify(taskconf);
                            $.ajax({
                                type: "POST",
                                url: apiconf.createtask,
                                contentType: "application/json",
                                xhrFields: XHRCONF,
                                data: createobjtext,
                            }).then(data => {
                                window.location.href = "navigation-3.html";
                            });
                        },
                        end: _ => {
                            $('#data-confirm').hide();
                        }
                    });
                }
            });
    });
}

// 测试账号事件选择注册
function testAccountChose() {
    $(".select-testaccount-setting").click(_ => {
        layer.open({
            type: 1,
            shadeClose: true,
            shade: 0,
            area: ['800px', '700px'],
            content: $("#testaccount-select-panel"),
            btn: '确定',
            btnAlign: 'r',
            title: '<b>选择参与测试账号</b>',
            zIndex: 1001,
            success: function() {
                $(".layui-header").css("z-index", 1);
                let currentdata = $.map(ACCOUNTS, _ => _);

                layui.table.render({
                    elem: '#testaccount-table',
                    cellMinWidth: 80,
                    cols: [
                        [{
                                type: 'numbers',
                                title: '序号'
                            },
                            {
                                type: 'checkbox'
                            },
                            {
                                field: 'id',
                                title: 'ID',
                                sort: true
                            },
                            {
                                field: 'name',
                                title: '用户名'
                            }
                        ]
                    ],
                    data: currentdata,
                    height: 540,
                    id: "testaccount",
                    limit: 70,
                    page: true
                });
            },
            yes: function() {
                var checkStatus = layui.table.checkStatus('testaccount')
                var getData = checkStatus.data;
                var conditiondata = $.map(getData, _ => _.name);

                if (conditiondata.length > 0) {
                    $("#select-testaccount").attr("readonly", false);
                    var text = conditiondata.join("，");
                    var textsub = text.length > 24 ? text.substring(0, 24) + "... ..." : text;

                    $("#select-testaccount").attr("value", textsub);
                    $("#select-testaccount").attr("title", text);
                    $("#select-testaccount").attr("readonly", true);
                } else {
                    $("#select-testaccount").attr("title", "");
                    $("#select-testaccount").attr("readonly", false);
                    $("#select-testaccount").attr("value", "");
                    $("#select-testaccount").attr("readonly", true);
                }
                //修改试题分配下拉框
                $("#shiti-assignment").empty();
                for (_ind = 0; _ind < getData.length; _ind++) {
                    let renshu = _ind + 1;
                    if (renshu == getData.length) {
                        $("#shiti-assignment").append('<option value="' + renshu + '"  selected="">' + renshu + '&nbsp;&nbsp;人/题</option>');
                    } else {
                        $("#shiti-assignment").append('<option value="' + renshu + '">' + renshu + '&nbsp;&nbsp;人/题</option>');
                    }
                }

                task_assignmentAccount = $.map(getData, _ => _.id);
                task_assignmentAccountNames = $.map(getData, _ => _.name);

                task_assignmentCount = getData.length;
                layui.form.render();
                layer.closeAll();
            },
            end: function() {
                $("#testaccount-select-panel").hide();
                $(".layui-header").css("z-index", 1000);
            }
        });
    });
}

// 去重测试选择注册
function testQuChongChose() {
    $(".select-testtask-setting").click(_ => {
        layer.open({
            type: 1,
            shadeClose: true,
            shade: 0,
            area: ['1100px', '740px'],
            content: $("#testtask-select-panel"),
            btn: '确定',
            btnAlign: 'r',
            title: '<b>选择去重任务</b>',
            zIndex: 10001,
            success: function() {
                // var quchogntaskconf=$.grep(TASK_CONF,(_,item)=>item.);
                var grep_taskconf = TASK_CONF;
                var skey = $("#input-taskname-search").val().trim();
                if (skey != "") {
                    var searchstr = $("#input-taskname-search").val().trim().split("&");
                    grep_taskconf = $.grep(TASK_CONF, item => {
                        var bo1 = $.grep(searchstr, eee => {
                            return eee != "" && item.taskname.indexOf(eee) > -1
                        }).length > 0;
                        // var bo2 = item.subjectcode == task_subjectcode;
                        return bo1;
                    });
                }
                grep_taskconf = $.grep(grep_taskconf, item => {
                    return item.subjectcode == task_subjectcode;
                });

                $(".layui-header").css("z-index", 1);
                layui.table.render({
                    elem: '#testtask-table',
                    cellMinWidth: 80,
                    cols: [
                        [{
                                type: 'numbers',
                                title: '序号'
                            },
                            {
                                type: 'checkbox'
                            },
                            {
                                field: 'taskname',
                                title: '任务名称',
                                sort: true
                            },
                            {
                                field: 'createtime',
                                title: '创建时间',
                                sort: true,
                                width: 180
                            }
                        ]
                    ],
                    data: grep_taskconf,
                    height: 540,
                    id: "testtask",
                    limit: 100,
                    page: {
                        limits: [10, 30, 50, 100, 200, 400, 700, 1000, 5000, 10000]
                    }
                });
                // 保存当前选中的所有数据 1 过滤本页所有数据 2 添加本页选中数据
                layui.table.on('checkbox(testtask-table)', function(obj) {
                    var checkdata = layui.table.checkStatus('testtask').data;
                    var alldata = layui.table.getData('testtask');
                    tmparr = $.grep(checkedtasknamearr, ele => {
                        return $.grep(alldata, _ => _.taskname == ele.taskname).length == 0;
                    });
                    checkedtasknamearr = tmparr.concat(checkdata);
                });
            },
            yes: function() {
                var conditiondata = $.map(checkedtasknamearr, _ => _.taskname);
                if (conditiondata.length > 0) {
                    $("#select-testtask").attr("readonly", false);

                    var text = conditiondata.join(",");
                    var textsub = text;
                    textsub = text.length > 20 ? text.substring(0, 20) + "... ..." : textsub;

                    $("#select-testtask").attr("value", textsub);
                    $("#select-testtask").attr("title", text);
                    $("#select-testtask").attr("readonly", true);
                } else {
                    $("#select-testtask").attr("readonly", false);
                    $("#select-testtask").attr("value", "");
                    $("#select-testtask").attr("readonly", true);
                }

                // 设置抽题表格
                layui.table.render({
                    elem: '#paging-table',
                    cellMinWidth: 80,
                    cols: [
                        [{
                                type: 'numbers',
                                title: '序号'
                            },
                            {
                                field: 'tixing',
                                title: '题型'
                            },
                            {
                                field: 'tixingcount',
                                title: '题型试题总量'
                            },
                            {
                                field: 'version',
                                title: '学习阶段'
                            },
                            {
                                field: 'ticai',
                                title: '体裁',
                            },
                            {
                                field: 'genrecount',
                                title: '体裁试题总量'
                            },
                            {
                                field: 'alreadyCount',
                                title: '已测题量'
                            },
                            {
                                field: 'quchongCount',
                                title: '去重后题量'
                            },
                            {
                                field: 'count',
                                title: '测试数量(点击编辑)',
                                edit: 'text',
                                width: 160
                            },
                        ]
                    ],
                    data: [],
                    height: tableheight,
                    limit: 14,
                    page: true
                });
                tixingcache = [];
                layer.closeAll();
            },
            end: function() {
                var loadIndex = layui.layer.load(0, {
                    shade: 0.2
                });
                $("#testtask-select-panel").hide();
                $(".layui-header").css("z-index", 1000);
                //更新题型-体裁信息中的试题数量
                var textsub = "";
                var conditiondata = $.map(checkedtasknamearr, _ => _.taskid);
                if (conditiondata.length > 0) {
                    $("#select-testtask").attr("readonly", false);
                    var text = conditiondata.join(",");
                    textsub = text;
                }


                var uurrll = apiconf.n_taskShiTiCount + "?taskIds=" + textsub;
                $.ajax({
                        type: "GET",
                        url: uurrll,
                        xhrFields: XHRCONF,
                    })
                    .then(data => {
                        QUCHONGTASKINFO = data.data;

                        //加载树控件的渲染数据
                        var xueketreeconf = $.grep(TIXING_CONF, item => item.subjectcode == task_subjectcode);

                        loadTreeConf(xueketreeconf);
                        layui.layer.close(loadIndex);
                    })
            }
        });
    });

    $("#btn-search-task").click(_ => {
        var searchstr = $("#input-taskname-search").val().trim().split("&");
        if ($("#input-taskname-search").val().trim() == "") {
            layui.layer.msg("输入搜索关键词！(可以有用“&”连接使用多个搜索关键词)");
            return;
        }
        var grep_taskconf = $.grep(TASK_CONF, item => {
            return $.grep(searchstr, eee => {
                return eee != "" && item.taskname.indexOf(eee) > -1
            }).length > 0;
        });

        $(".layui-header").css("z-index", 1);
        layui.table.render({
            elem: '#testtask-table',
            cellMinWidth: 80,
            cols: [
                [{
                        type: 'numbers',
                        title: '序号'
                    },
                    {
                        type: 'checkbox'
                    },
                    {
                        field: 'taskname',
                        title: '任务名称',
                        sort: true
                    },
                    {
                        field: 'createtime',
                        title: '创建时间',
                        sort: true,
                        width: 180
                    }
                ]
            ],
            data: grep_taskconf,
            height: 540,
            id: "testtask",
            limit: 100,
            page: {
                limits: [10, 30, 50, 100, 200, 400, 700, 1000, 5000, 10000]
            }
        });

    });

}

// 初始化空的抽题表格
function initEmptyTable() {
    layui.table.render({
        elem: '#paging-table',
        cellMinWidth: 80,
        cols: [
            [{
                    type: 'numbers',
                    title: '序号'
                },
                {
                    field: 'tixing',
                    title: '题型'
                },
                {
                    field: 'version',
                    title: '学习阶段'
                },
                {
                    field: 'ticai',
                    title: '体裁',
                },
                {
                    field: 'sum',
                    title: '试题总量'
                },
                {
                    field: 'left',
                    title: '去重后题量'
                },
                {
                    field: 'count',
                    title: '测试数量(点击编辑)',
                    edit: 'text'
                },
            ]
        ],
        data: [],
        height: tableheight,
        limit: 14,
        page: true
    });
}

// 加载数据库配置数据
function datainit() {
    $.ajax({
            type: "GET",
            url: apiconf.findalluser,
            xhrFields: XHRCONF,
        })
        .then(data => {
            ACCOUNTS = $(data.data).filter((_, ele) => ele.roleid == 101);
            return $.ajax({
                type: "GET",
                url: apiconf.questionproperty,
                xhrFields: XHRCONF,
            });
        }).then(data => {
            TIXING_CONF = data.data;
            return $.ajax({
                type: "GET",
                url: apiconf.testtaskdetail,
                xhrFields: XHRCONF,
            });
        }).then(data => {
            TASK_CONF = [];
            $.each(data.data, (_, ele) => {
                if (ele.taskstrategyid != 101) {
                    if ($(TASK_CONF).filter((__, tt) => {
                            return tt.taskname == ele.taskname && tt.taskid == ele.taskid && tt.subjectcode == ele.subjectcode && tt.subjectname == ele.subjectname;
                        }).length == 0) {
                        TASK_CONF.push({
                            "taskname": ele.taskname,
                            "taskid": ele.taskid,
                            "subjectcode": ele.subjectcode,
                            "subjectname": ele.subjectname,
                            "createtime": ele.createtime,
                            "tixingcount": ele.tixingCount,
                            "genrecount": ele.genreCount
                        });
                    }
                }
            });
            let subjecttreeconf = $.grep(TIXING_CONF, item => item.subjectname == "英语");
            loadTreeConf(subjecttreeconf);
        });
}

//渲染题型选择树，及表格相关操作
function loadTreeConf(tixingconf) {
    layui.table.render({
        elem: '#paging-table',
        cellMinWidth: 80,
        cols: [
            [{
                    type: 'numbers',
                    title: '序号'
                },
                {
                    field: 'tixing',
                    title: '题型'
                },
                {
                    field: 'version',
                    title: '学习阶段'
                },
                {
                    field: 'tixingcount',
                    title: '题型阶段总量'
                },
                {
                    field: 'ticai',
                    title: '体裁',
                },
                {
                    field: 'genrecount',
                    title: '体裁试题总量'
                },
                {
                    field: 'alreadyCount',
                    title: '已测题量'
                },
                {
                    field: 'quchongCount',
                    title: '去重后题量'
                },
                {
                    field: 'count',
                    title: '测试数量(点击编辑)',
                    edit: 'text',
                    width: 160
                },
            ]
        ],
        data: [],
        height: tableheight,
        limit: 14,
        page: true
    });


    let initdadddta = [];
    $.each(tixingconf, (_, item) => {
        if ($.grep(initdadddta, item2 => item2.tixing == item.questiontypename).length == 0) {
            initdadddta.push({
                "tixing": item.questiontypename,
                "count": item.tixingCount
            });
        }
    });
    initdadddta.sort((item1, item2) => item1.count > item2.count ? -1 : 1)

    //-------------------试题树形控件数据组织start---------------------
    let indexxx = 0;
    let initdata = [];
    $.each(tixingconf, (_, ele) => {
        if ($.grep(initdata, item => item.title == ele.questiontypename).length == 0) {
            let tixingobj = {
                title: ele.questiontypename,
                id: indexxx++,
                field: 'questiontypename',
                code: ele.questiontypecode,
                // spread: true,

                children: []
            };
            initdata.push(tixingobj);
        }
    });

    $.each(tixingconf, (_, ele) => {
        $.each(initdata, (__, item) => {
            if (item.title == ele.questiontypename) {
                if ($.grep(item.children, (item2, __) => item2.title == ele.versionname).length == 0) {
                    let obj = {
                        title: ele.versionname,
                        id: indexxx++,
                        code: ele.versioncode,
                        tixingcount: ele.tixingCount,
                        // spread: true,
                        children: []
                    };
                    item.children.push(obj);
                }
            }
        });
    });

    $.each(tixingconf, (_, ele) => {
        $.each(initdata, (__, item) => {
            if (item.title == ele.questiontypename) {
                $.each(item.children, (___, item2) => {
                    if (item2.title == ele.versionname) {
                        if ($.grep(item2.children, (item3, __) => item3.title == ele.genrename).length == 0) {
                            if (typeof(ele.genrename) != "undefined" && ele.genrename != "" && ele.genrename != null) {

                                var alCount = 0;
                                var quchongObj = $.grep(QUCHONGTASKINFO, quchongitem => {
                                    var bo1 = ele.genrecode == quchongitem.genreCode;
                                    var bo2 = ele.subjectcode = quchongitem.subjectCode;
                                    var bo3 = ele.questiontypecode = quchongitem.tixingCode;
                                    var bo4 = ele.versioncode == quchongitem.versionCode;
                                    return bo1 && bo2 && bo3 && bo4;
                                });
                                if (quchongObj != null && quchongObj.length == 1) {
                                    alCount = quchongObj[0].questionCount;
                                }
                                var quchong = ele.genreCount - alCount;
                                let obj = {
                                    title: ele.genrename,
                                    id: indexxx++,
                                    code: ele.genrecode,
                                    // spread: true
                                    genrecount: ele.genreCount,
                                    alreadyCount: alCount,
                                    quchongCount: quchong
                                };
                                item2.children.push(obj);
                            }
                        }
                    }
                });
            }
        });
    });
    //-------------------试题树形控件数据组织end---------------------

    // 加载树形控件，并注册相关操作
    layui.tree.render({
        elem: '#tree-tixing-version-ticai',
        data: initdata,
        showCheckbox: true,
        id: 'tixingtree',
        isJump: true,
        oncheck: function() {
            var checkData = layui.tree.getChecked('tixingtree');
            var tabledata = [];
            $.each(checkData, (_, ele1) => {
                $.each(ele1.children, (_, ele2) => {
                    if (ele2.children.length == 0) {
                        var tmpp = $.grep(tixingcache, item3 => item3.subjectCode == task_subjectcode && item3.tixing == ele1.title && item3.version == ele2.title);
                        let count = tmpp.length > 0 ? tmpp[0].count : 0;

                        let tmpobj = {
                            "tixing": ele1.title,
                            "tixingCode": ele1.code,
                            "ticai": "",
                            "count": count,
                            "sum": 0,
                            "version": ele2.title,
                            "versionCode": ele2.code
                        };
                        tabledata.push(tmpobj);
                    } else {
                        $.each(ele2.children, (_, ele3) => {
                            var tmpp = $.grep(tixingcache, item3 => item3.subjectCode == task_subjectcode && item3.tixing == ele1.title && item3.genre == ele3.title && item3.version == ele2.title);
                            let count = tmpp.length > 0 ? tmpp[0].count : "";

                            let tmpobj = {
                                "tixing": ele1.title,
                                "tixingCode": ele1.code,
                                "ticai": ele3.title,
                                "ticaiCode": ele3.code,
                                "count": count,
                                "sum": 0,
                                "tixingcount": ele2.tixingcount,
                                "genrecount": ele3.genrecount,
                                "quchongCount": ele3.quchongCount,
                                "alreadyCount": ele3.alreadyCount,
                                "version": ele2.title,
                                "versionCode": ele2.code
                            };
                            tabledata.push(tmpobj);
                        });
                    }
                });
            });

            // 设置抽题表格
            var tableD = tabledata.filter(ele => {
                if (ele.genrecount > 0) {
                    return ele;
                }
            });
            layui.table.render({
                elem: '#paging-table',
                cellMinWidth: 80,
                cols: [
                    [{
                            type: 'numbers',
                            title: '序号'
                        },
                        {
                            field: 'tixing',
                            title: '题型'
                        },
                        {
                            field: 'version',
                            title: '学习阶段'
                        },
                        {
                            field: 'tixingcount',
                            title: '题型阶段总量'
                        },
                        {
                            field: 'ticai',
                            title: '体裁',
                        },
                        {
                            field: 'genrecount',
                            title: '体裁试题总量'
                        },
                        {
                            field: 'alreadyCount',
                            title: '已测题量'
                        },
                        {
                            field: 'quchongCount',
                            title: '去重后题量'
                        },
                        {
                            field: 'count',
                            title: '测试数量(点击编辑)',
                            edit: 'text',
                            width: 160
                        },
                    ]
                ],
                data: tableD,
                height: tableheight,
                limit: 14,
                page: true
            });

            layui.table.on('edit(paging-table)', event => {
                //先做删除操作
                tixingcache = $.grep(tixingcache, ele => {
                    var bbb = ele.tixing == event.data.tixing && ele.genre == event.data.ticai && ele.version == event.data.version;
                    return !bbb;
                });

                if (/^[1-9]\d*$/.test(event.value)) {
                    var inputCount = parseInt(event.value);
                    var total = event.data.quchongCount;
                    if (inputCount <= total) {
                        let tmpobj = {
                            "tixing": event.data.tixing,
                            "tixingCode": event.data.tixingCode,
                            "genre": event.data.ticai,
                            "genreCode": parseInt(event.data.ticaiCode),
                            "version": event.data.version,
                            "versionCode": event.data.versionCode,
                            "count": inputCount
                        };
                        let has = false;
                        $.each(tixingcache, (_, ele) => {
                            if (ele.tixing == tmpobj.tixing && ele.genre == tmpobj.genre && ele.version == tmpobj.version) {
                                ele.count = event.value;
                                has = true;
                            }
                        })
                        if (has == false) {
                            tixingcache.push(tmpobj);
                        }
                    } else {
                        layer.msg("抽题数量不能大于去重后题量");
                    }
                } else {
                    layer.msg("只能输入大于0的整数");
                }
            });
        }
    });
}