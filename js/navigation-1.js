$(function() {
    layui.laydate.render({ elem: '#s_startEndTime', type: 'datetime', range: true });

    querypage();
});

function querypage() {
    var conf = {
        page: null,
        url: apiconf.n_taskviewpage,
        colsconf: [
            [
                { field: 'index', title: '序号', width: 60 },
                { field: 'subjectName', title: '学科', width: 80 },
                { field: 'taskName', title: '任务', width: 570 },
                { field: 'testCount', title: '题量', width: 80 },
                { field: 'statusName', title: '任务状态', width: 90 },
                { field: 'createTime', title: '创建时间', width: 170 },
                { field: 'autoChaYiSum', title: '自动识别差异题量', width: 150 },
                { field: 'autoUpdateTime', title: '更新时间', width: 170 },
                { field: 'memo', title: '备注' },
                { fixed: 'right', title: '操作', toolbar: '#side-bar', width: 200 }
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

    $.ajax({ type: "GET", url: backurl, xhrFields: { withCredentials: true } })
        .then(data => {
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
                    if (obj.event === 'chongceshenheduibi') {
                        layer.open({
                            type: 1,
                            shadeClose: true,
                            shade: 0,
                            area: ['840px', '500px'],
                            content: $("#popup-detail-check"),
                            btn: ["对比选中的测试记录"],
                            resize: false,
                            btnAlign: 'r',
                            title: "<b>重测任务对比</b>（" + obj.data.taskName + "）",
                            zIndex: 1001, //重点1
                            success: function(layero) {
                                var restesQueryUrl = apiconf.n_taskRetestDetail + "?taskId=" + obj.data.taskID;
                                $.ajax({ type: "GET", url: restesQueryUrl, xhrFields: { withCredentials: true } })
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
                                                    { field: 'taskName', title: '测试名称' },
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

                    if (obj.event === 'chakanshenhe') {
                        var checkpageIndex = GetCheckpageIndex();
                        var queeee =
                            "taskid=" + obj.data.taskID +
                            "&checkpageindex=" + checkpageIndex +
                            "&shitiindex=0" +
                            "&taskname=" + obj.data.taskname +
                            "&newresultstatus=" +
                            "&checkstatus=" +
                            "&currentshitiid=";
                        window.location.href = "checkpage-consumer.html?" + queeee;
                    }
                });
            } else {
                layui.layer.msg("暂无权限查看", _ => {});
            }
        });
}