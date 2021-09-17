var XHRCONF = { withCredentials: true };
$(function() {
    layui.laydate.render({ elem: '#s_startEndTime', type: 'datetime', range: true });

    $("#btn-createtask").click(_ => {
        window.location.href = "createnewtask.html";
        return false;
    });


    $("#button-duibirenwu").click(function(event) {
        window.location.href = "checkpage-admin-compare.html";
    });

    querypage();
});

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function querypage() {
    var conf = {
        page: null,
        url: apiconf.n_taskviewpage,
        colsconf: [
            [
                { field: 'index', title: '序号', width: 60 },
                { field: 'subjectName', title: '学科', width: 80 },
                { field: 'taskName', title: '任务名称' },
                { field: 'memo', title: '备注', width: 90 },
                { field: 'statusName', title: '任务状态', width: 90 },
                { field: 'createTime', title: '创建时间', width: 170 },
                { field: 'autoChaYi', title: '有无自动识别差异试题', width: 180 },
                { fixed: 'right', title: '操作', toolbar: '#table-butttons-pagelevel', width: 330 }
            ]
        ],
        startpage: 1,
        pagesize: 12
    };


    let s_subject = getQueryVariable("s_subject");
    s_subject = s_subject == false ? "" : decodeURIComponent(s_subject);
    let s_status = getQueryVariable("s_status");
    s_status = s_status == false ? "" : decodeURIComponent(s_status);
    let s_taskname = getQueryVariable("s_taskname");
    s_taskname = s_taskname == false ? "" : decodeURIComponent(s_taskname);
    let s_testcount = getQueryVariable("s_testcount");
    s_testcount = s_testcount == false ? "" : decodeURIComponent(s_testcount);
    let s_time = getQueryVariable("s_time");
    s_time = s_time == false ? "" : decodeURIComponent(s_time).replace(/\+/g, " ");
    let s_memo = getQueryVariable("s_memo");
    s_memo = s_memo == false ? "" : decodeURIComponent(s_memo);
    let s_name = getQueryVariable("s_name");
    s_name = s_name == false ? "" : decodeURIComponent(s_name);
    let s_autoChaYi = getQueryVariable("s_autoChaYi");
    s_autoChaYi = s_autoChaYi == false ? "" : decodeURIComponent(s_autoChaYi);
    let s_startEndTime = getQueryVariable("s_startEndTime");
    s_startEndTime = s_startEndTime == false ? "" : decodeURIComponent(s_startEndTime).replace(/\+/g, ' ');

    let s_pageNum = getQueryVariable("s_pageNum");
    s_pageNum = s_pageNum == false ? "" : decodeURIComponent(s_pageNum);


    let querytext = "memo=" + s_memo;
    querytext += "&taskName=" + s_taskname;
    querytext += "&subjectCode=" + s_subject;
    querytext += "&checkStatusID=" + s_status;
    querytext += "&autoChayi=" + s_autoChaYi;
    querytext += "&startEndTime=" + s_startEndTime;
    querytext += "&pageSize=" + conf.pagesize;
    querytext += "&pageNum=" + s_pageNum;

    layui.form.val('task-query', {
        "s_subject": s_subject,
        "s_status": s_status,
        "s_taskname": s_taskname,
        "s_testcount": s_testcount,
        "s_time": s_time,
        "s_memo": s_memo,
        "s_name": s_name,
        "s_autoChaYi": s_autoChaYi,
        "s_startEndTime": s_startEndTime,
    });

    let backurl = conf.url + "?" + querytext;

    $.ajax({
        type: "GET",
        url: backurl,
        xhrFields: XHRCONF
    }).then(data => {
        if (data.code == 200) {
            let pagenumber = s_pageNum == "" ? 1 : s_pageNum;
            let tabledata = $.map(data.data.list, (item, ind) => {
                item.index = (pagenumber - 1) * conf.pagesize + ind + 1;
                return item;
            });

            layui.table.render({
                elem: '#paging-table',
                cellMinWidth: 80,
                height: "full-260",
                cols: conf.colsconf,
                limit: conf.pagesize,
                data: tabledata,
                even: true
            });

            layui.laypage.render({
                elem: 'paging',
                count: data.data.total,
                limit: conf.pagesize,
                layout: ['count', 'prev', 'next', 'page', 'skip'],
                curr: s_pageNum,

                jump: function(obj, first) {
                    if (!first) {
                        var newhref = window.location.href;
                        if (newhref.indexOf("s_pageNum") > -1) {
                            newhref = newhref.replace(/(?<=s_pageNum=)\d+/g, obj.curr);
                        } else {
                            if (newhref.indexOf("&") > -1) {
                                newhref = newhref + "&s_pageNum=" + obj.curr;
                            } else {
                                newhref = newhref + "?s_pageNum=" + obj.curr;
                            }
                        }
                        window.location.href = newhref;
                    }

                }
            });

            layui.table.on('rowDouble(paging-table)', function(obj) {
                var choutiprogressUrl = apiconf.choutiprogressUrl + "?taskId=" + obj.data.taskID;
                $.ajax({ type: "GET", url: choutiprogressUrl, xhrFields: { withCredentials: true } })
                    .then(daa => {
                        layer.msg('【' + obj.data.taskName + '】抽题进度：  ' + daa.data.finishedCount + '/' + daa.data.totalCount + '');
                    })
            });
            //监听行工具事件
            layui.table.on('tool(paging-table)', function(obj) {
                if (obj.event === 'retest') {
                    if (obj.data.statusID == 103) {
                        layer.msg('当前任务正在创建过程中... ...', { icon: 0, time: 2300 });
                    } else {
                        layer.confirm('任务名称：【' + obj.data.taskName + '】  <br>此操作可能耗时较长，确定要重测此任务？', {
                            btn: ['确定', '取消'],
                            title: "任务重测确认",
                            icon: 7,
                            success: function() {
                                var taskconf = {
                                    "memo": "重测的任务",
                                    "retestTask": obj.data.taskID,
                                    "taskStrategyID": 101
                                };

                                let createobjtext = JSON.stringify(taskconf);
                                $.ajax({
                                    type: "POST",
                                    url: apiconf.n_taskRetest,
                                    contentType: "application/json",
                                    xhrFields: XHRCONF,
                                    data: createobjtext,
                                }).then(data => {
                                    // window.location.href = "navigation-3.html";
                                });

                            }

                        }, function() {
                            layer.msg('开始重测', { icon: 1, time: 700 });
                        });
                    }
                }
                if (obj.event === 'delete-task') {
                    if (obj.data.statusID == 103) {
                        layer.confirm('d当前任务正在创建过程中\n   任务名称：【' + obj.data.taskName + '】<br>与任务关联的试题、账号、识别结果、审核结果都将被删除，且不可恢复。<br>确定删除此任务？', {
                            btn: ['确定', '取消'],
                            icon: 7,
                            title: "删除操作确认"
                        }, function() {
                            var loadIndex = layer.load(0, { shade: 0.25 });

                            $.ajax({
                                type: "POST",
                                url: apiconf.n_taskdelete,
                                contentType: "application/json",
                                data: '{"id":' + obj.data.taskID + '}',
                                xhrFields: XHRCONF,
                                success: function(data) {
                                    if (data.code == 200) {
                                        layer.close(loadIndex);
                                        layer.msg('任务已删除', { icon: 1, time: 1300 });
                                        location.reload();
                                    }
                                }
                            });
                        });
                    } else {
                        layer.confirm('任务名称：【' + obj.data.taskName + '】<br>与任务关联的试题、账号、识别结果、审核结果都将被删除，且不可恢复。<br>确定删除此任务？', {
                            btn: ['确定', '取消'],
                            icon: 7,
                            title: "删除操作确认"
                        }, function() {
                            var loadIndex = layer.load(0, { shade: 0.25 });

                            $.ajax({
                                type: "POST",
                                url: apiconf.n_taskdelete,
                                contentType: "application/json",
                                data: '{"id":' + obj.data.taskID + '}',
                                xhrFields: XHRCONF,
                                success: function(data) {
                                    if (data.code == 200) {
                                        layer.close(loadIndex);
                                        layer.msg('任务已删除', { icon: 1, time: 1300 });
                                        location.reload();
                                    }
                                }
                            });
                        });
                    }
                }
                if (obj.event === 'update-task') {
                    if (obj.data.statusID == 103) {
                        layer.msg('当前任务正在创建过程中... ...', { icon: 0, time: 2300 });
                    } else {
                        layer.open({
                            type: 1,
                            shadeClose: true,
                            shade: 0,
                            area: ['640px', '210px'],
                            content: $("#taskname-check"),
                            btn: "确定",
                            resize: false,
                            btnAlign: 'r',
                            title: "<b>修改任务名称</b>（" + obj.data.taskName + "）",
                            zIndex: 1001, //重点1
                            success: function(layero) {
                                $("#new-taskName").val(obj.data.taskName);
                            },
                            yes: function() {
                                var newttName = $("#new-taskName").val().trim();
                                if (newttName == "") {
                                    layui.layer.msg("请输入任务名称");
                                    return;
                                }
                                let checkUrl = apiconf.checkTestName + "?taskName=" + newttName;
                                $.ajax({ type: "GET", url: checkUrl, xhrFields: XHRCONF, })
                                    .then(data => {
                                        if (data.code == 200 && data.data == 1) {
                                            layer.msg('任务名称 “' + newttName + '” 已经存在，请换一个');
                                        } else {
                                            var loadIndex = layer.load();
                                            var updatedd = '{"id":' + obj.data.taskID + ',"name":"' + newttName + '"}';
                                            $.ajax({
                                                type: "POST",
                                                url: apiconf.n_updatetask,
                                                contentType: "application/json",
                                                data: updatedd,
                                                xhrFields: XHRCONF,
                                                success: function(data) {
                                                    if (data.code == 200) {
                                                        layer.close(loadIndex);
                                                        layer.msg('修改成功', { icon: 1, time: 1300 });
                                                        location.reload();
                                                    } else {
                                                        layer.msg('操作未成功');
                                                    }
                                                }
                                            });
                                        }
                                    });


                            },
                            end: function() {
                                $("#taskname-check").hide();
                            }
                        });
                    }
                }
                if (obj.event === 'contrast-task') {
                    if (obj.data.statusID == 103) {
                        layer.msg('当前任务正在创建过程中... ...', { icon: 0, time: 2300 });
                    } else {
                        layer.open({
                            type: 1,
                            shadeClose: true,
                            shade: 0,
                            area: ['840px', '500px'],
                            content: $("#popup-detail-check"),
                            btn: ["对比选中的测试记录"],
                            resize: false,
                            btnAlign: 'r',
                            title: '<b>重测对比</b>（' + obj.data.taskName + ' ）',
                            zIndex: 1001, //重点1
                            success: function(layero) {
                                var restesQueryUrl = apiconf.n_taskRetestDetail + "?taskId=" + obj.data.taskID;
                                $.ajax({ type: "GET", url: restesQueryUrl, xhrFields: XHRCONF })
                                    .then(data => {
                                        layui.table.render({
                                            id: "task-user-duibi-table-id",
                                            elem: '#task-user-duibi-table',
                                            cellMinWidth: 80,
                                            height: 360,
                                            LAY_CHECKED: false,
                                            cols: [
                                                [
                                                    { type: "checkbox", width: 60 },
                                                    { type: 'numbers', title: '序号' },
                                                    { field: 'userName', title: '测试账号', width: 120 },
                                                    // { field: 'taskName', title: '测试名称' },
                                                    { field: 'createTime', title: '测试时间' },
                                                ]
                                            ],
                                            data: data.data,
                                            even: true
                                        });
                                        $("div[lay-id='task-user-duibi-table-id']").find("th").find(".laytable-cell-checkbox").empty();
                                        $("div[lay-id='task-user-duibi-table-id']").find("th").find(".laytable-cell-checkbox").append('<div class="layui-table-cell laytable-cell-2-0-0"><span>选择</span></div>');
                                        layui.table.on('checkbox(task-user-duibi-table)', function(data) {
                                            var checkStatus = layui.table.checkStatus('task-user-duibi-table-id');
                                            var checkelements = $("div[lay-id='task-user-duibi-table-id']").find("tbody").find(".layui-form-checkbox");

                                            if (checkStatus.data.length > 1) {
                                                $.each(checkelements, (_, ele) => {
                                                    if (!$(ele).hasClass("layui-form-checked")) {
                                                        $(ele).hide();
                                                    }
                                                })
                                            } else {
                                                $.each(checkelements, (_, ele) => {
                                                    if (!$(ele).hasClass("layui-form-checked")) {
                                                        $(ele).show();
                                                    }
                                                })
                                            }
                                        });
                                    });
                            },
                            yes: function() {
                                var checkStatus = layui.table.checkStatus('task-user-duibi-table-id');
                                if (checkStatus.data.length == 2) {
                                    window.location.href = "checkpage-contrast.html?" +
                                        "backgroundtaskid=" + checkStatus.data[0].taskID +
                                        "&popuptaskid=" + checkStatus.data[1].taskID +
                                        "&backgrounduserid=" + checkStatus.data[0].userID +
                                        "&popupuserid=" + checkStatus.data[1].userID +
                                        "&taskname=" + obj.data.taskName +
                                        "&backgroundusername=" + checkStatus.data[0].userName +
                                        "&popupusername=" + checkStatus.data[1].userName +
                                        "&shitiindex=" + 0;
                                } else {
                                    layer.msg("请选中两条测试记录，以进行对比");
                                }
                            },
                            end: function() {
                                $("#header-bar").css({ "z-index": 1000 });
                                $("#popup-detail-check").hide();
                            }
                        });
                    }
                } else if (obj.event === "zuixinshenhe") {
                    if (obj.data.statusID == 103) {
                        layer.msg('当前任务正在创建过程中... ...', { icon: 0, time: 2300 });
                    } else {
                        layer.open({
                            type: 1,
                            shadeClose: true,
                            shade: 0,
                            area: ['840px', '510px'],
                            content: $("#popup-new-check"),
                            btn: [],
                            resize: false,
                            btnAlign: 'r',
                            title: "<b>最新审核</b>（" + obj.data.taskName + "）",
                            zIndex: 1001, //重点1
                            success: function(layero) {
                                $.ajax({
                                    type: "GET",
                                    url: apiconf.n_taskassignment + "?taskId=" + obj.data.taskID,
                                    xhrFields: XHRCONF,
                                    success: function(taskdata) {
                                        layui.table.render({
                                            elem: '#task-user-new-table',
                                            cellMinWidth: 80,
                                            height: 400,
                                            LAY_CHECKED: false,
                                            cols: [
                                                [
                                                    { type: 'numbers', title: '序号' },
                                                    { field: 'createTime', title: '测试时间' },
                                                    { field: 'autoChaYiSum', title: '自动识别差异题量' },
                                                    { field: 'statusTaskName', title: '审核状态', width: 100 },
                                                    { field: 'userName', title: '测试账号', width: 100 },
                                                    { fixed: 'right', title: '操作', toolbar: '#table-buttton-zuixinshenhe', width: 80 }
                                                ]
                                            ],
                                            data: taskdata.data,
                                            even: true,
                                            page: {
                                                limit: 12,
                                                layout: ['count', 'prev', 'next', 'page', 'skip']
                                            }
                                        });


                                    }
                                });

                                //监听行工具事件
                                layui.table.on('tool(task-user-new-table)', function(obj) {
                                    var data = obj.data;
                                    if (obj.event === 'check-task') {
                                        // window.location.href = "checkpage-baseview.html";
                                        // var checkpageIndex = GetCheckpageIndex();
                                        var queeee =
                                            "taskid=" + obj.data.taskID +
                                            // "&checkpageindex=" + checkpageIndex +
                                            "&shitiindex=0" +
                                            "&taskname=" + obj.data.taskname +
                                            "&newresultstatus=" +
                                            "&checkstatus=" +
                                            "&currentshitiid=" +
                                            "&userid=" + obj.data.userID;
                                        window.location.href = "checkpage-consumer-admin.html?" + queeee;
                                    }
                                });

                            },
                            yes: function() {

                            },
                            end: function() {
                                $("#header-bar").css({ "z-index": 1000 });
                                $("#popup-new-check").hide();
                            }
                        });
                    }
                }
            });
        } else {
            layer.open({
                skin: "layui-layer-molv",
                content: "暂无权限查看",
                time: 1200
            });
        }
    }, _ => {
        layui.layer.msg("代码报错!  请联系管理员", _ => {});
    });
}