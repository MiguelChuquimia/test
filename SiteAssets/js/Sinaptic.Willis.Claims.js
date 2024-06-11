console.log("Loading: Sinaptic.Willis.Claims.js")

var firstClaim = true;
var firstAccount = true;
var datatable;
var dataTableAccount;
var office;
var claims;
var profile;
var arrayField = [];
var listButtons;
var listFields;
var accounts = [];
var selectFlowTypeClaim;
var selectedClaimID;
var selectedClaimsIDs = [];
Dropzone.autoDiscover = false;
var accountData;

$(function () {
    showSpinner();
    validatePage();

    $(document).ready(function () {
        formatClaimedAmount('claimedAmount');

        $("#dropzoneTask").dropzone({
            url: "#",
            addRemoveLinks: true,

            autoProcessQueue: false,
            dictDefaultMessage: "Drag and drop files here or click to select documents to upload",
            dictRemoveFile: "Remove",
            init: function () {
                this.on("sending", function (file, xhr, data) {

                    if (file.fullPath) {
                        data.append("fullPath", file.fullPath);

                    }
                });


            }
        });

        $("#sectionNewClaim").hide();
        $("#sectionHome").show();


        htmlCargando = `
		<div class="divCargando" style="width:80%; display: none;">
			<div class="divCargandoSpinner"></div>
			<div class="txtCargando">Searching <span></span>...</div>
		</div>
	`

        $(htmlCargando).insertBefore($("#dtAccounts").closest('.table-responsive'));

    });

    //$(document).on('keyup', '#searchAccounts', function (event) {
    //    HandleSearchChange(event)
    //})

    //$(document).on('keydown', '#searchAccounts', function (event) {
    //    if (event.keyCode == 13) {
    //        event.preventDefault()
    //    }
    //})

});






function tabSwitch(tab) {
    if (!$("#" + tab).hasClass("active")) {
        $("#" + tab).children('a').addClass("active");

    }
    //$("#dtMyTasks_wrapper").show();
    //$("#tableAccounts").hide();
    switch (tab) {

        case "tab-home":
            {

                $("#tab-newclaim").children('a').removeClass("active");
                $("#sectionNewClaim").hide();
                $("#sectionHome").show();

            }
            break;


        case "tab-newclaim":
            {
                $("#tab-home").children('a').removeClass("active");
                //$("#tab-process").children('a').removeClass("active");

                $("#sectionNewClaim").show();
                $("#sectionHome").hide();

            }
            break;
        default: break;
    }


}

$('#dtClaims tbody').on('click', 'tr', function () {

    //$(this).toggleClass('selected');

    //if ($(this).hasClass('selected')) {

    //    selectedClaimsIDs.push(datatable.rows('.selected').data()[0][0]);

    //}
    //else {

    //    if (selectedClaimsIDs.length > 1)
    //        selectedClaimsIDs.splice(selectedClaimsIDs.indexOf(datatable.rows('.selected').data()[0][0]), 1);

    //}

});


$("#s4-workspace").scroll(function (e) {
    var $el = $('.screen-header .row-buttons');
    var isPositionFixed = ($el.css('position') == 'fixed');
    if ($(this).scrollTop() > 200 && !isPositionFixed) {
        $el.css({ 'position': 'fixed', 'margin-top': '-83px' });
    }
    if ($(this).scrollTop() < 200 && isPositionFixed) {
        $el.css({ 'position': 'static', 'margin-top': '1%' });
    }
});

async function validatePage() {
    office = await getUserOffice();
    var OfficeArray = [];
    for (var indexOffice = 0; indexOffice < office.results.length; indexOffice++) {
        OfficeArray.push(office.results[indexOffice].Office);
    };
    await getListUsersByOffice(OfficeArray);
    profile = await getUserProfile();
    listFields = loadListFieldsvalue(profile.ProfileId, OfficeArray);
    getListClaimHandler("#oUser", OfficeArray, "clickAssignTeamManager");
    getListsFlowTypeClaim("#oFlowType", "clickCreateTask");
    validateFilters(profile.ProfileId);
    await getAccounts();
    hideSpinner();
}
async function validateFilters(profileId) {
    listButtons = await getData("FiltersButtons", "?$filter=(ProfileId eq " + profileId + ")&$orderby=OrderColumn");
    var valor = "";
    listButtons.forEach((element, index) => {
        createFilters(element, index, "Claims");

        listFields.forEach(field => {
            valor = field.value;
            if (field.field === "Office") {
                valor = "";
                for (var indexOffice = 0; indexOffice < office.results.length; indexOffice++) {
                    valor += "Office eq '" + office.results[indexOffice].Office + "'";
                    if (indexOffice + 1 < office.results.length) {
                        valor += " or ";
                    }
                }
            }
            element.Filters = element.Filters.replace("*" + field.field + "*", valor);
        });
    });

    hideSpinner();

    clickFilterClaims(0);
}


$("#searchAccounts").on("keyup", function (e) {
    if (e.keyCode === 13) {
        clickSearchAccounts();
    }
});


async function clickSearchAccounts() {

    ShowSearchingMessage();


    StrFilter = ""
    if ($("#searchAccounts").val().trim() != "") {
        strEscapado = $("#searchAccounts").val().trim();
        strEscapado = strEscapado.replace(/'/g, '');

        strEscapado = encodeURIComponent(strEscapado);

        if ($("input[name='optSearchOnMyAccountsFilter']:checked").val() == "byReference")
            StrFilter += "(substringof('" + strEscapado + "', Reference))";
        else
            StrFilter += "(substringof('" + strEscapado + "', OriginalInsured))";

    }

    getAccounts(StrFilter);

}


function HideSearchingMessage() {
    $("#dtAccounts").closest('.table-responsive').show()

    $(".divCargando").hide()
}

function ShowSearchingMessage() {
    $("#dtAccounts").closest('.table-responsive').hide()

    if ($("#txtSearchOnMyAccounts").val() != "") {
        SearchingText = `"${$("#searchAccounts").val()}"`
    } else {
        SearchingText = `all Accounts`
    }


    SearchingText += " status Completed"

    $(".divCargando .txtCargando span").text(SearchingText)
    $(".divCargando").show()
}

async function clickFilterClaims(index) {
    showSpinner();
    listButtons.forEach((element, position) => {
        if (index == position) $("#b" + element.Title.replace(/\s/g, '')).css("background", "lightgray");
        else $("#b" + element.Title.replace(/\s/g, '')).css("background", "none");
    });
    var data = listButtons[index];
    if (data == undefined) {
        return false;
    }
    if (data.Title == "Office Claims") {
        $(".section-account").hide();
    }
    else {
        $(".section-account").show();
    }
    claims = await getData(data.ListName, data.Filters);

    if (!firstClaim) datatable.destroy();
    $("#tClaims").html("");
    $("#dtSelect").html("");
    $("#dtHeader").html("");

    validateFieldsHeadersWithID(JSON.parse(data.Fields));

    claims.forEach((claim, indexClaim) => {
        $("#tClaims").append($("<tr id=\"trClaim" + indexClaim + "\"></tr>"));
        JSON.parse(data.Fields).forEach((field, indexField) => {
            if (indexField == 0) {
                //$("#trClaim" + indexClaim).append($("<td style=\"display: none;\">" + claim[field.Field] + "</td>"));
                $("#trClaim" + indexClaim).append($("<td>" + claim[field.Field] + "</td>"));
            }
            else {
                var value = "";

                if (field.Type == "Date") {
                    if (field.SecondField != "") {
                        if (claim[field.Field][field.SecondField.toString()] != null)
                            value = claim[field.Field][field.SecondField.toString()].split("T")[0];
                        else
                            value = "";
                    }
                    else {
                        if (claim[field.Field] != null)
                            value = claim[field.Field.toString()].split("T")[0];
                        else
                            value = "";
                    }
                }
                else {
                    if (field.SecondField != "") value = claim[field.Field][field.SecondField];
                    else value = claim[field.Field] || "";
                }

                $("#trClaim" + indexClaim).append($("<td>" + value + "</td>"));
            }
        });

        if (data.Title == "All Tasks") {
            $("#trClaim" + indexClaim).append("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + claim.ID + "');\">View Task</button></td>");
        } else {
            //Data row record creation
            $("#trClaim" + indexClaim).append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickClaim(" + indexClaim + ");\">View Claim</button>" +
                "<button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"ClickViewClaimSummary('" + claim.ID +
                "','Claims');\">View Summary</button></td>"));
        }
    });

    datatable = addDataTable('dtClaims', arrayField);
    datatable.column(0).visible(false);
    if (data.Title == "All Tasks") {
        datatable.column(7).visible(false);
        datatable.column(8).visible(false);
        datatable.column(9).visible(false);
        datatable.column(10).visible(false);
    }


    if (firstClaim) {
        firstClaim = false;

        $('#dtClaims tbody').on('click', 'tr', async function () {
            $(this).toggleClass('selected');

            if (datatable.rows('.selected').data().length > 1) {
                $("#bCreateTask").prop("disabled", true);
                $("#bAssingToMe").prop("disabled", false);
                $("#bProcessRequestUser").prop("disabled", false);
            }
            else {
                if (datatable.rows('.selected').data().length == 1) {
                    selectedClaimID = datatable.rows('.selected').data()[0][0];
                    selectedReference = datatable.rows('.selected').data()[0][1];
                    var selectedBusinessRef = datatable.rows('.selected').data()[0][2];
                    accountData = await getData("Accounts", "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(Reference eq '" + selectedBusinessRef + "')");
                    $("#bAssingToMe").prop("disabled", false);
                    $("#bProcessRequestUser").prop("disabled", false);
                    $("#bCreateTask").prop("disabled", false);
                }
                else {
                    disabledButtons();
                }
            }
        });
    }

    searchField();

    JSON.parse(data.Fields).forEach((element, index) => {
        if (element.Disabled) datatable.column(index).visible(false);
    });

    hideSpinner();
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
            break;
        case 2:
            $("#divClaimedAmount").show();

            $("#mDescription").html(viewTaskClaim[0].Description);
            $("#viewClaimedAmount").val(viewTaskClaim[0].ClaimedAmount);

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

            break;
        case 8:
            // $("#mParticipationPercentage").html(viewTaskClaim[0].ParticipationPercentage);
            //$("#mAmountRecover").html(viewTaskClaim[0].AmountRecover);
            $("#mDescription").html(viewTaskClaim[0].Description);
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
            break;
        case 9:
            $("#dataTask").hide();
            $("#divClaimedAmount").hide();
            break;
        default:
            // $("#mAmount").html(viewTaskClaim[0].Amount);
            // $("#mPercent").html(viewTaskClaim[0].Percent);
            // $("#mAttachedDoc").html((viewTaskClaim[0].AttachedSupportingDoc) ? "YES" : "NO");
            $("#mDescription").html(viewTaskClaim[0].Description);

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

    LoadClaimTasksComments("#mComments", viewTaskClaim[0].InternalReference, "modal-comment-content");

    hideSpinner();

    $("#modalTask").modal("show");
}

async function GetTaskClaimStatus() {
    return await getData("TasksClaimsStatus", "");
}


function clickNewClaim() {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + dataTableAccount.rows('.selected').data()[0][0] + "&type=new", '_self');
}

function clickAssign() {
    for (let index = 0; index < datatable.rows('.selected').data().length; index++) {
        var dataSave = {
            '__metadata': { type: "SP.Data.ClaimsListItem" },
            'ProcessRequestUserId': _spPageContextInfo.userId
        }

        if (index != datatable.rows('.selected').data().length - 1) updateData("Claims", datatable.rows('.selected').data()[index][0], dataSave);
        else updateData("Claims", datatable.rows('.selected').data()[index][0], dataSave, "claim");
    }
}

function clickClaim(index) {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + claims[index].ID + "&type=view", '_blank');
}

function disabledButtons() {
    $("#bCreateTask").prop("disabled", true);
    $("#bAssingToMe").prop("disabled", true);
    $("#bProcessRequestUser").prop("disabled", true);
}

function clickAssignTeamManager(id) {
    for (let index = 0; index < datatable.rows('.selected').data().length; index++) {
        var dataSave = {
            '__metadata': { type: "SP.Data.ClaimsListItem" },
            'ProcessRequestUserId': id
        }

        if (index != datatable.rows('.selected').data().length - 1) updateData("Claims", datatable.rows('.selected').data()[index][0], dataSave);
        else {
            showErrorMessage("Completed update Assign Claim Handler");
            updateData("Claims", datatable.rows('.selected').data()[index][0], dataSave, "claim");
        }
    }
}

function searchField() {
    $('#dtClaims thead tr:eq(0) th').each(function (i) {

        $('input', this).on('keyup change', function () {
            if (datatable.column(i).search() !== this.value) {
                datatable
                    .column(i)
                    .search(this.value)
                    .draw();
            }
        });
    });
}

async function getAccounts(filter = "") {
    if (!firstAccount) dataTableAccount.destroy();
    //Office Allow Multiple values
    var Officefilter = "";
    for (var indexOffice = 0; indexOffice < office.results.length; indexOffice++) {
        Officefilter += "Office eq '" + office.results[indexOffice].Office + "'";
        if (indexOffice + 1 < office.results.length) {
            Officefilter += " or ";
        }
    };

    var _filter = (filter != "") ? filter + "and" : "";

    accounts = await getData("Accounts", "?$filter=" + _filter + "(Status eq 'Completed')and(" + Officefilter + ")");
    $("#tAccounts").html("");
    accounts.forEach((account, indexAccount) => {
        $("#tAccounts").append($("<tr></tr>")
            .append($("<td>" + account.Reference + "</td>"))
            .append($("<td>" + account.OriginalInsured + "</td>"))
            .append($("<td>" + account.Client + "</td>"))
            .append($("<td>" + account.Inception + "</td>"))
            .append($("<td>" + account.LineBusiness + "</td>"))
            .append($("<td class='" + setColorStatus(account.Status, "label") + "'>" + account.Status + "</td>"))
            .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickAccountClaims(" + indexAccount + ");\">View Account</button></td>"))
        );
    });
    dataTableAccount = addDataTable('dtAccounts');
    if (firstAccount) {
        firstAccount = false;
        $('#dtAccounts tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
            if (dataTableAccount.rows('.selected').data().length == 1) $("#bNewClaim").prop("disabled", false);
            else $("#bNewClaim").prop("disabled", true);
        });
    }

    HideSearchingMessage();
}

function clickAccountClaims(indexAccount) {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accounts[indexAccount].Reference + "&type=account", '_self');
}

function clickClearFilters() {
    clickFilterClaims(0);
}


function ClickModalSaveTask() {

    ClickModalSave(selectedReference, selectedClaimID);
    disabledButtons();
    clickFilterClaims(0);
}

//function clickCreateTask(idFlowTypeClaim) {
//    ValidateFlowType(idFlowTypeClaim);
//    $("#modalTask").show();
//    selectFlowTypeClaim = idFlowTypeClaim;
//}

//function ClickModalSave() {
//    if (ValidateFlowTypeClaim()) {
//        var createTask = {
//            '__metadata': { type: "SP.Data.TasksClaimsListItem" },
//            'TaskClaimStatusId': 8,
//            'Title': datatable.rows('.selected').data()[0][1],
//            'InternalReference': datatable.rows('.selected').data()[0][0],
//            'FlowTypeClaimId': selectFlowTypeClaim
//        }

//        switch (selectFlowTypeClaim) {
//            case 1:
//                createTask["AccountReference"] = $("#accountReference").val();
//                createTask["DateOfLoss"] = $("#dateOfLoss").val();
//                createTask["ReportDate"] = $("#iReportDate").val();
//                createTask["Cause"] = $("#cause").val();
//                createTask["ReferenceGrantor"] = $("#referenceGrantor").val();
//                createTask["Description"] = $("#description").val();
//                break;
//            case 8:
//                createTask["Cause"] = $("#cause").val();
//                createTask["ReferenceGrantor"] = $("#referenceGrantor").val();
//                break;
//            case 9:
//                break;
//            default:
//                createTask["Amount"] = $("#amount").val();
//                createTask["Percent"] = $("#percent").val();
//                createTask["AttachedSupportingDoc"] = $("#attachedSupportingDoc").prop("checked");
//                break;
//        }

//        $("#modalTask").hide();

//        CreateNewTaskClaim(createTask);

//        //TODO: Resolve what task type we need record in History List
//        AddRegisterHistoryProcess(datatable.rows('.selected').data()[0][0], "created", getFlowTypeName(createTask.FlowTypeClaimId), "Pending", "HistoryClaimTasks");
//    }
//    else showErrorMessage("There are required fields or the date is incorrect.");
//}

//async function ValidateFlowType(idFlowTypeClaim) {
//    switch (idFlowTypeClaim) {
//        case 1: //notice
//            $("#accountReference").val(datatable.rows('.selected').data()[0][2]);
//            $("#mAccountReference").show();
//            $("#mDateOfLoss").show();
//            $("#miReportDate").show();
//            $("#mCause").show();
//            $("#mReferenceGrantor").show();
//            $("#mDescription").show();

//            $("#mAmount").hide();
//            $("#mPercent").hide();
//            $("#mAttachedSupportingDoc").hide();
//            $("#mParticipationPercentage").hide();
//            $("#mAmountRecover").hide();
//            break;
//        case 8: //salvage
//            $("#mAmountRecover").show();
//            $("#mParticipationPercentage").show();

//            $("#mAccountReference").hide();
//            $("#mDateOfLoss").hide();
//            $("#miReportDate").hide();
//            $("#mCause").hide();
//            $("#mReferenceGrantor").hide();
//            $("#mDescription").hide();
//            $("#mAmount").hide();
//            $("#mPercent").hide();
//            $("#mAttachedSupportingDoc").hide();
//            break;
//        case 9: //closure
//            $("#mAmountRecover").hide();
//            $("#mParticipationPercentage").hide();
//            $("#mAccountReference").hide();
//            $("#mDateOfLoss").hide();
//            $("#miReportDate").hide();
//            $("#mCause").hide();
//            $("#mReferenceGrantor").hide();
//            $("#mDescription").hide();
//            $("#mAmount").hide();
//            $("#mPercent").hide();
//            $("#mAttachedSupportingDoc").hide();
//            break;
//        default:
//            $("#mAmount").show();
//            $("#mPercent").show();
//            $("#mAttachedSupportingDoc").show();
//            $("#mParticipationPercentage").show();

//            $("#mAccountReference").hide();
//            $("#mDateOfLoss").hide();
//            $("#miReportDate").hide();
//            $("#mCause").hide();
//            $("#mReferenceGrantor").hide();
//            $("#mDescription").hide();
//            $("#mAmountRecover").hide();
//            break;
//    }
//}

//function ClickModalCancel() {
//    $("#accountReference").val("");
//    $("#dateOfLoss").val("");
//    $("#iReportDate").val("");
//    $("#cause").val("");
//    $("#referenceGrantor").val("");
//    $("#amount").val("");
//    $("#percent").val("");
//    $("#attachedSupportingDoc").val("");
//    $("#participationPercentage").val("");
//    $("#amountRecover").val("");

//    $("#modalTask").hide();
//}

//function getFlowTypeName(idType) {

//    switch (idType) {
//        case 1: { return "Notice"; } break;
//        case 2: { return "Estimate";  } break;
//        case 3: { return "Reserve";  } break;
//        case 3: { return "Payment on Account";  } break;
//        case 5: { return "Partial Settlement";  } break;
//        case 6: { return "Final Settlement";  } break;
//        case 7: { return "Fees";  } break;
//        case 8: { return "Salvage";  } break;
//        case 9: { return "Closure"; } break;
//        default: { } break;
//    }
//}

//function ValidateFlowTypeClaim() {
//    var val = true;

//    switch (selectFlowTypeClaim) {
//        case 1: //notice
//            if ($("#accountReference").val() == null || $("#accountReference").val() == "") {
//                val = false;
//                $("#accountReference").css('border-color', 'red');
//            }
//            else $("#accountReference").css('border-color', '');

//            if ($("#dateOfLoss").val() == null || $("#dateOfLoss").val() == "") {
//                val = false;
//                $("#dateOfLoss").css('border-color', 'red');
//            }
//            else $("#dateOfLoss").css('border-color', '');

//            if ($("#iReportDate").val() == null || $("#iReportDate").val() == "") {
//                val = false;
//                $("#iReportDate").css('border-color', 'red');
//            }
//            else $("#iReportDate").css('border-color', '');

//            if ($("#cause").val() == null || $("#cause").val() == "") {
//                val = false;
//                $("#cause").css('border-color', 'red');
//            }
//            else $("#cause").css('border-color', '');

//            if ($("#referenceGrantor").val() == null || $("#referenceGrantor").val() == "") {
//                val = false;
//                $("#referenceGrantor").css('border-color', 'red');
//            }
//            else $("#referenceGrantor").css('border-color', '');

//            if ($("#description").val() == null || $("#description").val() == "") {
//                val = false;
//                $("#description").css('border-color', 'red');
//            }
//            else $("#description").css('border-color', '');

//            break;
//        case 8: //salvage
//            if ($("#amountRecover").val() == null || $("#amountRecover").val() == "") {
//                val = false;
//                $("#amountRecover").css('border-color', 'red');
//            }
//            else $("#amountRecover").css('border-color', '');

//            if ($("#participationPercentage").val() == null || $("#participationPercentage").val() == "") {
//                val = false;
//                $("#participationPercentage").css('border-color', 'red');
//            }
//            else $("#participationPercentage").css('border-color', '');

//            break;
//        case 9: //closure
//            break;
//        default:
//            if ($("#amount").val() == null || $("#amount").val() == "") {
//                val = false;
//                $("#amount").css('border-color', 'red');
//            }
//            else $("#amount").css('border-color', '');

//            if ($("#percent").val() == null || $("#percent").val() == "") {
//                val = false;
//                $("#percent").css('border-color', 'red');
//            }
//            else $("#percent").css('border-color', '');

//            //if ($("#attachedSupportingDoc").val() == null || $("#attachedSupportingDoc").val() == "") {
//            //    val = false;
//            //    $("#attachedSupportingDoc").css('border-color', 'red');
//            //}
//            //else $("#attachedSupportingDoc").css('border-color', '');

//            break;
//    }

//    return val;
//}