$(function() {

    layui.laydate.render({
        elem: '#daterangeselect',
        range: true
    });
    layui.form.on('submit(btn-search)', function(data) {
        console.log(data.field);
    });

    let popupHtml = '<form class="layui-form" style="margin-top:20px;" action="">' +
        '        <div class="layui-form-item">' +
        '           <label class="layui-form-label">账号名称</label>' +
        '           <div class="layui-input-block">' +
        '             <input type="text" name="title" lay-verify="title" id="c-name" autocomplete="off" placeholder="请输入账号名称" class="layui-input">' +
        '            </div>' +
        '         </div>' +
        '        <div class="layui-form-item">' +
        '           <label class="layui-form-label">账号密码</label>' +
        '           <div class="layui-input-block">' +
        '             <input type="text" name="title" lay-verify="title" id="c-password" autocomplete="off" placeholder="请输入账号密码" class="layui-input">' +
        '            </div>' +
        '         </div>' +
        '        <div class="layui-form-item">' +
        '           <label class="layui-form-label">备注</label>' +
        '           <div class="layui-input-block">' +
        '           <textarea placeholder="请输入备注信息" id="c-memo" class="layui-textarea"></textarea>' +
        '            </div>' +
        '         </div>' +
        '     </form>';

    querypage(popupHtml);
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

function querypage(popupHtml) {
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
    let s_name = getQueryVariable("s_name"); //测试账号名称
    s_name = s_name == false ? "" : decodeURIComponent(s_name);
    let querytext = "?";
    querytext += "taskName=" + s_taskname;
    querytext += "&subjectId=" + s_subject;
    querytext += "&memo=" + s_memo;
    querytext += "&statusId=" + s_status;
    querytext += "&typeId=100"; //考点测试任务

    // $("#s_subject").val(s_subject);
    layui.form.val('task-query', {
        "s_subject": s_subject,
        "s_status": s_status,
        "s_taskname": s_taskname,
        "s_testcount": s_testcount,
        "s_time": s_time,
        "s_memo": s_memo,
        "s_name": s_name,
    });

    var confList = [{
            roleid: 100,
            page: null,
            buttonid: "",
            url: apiconf.testtaskdetail,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'taskname', title: '任务' },
                    { field: 'parenttaskname', title: '父任务', width: 100 },
                    { field: 'username', title: '测试账号', width: 100, sort: true },
                    { field: 'subjectname', title: '学科', width: 80 },
                    { field: 'statusname', title: '审核状态', width: 90 },
                    { field: 'createtime', title: '创建时间', width: 120 },
                    { field: 'memo', title: '备注' },
                    { fixed: 'right', title: '操作', toolbar: '#side-bar', width: 120 }
                ]
            ],
            title: "",
            startpage: 1,
            pagesize: 12
        },
        {
            roleid: 101,
            page: null,
            buttonid: "",
            url: apiconf.testtaskdetail,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'taskname', title: '任务' },
                    { field: 'parenttaskname', title: '父任务', width: 100 },
                    { field: 'subjectname', title: '学科', width: 80 },
                    { field: 'statusname', title: '审核状态', width: 90 },
                    { field: 'createtime', title: '创建时间', width: 120 },
                    { field: 'memo', title: '备注' },
                    { fixed: 'right', title: '操作', toolbar: '#side-bar', width: 120 }
                ]
            ],
            title: "",
            startpage: 1,
            pagesize: 12
        }
    ];

    var conf = $.grep(confList, function(item) {
        return item.roleid == userinfo.roleid;
    })[0];

    let pagenumber = conf.startpage;
    let pagesize = conf.pagesize;
    let backurl = conf.url;
    if (querytext != "?") {
        backurl += querytext;
    }
    $.ajax({
        type: "GET",
        url: backurl,
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
            if (data.code == 200) {
                let limits = [10, 15, 30, 60, 100, 300, 600]; //.push(conf.pagesize);
                layui.table.render({
                    elem: '#paging-table',
                    cellMinWidth: 80,
                    height: "full-180",
                    cols: conf.colsconf,
                    data: data.data,
                    even: true,
                    page: {
                        limit: pagesize,
                        limits: limits,
                        layout: ['limit', 'count', 'prev', 'next', 'page', 'skip']
                    }
                });

                //监听行工具事件
                layui.table.on('tool(paging-table)', function(obj) {
                    var data = obj.data;
                    // 删除账户
                    if (obj.event === 'del') {
                        // layer.confirm('确定要删除这个测试账号吗？<br>账号名：【' + data.name + '】', function() {
                        //     layer.confirm('真的要删除这个用户吗？【' +
                        //         data.name +
                        //         '】<br>删除后，该账号的其他任务信息等也将被关联删除，且不可恢复，所以，真的要删除吗？',
                        //         function(index) {
                        //             let deletedata = '{"id":' + data.id + '}';
                        //             $.ajax({
                        //                 type: "POST",
                        //                 url: apiconf.deleteuser,
                        //                 contentType: "application/json",
                        //                 data: deletedata,
                        //                 xhrFields: { withCredentials: true },
                        //                 success: function() { querypage(popupHtml); },
                        //                 error: function() {
                        //                     layer.open({
                        //                         skin: "layui-layer-molv",
                        //                         content: "删除失败，请联系管理员",
                        //                         time: 2000
                        //                     });
                        //                     layer.close(index);
                        //                 }
                        //             });
                        //             layer.close(index);
                        //         });
                        // });
                    }
                    // 编辑账户 
                    else if (obj.event === 'edit') {
                        // layer.open({
                        //     type: 1,
                        //     offset: "auto",
                        //     id: 'user-edit',
                        //     content: popupHtml,
                        //     btn: '确定',
                        //     btnAlign: 'r',
                        //     title: "编辑测试账号",
                        //     area: ["500px", "350px"],
                        //     yes: function() {
                        //         let name = $("#c-name").val().trim();
                        //         let password = $("#c-password").val().trim();
                        //         let memo = $("#c-memo").val().trim();
                        //         if (name == "" || password == "" || memo == "") {
                        //             return layer.open({ skin: "layui-layer-molv", content: "信息不完整", time: 1200 });
                        //         }

                        //         layer.closeAll();
                        //         let createdata = '{"id":' + data.id + ',"name": "' + name + '","password": "' + password + '","memo": "' + memo + '","roleid": 101}';
                        //         $.ajax({
                        //             type: "POST",
                        //             url: apiconf.updateuser,
                        //             contentType: "application/json",
                        //             data: createdata,
                        //             xhrFields: { withCredentials: true },
                        //             success: function() {
                        //                 querypage(popupHtml);
                        //             }
                        //         });
                        //     }
                        // });
                        // $("#c-name").val(data.name);
                        // $("#c-password").val(data.password);
                        // $("#c-memo").val(data.memo);
                    }
                });
            } else {
                layer.open({
                    skin: "layui-layer-molv",
                    content: "暂无权限查看",
                    time: 1200
                });
            }
        },
        error(data) {
            layer.open({
                skin: "layui-layer-molv",
                content: "代码报错啦，请联系管理员",
                time: 0
            });
        }
    });
}