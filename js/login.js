$(function() {
    // 加载相关配置信息
    GlobalConf();
    // 加载layui表单效果
    layui.use('form', _ => layui.form.render());
    // 设置本地cookie中当前的用户名称
    $("#user-test").val($.cookie("username"));
    // 初始化浏览器内存中的用户对象
    localStorage.setItem("userInfo", null);

    // 登录
    $("#login-test")
        .click(function() {
            let username = $("#user-test").val();
            let pwd = $("#pwd-test").val();
            var postData = JSON.stringify({ username: username, password: pwd });

            $.ajax({
                type: "POST",
                url: apiconf.login,
                contentType: "application/json",
                data: postData,
                xhrFields: { withCredentials: true }
            }).then(data => {
                if (data.code == 200) {
                    if (data.data.roleid != 100) {
                        if ($("#remember-check1").prop("checked")) {
                            let infostring = JSON.stringify(data.data);
                            localStorage.setItem("userInfo", infostring);
                            localStorage.setItem("checkpageIndex", 0);
                            $.cookie("username", data.data.name)
                        }
                        let href = pageconf.filter(_ => _.roleid == data.data.roleid)[0].redirect;
                        window.location.href = href;
                    } else {
                        layui.layer.msg("请移步至：管理员账号 登录", _ => {});
                    }
                } else {
                    layui.layer.msg("账号或密码错误，请重新输入，或联系管理员", _ => {});
                }
            }, _ => {
                $.cookie(username, null);
                layui.layer.msg("代码报错!   请联系管理员", _ => {});
            });
        });

    // 管理员账号登录
    $("#login-admin").click(_ => {
        let username = $("#user-admin").val();
        let pwd = $("#pwd-admin").val();
        var postData = JSON.stringify({ username: username, password: pwd });

        $.ajax({
            type: "POST",
            url: apiconf.login,
            contentType: "application/json",
            data: postData,
            xhrFields: { withCredentials: true }
        }).then(data => {
            if (data.code == 200) {
                if (data.data.roleid == 100) {
                    if ($("#remember-check2").prop("checked")) {
                        let infostring = JSON.stringify(data.data);
                        localStorage.setItem("userInfo", infostring);
                        localStorage.setItem("checkpageIndex", 0);
                    }
                    let href = pageconf.filter(_ => _.roleid == data.data.roleid)[0].redirect;
                    window.location.href = href;
                } else {
                    layui.layer.msg("请移步至：测试账号 登录", _ => {});
                }
            } else {
                layui.layer.msg("账号或密码错误，请重新输入，或联系管理员", _ => {});
            }
        }, _ => {
            $.cookie(username, null);
            layui.layer.msg("代码报错!   请联系管理员", _ => {});
        });
    });
})

function GlobalConf() {
    let host = "172.16.63.109";
    let port = "8083";
    let domain = "http://" + host + ":" + port;
    apiconf = {
        sentenceknowledgerecognizerealtime: "http://172.16.63.201:10105/EnglishSentenceRecognize.asmx/EnglishSPRecognize",
        login: domain + "/home/login",
        getallgenre: domain + "/genreInfo/list",
        getalltixing: domain + "/questionType/list",
        getalloperation: domain + "/operationLog/list",
        questiondetail: domain + "/questionDetail/list",
        questionproperty: domain + "/questionProperty/all",
        questionpropertyTixing: domain + "/questionProperty/questionType",
        findalluser: domain + "/userInfo/list",
        adduser: domain + "/userInfo/create",
        deleteuser: domain + "/userInfo/delete",
        updateuser: domain + "/userInfo/update",
        testtaskdetail: domain + "/viewTask/list",
        reportissueview: domain + "/reportIssueDetail/list",
        reportissuerecordview: domain + "/issueRecordDetail/list",
        reportissuerecordviewpagelist: domain + "/issueRecordDetail/pageList",
        deleteissue: domain + "/issue/delete",
        updateissue: domain + "/issue/update",
        issuetype: domain + "/issueType/list",
        solvetype: domain + "/solveType/list",
        checktype: domain + "/checkType/list",
        issuecreate: domain + "/issue/create",
        issuerecordlistcreate: domain + "/issueRecord/batchCreate",
        issuerecorddelete: domain + "/issueRecord/delete",
        issuerecordupdate: domain + "/issueRecord/update",
        issuerecordupdatemany: domain + "/issueRecord/batchUpdate",
        knowledgetype: domain + "/knowledgeType/list",
        knowledgelosecountview: domain + "/engKpLoseStatistics/list",
        knowledgewrongcountview: domain + "/engKpWrongStatistics/list",
        createtask: domain + "/testTask/create",
        checkTestName: domain + "/testTask/name",
        n_taskviewpage: domain + "/viewTask/conditions",
        n_taskdetail: domain + "/testTask/ids",
        n_shitiRetestdetail: domain + "/currentTimeEpRec/reRec",
        n_shitidetail: domain + "/questionDetail/single",
        n_taskassignment: domain + "/testTaskDetail/distribution",
        n_taskdelete: domain + "/testTask/delete",
        n_updatetask: domain + "/testTask/update",
        n_shitiRecAndCheckResult: domain + "/taskCheckInfo/checkInfo",
        n_shitiRecAndCheckResultContrast: domain + "/taskCheckInfo/compare",
        n_shitiRecPostCheck: domain + "/taskCheckInfo/update",
        n_memoGet: domain + "/ttuTestQuestion/memo",
        n_memoUpdate: domain + "/ttuTestQuestion/update",
        n_taskAndUserRatio: domain + "/statistics/rec/get",
        n_taskAndUserCheck: domain + "/testTaskAndUser/update",
        n_shitiKaoDianReferenceZhiShiDian: domain + "/taskCheckInfo/kpInfo",
        n_taskRetest: domain + "/testTask/retest",
        n_taskRetestDetail: domain + "/testTaskDetail/retestTask",
        n_taskShiTiCount: domain + "/questionProperty/reTestQuestionType",
        n_kaoDianStatus: domain + "/kaoDianStatus/list",
        choutiprogressUrl: domain + "/testTask/progress",
        s_tixingstatic: domain + "/questionTypeStatistics/info",
        s_zhishidianPieStatic: domain + "/chart/kpType",
        s_globalstatic: domain + "/globalStatistics/info",
        s_knowledgedownloadstatic: domain + "/kpStatistics/kpExport",
        s_globalChartstatic: domain + "/chart/info",
        s_zhishidianstatic: domain + "/kpStatistics/info",
        s_shitiLeiXingDetailtatic: domain + "/questionKpType/info",
        n_tagCreate: domain + "/shiTiCategory/add",
        n_tagChange: domain + "/shiTiCategory/modification",
        n_tagQuery: domain + "/shiTiCategory/list",
        n_tagDelete: domain + "/shiTiCategory/remove",
        n_tagShitTiMogify: domain + "/shiTiRelationCategory/list",
        n_tagShiTiQuery: domain + "/shiTiRelationCategory/modification",
        n_staticQuestionDetailWrongQuery: domain + "/questionKpType/wrongQuestions",
        n_staticQuestionDetailLoseQuery: domain + "/questionKpType/loseQuestions",
        n_staticQuestionDetailWrongQueryKnowledge: domain + "/kp/wrongQuestions",
        n_staticQuestionDetailLoseQueryKnowledge: domain + "/kp/loseQuestions",
        n_conf_zhutiCandidate: domain + "/candidateZhuTi/list"
    };
    localStorage.setItem("apiconf", JSON.stringify(apiconf));
    pageconf = [{
            "roleid": 100,
            "redirect": "navigation-3.html",
            //不做配置视为对所有页面开放
            "pageshowidconf": [
                "navigation.html",
                "navigation-3.html",
                // "navigation-4.html",
                //"navigation-5.html",
                // "navigation-6.html",
                // "navigation-7.html",
                "navigation-8.html"
            ]
        },
        {
            "roleid": 101,
            "redirect": "navigation-1.html",
            "pageshowidconf": [
                "navigation.html",
                "navigation-1.html",
                // "navigation-2.html",
                //"navigation-5.html",
                "navigation-8.html"
            ]
        },
        {
            "roleid": 102,
            "redirect": "navigation-8.html",
            "pageshowidconf": [
                "navigation-8.html",
                "navigation-9.html"
            ]
        }
    ];
    localStorage.setItem("pageconf", JSON.stringify(pageconf));
}