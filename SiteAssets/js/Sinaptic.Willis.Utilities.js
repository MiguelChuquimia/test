var listFields = [{ "field": "ProfileId", "value": "" }, { "field": "UserId", "value": "" }, { "field": "Office", "value": "" }];

function addDataTable(idTabla, arrayFields = []) {
    return $('#' + idTabla).DataTable({
        initComplete: function () {
            arrayFields.forEach(element => {
                this.api().columns([element]).every(function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo($("#dtSelect #select" + element).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );

                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });

                    column.data().unique().sort().each(function (d) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });
                });
            });
        },
        dom: 'Bfrtip',
        buttons: [],
        oLanguage: {
            "sSearch": "Search all columns"
        }
    });
}

async function getUserOffice() {
    var userData = await getData("Users", "?$select=*,Office/Office,Office/Initials,Office/EoC&$expand=Office&$filter=(UserId eq " + _spPageContextInfo.userId + ")");

    return userData[0].Office;
}

function sumDate(d, days) {
    var date = new Date(d);
    var newdate = new Date(date);

    newdate.setDate(newdate.getDate() + days);

    var dd = newdate.getDate();
    var mm = newdate.getMonth() + 1;
    var y = newdate.getFullYear();

    return new Date(mm + '/' + dd + '/' + y);
}

async function deleteFile(FileUrl) {
    const result = await $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFileByServerRelativeUrl('" + _spPageContextInfo.webServerRelativeUrl + FileUrl + "')",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "DELETE",
            "IF-MATCH": "*"
        }
    });

    return result;
}

async function getUserProfile() {
    var userData = await getData("Users", "?$select=*,Profile/Title&$expand=Profile&$filter=(UserId eq " + _spPageContextInfo.userId + ")");

    return userData[0];
}

function showSpinner() {
    $("#loadMe").modal({
        backdrop: "static",
        keyboard: false,
        show: true
    });
}

function hideSpinner() {
    setTimeout(function () {
        $("#loadMe").modal("hide");
    }, 500);
}

async function getListUsersByOffice(office) {
    return await getData("Users", "?$select=*,Office/Title&$expand=Office&$select=User/Title&$expand=User&$filter=(Office/Title eq '" + office + "')");
}

function createFilters(data, index, txt) {
    $("#bFilters").append($("<button id=\"b" + data.Title.replace(/\s/g, '') + "\" type=\"button\" class=\"button-filter\" onclick=\"clickFilter" + txt + "(" + index + ")\"> " +
        data.Title + " <i class=\"" + data.Icon + "\"></i></button>"));
}

function loadListFieldsvalue(profileId, office) {
    listFields.forEach(element => {
        switch (element.field) {
            case "ProfileId":
                element.value = profileId;
                break;
            case "UserId":
                element.value = _spPageContextInfo.userId;
                break;
            case "Office":
                element.value = office;
                break;
            default:
                break;
        }
    });

    return listFields;
}

function validateFieldsHeaders(dataFields) {
    dataFields.forEach((element, index) => {
        var txtTh = "<th scope=\"col\"";
        if (index == 0) txtTh += " style=\"display: none;\"";
        if (element.TypeFilter == "select") {
            txtTh += " id=\"select" + index + "\"";
            arrayField.push(index);
        }
        if (element.TypeFilter == "search") txtTh += "><input type=\"text\" placeholder=\"Search " + element.Title + "\" /";

        txtTh += "></th>";

        $("#dtSelect").append(txtTh);

        if (index == 0) $("#dtHeader").append("<th style=\"display: none;\" scope=\"col\">" + element.Title + "</th>");
        else $("#dtHeader").append("<th scope=\"col\">" + element.Title + "</th>");
    });

    $("#dtSelect").append($("<th></th>"));
    $("#dtHeader").append($("<th></th>"));
}

async function getListLineBusiness() {
    var listBusinessLine = await getData("Business Line", "?$filter=(Active eq 1)");

    listBusinessLine.forEach(element => {
        $("#linebusiness").append($("<option value=\"" + element.BusinessLine + "\">" + element.BusinessLine + "</option>"));
    });
}

async function getListStatus() {
    var listStatus = await getData("Status", "");

    listStatus.forEach(element => {
        $("#status").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });
}

async function getListAccountManagerTeam(selector, office) {
    var listAccountManagerTeam = await getData("Users", "?$select=*,Office/Title&$expand=Office&$select=User/Title&$expand=User&$filter=(Office/Title eq '" + office + "')");

    listAccountManagerTeam.forEach(element => {
        $(selector).append($("<option value=\"" + element.UserId + "\">" + element.User.Title + "</option>"));
    });
}

async function getListsAccountManager(selector, office, functionClick) {
    var listAccountManager = await getData("Users", "?$select=*,Office/Title&$expand=Office&$select=User/Title&$expand=User&$filter=(Office/Title eq '" + office + "')");

    listAccountManager.forEach(element => {
        $(selector).append($("<a class=\"dropdown-item\" onclick=\"" + functionClick + "(" + element.UserId + ")\">" + element.User.Title + "</a>"));
    });
}

function validateIcons(typeFile) {
    ret = "far fa-file-alt";
    switch (typeFile) {
        case "jpg":
        case "jpeg":
        case "png":
        case "bmp":
        case "gif":
            ret = "far fa-file-image";
            break;
        case "pdf":
            ret = "far fa-file-pdf";
            break;
        case "xls":
        case "xlsx":
            ret = "far fa-file-excel";
            break;
        case "doc":
        case "docx":
            ret = "far fa-file-word";
            break;
        default:
            break;
    }

    return ret;
}

async function RequestProcess(reference, idAccount, funct) {
    showSpinner();

    if (!await ValidateNewProcess(reference)) {
        await CreateNewProcess(reference, 12);

        var updateStatus = {
            '__metadata': { type: "SP.Data.AccountsListItem" },
            'Status': "In Progress"
        }

        updateData("Accounts", idAccount, updateStatus, funct);
    }
    else alert("There is a process with the same reference.");

    hideSpinner();
}

async function ValidateNewProcess(reference) {
    var process = await getData("Process", "?$filter=(Title eq '" + reference + "')");

    if (process.length != 0) return true;
    else return false;
}

async function CreateNewProcess(ref, idFlowType) {
    var createProcess = {
        '__metadata': { type: "SP.Data.ProcessListItem" },
        'Title': ref,
        'CurrentFlowId': idFlowType,
        'StatusId': 1
    }

    var newProcess = await addData("Process", createProcess);

    var createTask = {
        '__metadata': { type: "SP.Data.TasksListItem" },
        'Title': ref,
        'FlowTypeId': idFlowType,
        'ProcessId': newProcess.Id,
        'TaskStatusId': 1,
        'IsLast': true
    }

    var newTask = await addData("Tasks", createTask);

    AddRegisterHistoryProcess(ref, "created", await GetFlowTypeName(idFlowType), "Pending", "HistoryProcessBilling");

    await AddAllDocumentsTasks(newTask.Title);

    return newTask.ID;
}

async function GetTaskStatus() {
    return await getData("TaskStatus", "?$filter=(Visible eq '1')");
}

async function GetNextFlowIdByFlowTypeId(idFlowType) {
    var flowType = await getData("FlowType", "?$filter=(ID eq " + idFlowType + ")");
    return flowType[0].NextFlowId;
}

async function GetPreviousFlowIdByFlowTypeId(idFlowType) {
    var flowType = await getData("FlowType", "?$filter=(ID eq " + idFlowType + ")");
    return flowType[0].PreviousFlowId;
}

async function GetFlowTypeName(idFlowType) {
    var flowType = await getData("FlowType", "?$filter=(ID eq " + idFlowType + ")");
    return flowType[0].Title;
}

async function IsGenericType(idFlowType) {
    var flowType = await getData("FlowType", "?$filter=(ID eq " + idFlowType + ")");
    return (flowType[0].TaskType == "Generic") ? true : false;
}

async function AddAllDocumentsTasks(ref) {
    for (let index = 1; index < 13; index++) {
        var addDocTask = {
            '__metadata': { type: "SP.Data.DocumentsTasksListItem" },
            'Title': ref,
            'DocumentStatusId': index,
            'Pending': true
        }

        await addData("DocumentsTasks", addDocTask);
    }
}

async function UpdateStatusAccount(status, idAccount) {
    var updatedata = {
        '__metadata': { type: "SP.Data.AccountsListItem" },
        'Status': status
    }

    updateData("Accounts", idAccount, updatedata);
}

async function GetStatusNameById(idStatus) {
    var status = await getData("TaskStatus", "?$filter=(ID eq " + idStatus + ")");

    return status[0].Title;
}

async function CreateNewTaskClaim(taskClaim) {
    showSpinner();

    await addData("TasksClaims", taskClaim);

    alert("Create new task successfully.");
    disabledButtons();
    clickFilterClaims(0);

    hideSpinner();
}

async function getListsFlowTypeClaim(selector, functionClick) {
    var list = await getData("FlowTypeClaim", "");

    list.forEach(element => {
        $(selector).append($("<a class=\"dropdown-item\" onclick=\"" + functionClick + "(" + element.ID + ")\">" + element.Title + "</a>"));
    });
}

async function AddRegisterHistoryProcess(ref, typeHistory, task, status, processType) {
    var data = {
        '__metadata': { type: "SP.Data." + processType + "ListItem" },
        'Title': typeHistory,
        'Reference': ref,
        'Task': task,
        'Status': status
    }

    addData(processType, data);
}

async function ClickViewSummary(ref, listName) {
    showSpinner();
    var accountData = await getData(listName, "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(Reference eq '" + ref + "')");

    $("#mSummaryReference").html(accountData[0].Reference);
    $("#mSummaryInsured").html(accountData[0].OriginalInsured);
    $("#mSummaryBusinessLine").html(accountData[0].LineBusiness);
    $("#mSummaryClient").html(accountData[0].Client);
    $("#mSummaryInception").html(accountData[0].Inception.split('T')[0]);
    $("#mSummaryBroker").html(accountData[0].UserAccount.Title);

    $("#divSummaryReason").show();
    $("#divSummaryCurrentTasks").show();
    $("#divSummaryEndorsements").show();

    $("#collapseProcessLog").html("");

    $("#divSummaryEndorsements").html("<div class=\"eocStatusHeader\">" +
        "<div class=\"eocTitleHeader\">" +
        "<label>Endorsements Summary</label>" +
        "</div>" +
        "</div>"
    );

    var processData = await getData("Process", "?$select=Reason/Title&$expand=Reason&$select=Status/Title&$expand=Status&$filter=(Title eq '" + ref +
        "')&$orderby=ID desc");

    if (processData.length > 0) {
        $("#mSummaryStatus").html(processData[0].Status.Title);
        if (processData.ReasonId) {
            $("#mSummaryReason").html(accountData[0].Reason.Title);
        } else $("#divSummaryReason").hide();

        LoadComments("#mSummaryComments", ref);

        if (processData[0].Status.ID != 6) {
            var tasks = await getData("Tasks", "?$select=*,FlowType/Title&$expand=FlowType&$select=TaskStatus/Title&$expand=TaskStatus&$select=Reason/Title&$expand=Reason" +
                "&$filter=(Title eq '" + ref + "')and(IsLast eq 1)&$orderby=ID desc");

            tasks.forEach(async task => {
                if (task.FlowTypeId != 9 && task.FlowTypeId != 10 && task.FlowTypeId != 11) {
                    $("#mSummaryBillingFlowType").html(task.FlowType.Title + ": ");
                    $("#mSummaryBillingTaskStatus").html(task.TaskStatus.Title);
                    if (task.ReasonId) {
                        $("#mSummaryBillingTaskStatusReason").html(task.Reason.Title);
                        $("#divSummaryBillingTaskStatusReason").show();
                    }
                    else $("#divSummaryBillingTaskStatusReason").hide();

                    var comments = await getData("Comments", "?$select=Author/Title&$expand=Author&$filter=(TaskId eq " + task.ID + ")&$orderby=ID desc");
                    $("#mSummaryBillingTaskComment").html("");
                    comments.forEach(comment => {
                        $("#mSummaryBillingTaskComment").append($("<label class=\"modal-label-info\">" + comment.Created.split('T')[0] + " " +
                            comment.Created.split('T')[1] + " " + comment.Author.Title + "\"" + comment.Title + "\"" + "</label>"));
                    });
                }
                else {
                    $("#mSummaryEoCFlowType").html(task.FlowType.Title + ": ");
                    $("#mSummaryEoCTaskStatus").html(task.TaskStatus.Title);
                    if (task.ReasonId) {
                        $("#mSummaryEoCTaskStatusReason").html(task.Reason.Title);
                        $("#divSummaryEoCTaskStatusReason").show();
                    }
                    else $("#divSummaryEoCTaskStatusReason").hide();

                    var comments = await getData("Comments", "?$select=Author/Title&$expand=Author&$filter=(TaskId eq " + task.ID + ")&$orderby=ID desc");
                    $("#mSummaryEoCTaskComment").html("");
                    comments.forEach(comment => {
                        $("#mSummaryEoCTaskComment").append($("<label class=\"modal-label-info\">" + comment.Created.split('T')[0] + " " +
                            comment.Created.split('T')[1] + " " + comment.Author.Title + "\"" + comment.Title + "\"" + "</label>"));
                    });
                }
            });

            if (listName != "Endorsement") {
                var endorsements = await getData("Endorsement", "?$select=*,Reason/Title&$expand=Reason&$filter=(AccountReference eq '" + ref + "')&$orderby=ID desc");

                endorsements.forEach((endorsement, index) => {
                    if (index != 0) $("#divSummaryEndorsements").append($("<div class=\"div-separator\"></div>"));
                    var reasonEndo = (endorsement.ReasonId != null) ? endorsement.Reason.Title : "";
                    $("#divSummaryEndorsements").append($("<div class=\"\"></div>")
                        .append("<label class=\"modal-label-title\">Reference:</label>&nbsp;<label class=\"modal-label-title\">" + endorsement.Reference + "</label><br>")
                        .append("<label class=\"modal-label-title\">Status:</label>&nbsp;<label class=\"modal-label-info\">" + endorsement.Status + "  </label>")
                        .append("&nbsp;<label class=\"modal-label-info\">" + reasonEndo + "</label>")
                    );
                });
            }

            var processBillingLogs = await getData("HistoryProcessBilling", "?$select=*,Author/Title&$expand=Author&$filter=(Reference eq '" + ref + "')&$orderby=ID")
            var processEoCLogs = await getData("HistoryProcessEoC", "?$select=*,Author/Title&$expand=Author&$filter=(Reference eq '" + ref + "')&$orderby=ID");

            let listMargeProcess = processBillingLogs.concat(processEoCLogs)

            listMargeProcess.sort((a, b) => {
                return (a.Created).localeCompare((b.Created))
            });

            listMargeProcess.forEach(log => {
                $("#collapseProcessLog").append($("<div class=\"\"></div>")
                    .append("&nbsp;<label class=\"modal-label-info\">" + log.Created.split('T')[0] + " " + log.Created.split('T')[1] + " " + log.Author.Title +
                        " " + log.Title + "</label><br>")
                );
            });
        }
        else {
            $("#divSummaryReason").hide();
            $("#divSummaryCurrentTasks").hide();
            $("#divSummaryEndorsements").hide();
        }
    }
    else {
        $("#divSummaryReason").hide();
        $("#divSummaryCurrentTasks").hide();
        $("#divSummaryEndorsements").hide();
    }

    $("#modalSummary").modal("show");

    hideSpinner();
}

function ClickCancelSummary(view) {
    switch (view) {
        case "ViewAnalyst":
            dataTableProcess.rows('.selected').nodes().to$().removeClass('selected');
            break;
        default:
            datatable.rows('.selected').nodes().to$().removeClass('selected');
            break;
    }
}

async function LoadComments(selector, ref) {
    $(selector).html("");

    var comments = await getData("Comments", "?$select=*,Author/Title&$expand=Author&$filter=(Reference eq '" + ref + "')&$orderby=ID desc");

    if (comments.length > 0) {
        comments.forEach(item => {
            $(selector).append($("<div class=\"modal-comment-content\"><label>" + item.Created.replace('T', " ").replace('Z', "") + " - " + item.Author.Title +
                " - " + item.FlowType + "</label><br><label class=\"label-comment\">" + item.Title + "</label></div>"));
        });
    }
    else {
        if (selector == "#mSummaryComments") $(selector).append($("<div style=\"text-align-last: center; padding: 20%;\"><label>Sin Comentarios</label></div>"));
    }
}