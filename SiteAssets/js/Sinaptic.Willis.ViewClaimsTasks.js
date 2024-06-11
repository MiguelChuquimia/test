console.log("Loading: Sinaptic.Willis.ViewClaimsTasks.js");

var firtsMyTasks = true;
var dataTableMyTasks;
var dataTableAllClaims;

var firtsAssignPending = true;
var firstLoadClaimsTable = true;
var dataTableAssignPending;

var office;
var viewTaskClaim = [];
var claimViewTask = [];

var businessReference;

var teamLeaderClaimsId = 6;
var analystClaimsId = 7;

$(function () {
    validatePage();

    formatClaimedAmount('claimedAmount');
});


function tabSwitch(tab) {
    if (!$("#" + tab).hasClass("active")) {
        $("#" + tab).children('a').addClass("active");

    }

    switch (tab) {

        case "tab-assignment":
            {
                $("#tab-mytasks").children('a').removeClass("active");
                $("#tab-allClaims").children('a').removeClass("active");
                $("#tableAssignPending").show();
                $("#tableMyTasks").hide();
                $("#tableAllClaims").hide();

                getAssignPending();
            }
            break;


        case "tab-mytasks":
            {
                $("#tab-assignment").children('a').removeClass("active");
                $("#tab-allClaims").children('a').removeClass("active");
                $("#tableAssignPending").hide();
                $("#tableMyTasks").show();
                $("#tableAllClaims").hide();

                getMyTasks();
            } break;
        case "tab-allClaims":
            {
                $("#tab-assignment").children('a').removeClass("active");
                $("#tab-mytasks").children('a').removeClass("active");
                $("#tableAssignPending").hide();
                $("#tableMyTasks").hide();
                $("#tableAllClaims").show();

                getAllClaims();
            } break;


        default: break;
    }


}

async function refreshPage() {
    await validatePage();
}

async function validatePage() {
    var profile = await getUserProfile();

    office = await getUserOffice();

    $("#oTeamManager").html("");
    getListUsersByProfile("#oTeamManager", "clickAssign", "Claims");

    switch (profile.ProfileId) {
        case teamLeaderClaimsId:
            $("#title").html("View Team Leader Claim");

            $("#tableAssignPending").show();
            $("#tableMyTasks").hide();
            $("#tableAllClaims").hide();
            $(".view-tl-select").show();

            // await getMyTasks();
            await getAssignPending();
            // await getAllClaims();
            break;
        case analystClaimsId:
            $("#title").html("View Analyst Claim");

            $("#tableAssignPending").hide();
            $("#tableAllClaims").hide();
            $(".view-tl-select").hide();

            await getMyTasks();

            hideSpinner();
            break;
        default:
            showErrorMessage("You do not have the permissions to enter this page.");
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Index.aspx", '_self');

            hideSpinner();
            break;
    }

    $("#searchTask").on("keyup", function (e) {
        if (e.keyCode === 13) {
            clickSearchTask();
        }
    });

    $("#searchClaim").on("keyup", function (e) {
        if (e.keyCode === 13) {
            clickSearchClaim();
        }
    });

    $("#mDocumentation").on("click", function () {

        clickViewRelatedDocuments();

    });

    $("#closeRelatedDoc").on("click", function () {
        $("#relatedDocumentModal").modal("hide");
    });

}

async function getMyTasks() {
    $("#bMyTasks").addClass("filter-active");
    $("#bAllTasks").removeClass("filter-active");

    showSpinner();

    if (!firtsMyTasks) dataTableMyTasks.destroy();

    var myTasks = await getData("TasksClaims", "?$select=*,FlowTypeClaim/Title,AssignTo/Title&$expand=FlowTypeClaim,AssignTo/Id&$select=TaskClaimStatus/Title&$expand=TaskClaimStatus" +
        "&$filter=(AssignToId eq '" + _spPageContextInfo.userId + "')and((TaskClaimStatusId eq 1)or(TaskClaimStatusId eq 2)or(TaskClaimStatusId eq 3))");

    $("#tMyTasks").html("");

    myTasks.forEach(task => {
        $("#tMyTasks").append($("<tr></tr>")
            .append($("<td>" + task.ID + "</td>"))
            .append($("<td>" + task.Title + "</td>"))
            .append($("<td>" + task.AccountReference + "</td>"))
            .append($("<td>" + task.FlowTypeClaim.Title + "</td>"))
            .append($("<td>" + task.AssignTo.Title + "</td>"))
            .append($("<td>" + task.Client + "</td>"))
            .append($("<td>" + task.Cedent + "</td>"))
            .append($("<td>" + formatDate(task.Created) + "</td>"))
            .append($("<td>" + formatDateDueDate(task.Created, task.FlowTypeClaim.Title) + "</td>"))
            // .append($("<td>" + formatDate(task.DateOfLoss) + "</td>"))
            .append($("<td>" + task.Insured + "</td>"))
            .append($("<td>" + task.TaskClaimStatus.Title + "</td>"))
            .append($("<td>" + ((task.ClaimedAmount == null) ? "" : task.ClaimedAmount) + "</td>"))
            .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + task.ID + "');\">View Task</button></td>"))
        );
    });

    dataTableMyTasks = addDataTable('dtMyTasks');

    dataTableMyTasks.column(0).visible(false);

    if (firtsMyTasks) firtsMyTasks = false;

    hideSpinner();
}

async function getAllTasks() {
    $("#bMyTasks").removeClass("filter-active");
    $("#bAllTasks").addClass("filter-active");

    showSpinner();

    if (!firtsMyTasks) dataTableMyTasks.destroy();

    var myTasks = await getData("TasksClaims", "?$select=*,FlowTypeClaim/Title,AssignTo/Title&$expand=FlowTypeClaim,AssignTo/Id&$select=TaskClaimStatus/Title&$expand=TaskClaimStatus" +
        "&$filter=((TaskClaimStatusId eq 1)or(TaskClaimStatusId eq 2)or(TaskClaimStatusId eq 3))");

    $("#tMyTasks").html("");

    myTasks.forEach(task => {
        $("#tMyTasks").append($("<tr></tr>")
            .append($("<td>" + task.ID + "</td>"))
            .append($("<td>" + task.Title + "</td>"))
            .append($("<td>" + task.AccountReference + "</td>"))
            .append($("<td>" + task.FlowTypeClaim.Title + "</td>"))
            .append($("<td>" + task.AssignTo.Title + "</td>"))
            .append($("<td>" + task.Client + "</td>"))
            .append($("<td>" + task.Cedent + "</td>"))
            .append($("<td>" + formatDate(task.Created) + "</td>"))
            .append($("<td>" + formatDateDueDate(task.Created, task.FlowTypeClaim.Title) + "</td>"))
            // .append($("<td>" + formatDate(task.DateOfLoss) + "</td>"))
            .append($("<td>" + task.Insured + "</td>"))
            .append($("<td>" + task.TaskClaimStatus.Title + "</td>"))
            .append($("<td>" + ((task.ClaimedAmount == null) ? "" : task.ClaimedAmount) + "</td>"))
            .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + task.ID + "');\">View Task</button></td>"))
        );
    });

    dataTableMyTasks = addDataTable('dtMyTasks');

    dataTableMyTasks.column(0).visible(false);

    if (firtsMyTasks) firtsMyTasks = false;

    hideSpinner();
}

async function getAllClaims() {
    showSpinner();

    var allClaimsOffice = [];

    office.results.forEach(async elem => {
        allClaimsOffice.push(getDataPromise("Claims", "?$filter=(Office eq '" + elem.Office + "')&$orderBy=Created desc"));
    });

    Promise.all(allClaimsOffice).then(results => {
        createTableAllClaims(results);
    });
}

function clickViewClaim(index) {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + index + "&type=view", '_blank');
}

async function getAssignPending() {
    showSpinner();

    if (!firtsAssignPending) dataTableAssignPending.destroy().clear();

    var assignPending = await getData("TasksClaims", "?$select=*,FlowTypeClaim/Title&$expand=FlowTypeClaim&$select=TaskClaimStatus/Title&$expand=TaskClaimStatus" +
        "&$filter=(AssignToId eq null)and(TaskClaimStatusId eq 8)");

    $("#tAssignPending").html("");

    assignPending.forEach(task => {
        $("#tAssignPending").append($("<tr></tr>")
            .append($("<td>" + task.ID + "</td>"))
            .append($("<td>" + task.Title + "</td>"))
            .append($("<td>" + task.AccountReference + "</td>"))
            .append($("<td>" + task.FlowTypeClaim.Title + "</td>"))
            .append($("<td>" + task.Client + "</td>"))
            .append($("<td>" + task.Cedent + "</td>"))
            .append($("<td>" + formatDate(task.Created) + "</td>"))
            .append($("<td>" + formatDateDueDate(task.Created, task.FlowTypeClaim.Title) + "</td>"))
            // .append($("<td>" + formatDate(task.DateOfLoss) + "</td>"))
            .append($("<td>" + task.Insured + "</td>"))
            .append($("<td>" + task.TaskClaimStatus.Title + "</td>"))
            .append($("<td>" + ((task.ClaimedAmount == null) ? "" : task.ClaimedAmount) + "</td>"))
            .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + task.ID + "');\">View Task</button></td>"))
        );
    });

    dataTableAssignPending = addDataTable('dtAssignPending');

    if (firtsAssignPending) {
        firtsAssignPending = false;
        $('#dtAssignPending tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');

            if (dataTableAssignPending.rows('.selected').data().length > 0) $("#bAnalyst").prop("disabled", false);
            else $("#bAnalyst").prop("disabled", true);
        });
    }

    dataTableAssignPending.column(0).visible(false);

    hideSpinner();
}

function formatDateDueDate(Created, FlowTypeClaim) {
    var dateToFormat = new Date(Created);
    if (FlowTypeClaim.toLowerCase() === "notice") {
        dateToFormat = sumarDias(dateToFormat, 2);
    } else {
        dateToFormat = sumarDias(dateToFormat, 5);
    }
    return dateToFormat.getFullYear() + "-" + (dateToFormat.getMonth() + 1).toString().padStart(2, "0") + "-" + dateToFormat.getDate().toString().padStart(2, "0");
}

function sumarDias(fecha, dias) {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}

function clickAssign(id) {
    showSpinner();
    for (let index = 0; index < dataTableAssignPending.rows('.selected').data().length; index++) {
        var dataSave = {
            '__metadata': { type: "SP.Data.TasksClaimsListItem" },
            'AssignToId': id,
            'TaskClaimStatusId': 1
        }

        if (index != dataTableAssignPending.rows('.selected').data().length - 1) updateData("TasksClaims", dataTableAssignPending.rows('.selected').data()[index][0], dataSave);
        else updateData("TasksClaims", dataTableAssignPending.rows('.selected').data()[index][0], dataSave, "viewAnalyst");
    }
    hideSpinner();
}

async function clickSearchTask() {
    showSpinner();

    if ($("#searchTask").val() != "") {
        if (!firtsAssignPending) dataTableAssignPending.destroy().clear();

        var tasks = await getData("TasksClaims", "?$select=*,FlowTypeClaim/Title&$expand=FlowTypeClaim&$select=TaskClaimStatus/Title&$expand=TaskClaimStatus" +
            "&$filter=(Title eq '" + $("#searchTask").val() + "')or(AccountReference eq '" + $("#searchTask").val() + "')");

        $("#tAssignPending").html("");

        tasks.forEach(task => {
            $("#tAssignPending").append($("<tr></tr>")
                .append($("<td>" + task.ID + "</td>"))
                .append($("<td>" + task.Title + "</td>"))
                .append($("<td>" + task.FlowTypeClaim.Title + "</td>"))
                .append($("<td>" + task.Client + "</td>"))
                .append($("<td>" + task.Cedent + "</td>"))
                .append($("<td>" + formatDate(task.Created) + "</td>"))
                .append($("<td>" + formatDate(task.Inception) + "</td>"))
                .append($("<td>" + formatDate(task.DueDate) + "</td>"))
                .append($("<td>" + task.Insured + "</td>"))
                .append($("<td>" + task.TaskClaimStatus.Title + "</td>"))
                .append($("<td>" + ((task.ClaimedAmount == null) ? "" : task.ClaimedAmount) + "</td>"))
                .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + task.ID + "');\">View Task</button></td>"))
            );
        });

        dataTableAssignPending = addDataTable('dtAssignPending');

        if (firtsAssignPending) {
            firtsAssignPending = false;
            $('#dtAssignPending tbody').on('click', 'tr', function () {
                $(this).toggleClass('selected');

                if (dataTableAssignPending.rows('.selected').data().length > 0) $("#bAnalyst").prop("disabled", false);
                else $("#bAnalyst").prop("disabled", true);
            });
        }

        dataTableAssignPending.column(0).visible(false);

        hideSpinner();
    }
    else getAssignPending();
}

async function clickSearchClaim() {
    showSpinner();
    if ($("#searchClaim").val() != "") {
        var filter;

        if ($("#selectFilter").val() == 1) {
            filter = "(substringof('" + $("#searchClaim").val() + "', BusinessReference))";
        }
        else {
            filter = "(substringof('" + $("#searchClaim").val() + "', ClaimReference))";
        }
        getDataPromise("Claims", "?$select=*&$filter=" + filter).then(
            (claims) => {
                var result = [];
                result.push(claims);
                createTableAllClaims(result);
            }
        );
    }
    else
        getAllClaims();
}

async function clickViewTask(idTask) {
    showSpinner();

    viewTaskClaim = await getData("TasksClaims", "?$select=*,AssignTo/Title&$expand=AssignTo&$select=TaskClaimStatus/Title&$expand=TaskClaimStatus" +
        "&$select=FlowTypeClaim/Title&$expand=FlowTypeClaim" +
        "&$filter=(ID eq " + idTask + ")");

    $("#modalTitle").html(viewTaskClaim[0].FlowTypeClaim.Title);



    $("#dataTask").show();

    switch (viewTaskClaim[0].FlowTypeClaimId) {
        case 1:
            //$("#mDateLoss").html(viewTaskClaim[0].DateOfLoss == null ? viewTaskClaim[0].DateOfLoss.split('T')[0]:"");
            //$("#mReportDateTask").html(viewTaskClaim[0].ReportDate == null ? viewTaskClaim[0].ReportDate.split('T')[0]:"");
            //$("#mCause").html(viewTaskClaim[0].Cause);
            $("#mCedentReference").html(viewTaskClaim[0].Cedent);
            $("#mDescription").html(viewTaskClaim[0].Description);
            $("#mClosureReason").html("");

            $("#divDateLoss").hide();
            $("#divReportDateTask").hide();
            $("#divCause").hide();
            $("#divCedentReference").show();
            $("#divDescription").show();

            $("#divAmount").hide();
            $("#divPercent").hide();
            $("#divAttachedDoc").hide();
            $("#divParticipationPercentage").hide();
            $("#divAmountRecover").hide();
            $("#divClaimedAmount").hide();
            $("#divCurrency").hide();
            break;
        case 2:
            $("#divClaimedAmount").show();
            $("#divCurrency").show();

            var accountData = await getData("Accounts", "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(Reference eq '" + viewTaskClaim[0].AccountReference + "')");

            $("#viewCurrency").val(accountData[0].Currency);

            $("#mClosureReason").html("");

            $("#mDescription").html(viewTaskClaim[0].Description);
            $("#claimedAmount").val(viewTaskClaim[0].ClaimedAmount);
            $("#claimedAmount").attr("disabled", true);

            $("#divAmount").hide();
            $("#divPercent").hide();
            $("#divAttachedDoc").hide();

            $("#divParticipationPercentage").hide();
            $("#divAmountRecover").hide();
            $("#divDateLoss").hide();
            $("#divReportDateTask").hide();
            $("#divCause").hide();
            $("#divCedentReference").hide();
            $("#divDescription").show();
            break
        case 8:
            // $("#mParticipationPercentage").html(viewTaskClaim[0].ParticipationPercentage);
            //$("#mAmountRecover").html(viewTaskClaim[0].AmountRecover);
            $("#mDescription").html(viewTaskClaim[0].Description);
            $("#mClosureReason").html("");
            // $("#divParticipationPercentage").show();
            // $("#divAmountRecover").show();

            $("#divDateLoss").hide();
            $("#divReportDateTask").hide();
            $("#divCause").hide();
            $("#divCedentReference").hide();
            $("#divDescription").show();
            $("#divAmount").hide();
            $("#divPercent").hide();
            $("#divAttachedDoc").hide();
            $("#divClaimedAmount").hide();
            $("#divCurrency").hide();
            break;
        case 9:
            $("#mClosureReason").html(viewTaskClaim[0].ClosureReason);

            $("#dataTask").hide();
            $("#divClaimedAmount").hide();
            $("#divCurrency").hide();
            break;
        default:
            // $("#mAmount").html(viewTaskClaim[0].Amount);
            // $("#mPercent").html(viewTaskClaim[0].Percent);
            // $("#mAttachedDoc").html((viewTaskClaim[0].AttachedSupportingDoc) ? "YES" : "NO");
            $("#mDescription").html(viewTaskClaim[0].Description);
            $("#mClosureReason").html("");

            $("#divAmount").hide();
            $("#divPercent").hide();
            $("#divAttachedDoc").hide();

            $("#divParticipationPercentage").hide();
            $("#divAmountRecover").hide();
            $("#divDateLoss").hide();
            $("#divReportDateTask").hide();
            $("#divCause").hide();
            $("#divCedentReference").hide();
            $("#divDescription").show();
            $("#divClaimedAmount").hide();
            $("#divCurrency").hide();
            break;
    }

    claimViewTask = await getData("Claims", "?$filter=(ID eq '" + viewTaskClaim[0].InternalReference + "')");

    $("#mClaimId").html(claimViewTask[0].ID);
    $("#mReference").html(claimViewTask[0].ClaimReference);
    $("#mReference").attr('href', _spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + claimViewTask[0].ID + "&type=view");
    $("#mBusinessReference").html(claimViewTask[0].BusinessReference);

    var urlParameters = claimViewTask[0].BusinessReference.split("-").length > 2 ? "&type=endorsement&mode=view" : "&type=account&mode=view";


    $("#mBusinessReference").attr('href', _spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + claimViewTask[0].BusinessReference + urlParameters)

    $("#mReportDate").html((claimViewTask[0].ReportDate) ? claimViewTask[0].ReportDate.split('T')[0] : "");
    $("#mClient").html(claimViewTask[0].Client);
    $("#mBusinessLine").html(claimViewTask[0].BusinessLine);
    $("#mDocumentation").html("<a class='btn btn-primary button-modal view-docs' role='button' href='#'><i class='fas fa-folder-open' aria-hidden='true'></i> View Documents</a>");
    //$("#mDocumentation").html("<a href=\"" + _spPageContextInfo.webAbsoluteUrl + "/Documents/" + claimViewTask[0].BusinessReference + "/" +
    //    claimViewTask[0].ID + "?web=1" + "\">link</a>");

    businessReference = viewTaskClaim[0].AccountReference;

    currentRootPath = businessReference.replace(/\-/g, "") + "/" + claimViewTask[0].ID;

    var status = await GetTaskClaimStatus();
    $("#selectStatus").html("<option value=\"\" disabled selected>Status</option>");
    status.forEach(item => {
        $("#selectStatus").append("<option value='" + item.ID + "'>" + item.Title + "</option>");
    });

    $("#selectStatus").val(viewTaskClaim[0].TaskClaimStatusId);

    LoadClaimTasksComments("#mComments", viewTaskClaim[0].InternalReference, "modal-comment-content");

    hideSpinner();

    $("#modalTask").modal("show");
}

// async function LoadComments() {
//     $("#mComments").html("");

//     var comments = await getData("Comments", "?$select=*,Author/Title&$expand=Author&$filter=(Reference eq '" + viewTaskClaim[0].Title + "')&$orderby=ID desc");

//     comments.forEach(item => {
//         $("#mComments").append($("<div class=\"modal-comment-content\"><label>" + item.Created.replace('T', " ").replace('Z', "") + " - " + item.Author.Title +
//             " - " + item.FlowType + "</label><br><label class=\"label-comment\">" + item.Title + "</label></div>"));
//     });
// }

async function ClickAddComment() {


    if ($("#mComment").val() != "") {
        $("#commentButton").attr("disabled", true);
        var addComment = {
            '__metadata': { type: "SP.Data.ClaimsTasksCommentsListItem" },
            'Comments': $("#mComment").val(),
            'TaskId': viewTaskClaim[0].ID,
            'ClaimReference': viewTaskClaim[0].InternalReference,
            'TaskType': viewTaskClaim[0].FlowTypeClaim.Title
        }

        addDataAsync("ClaimsTasksComments", addComment, function (result) {
            $("#mComment").val("");
            LoadClaimTasksComments("#mComments", viewTaskClaim[0].InternalReference, "modal-comment-content");
            $("#commentButton").attr("disabled", false);
            $("#mComment").val("");
        },
            function (data) {

                showErrorMessage("An error has succeded: " + data);

            });





    }
    else showErrorMessage("You must enter a comment.");
}

async function ClickModalSave() {
    var updateTask = {
        '__metadata': { type: "SP.Data.TasksClaimsListItem" },
        'TaskClaimStatusId': parseInt($("#selectStatus").val())
    }

    var changeClaimedAmount = (viewTaskClaim[0].ClaimedAmount != $("#claimedAmount").val())

    if (changeClaimedAmount)
        updateTask["ClaimedAmount"] = $("#claimedAmount").val();

    //Changes by Mauricio: Adding history task
    updateData("TasksClaims", viewTaskClaim[0].ID, updateTask, "ModalSave");
    AddRegisterHistoryProcess(viewTaskClaim[0].InternalReference, (changeClaimedAmount) ? "change claimed amount" : "modified", $("#modalTitle").text(), $("#selectStatus option:selected").html(), "HistoryClaimTasks");
}

async function GetTaskClaimStatus() {
    return await getData("TasksClaimsStatus", "");
}

async function ChangeTaskStatus() {
    if ($("#selectStatus").val() != "") $("#bModalSave").prop("disabled", false);
}

function clickViewRelatedDocuments() {

    resetBreadcrumb();
    getRelatedDocuments(currentRootPath, "#tRelatedDocuments");

    $("#relatedDocumentModal").modal("show");

}

function clickViewFile(Name) {


    var pathDocument = currentRootPath;
    if (levelsBreadcrumb.paths.length == 1) {

        window.open(urlDocumentManager + "/api/download?path=/" + pathDocument + "/" + Name);
    }
    else {
        var pathToQueryList = levelsBreadcrumb.paths.slice();

        pathToQueryList.shift();

        var pathToQuery = pathToQueryList.length == 0 ? "/" : pathToQueryList.join("/");
        window.open(urlDocumentManager + "/api/download?path=/" + pathDocument + "/" + pathToQuery + "/" + Name);
    }



    // window.open("_spPageContextInfo.webAbsoluteUrl/Documents/" + reference + "/" + Name + "?web=1", '_blank');
}

function createTableAllClaims(dataTableResult) {
    if (!firstLoadClaimsTable) dataTableAllClaims.destroy();

    $("#tAllClaims").html("");

    dataTableResult.forEach(res => {
        var dataResult = res.d.results || [];

        if (dataResult.length > 0) {
            dataResult.forEach(claim => {
                $("#tAllClaims").append($("<tr></tr>")
                    .append($("<td>" + claim.ID + "</td>"))
                    .append($("<td>" + (claim.ClaimReference || "") + "</td>"))
                    .append($("<td>" + (claim.BusinessReference || "") + "</td>"))
                    .append($("<td>" + (claim.Reinsured || "") + "</td>"))
                    .append($("<td>" + (claim.Client || "") + "</td>"))
                    .append($("<td>" + (claim.Description || "") + "</td>"))
                    .append($("<td>" + formatDate(claim.OccurrenceDate) + "</td>"))
                    // .append($("<td>" + (claim.BusinessLine || "") + "</td>"))
                    .append($("<td>" + (claim.CedentReference || "") + "</td>"))
                    .append($("<td>" + (claim.Status || "") + "</td>"))
                    // .append($("<td>" + (claim.WillisUKReference || "") + "</td>"))
                    .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewClaim('" + claim.ID + "');\">View Claim</button></td>"))
                );
            });
        }
    });

    dataTableAllClaims = addDataTable('dtAllClaims');

    dataTableAllClaims.column(0).visible(false);
    // dataTableAllClaims.column(1).visible(false);

    if (firstLoadClaimsTable) firstLoadClaimsTable = false;

    hideSpinner();
}