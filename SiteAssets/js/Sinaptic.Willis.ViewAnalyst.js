

console.log("Loading: Sinaptic.Willis.ViewAnalyst.js");

var firtsMyTasks = true;
var dataTableMyTasks;

var firtsAssignPending = true;
var dataTableAssignPending;

var firtsProcess = true;
var dataTableProcess;

var office;
var OfficeArray = [];
var arrayField = [];
var first = true;
var viewTask = [];
var docs = [];
var accountViewTask = [];
var docsStatus = ["na", "pending", "ok"]

var isSuspend = false;

var reasonId = 0;

var lastStatusTask = {
    lastStatusBilling: "",
    lastStatusEoC: ""
}


var okTaskEoC = true;
var lastTaskEocCompleted = false;
var businessReference;
var entityType = "";

var teamLeaderId = 3;
var analystId = 5;

$(function () {
    console.log("Test de cambio.");
    validatePage();

    //createTabsAndSearch();

    $(document).on('keyup', '#txtSearchOnMyAccounts', function (event) {
        HandleSearchChange(event)
    })

    $(document).on('keydown', '#txtSearchOnMyAccounts', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault()
        }
    })

});


//START - Method to Switch tabs in Team Leader Page

function tabSwitch(tab) {
    if (!$("#" + tab).hasClass("active")) {
        $("#" + tab).children('a').addClass("active");

    }
    $("#dtMyTasks_wrapper").show();
    $("#tableAccounts").hide();
    switch (tab) {

        case "tab-assignment":
            {
                $("#tab-mytasks").children('a').removeClass("active");
                $("#tab-accounts").children('a').removeClass("active");
                $("#tab-process").children('a').removeClass("active");
                $("#tableAssignPending").show();
                $("#tableProcess").hide();
                $("#tableAccounts").hide();
                $("#tableMyTasks").hide();
            }
            break;


        case "tab-mytasks":
            {
                $("#tab-assignment").children('a').removeClass("active");
                $("#tab-process").children('a').removeClass("active");
                $("#tab-accounts").children('a').removeClass("active");

                $("#tableAssignPending").hide();
                $("#tableProcess").hide();
                $("#tableAccounts").hide();
                $("#tableMyTasks").show();
            }
            break;
        case "tab-process":
            {
                $("#tab-mytasks").children('a').removeClass("active");
                $("#tab-assignment").children('a').removeClass("active");
                $("#tab-accounts").children('a').removeClass("active");

                $("#tableAssignPending").hide();
                $("#tableProcess").show();
                $("#tableAccounts").hide();
                $("#tableMyTasks").hide()
            }
            break;
        case "tab-accounts":
            {
                $("#tab-mytasks").children('a').removeClass("active");
                $("#tab-assignment").children('a').removeClass("active");
                $("#tab-process").children('a').removeClass("active");

                $("#tableAccounts").show();
                $("#tableAssignPending").hide();
                $("#tableProcess").hide();
                $("#tableMyTasks").hide();
                createTabsAndSearch();
            }
            break;
        default: break;
    }


}

async function createTabsAndSearch() {
    //   htmlTabs = `
    //	<div class="TabsSecundarios">
    //		<div class="tabSecundario tabDarkViolet tabSeleccionado" data-show="bFilters">Filters buttons</div>
    //		<div class="tabSecundario tabDarkViolet" data-show="SearchOnMyAccounts">Search in Office Accounts</div>
    //	</div>
    //`

    //   $(htmlTabs).insertBefore($("#bFilters"))

    //   $(".tabSecundario").click(function () {
    //       HandleClickTab($(this))
    //   })

    //< div class='input-group date' id = 'dateTimeFrom' >
    //            <input type="text" value="05/16/2018" class="form-control" required/>
    //               <span class="input-group-addon">
    //               <i class="glyphicon glyphicon-calendar fa fa-calendar"></i>
    //            </span>
    //          </div >
    //<div class='input-group date' id='dateTimeUntil'>
    //	<input type='text' class="form-control" />
    //	<span class="input-group-addon">
    //		<i class="glyphicon glyphicon-calendar fa fa-calendar"></i>
    //	</span>
    //</div>
    htmlSearch = `
		<div id="SearchOnMyAccounts">
		<input id="txtSearchOnMyAccounts" placeholder="Enter an Account Reference" class="form-control" type="" disabled/>
			<div id="SearchOnMyAccountsFilters">
				<span class="mini-spinner" style="margin-right: 5px;"></span>
				<span style="font-size: 14px;">Getting filters...</span>
			</div>
		</div>
	`

    $(htmlSearch).insertBefore($("#dtAccounts"));

    //$('#dateTimeFrom').datetimepicker({
    //	"allowInputToggle": true,
    //	"showClose": true,
    //	"showClear": true,
    //	"showTodayButton": true,
    //	"format": "MM/DD/YYYY",
    //});
    //$('#dateTimeUntil').datetimepicker({
    //	"allowInputToggle": true,
    //	"showClose": true,
    //	"showClear": true,
    //	"showTodayButton": true,
    //	"format": "MM/DD/YYYY",
    //});

    AllStatus = await getData("Status", "?$select=Title&$orderby=Title");

    var htmlOptionFilters = "";
    //	`
    //	<label>
    //		<input type="radio" name="optSearchOnMyAccountsFilter" value="All" checked>
    //		<span>All</span>
    //	</label>
    //`

    AllStatus.map(function (item) {
        htmlOptionFilters += `
			<label>
				<input type="radio" name="optSearchOnMyAccountsFilter" value="${item.Title}">
				<span>${item.Title}</span>
			</label>
		`
    })

    var htmlFieldOption = `
			</br><label>
				<input type="radio" name="optSearchByField" value="byReference">
				<span>By Reference</span>
			</label>
<label>
				<input type="radio" name="optSearchByField" value="byOriginalInsured">
				<span>By Original Insured</span>
			</label>
		`

    $("#SearchOnMyAccountsFilters").html(htmlOptionFilters + htmlFieldOption);
    //$("#SearchOnMyAccountsFilters").html(htmlFieldOption);
    $("#txtSearchOnMyAccounts").prop("disabled", false)

    $("input[name='optSearchOnMyAccountsFilter']").change(function () {
        BeginToSearch()
    })

    $("input[name='optSearchByField']").change(function () {
        BeginToSearch()
    })

    htmlCargando = `
		<div class="divCargando" style="width:80%; display: none;">
			<div class="divCargandoSpinner"></div>
			<div class="txtCargando">Searching <span></span>...</div>
		</div>
	`

    $(htmlCargando).insertBefore($("#dtAccounts"));


}

function HandleSearchChange(event) {
    if (((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 32 || event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 27 || event.keyCode == 189)) {

        BeginToSearch()
    }
}

//END - Method to Switch tabs in Team Leader Page
async function BeginToSearch() {
    TokenTimeSearch = new Date().getTime() + "_" + NumeroRandom(1, 500000)

    ShowSearchingMessage()

    dataFilteredAccounts = await getFilteredAccountsWithTokenTime(TokenTimeSearch)

    if (dataFilteredAccounts.Status == "Completed") {
        dataArmarTabla = {
            Fields: getFieldsSearchQuery(),
            ListName: "Accounts",
            ImSearchingByText: true
        }

        ArmarTabla(dataArmarTabla)
    }

    HideSearchingMessage();
}

function NumeroRandom(pMin, pMax) {
    pMin = Math.ceil(pMin);
    pMax = Math.floor(pMax);
    return Math.floor(Math.random() * (pMax - pMin + 1)) + pMin;
}

function ShowSearchingMessage() {
    $("#dtAccounts").closest('.table-responsive').hide()

    if ($("#txtSearchOnMyAccounts").val() != "") {
        SearchingText = `"${$("#txtSearchOnMyAccounts").val()}"`
    } else {
        SearchingText = `all Accounts`
    }

    SearchingText += " with "

    vSelectedFilter = $("input[name='optSearchOnMyAccountsFilter']:checked").val()

    if (vSelectedFilter != "All") {
        SearchingText += vSelectedFilter
    } else {
        SearchingText += "any"
    }

    SearchingText += " status"

    $(".divCargando .txtCargando span").text(SearchingText)
    $(".divCargando").show()
}

function HideSearchingMessage() {
    $("#dtAccounts").closest('.table-responsive').show()

    $(".divCargando").hide()
}

function getFilteredAccountsWithTokenTime(pTokenTime) {
    var pGetFilteredAccountsWithTokenTime = new Promise(async (resolve, reject) => {
        accounts = [0]
        cantOffice = 0

        for (var i = 0; i < OfficeArray.length; i++) {
            Office = OfficeArray[i]

            // Search filter
            StrFilter = ""
            if ($("#txtSearchOnMyAccounts").val().trim() != "") {
                strEscapado = $("#txtSearchOnMyAccounts").val().trim()
                strEscapado = strEscapado.replace(/'/g, '')

                strEscapado = encodeURIComponent(strEscapado)

                vSelectedFilterByField = $("input[name='optSearchByField']:checked").val();

                if (vSelectedFilterByField == "byOriginalInsured") {

                    StrFilter += "(substringof('" + strEscapado + "', OriginalInsured))"
                }
                else
                    StrFilter += "(substringof('" + strEscapado + "', Title))"
            }

            // Status filter
            vSelectedFilter = $("input[name='optSearchOnMyAccountsFilter']:checked").val()

            StatusFilter = ""
            if (vSelectedFilter != "All") {
                StatusFilter = "(Status eq '" + vSelectedFilter + "')"
            }



            OfficeAccounts = await getData("Accounts", `?$select=*,UserAccount/Title&$expand=UserAccount&$filter=${StrFilter}and${StatusFilter}and(Office eq '${Office}')`);

            if (pTokenTime == TokenTimeSearch) {
                for (var j = 0; j < OfficeAccounts.length; j++) {
                    accounts.push(OfficeAccounts[j]);
                }

                cantOffice++;
                if (cantOffice == OfficeArray.length) {
                    resolve({
                        TokenTime: pTokenTime,
                        Status: "Completed"
                    })
                }
            } else {
                i = OfficeArray.length
                resolve({
                    TokenTime: pTokenTime,
                    Status: "Cancelled"
                })
            }
        }
    });

    return pGetFilteredAccountsWithTokenTime;
}

function getFieldsSearchQuery() {
    // Este JSON es el mismo que existe para los Filter Buttons de All Accounts Pending y All Accounts On Hold - In Progress

    return `
		[{"Title": "ID", "Field": "ID", "SecondField": "", "TypeFilter": "", "Disabled": false, "Type": ""},{"Title": "Reference", "Field": "Reference", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": ""},{"Title": "Original Insured", "Field": "OriginalInsured", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": ""},{"Title": "Client", "Field": "Client", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": ""},{"Title": "Type Of Movement", "Field": "TypeOfMovement", "SecondField": "", "TypeFilter": "select", "Disabled": false, "Type": ""},{"Title": "Inception", "Field": "Inception", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": "Date"},{"Title": "GL of Business", "Field": "LineBusiness", "SecondField": "", "TypeFilter": "select", "Disabled": false, "Type": ""},{"Title": "Business Country", "Field": "BusinessCountry", "SecondField": "", "TypeFilter": "", "Disabled": false, "Type": ""},{"Title": "Income USD", "Field": "IncomeUSD", "SecondField": "", "TypeFilter": "", "Disabled": false, "Type": ""},{"Title": "Main Responsible", "Field": "UserAccount", "SecondField": "Title", "TypeFilter": "select", "Disabled": false, "Type": ""},{"Title": "Status", "Field": "Status", "SecondField": "", "TypeFilter": "select", "Disabled": false, "Type": ""}]
	`
}



async function refreshPage() {
    $("#oTeamManager").html("");
    await validatePage();
}

async function validateFilters(profileId) {
    listButtons = await getData("FiltersButtons", "?$filter=(ProfileId eq " + profileId + ")&$orderby=OrderColumn");

    listButtons.forEach((element, index) => {
        createFilters(element, index, "Accounts");
    });

    hideSpinner();

    //clickFilterAccounts(0);
}

async function clickFilterAccounts(index) {
    showSpinner();
    listButtons.forEach((element, position) => {
        if (index == position) $("#b" + element.Title.replace(/\s/g, '')).css("background", "lightgray");
        else $("#b" + element.Title.replace(/\s/g, '')).css("background", "none");
    });
    var data = listButtons[index];
    var valor = "";
    var cantOffice = 0;
    FiltroTXT = data.Filters;
    listFields.forEach(element => {
        valor = element.value;
        if (element.field === "Office") {
            valor = "";
            for (var indexOffice = 0; indexOffice < element.value.length; indexOffice++) {
                valor += "Office eq '" + element.value[indexOffice] + "'";
                if (indexOffice + 1 < element.value.length) {
                    valor += " or ";
                }
                cantOffice++;
            }
        }
        if (element.field !== "Office") {
            data.Filters = data.Filters.replace("*" + element.field + "*", valor);
        }
    });
    $("#bMyTasks").removeClass("filter-active");
    $("#bAllTasks").removeClass("filter-active");
    $("#dtMyTasks_wrapper").hide();
    $("#tableAccounts").show();
    if (data.Filters.indexOf("Office") > 0) {
        getItems(data.ListName, OfficeArray, FiltroTXT, cantOffice, data);
    } else {
        accounts = await getData(data.ListName, data.Filters);
        ArmarTabla(data);
    }
}

async function validatePage() {
    var profile = await getUserProfile();

    office = await getUserOffice();
    for (var indexOffice = 0; indexOffice < office.results.length; indexOffice++) {
        OfficeArray.push(office.results[indexOffice].Office);
    };

    listFields = loadListFieldsvalue(profile.ProfileId, OfficeArray);

    validateFilters(profile.ProfileId);
    getListsAnalyst("#oTeamManager", office.Office, "clickAssign");

    switch (profile.ProfileId) {
        case teamLeaderId:
            $("#title").html("Hub Screen");
            $(".containerTitleSections").hide();
            await getMyTasks();
            //await getAllTasks();
            await getAssignPending();
            await getProcess();
            break;
        case analystId:
            $("#title").html("Hub Screen");
            await getMyTasks();
            //await getAllTasks();
            $("#tableAssignPending").hide();
            $("#tableProcess").hide();
            $("#tableMyTasks").show();
            $(".view-tl-select").hide();
            break;
        default:
            showErrorMessage("You do not have the permissions to enter this page.");
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Index.aspx", '_self');
            break;
    }

    $("#searchTask").on("keyup", function (e) {
        if (e.keyCode === 13) {
            clickSearchTask();
        }
    });

    $("#mDocumentation").on("click", function () {

        clickViewRelatedDocuments();

    });

    $("#closeRelatedDoc").on("click", function () {
        $("#relatedDocumentModal").modal("hide");
    });


}


async function getAllTasks() {

    showSpinner();

    $("#bMyTasks").removeClass("filter-active");
    $("#bAllTasks").addClass("filter-active");

    if (!firtsMyTasks) dataTableMyTasks.destroy();

    var filter = "&$filter=((TaskStatusId eq 2)or(TaskStatusId eq 3)or(TaskStatusId eq 4)or(TaskStatusId eq 8))";
    await getTasks(filter);

    if (firtsMyTasks) firtsMyTasks = false;

    hideSpinner();
}


async function getTasks(filter) {
    $("#dtMyTasks_wrapper").show();
    $("#tableAccounts").hide();
    $("#bAllAccounts").css("background", "#fff");


    var myTasks = await getData("Tasks", "?$select=*,FlowType/Title,AssignTo/Title&$expand=FlowType,AssignTo/Id&$select=TaskStatus/Title&$expand=TaskStatus" + filter);

    $("#tMyTasks").html("");

    myTasks.forEach(task => {
        var tr = task.Urgent == true ? "<tr style='background-color: #ca000047;'></tr>" : "<tr></tr>";

        $("#tMyTasks").append($(tr)
            .append($("<td>" + task.ID + "</td>"))
            .append($("<td>" + task.ObjectType + "</td>"))
            .append($("<td>" + task.Title + "</td>"))
            .append($("<td>" + task.Office + "</td>"))
            .append($("<td>" + task.Client + "</td>"))
            .append($("<td>" + task.Insured + "</td>"))
            .append($("<td>" + (task.Inception != null ? formatDate(new Date(task.Inception)) : "-") + "</td>"))
            .append($("<td>" + (task.DueDate != null ? formatDate(new Date(task.DueDate)) : "-") + "</td>"))
            .append($("<td>" + (task.Created != null ? formatDate(new Date(task.Created)) : "-") + "</td>"))
            .append($("<td>" + task.AssignTo.Title + "</td>"))
            .append($("<td>" + task.FlowType.Title + "</td>"))
            .append($("<td class='" + setColorStatus(task.TaskStatus.Title, "label") + "'>" + task.TaskStatus.Title + "</td>"))
            .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + task.ID + "');\">View Task</button></td>"))
        );
    });

    dataTableMyTasks = addDataTable('dtMyTasks');

    dataTableMyTasks.column(0).visible(false);

}

async function getMyTasks() {
    showSpinner();

    $("#bMyTasks").addClass("filter-active");
    $("#bAllTasks").removeClass("filter-active");

    if (!firtsMyTasks) dataTableMyTasks.destroy();

    var filter = "&$filter=((TaskStatusId eq 2)or(TaskStatusId eq 3)or(TaskStatusId eq 4)or(TaskStatusId eq 8))and(AssignToId eq '" + _spPageContextInfo.userId + "')&$orderby=Created desc";
    await getTasks(filter);

    if (firtsMyTasks) firtsMyTasks = false;

    hideSpinner();
}

async function getAssignPending() {
    showSpinner();

    if (!firtsAssignPending) dataTableAssignPending.destroy();

    var assignPending = await getData("Tasks", "?$select=*,FlowType/Title,AssignTo/Title,PrevAssignedTo/Title&$expand=FlowType,AssignTo/Id,PrevAssignedTo/Id&$select=TaskStatus/Title,TaskStatus/Id&$expand=TaskStatus" +
        "&$filter=(TaskStatusId eq 1)&$orderby=DueDate asc");

    $("#tAssignPending").html("");

    assignPending.forEach(task => {

        var tr = task.Urgent == true ? "<tr style='background-color: #ca000047;'></tr>" : "<tr></tr>";
        $("#tAssignPending").append($(tr)
            .append($("<td>" + task.ID + "</td>"))
            .append($("<td>" + task.ObjectType + "</td>"))
            .append($("<td>" + task.Title + "</td>"))
            .append($("<td>" + task.Office + "</td>"))
            .append($("<td>" + task.Client + "</td>"))
            .append($("<td>" + task.Insured + "</td>"))
            .append($("<td>" + (task.Inception != null ? formatDate(new Date(task.Inception)) : "-") + "</td>"))
            .append($("<td>" + (task.DueDate != null ? formatDate(new Date(task.DueDate)) : "-") + "</td>"))
            .append($("<td>" + (task.Created != null ? formatDate(new Date(task.Created)) : "-") + "</td>"))
            .append($("<td>" + ((task.PrevAssignedTo.Title !== undefined) ? task.PrevAssignedTo.Title : "") + "</td>"))
            .append($("<td>" + ((task.AssignTo.Title !== undefined) ? task.AssignTo.Title : "") + "</td>"))
            .append($("<td>" + task.FlowType.Title + "</td>"))
            .append($("<td class='" + setColorStatus(task.TaskStatus.Title, "label") + "'>" + task.TaskStatus.Title + "</td>"))
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

async function getProcess() {
    showSpinner();

    if (!firtsProcess) dataTableProcess.destroy();

    var process = await getData("Process", "?$select=*,CurrentFlow/Title&$expand=CurrentFlow&$select=Status/Title,Status/Id&$expand=Status&$select=Reason/Title&$expand=Reason&$filter=(StatusId ne 6)&$top=5000&$orderby=Created desc");

    $("#tProcess").html("");

    process.forEach(item => {
        var reason = (item.Reason.Title != undefined) ? item.Reason.Title : "";

        $("#tProcess").append($("<tr></tr>")
            .append($("<td>" + item.ID + "</td>"))
            .append($("<td>" + item.ObjectType + "</td>"))
            .append($("<td>" + item.Title + "</td>"))
            .append($("<td>" + (item.StartDate != null ? formatDate(item.StartDate) : "-") + "</td>"))
            .append($("<td>" + item.Office + "</td>"))
            .append($("<td>" + item.Client + "</td>"))
            .append($("<td>" + (item.DueDate != null ? formatDate(new Date(item.DueDate)) : "-") + "</td>"))
            .append($("<td>" + item.Insured + "</td>"))
            .append($("<td class='" + setColorStatus(item.Status.Title, "label") + "'>" + item.Status.Title + "</td>"))
            //.append($("<td>" + reason + "</td>"))
            .append($("<td><button type=\"button\"  class=\"btn btn-info btn-sm button-table\" onclick=\"ClickViewSummary('" + item.Title + "','Accounts');\">View Process</button></td>"))
            //.append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"ClickViewProcess('" + item.Title + "');\">View Process</button>" +
            //    "<button type=\"button\"  class=\"btn btn-info btn-sm button-table\" onclick=\"ClickViewSummary('" + item.Title +
            //    "','Accounts');\">View Summary</button></td>"))
        );
    });

    dataTableProcess = addDataTable('dtProcess');

    if (firtsProcess) {
        firtsProcess = false;

        $('#dtProcess tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');

            if (dataTableProcess.rows('.selected').data().length == 1) {
                $("#bSuspend").prop("disabled", false);
                $("#bActivate").prop("disabled", false);
                $("#bCancel").prop("disabled", false);
            }
            else {
                $("#bSuspend").prop("disabled", true);
                $("#bActivate").prop("disabled", true);
                $("#bCancel").prop("disabled", true);
            }



        });
    }

    dataTableProcess.column(0).visible(false);
    hideSpinner();
}

function clickAssign(id) {
    showSpinner();
    for (let index = 0; index < dataTableAssignPending.rows('.selected').data().length; index++) {
        var phase = dataTableAssignPending.rows('.selected').data()[index][11];

        var dataSave = {
            '__metadata': { type: "SP.Data.TasksListItem" },
            'TaskStatusId': 2,
            'PreviousTaskStatusId': 1
        }

        if (phase.includes("SPOE") && !phase.includes("SPOE Credit & Debit Notes")) {

            dataSave.AssignToId = id;
        }
        else {
            dataSave.AssignToId = id;
            dataSave.PrevAssignedToId = id;
        }

        if (index != dataTableAssignPending.rows('.selected').data().length - 1)
            updateData("Tasks", dataTableAssignPending.rows('.selected').data()[index][0], dataSave);
        else
            updateData("Tasks", dataTableAssignPending.rows('.selected').data()[index][0], dataSave, "viewAnalyst");
    }
    hideSpinner();
}


//TODO
async function ClickSuspend() {
    showSpinner();
    var list;
    var referenceCode = dataTableProcess.rows('.selected').data()[0][2];
    var list = dataTableProcess.rows('.selected').data()[0][1] == "Account" ? "Accounts" : "Endorsement";


    var tasks = await getData("Tasks", "?$filter=(Process eq '" + dataTableProcess.rows('.selected').data()[0][0] + "')and(IsLast eq 1)and(TaskStatusId ne 7)");

    var businessObject = await getData(list, "?$filter=(Reference eq '" + referenceCode + "')");

    reasonId = parseInt($("#reasonTask").val());

    for (let index = 0; index < tasks.length; index++) {
        var updateTask = {
            '__metadata': { type: "SP.Data.TasksListItem" },
            'TaskStatusId': 5,
            'ReasonId': reasonId,
            'PreviousTaskStatusId': tasks[index].TaskStatusId
        }

        if (tasks[index].TaskStatusId != 5 && tasks[index].TaskStatusId != 6) updateTask.PreviousTaskStatusId = tasks[index].TaskStatusId;

        if (index != tasks.length - 1) updateData("Tasks", tasks[index].ID, updateTask);
        else {
            updateEntityData("Tasks", tasks[index].ID, updateTask, function (data) {

                updateProcessEntity(4, function (data) {


                    if (list == "Accounts")
                        UpdateStatusAccountReason("Suspended", businessObject[0].ID, reasonId);
                    else
                        UpdateStatusEndorsementReason("Suspended", businessObject[0].ID, reasonId);


                    getMyTasks();
                    getAssignPending();
                    getProcess();

                }, function (error) { });
            }, function (error) { });
        }
    }

    hideSpinner();
}

async function ClickCancel() {
    showSpinner();
    var referenceCode = dataTableProcess.rows('.selected').data()[0][2];
    var list = dataTableProcess.rows('.selected').data()[0][1] == "Account" ? "Accounts" : "Endorsement";

    var tasks = await getData("Tasks", "?$filter=(Process eq '" + dataTableProcess.rows('.selected').data()[0][0] + "')and(IsLast eq 1)and(TaskStatusId ne 7)");

    var businessObject = await getData(list, "?$filter=(Reference eq '" + referenceCode + "')");

    reasonId = parseInt($("#reasonTask").val())


    for (let index = 0; index < tasks.length; index++) {
        var updateTask = {
            '__metadata': { type: "SP.Data.TasksListItem" },
            'TaskStatusId': 6,
            'ReasonId': reasonId,
            'PreviousTaskStatusId': tasks[index].TaskStatusId
        }

        if (tasks[index].TaskStatusId != 5 && tasks[index].TaskStatusId != 6) updateTask.PreviousTaskStatusId = tasks[index].TaskStatusId;

        if (index != tasks.length - 1)
            updateData("Tasks", tasks[index].ID, updateTask);
        else {


            updateData("Tasks", tasks[index].ID, updateTask, "updateProcessCancel");

            updateEntityData("Tasks", tasks[index].ID, updateTask, function (data) {

                updateProcessEntity(5, function (data) {


                    if (list == "Accounts")
                        UpdateStatusAccountReason("Cancelled", businessObject[0].ID, reasonId);
                    else
                        UpdateStatusEndorsementReason("Cancelled", businessObject[0].ID, reasonId);


                    getMyTasks();
                    getAssignPending();
                    getProcess();

                }, function (error) { });
            }, function (error) { });
        }


    }



    hideSpinner();
}

async function clickActivate() {
    showSpinner();
    var referenceCode = dataTableProcess.rows('.selected').data()[0][2];
    var list = dataTableProcess.rows('.selected').data()[0][1] == "Account" ? "Accounts" : "Endorsement";

    var tasks = await getData("Tasks", "?$select=*,PreviousTaskStatus/Title&$expand=PreviousTaskStatus&$filter=(Process eq '" + dataTableProcess.rows('.selected').data()[0][0] + "')and(IsLast eq 1)and(TaskStatusId ne 7)");

    var businessObject = await getData(list, "?$filter=(Reference eq '" + referenceCode + "')");



    for (let index = 0; index < tasks.length; index++) {
        var updateTask = {
            '__metadata': { type: "SP.Data.TasksListItem" },
            'TaskStatusId': tasks[index].PreviousTaskStatusId,
            'PreviousTaskStatusId': null,
            'ReasonId': null
        }

        if (index != tasks.length - 1) updateData("Tasks", tasks[index].ID, updateTask);
        else {

            // updateData("Tasks", tasks[index].ID, updateTask, "updateProcessCancel");

            updateEntityData("Tasks", tasks[index].ID, updateTask, function (data) {

                updateProcessEntity(1, function (data) {


                    if (list == "Accounts")
                        UpdateStatusAccountReason("In Progress", businessObject[0].ID, reasonId);
                    else
                        UpdateStatusEndorsementReason("In Progress", businessObject[0].ID, reasonId);


                    getMyTasks();
                    getAssignPending();
                    getProcess();

                }, function (error) { });
            }, function (error) { });
        }
    }

    hideSpinner();
}

async function updateProcess(idStatus) {
    //var dataProcess = await getData("Process", "?$filter=(ID eq " + dataTableProcess.rows('.selected').data()[0][1] + ")");

    var updateProcess = {
        '__metadata': { type: "SP.Data.ProcessListItem" },
        'StatusId': idStatus,
        'ReasonId': reasonId
    }

    if (idStatus != 5 && idStatus != 6) updateProcess.PreviousStatusId = idStatus;

    updateData("Process", dataTableProcess.rows('.selected').data()[0][0], updateProcess, "updateStatusProcess");
}

async function updateProcessEntity(idStatus, complete, error) {
    //var dataProcess = await getData("Process", "?$filter=(ID eq " + dataTableProcess.rows('.selected').data()[0][1] + ")");

    var updateProcess = {
        '__metadata': { type: "SP.Data.ProcessListItem" },
        'StatusId': idStatus,
        'ReasonId': reasonId
    }

    if (idStatus != 5 && idStatus != 6) updateProcess.PreviousStatusId = idStatus;

    updateEntityData("Process", dataTableProcess.rows('.selected').data()[0][0], updateProcess, function (data) {
        complete(data);
    }, function (data) {
        error(data);
    });
}

async function updateProcessActivate() {
    var dataProcess = await getData("Process", "?$filter=(ID eq " + dataTableProcess.rows('.selected').data()[0][0] + ")");

    var updateProcess = {
        '__metadata': { type: "SP.Data.ProcessListItem" },
        'StatusId': dataProcess[0].PreviousStatusId,
        'PreviousStatusId': null,
        'ReasonId': null,
        'StatusId': 1 //Status Pending
    }

    updateData("Process", dataTableProcess.rows('.selected').data()[0][0], updateProcess, "updateStatusProcess");
}

async function clickSearchTask() {
    showSpinner();

    if ($("#searchTask").val() != "") {
        if (!firtsAssignPending) dataTableAssignPending.destroy();

        var tasks = await getData("Tasks", "?$select=*,FlowType/Title,AssignTo/Title,PrevAssignedTo/Title&$expand=FlowType,AssignTo/Id,PrevAssignedTo/Id&$select=TaskStatus/Title&$expand=TaskStatus" +
            "&$filter=(Title eq '" + $("#searchTask").val() + "')");

        $("#tAssignPending").html("");


        tasks.forEach(task => {
            $("#tAssignPending").append($("<tr></tr>")
                .append($("<td>" + task.ID + "</td>"))
                .append($("<td>" + task.ObjectType + "</td>"))
                .append($("<td>" + task.Title + "</td>"))
                .append($("<td>" + task.Office + "</td>"))
                .append($("<td>" + task.Client + "</td>"))
                .append($("<td>" + task.Insured + "</td>"))
                .append($("<td>" + (task.Inception != null ? formatDate(new Date(task.Inception)) : "-") + "</td>"))
                .append($("<td>" + (task.DueDate != null ? formatDate(new Date(task.DueDate)) : "-") + "</td>"))
                .append($("<td>" + (task.Created != null ? formatDate(new Date(task.Created)) : "-") + "</td>"))
                .append($("<td>" + task.PrevAssignedTo.Title + "</td>"))
                .append($("<td>" + task.AssignTo.Title + "</td>"))
                .append($("<td>" + task.FlowType.Title + "</td>"))
                .append($("<td class='" + setColorStatus(task.TaskStatus.Title, "label") + "'>" + task.TaskStatus.Title + "</td>"))
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

async function ClickViewProcess(ref) {
    showSpinner();

    var accountData = await getData("Accounts", "?$filter=(Reference eq '" + ref + "')");

    $("#mProcessReference").html(accountData[0].Reference);
    $("#mProcessInception").html(accountData[0].Inception.split('T')[0]);
    $("#mProcessClient").html(accountData[0].Client);
    $("#mProcessBusinessLine").html(accountData[0].LineBusiness);
    $("#mProcessTeam").html(accountData[0].Team);

    var tasksBilling = await getData("Tasks", "?$select=*,FlowType/Title,FlowType/FlowType&$expand=FlowType&$select=TaskStatus/Title&$expand=TaskStatus" +
        "&$filter=(Title eq '" + ref + "')and(FlowType/FlowType eq 'Billing')&$orderby=ID desc");

    $("#tTaskBillingList").html("");

    tasksBilling.forEach(element => {
        var active = (element.IsLast) ? "YES" : "NO";
        var status = (element.TaskStatus.Title) ? element.TaskStatus.Title : "";
        if (element.IsLast) $("#mProcessStatusBilling").html(element.FlowType.Title + " (" + element.TaskStatus.Title + ")");
        $("#tTaskBillingList").append($("<tr style=\"cursor: pointer;\" onclick=\"clickViewTask(" + element.ID + ")\"></tr>")
            .append($("<td>" + element.FlowType.Title + "</td>"))
            .append($("<td>" + status + "</td>"))
            .append($("<td>" + active + "</td>"))
        )
    });

    var tasksEoC = await getData("Tasks", "?$select=*,FlowType/Title,FlowType/FlowType&$expand=FlowType&$select=TaskStatus/Title&$expand=TaskStatus" +
        "&$filter=(Title eq '" + ref + "')and(FlowType/FlowType eq 'EoC')&$orderby=ID desc");

    $("#tTaskEoCList").html("");

    tasksEoC.forEach(element => {
        var active = (element.IsLast == true) ? "YES" : "NO";
        var status = (element.TaskStatus.Title) ? element.TaskStatus.Title : "";
        if (element.IsLast) $("#mProcessStatusEoC").html(element.FlowType.Title + " (" + element.TaskStatus.Title + ")");
        $("#tTaskEoCList").append($("<tr style=\"cursor: pointer;\" onclick=\"clickViewTask(" + element.ID + ")\"></tr>")
            .append($("<td>" + element.FlowType.Title + "</td>"))
            .append($("<td>" + status + "</td>"))
            .append($("<td>" + active + "</td>"))
        )
    });

    hideSpinner();

    $("#modalProcess").modal("show");
}

async function clickViewTask(idTask) {
    showSpinner();


    viewTask = await getData("Tasks", "?$select=*,Author/Title,AssignTo/Title&$expand=Author,AssignTo/Id&$select=TaskStatus/Title&$expand=TaskStatus" +
        "&$select=FlowType/Title,FlowType/TaskType,FlowType/Help&$expand=FlowType" +
        "&$filter=(ID eq " + idTask + ")");


    var assignedTo = viewTask[0].AssignTo == null ? "unasigned" : viewTask[0].AssignTo.Title;
    businessReference = viewTask[0].Title;
    currentRootPath = businessReference.replace(/\-/g, "");

    $("#mCreationDate").html(viewTask[0].Created.split('T')[0]);
    $("#mAssignTo").html(assignedTo);
    $("#mIdProcess").html(viewTask[0].ProcessId);
    $("#mStatus").html(viewTask[0].TaskStatus.Title);
    var dueDate = viewTask[0].DueDate != null ? viewTask[0].DueDate.split("T")[0] : "-";
    $("#mDueDate").html(dueDate);

    var len = viewTask[0].Title.split('-').length;

    accountViewTask = await getData(viewTask[0].ObjectType == "Endorsement" ? "Endorsement" : "Accounts", "?$filter=(Reference eq '" + viewTask[0].Title + "')");
    entityType = viewTask[0].ObjectType;

    //Set Start Process parameters like EoC, SOPE, Urgent and control of 30 days is FlowTypeId is 12 (Start Process)
    if (viewTask[0].FlowTypeId == 12) {
        var startConfigParam = await getData("Offices", "?$filter=(Title eq '" + accountViewTask[0].Office + "')");

        if (startConfigParam.length > 0 && viewTask[0].TaskStatusId == 1) {
            $("#checkCredDebNote").prop("checked", startConfigParam[0].SPOECreditDebit);
            $("#controlDays").prop("checked", startConfigParam[0].Ctrl30Days);
            $("#eoC").prop("checked", startConfigParam[0].EoC);
            $("#urgent").prop("checked", startConfigParam[0].Urgent);
        }
        else {

            $("#checkCredDebNote").prop("checked", viewTask[0].SPOECreditDebit);
            $("#controlDays").prop("checked", viewTask[0].Ctrl30Days);
            $("#eoC").prop("checked", viewTask[0].EoC);
            $("#urgent").prop("checked", viewTask[0].Urgent);
        }
    }

    var urlParameters = len > 2 ? "&type=endorsement&mode=view" : "&type=account&mode=view";
    $("#mReference").html("<a href=\"" + _spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accountViewTask[0].Reference + urlParameters + "\">" + accountViewTask[0].Reference + "</a>");
    $("#mTeam").html(accountViewTask[0].Team);
    $("#mInception").html(accountViewTask[0].Inception.split('T')[0]);
    $("#mClient").html(accountViewTask[0].Client);
    $("#mBusinessLine").html(accountViewTask[0].LineBusiness);
    $("#mDocumentation").html("<a class='btn btn-primary button-modal view-docs' role='button' href='#'><i class='fas fa-folder-open' aria-hidden='true'></i> View Documents</a>");

    var status = await GetTaskStatus();

    $("#selectStatus").html("<option value=\"\" disabled selected>Status</option>");
    status.forEach(item => {
        $("#selectStatus").append("<option value='" + item.ID + "'>" + item.Title + "</option>");
    });

    if (viewTask[0].FlowTypeId != 9 && viewTask[0].FlowTypeId != 10 && viewTask[0].FlowTypeId != 11) {
        $("#bChecklistDocumentation").show();

        $("#labelEocTitle").html("Status EoC Process");
        $("#labelPhasesEoC").html("Status EoC Process:");
        $("#labelDocEoC").html("EoC documentation sent:");



        var taskEoC = await getData("Tasks", "?$filter=(Title eq '" + viewTask[0].Title +
            "')and(IsLast eq 1)and((FlowTypeId eq 9)or(FlowTypeId eq 10)or(FlowTypeId eq 11))");

        if (taskEoC.length > 0) {
            $("#phasesEoC").html(await GetFlowTypeName(taskEoC[0].FlowTypeId));
            $("#divPhasesEoC").show();
            lastTaskEocCompleted = taskEoC[0].TaskStatusId == 7 ? true : false;

            // lastStatusTask.lastStatusEoC = taskEoC[0].TaskStatusId;

            if (viewTask[0].FlowTypeId == 8) {
                $("#docEoC").html((taskEoC[0].EoCDocSent) ? "YES" : "NO");
                $("#divDocEoC").show();

                $("#selectStatus").prop("disabled", !lastTaskEocCompleted);
            }
            else {
                $("#divDocEoC").hide();
                $("#selectStatus").prop("disabled", false);
            }

            okTaskEoC = (taskEoC[0].EoCDocSent) ? true : false;
        }
        else {
            $("#phasesEoC").html("N/A");
            $("#divDocEoC").hide();
            okTaskEoC = true;
        }

        $("#mSendDoc").hide();
    }
    else {
        $("#bChecklistDocumentation").show();

        $("#labelEocTitle").html("Status Billing Process");
        $("#labelPhasesEoC").html("Status Billing Process:");
        $("#labelDocEoC").html("Billing documentation sent:");

        var taskBilling = await getData("Tasks", "?$filter=(Title eq '" + viewTask[0].Title +
            "')and(IsLast eq 1)and((FlowTypeId ne 9)or(FlowTypeId ne 10)or(FlowTypeId ne 11))");

        //lastStatusTask.lastStatusEoC = viewTask[0].TaskStatusId;

        if (taskBilling.length > 0) {
            $("#phasesEoC").html(await GetFlowTypeName(taskBilling[0].FlowTypeId));
            $("#divPhasesEoC").show();

            $("#docEoC").html((taskBilling[0].FlowTypeId == 8 && taskBilling[0].TaskStatusId == 6) ? "YES" : "NO");
            $("#divDocEoC").show();

            //lastStatusTask.lastStatusBilling = taskBilling[0].TaskStatusId;
        }
        else {
            $("#phasesEoC").html("N/A");
        }

        $("#selectStatus").prop("disabled", false);

        if (viewTask[0].FlowTypeId == 11) $("#mSendDoc").show();
        else $("#mSendDoc").hide();
    }

    ValidateFlowType();

    LoadComments("#mComments", viewTask[0].Title, "modal-comment-content");

    hideSpinner();

    $("#modalTask").modal("show");
}

async function ValidateFlowType() {
    $("#modalTitle").html(viewTask[0].FlowType.Title);

    if (await IsGenericType(viewTask[0].FlowTypeId)) {
        $("#bModalApprove").hide();
        $("#bModalReject").hide();

        $("#bModalSave").show();
        $("#mSelectStatus").show();
        $("#mSelectStatus").prop("disabled", false);
        $("#mSelectReason").show();
    }
    else {
        $("#bModalSave").hide();
        $("#mSelectStatus").hide();
        $("#mSelectReason").hide();

        $("#bModalApprove").show();
        $("#bModalReject").show();
    }

    if (viewTask[0].FlowTypeId == 12) {
        $("#mCheckCredDebNote").show();
        $("#mEoC").show();
        $("#mControlDays").show();
        $("#mUrgent").show();

        $("#mSelectStatus").show();
        $("#mSelectReason").show();

        $("#bModalSave").prop("disabled", false);
    }
    else {
        $("#mCheckCredDebNote").hide();
        $("#mEoC").hide();
        $("#mControlDays").hide();
        $("#mUrgent").hide();
    }
}

// async function LoadComments(selector) {
//     $(selector).html("");

//     var comments = await getData("Comments", "?$select=*,Author/Title&$expand=Author&$filter=(Reference eq '" + viewTask[0].Title + "')&$orderby=ID desc");

//     comments.forEach(item => {
//         $(selector).append($("<div class=\"modal-comment-content\"><label>" + item.Created.replace('T', " ").replace('Z', "") + " - " + item.Author.Title +
//             " - " + item.FlowType + "</label><br><label class=\"label-comment\">" + item.Title + "</label></div>"));
//     });
// }

async function ChangeTaskStatus() {
    $("#selectReason").val("");
    $("#selectReason").html("<option value=\"\" disabled selected>Reason</option>");
    $("#bModalSave").prop("disabled", true);

    if ($("#selectStatus").val() != "" && $("#selectStatus").val() != "7" && $("#selectStatus").val() != "2") {
        $("#selectReason").prop("disabled", false);

        var reason = await getData("TaskStatusReason", "?$select=*,Reason/Title&$expand=Reason&$filter=(TaskStatusId eq " + $("#selectStatus").val() + ")");

        reason.forEach(item => {
            $("#selectReason").append("<option value='" + item.ReasonId + "'>" + item.Reason.Title + "</option>");
        });
    }
    else {
        $("#selectReason").prop("disabled", true);
        $("#bModalSave").prop("disabled", false);
    }
}

function ChangeReason() {
    if ($("#selectReason").val() != "") $("#bModalSave").prop("disabled", false);
    else $("#bModalSave").prop("disabled", true);
}

function ClickModalCancel() {
    $("#checkCredDebNote").val("");
    $("#mComment").val("");
    $("#selectStatus").val("");
    $("#selectReason").val("");
    $("#selectReason").prop("disabled", true);
}

async function ClickAddComment() {
    if ($("#mComment").val() != "") {
        $("#commentButton").attr("disabled", true);
        var addComment = {
            '__metadata': { type: "SP.Data.CommentsListItem" },
            'Title': $("#mComment").val(),
            'TaskId': viewTask[0].ID,
            'Reference': viewTask[0].Title,
            'FlowType': viewTask[0].FlowType.Title
        }

        addDataAsync("Comments", addComment, function (result) {
            $("#mComment").val("");
            LoadComments("#mComments", viewTask[0].Title, "modal-comment-content");
            $("#commentButton").attr("disabled", false);
        },
            function (data) {

                showErrorMessage("An error has succeded: " + data);
            });


    }
    else showErrorMessage("You must enter a comment.");
}


//********** SAVE TASK*************/
async function ClickModalSave(isApprove) {

    showSpinner();

    var nextFlowId = await GetNextFlowIdByFlowTypeId(viewTask[0].FlowTypeId);
    var flowTypeName;
    var statusName;
    var previousTask;
    var isLast = false;
    var returnToInProgress = false;
    var isGenericType = await IsGenericType(nextFlowId);



    if ($("#selectStatus").val() != null || isApprove) {


        if (viewTask[0].FlowTypeId != 12) {
            if (viewTask[0].EoC && viewTask[0].PreviousTaskId != null)
                previousTask = await getData("Tasks", "?$select=*,FlowType/Title&$expand=FlowType&$select=TaskStatus/Title&$select=AssignTo/Title,PrevAssignedTo/Title&$expand=TaskStatus,AssignTo,PrevAssignedTo" + "&$filter=ID eq " + viewTask[0].PreviousTaskId);
        }

        // Si la tarea actual es EoC to be delivered actualizo la rama de Billing
        evaluateLastBillingTask();


        var checkedSPOECredDebNotes = (viewTask[0].FlowTypeId != 12) ? viewTask[0].SPOECredDebNotes : $("#checkCredDebNote").prop("checked");
        var urgent = (viewTask[0].FlowTypeId != 12) ? viewTask[0].Urgent : $("#urgent").prop("checked");
        var control30Days = (viewTask[0].FlowTypeId != 12) ? viewTask[0].Ctrl30Days : $("#controlDays").prop("checked");
        var eoCEnabled = (viewTask[0].FlowTypeId != 12) ? viewTask[0].EoC : $("#eoC").prop("checked");

        if (nextFlowId != null && nextFlowId != 0) {

            //Evaluate if next task has SPOE Debit & Credit Notes, if not, jump to DeliverDocumentation.
            if (nextFlowId == 6 && !viewTask[0].SPOECredDebNotes) nextFlowId = 8;


            flowTypeName = await GetFlowTypeName(nextFlowId);

            statusName = await GetStatusNameById((isGenericType) ? 2 : 1);


            var taskStatus;

            if (!isGenericType || viewTask[0].FlowTypeId == 12 || viewTask[0].FlowTypeId == 1) {
                //Si la proxima tarea es Deliver Documentation to Client y no tiene SPOE
                if (nextFlowId == 8 && !checkedSPOECredDebNotes) {
                    //Si tiene EOC y la ultima tarea de esa rama no fue completada, el estado queda en Pending of EoC
                    taskStatus = (eoCEnabled && !lastTaskEocCompleted) ? 8 : 2;
                }
                else {

                    //si la fase actual es Check Documentation y no tiene rama de EoC, el estado de la proxima tarea es pending
                    if (viewTask[0].FlowTypeId == 1 && !eoCEnabled)
                        taskStatus = 2;
                    else {

                        // Si la proxima tarea es SPOE Credit and Debit Notes, el estado es Pending
                        // if (nextFlowId == 6)
                        //     taskStatus = 2;
                        // else
                        //     taskStatus = 1;

                        //Nuevo pedido de Martín, 25/06/2021 Cuando la tarea es SPOE Credit and Debit note tiene que quedar pending of Assignment,
                        // para ello el AssignTo deberá quedar nulo para que pueda ser reasignada. Y así poder devolver la tarea al usuario anterior cuando se completa la aprobación o rechazo de la misma
                        if (nextFlowId == 6)
                            taskStatus = 1;
                        else
                            taskStatus = 1;
                    }
                }
            }
            else {
                if (nextFlowId == 8) {
                    //Si tiene EOC y la ultima tarea de esa rama no fue completada, el estado queda en Pending of EoC
                    taskStatus = (eoCEnabled && !lastTaskEocCompleted) ? 8 : 2;
                }
                else {

                    taskStatus = 2;
                }
            }


            if ($("#selectStatus").val() == "7" || isApprove) {
                var dataSave = {
                    '__metadata': { type: "SP.Data.TasksListItem" },
                    'Title': viewTask[0].Title,
                    'FlowTypeId': nextFlowId,
                    'ProcessId': viewTask[0].ProcessId,
                    'PreviousTaskId': viewTask[0].ID,
                    'PreviousTaskStatusId': viewTask[0].TaskStatusId,
                    'TaskStatusId': taskStatus,
                    'SPOECredDebNotes': checkedSPOECredDebNotes,
                    'EoC': eoCEnabled,
                    'Urgent': urgent,
                    'Ctrl30Days': control30Days,
                    'Office': viewTask[0].Office,
                    'Client': viewTask[0].Client,
                    'Insured': viewTask[0].Insured,
                    'DueDate': viewTask[0].DueDate,
                    'Inception': viewTask[0].Inception,
                    'IsLast': true,
                    'ObjectType': viewTask[0].ObjectType
                }



                //Assign task to current user if not is approval task or Start Process Tasks
                if (isGenericType && viewTask[0].FlowTypeId != 12) {

                    //The CheckDocumentation Task not has Previous Assigned To, however the previous assigned to for next task is the current user
                    var nextAssignedValue = viewTask[0].PrevAssignedToId == null ? _spPageContextInfo.userId : viewTask[0].PrevAssignedToId;
                    var prevAssignedToUserId = viewTask[0].FlowTypeId == 1 ? (eoCEnabled ? null : nextAssignedValue) : nextAssignedValue;

                    dataSave.AssignToId = prevAssignedToUserId;
                    dataSave.PrevAssignedToId = prevAssignedToUserId;
                }
                else {

                    if (nextFlowId == 8)
                        dataSave.AssignToId = viewTask[0].PrevAssignedToId == null ? _spPageContextInfo.userId : viewTask[0].PrevAssignedToId;

                    //If the next task is SPOE and Credit and Debit Notes
                    if (nextFlowId == 6)
                        dataSave.AssignToId = null;

                    dataSave.PrevAssignedToId = viewTask[0].PrevAssignedToId == null ? _spPageContextInfo.userId : viewTask[0].PrevAssignedToId;
                }

                await addData("Tasks", dataSave);

                if (viewTask[0].FlowTypeId == 1 && eoCEnabled) {
                    var dataSaveEoC = {
                        '__metadata': { type: "SP.Data.TasksListItem" },
                        'Title': viewTask[0].Title,
                        'FlowTypeId': 9,
                        'ProcessId': viewTask[0].ProcessId,
                        'TaskStatusId': 1,
                        'PreviousTaskStatusId': viewTask[0].TaskStatusId,
                        'SPOECredDebNotes': checkedSPOECredDebNotes,
                        'EoC': eoCEnabled,
                        'Urgent': urgent,
                        'Ctrl30Days': control30Days,
                        'Office': viewTask[0].Office,
                        'Client': viewTask[0].Client,
                        'Insured': viewTask[0].Insured,
                        'DueDate': viewTask[0].DueDate,
                        'Inception': viewTask[0].Inception,
                        'IsLast': true,
                        'ObjectType': viewTask[0].ObjectType
                    }

                    if (isGenericType) {

                        var prevAssignedToUserId = viewTask[0].FlowTypeId == 9 ? _spPageContextInfo.userId : viewTask[0].PrevAssignedToId;
                        dataSaveEoC.AssignToId = viewTask[0].FlowTypeId == 1 ? null : prevAssignedToUserId;
                        dataSaveEoC.PrevAssignedToId = prevAssignedToUserId;

                    }
                    else {

                        dataSaveEoC.PrevAssignedToId = viewTask[0].PrevAssignedToId;
                    }

                    await addData("Tasks", dataSaveEoC);


                }
            }
        }
        else {
            var okDocs = true;

            if (viewTask[0].FlowTypeId == 8 && lastTaskEocCompleted) {
                var documents = await getData("DocumentsTasks", "?$select=*,DocumentStatus/Title&$expand=DocumentStatus&$filter=(Title eq '" + viewTask[0].Title + "')");
                documents.forEach(doc => {
                    if (doc.Pending == "1") okDocs = false;
                });
            }

            if (!okDocs) {
                showErrorMessage("At least one document is pending.");
                hideSpinner();
                return;
            }
            if (viewTask[0].FlowTypeId == 8 && viewTask[0].EoC) {
                if (!lastTaskEocCompleted) {
                    showErrorMessage("EoC process is pending. You cannot complete this tasks until the last EoC task completed.");
                    hideSpinner();
                    return;
                }
            }

            isLast = true;
        }

        //if ($("#selectStatus").val() == "3" || $("#selectStatus").val() == "4") UpdateStatusAccount(await GetStatusNameById(parseInt($("#selectStatus").val())), accountViewTask[0].ID);
        //else UpdateStatusAccount("In Progress", accountViewTask[0].ID);

        saveLastTaskStatus(viewTask[0], function (data) {

            lastStatusTask = JSON.parse(localStorage.getItem('lastStatusTask'));

            if (lastStatusTask.lastStatusBilling == "3" || lastStatusTask.lastStatusBilling == "4" || lastStatusTask.lastStatusEoC == "3" || lastStatusTask.lastStatusEoC == "4") {
                statusId = 3;
            }
            else {
                statusId = ($("#selectStatus").val() == "3" || $("#selectStatus").val() == "4") ? 3 : (viewTask[0].FlowTypeId == 8 && $("#selectStatus").val() == "7") ? 6 : 2;
            }

        });

        //Task status evaluation for both branch EoC and Billing, if there are any task with status 3 or 4, the process must be stay in OnHold 

        if (($("#selectStatus").val() == "3" || $("#selectStatus").val() == "4")) {

            if (entityType == "Account")
                UpdateStatusAccountReason('On Hold', accountViewTask[0].ID, $("#selectReason").val());
            else
                UpdateStatusEndorsementReason('On Hold', accountViewTask[0].ID, $("#selectReason").val());
        }
        else {

            if ($("#selectStatus").val() == "7" && (nextFlowId == null || nextFlowId == 0))
                UpdateStatusAccountEndorsement("Completed", accountViewTask[0].ID, entityType == "Account" ? "Accounts" : "Endorsement");
            else {

                if (eoCEnabled) {


                    if (lastStatusTask.lastStatusBilling == "3" || lastStatusTask.lastStatusBilling == "4" || lastStatusTask.lastStatusEoC == "3" || lastStatusTask.lastStatusEoC == "4") {
                        UpdateStatusAccountEndorsement("On Hold", accountViewTask[0].ID, entityType == "Account" ? "Accounts" : "Endorsement");
                    }
                    else {
                        UpdateStatusAccountEndorsement("In Progress", accountViewTask[0].ID, entityType == "Account" ? "Accounts" : "Endorsement");
                    }
                }

                else {
                    UpdateStatusAccountEndorsement("In Progress", accountViewTask[0].ID, entityType == "Account" ? "Accounts" : "Endorsement");

                }

            }
        }

        var updateProcess;

        var statusId;



        var updateProcess = {
            '__metadata': { type: "SP.Data.ProcessListItem" },
            'StatusId': statusId,
            'PreviousStatusId': null,
            'ReasonId': ($("#selectStatus").val() == "3" || $("#selectStatus").val() == "4") ? $("#selectReason").val() : null
        }

        updateData("Process", viewTask[0].ProcessId, updateProcess);


        if ($("#selectStatus").val() == "4" || $("#selectStatus").val() == "3" || $("#selectStatus").val() == "2")
            isLast = true


        // Update current task     
        var updateTask;




        if (viewTask[0].FlowTypeId == 12) {
            updateTask = {
                '__metadata': { type: "SP.Data.TasksListItem" },
                'TaskStatusId': parseInt($("#selectStatus").val()),
                'IsLast': isLast,
                'AssignToId': viewTask[0].AssignToId,
                'SPOECredDebNotes': checkedSPOECredDebNotes,
                'EoC': eoCEnabled,
                'Urgent': urgent,
                'Ctrl30Days': control30Days

            }
        }
        else {
            updateTask = {
                '__metadata': { type: "SP.Data.TasksListItem" },
                'TaskStatusId': (isApprove) ? 7 : parseInt($("#selectStatus").val()),
                'IsLast': isLast,
                'AssignToId': viewTask[0].AssignToId,
                'SPOECredDebNotes': checkedSPOECredDebNotes,
                'EoC': eoCEnabled,
                'Urgent': urgent,
                'Ctrl30Days': control30Days
            }
        }



        AddRegisterHistoryProcess(viewTask[0].Title, "modified", viewTask[0].FlowType.Title, (await GetStatusNameById(((isApprove) ? 7 : (nextFlowId == 8 && !lastTaskEocCompleted) ? 8 : parseInt($("#selectStatus").val())))),
            ((viewTask[0].FlowTypeId != 9 && viewTask[0].FlowTypeId != 10 && viewTask[0].FlowTypeId != 11) ? "HistoryProcessBilling" : "HistoryProcessEoC"));

        AddRegisterHistoryProcess(viewTask[0].Title, "created", flowTypeName, statusName, (viewTask[0].FlowTypeId != 9 && viewTask[0].FlowTypeId != 10 && viewTask[0].FlowTypeId != 11) ? "HistoryProcessBilling" : "HistoryProcessEoC");


        if (viewTask[0].FlowTypeId == 11) {
            updateTask.EoCDocSent = $("#sendDoc").prop("checked");
        }

        if ($("#selectReason").val() != "" && $("#selectReason").val() != null) {
            Object.assign(updateTask, { 'ReasonId': parseInt($("#selectReason").val()) });
        }

        updateData("Tasks", viewTask[0].ID, updateTask, "ModalSave");

        //End Update current task


        hideSpinner();
    }
    else {
        showErrorMessage("To continue you must select tasks's status.");
        hideSpinner();
    }
}

function saveLastTaskStatus(currentTask, complete) {

    if (currentTask.FlowTypeId == "9" || currentTask.FlowTypeId == "10" || currentTask.FlowTypeId == "11") {

        lastStatusTask.lastStatusEoC = $("#selectStatus").val();
    }
    else {
        lastStatusTask.lastStatusBilling = $("#selectStatus").val();

    }

    localStorage.setItem('lastStatusTask', JSON.stringify(lastStatusTask));
    complete();

}

function clickViewRelatedDocuments() {

    sessionData = { reference: businessReference }
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    getRelatedDocuments(businessReference.replace(/\-/g, ""), "#tRelatedDocuments");



    $("#relatedDocumentModal").modal("show");

}

function updateCurrentTask(complete, error) {


}

function updateProcessStatus(complete, error) {


}


async function evaluateLastBillingTask() {
    var billingLastTask;
    if (viewTask[0].FlowTypeId == 11 && $("#selectStatus").val() == "7") {

        billingLastTask = await getData("Tasks", "?$filter=(Title eq '" + viewTask[0].Title + "')and(IsLast eq 1)and((FlowTypeId ne 9)and(FlowTypeId ne 10)and(FlowTypeId ne 11))");

        if (billingLastTask[0].TaskStatusId == 8) {

            var dataTaskBillingUpdate = {
                '__metadata': { type: "SP.Data.TasksListItem" },
                'TaskStatusId': 2,
            }

            updateData("Tasks", billingLastTask[0].ID, dataTaskBillingUpdate, "");
        }

    }
}

function ClickHelp() {
    $("#modalMsj").val(viewTask[0].FlowType.Help);
    $("#modalHelp").modal("show");
}

async function ClickDoc() {
    showSpinner();
    $("#modalListDocumentation").html("");

    var countNa = 0;
    var countPending = 0;
    var countOk = 0;

    docs = await getData("DocumentsTasks", "?$select=*,DocumentStatus/Title&$expand=DocumentStatus&$select=Editor/Title&$expand=Editor" +
        "&$filter=(Title eq '" + viewTask[0].Title + "') and (DocumentStatus/Title ne null)");

    docs.forEach((doc, index) => {
        $("#modalListDocumentation").append($("<li class=\"li-modal\">" + doc.DocumentStatus.Title + "</li>" +
            "<input type=\"checkbox\" id=\"na" + index + "\" onclick=\"ClickCheckBox('na', " + index + ")\"><label class=\"label-doc\">N/A</label>" +
            "<input type=\"checkbox\" id=\"pending" + index + "\" onclick=\"ClickCheckBox('pending', " + index + ")\"><label class=\"label-doc\">Pending</label>" +
            "<input type=\"checkbox\" id=\"ok" + index + "\" onclick=\"ClickCheckBox('ok', " + index + ")\"><label class=\"label-doc\">OK</label>"
        ));

        if (doc.Created != doc.Modified) {
            $("#modalListDocumentation").append($("<label class=\"label-doc\">" + doc.Editor.Title + "</label>" +
                "<label class=\"label-doc\">" + doc.Created.split('T')[0] + "</label>"
            ));
        }

        $("#na" + index).prop("checked", doc.N_x002f_A);
        $("#pending" + index).prop("checked", doc.Pending);
        $("#ok" + index).prop("checked", doc.OK);

        if (doc.N_x002f_A) countNa++;
        if (doc.Pending) countPending++;
        if (doc.OK) countOk++;
    });

    $("#na").prop("checked", (countNa == 5) ? true : false);
    $("#pending").prop("checked", (countPending == 5) ? true : false);
    $("#ok").prop("checked", (countOk == 5) ? true : false);

    hideSpinner();
    $("#modalDocumentation").modal("show");
}



async function ClickSaveDocumentation() {
    for (let index = 0; index < docs.length; index++) {
        var updateDoc = {
            '__metadata': { type: "SP.Data.DocumentsTasksListItem" },
            'N_x002f_A': $("#na" + index).prop("checked"),
            'Pending': $("#pending" + index).prop("checked"),
            'OK': $("#ok" + index).prop("checked"),
        }

        if (index != docs.length - 1) updateData("DocumentsTasks", docs[index].ID, updateDoc);
        else updateData("DocumentsTasks", docs[index].ID, updateDoc, "SaveDocumentation");
    }

    $("#modalDocumentation").modal("hide");
}

async function ClickModalReject() {
    if ($("#selReason").val() != "" && $("#reasonReject").val() != "") {
        var previousTask = await getData("Tasks", "?$filter=(ID eq " + viewTask[0].PreviousTaskId + ")");

        //var checkedSPOECredDebNotes = (viewTask[0].FlowTypeId != 1) ? viewTask[0].SPOECredDebNotes : $("#checkCredDebNote").prop("checked");

        var assignedTo;
        var flowType;

        if (viewTask[0].FlowTypeId == 6) {
            assignedTo = viewTask[0].PrevAssignedToId;
            flowType = 3;

        }
        else {
            assignedTo = viewTask[0].PrevAssignedToId;
            flowType = previousTask[0].FlowTypeId;
        }

        var dataComment = {
            '__metadata': { type: "SP.Data.CommentsListItem" },
            'Title': $("#selReason").val() + " - " + $("#reasonReject").val(),
            'TaskId': viewTask[0].ID,
            'Reference': viewTask[0].Title,
            'FlowType': viewTask[0].FlowType.Title
        }



        await addData("Comments", dataComment);

        var checkedSPOECredDebNotes = (viewTask[0].FlowTypeId != 12) ? viewTask[0].SPOECredDebNotes : $("#checkCredDebNote").prop("checked");
        var urgent = (viewTask[0].FlowTypeId != 12) ? viewTask[0].Urgent : $("#urgent").prop("checked");
        var control30Days = (viewTask[0].FlowTypeId != 12) ? viewTask[0].Ctrl30Days : $("#controlDays").prop("checked");
        var eoCEnabled = (viewTask[0].FlowTypeId != 12) ? viewTask[0].EoC : $("#eoC").prop("checked");


        var dataSave = {
            '__metadata': { type: "SP.Data.TasksListItem" },
            'Title': viewTask[0].Title,
            'FlowTypeId': flowType,
            'ProcessId': viewTask[0].ProcessId,
            'PreviousTaskId': viewTask[0].ID,
            'TaskStatusId': 2,
            'SPOECredDebNotes': checkedSPOECredDebNotes,
            'Urgent': urgent,
            'Ctrl30Days': control30Days,
            'Office': viewTask[0].Office,
            'Client': viewTask[0].Client,
            'Insured': viewTask[0].Insured,
            'DueDate': viewTask[0].DueDate,
            'Inception': viewTask[0].Inception,
            'EoC': eoCEnabled,
            'IsLast': true,
            'AssignToId': assignedTo,
            'PrevAssignedToId': viewTask[0].PrevAssignedToId,
            'ObjectType': viewTask[0].ObjectType
        }

        await addData("Tasks", dataSave);

        var updateTask = {
            '__metadata': { type: "SP.Data.TasksListItem" },
            'TaskStatusId': 7,
            'IsLast': false,
            'ReasonReject': $("#reasonReject").val()
        }

        updateData("Tasks", viewTask[0].ID, updateTask, "ModalSave");
    }
    else showErrorMessage("There are required fields.");
}

async function ClickOpenModalReason() {

    $("#selReason").val("");
    $("#selReason").html("<option value=\"\" disabled selected>Reason</option>");
    $("#reasonReject").html("");

    var reason = await getData("ReasonRejection", "");

    reason.forEach(item => {
        $("#selReason").append("<option value='" + item.Title + "'>" + item.Title + "</option>");
    });

    $("#modalReason").modal("show");
}

async function ClickModalReason(idReason) {

    if (dataTableProcess.rows('.selected').data()[0][6] != "Completed") {
        if (idReason == 5) isSuspend = true;
        else isSuspend = false;




        $("#reasonTask").val("");
        $("#reasonTask").html("<option value=\"\" disabled selected>Reason</option>");

        var reason = await getData("TaskStatusReason", "?$select=*,Reason/Title&$expand=Reason&$filter=(TaskStatusId eq " + idReason + ")");

        reason.forEach(item => {
            $("#reasonTask").append("<option value='" + item.ReasonId + "'>" + item.Reason.Title + "</option>");
        });

        $("#modalReasonTask").modal("show");
    }
    else
        showErrorMessage("This process was completed and cannot be changed.");
}

function ClickSaveReason() {
    $("#modalReasonTask").modal("hide");

    if (isSuspend) ClickSuspend();
    else ClickCancel();
}

function ClickCheckBox(prop, index) {
    if (index == "checkall") {
        docs.forEach((doc, i) => {
            docsStatus.forEach(docStatus => {
                $("#" + docStatus + i).prop("checked", ($("#" + prop).prop("checked")) ? (docStatus == prop) ? true : false : false);
                $("#" + docStatus).prop("checked", ($("#" + prop).prop("checked")) ? (docStatus == prop) ? true : false : false);
            });
        });
    }
    else {
        docsStatus.forEach(docStatus => {
            $("#" + docStatus + index).prop("checked", (docStatus == prop) ? true : false);
        });

        $("#na").prop("checked", false);
        $("#pending").prop("checked", false);
        $("#ok").prop("checked", false);
    }
}

function clickViewFile(Name) {

    if (levelsBreadcrumb.paths.length == 1)
        window.open(urlDocumentManager + "/api/download?path=/" + businessReference.replace(/\-/g, "") + "/" + Name);
    else {

        var pathToQueryList = levelsBreadcrumb.paths.slice();

        pathToQueryList.shift();

        var pathToQuery = pathToQueryList.length == 0 ? "/" : pathToQueryList.join("/");

        window.open(urlDocumentManager + "/api/download?path=/" + businessReference.replace(/\-/g, "") + "/" + pathToQuery + "/" + Name);
    }

    //downloadFileFromFS(reference + "/" + Name, function (succesData) {
    //    hideSpinner();
    //    if (succesData.error_code != null)
    //        showErrorMessage("The file could not be opened. Please, try again later or contact your sys admin. Ref error: " + succesData.err_desc);
    //    else {
    //        //getRelatedDocuments(reference);
    //        //showErrorMessage("The document has been deleted");

    //    }

    //}, function (error) {

    //    hideSpinner();
    //    showErrorMessage(error);
    //});

}
function GetRequestEndpoint(fileCollectionEndpoint, optionsAsync, header) {
    var deferred = $.Deferred();
    $.ajax({
        url: fileCollectionEndpoint,
        type: "GET",
        async: optionsAsync,
        dataType: "json",
        headers: header,
        success: function (data) {
            deferred.resolve(data);
        }, error: function (err) {
            deferred.reject(err);
            if (err.responseText !== null && err.responseText !== undefined) {
                console.log(err.responseText);
            }
        }
    });
    return deferred;
}

function getItems(listName, OfficeArray, Filtrostr, cantOffice, dataIndex) {
    var valor = "";
    var accountsFinal = [];
    accounts = [0];
    cantOffice = 0;
    OfficeArray.forEach((Office, indexAccount) => {
        valor = "Office eq '" + Office + "'";
        filter = Filtrostr.replace("*Office*", valor);
        var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle" + "('" + listName + "')/Items" + filter + "&$top=5000";
        var headers = { "accept": "application/json;odata=verbose", "Content-type": "application/json;odata=verbose" };
        var getAccounts = GetRequestEndpoint(url, true, headers);
        getAccounts.done(function (dataGet, status, xhr) {
            if (dataGet.d.results.length > 0) {
                var resultados = dataGet.d.results;
                for (var i = 0; i < dataGet.d.results.length; i++) {
                    accounts.push(resultados[i]);
                }
            }
            cantOffice++;
            if (cantOffice == OfficeArray.length) {
                ArmarTabla(dataIndex);
            }
        });
        getAccounts.fail(function () {
        });
    });
}

function ArmarTabla(data) {
    accounts.shift();
    if (!first) datatable.destroy();
    $("#tAccounts").html("");
    $("#dtSelect").html("");
    $("#dtHeader").html("");
    validateFieldsHeaders(JSON.parse(data.Fields));

    accounts.forEach((account, indexAccount) => {
        try {
            $("#tAccounts").append($("<tr id=\"trAccount" + indexAccount + "\"></tr>"));

            JSON.parse(data.Fields).forEach((field, indexField) => {
                if (indexField == 0) {
                    $("#trAccount" + indexAccount).append($("<td style=\"display: none;\">" + account[field.Field] + "</td>"));
                }
                else {
                    var value = "";

                    if (field.Type == "Date") {
                        if (field.SecondField != "") value = account[field.Field][field.SecondField.toString()].split("T")[0];
                        else value = account[field.Field.toString()]?.split("T")[0];
                    }
                    else {
                        if (field.SecondField != "")
                            value = account[field.Field][field.SecondField];
                        else
                            value = account[field.Field];


                    }

                    if (field.Field == "Status")
                        $("#trAccount" + indexAccount).append($("<td class='" + setColorStatus(value, "label") + "'>" + (value || "") + "</td>"));
                    else
                        $("#trAccount" + indexAccount).append($("<td>" + (value || "") + "</td>"));
                }

                if (field.Field == "Status") positionStatus = indexField;
            });

            var buttonEvent = data.ListName == "Accounts" ? "Account" : "Endorsement";
            $("#trAccount" + indexAccount).append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickView" + buttonEvent + "(" + indexAccount +
                ");\">View Account</button><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"ClickViewSummary('" +
                account.Reference + "','" + data.ListName + "');\">View Summary</button></td>"))
        } catch (error) {
            console.log("error: ", error);
            hideSpinner();
            showErrorMessage("Filter error. Consult with administrator.");
        }

    });

    if (first) {
        first = false;

        $('#dtAccounts tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');

            if (datatable.rows('.selected').data().length > 1) {
                $("#bEndorsement").prop("disabled", true);
                $("#bRequestProcess").prop("disabled", true);
                $("#bRenewal").prop("disabled", true);
                $("#bAssingToMe").prop("disabled", false);
                $("#bNTU").prop("disabled", true);
                $("#bTeamManager").prop("disabled", false);
            }
            else {
                if (datatable.rows('.selected').data().length == 1) {
                    $("#bTeamManager").prop("disabled", false);

                    switch (datatable.rows('.selected').data()[0][positionStatus]) {
                        case "Pending":
                            $("#bEndorsement").prop("disabled", true);
                            $("#bRequestProcess").prop("disabled", false);
                            $("#bRenewal").prop("disabled", true);
                            $("#bAssingToMe").prop("disabled", false);
                            $("#bNTU").prop("disabled", false);
                            break;
                        case "In Progress":
                            $("#bEndorsement").prop("disabled", true);
                            $("#bRequestProcess").prop("disabled", true);
                            $("#bRenewal").prop("disabled", true);
                            $("#bAssingToMe").prop("disabled", false);
                            $("#bNTU").prop("disabled", true);
                            break;
                        case "Cancelled":
                            disabledButtons();
                            break;
                        default:
                            $("#bEndorsement").prop("disabled", false);
                            $("#bRequestProcess").prop("disabled", true);
                            $("#bRenewal").prop("disabled", false);
                            $("#bAssingToMe").prop("disabled", false);
                            $("#bNTU").prop("disabled", true);
                            break;
                    }
                }
                else {
                    disabledButtons();
                    $("#bTeamManager").prop("disabled", true);
                }
            }
        });
    }

    datatable = addDataTable('dtAccounts', arrayField);

    searchField();

    JSON.parse(data.Fields).forEach((element, index) => {
        if (element.Disabled) datatable.column(index).visible(false);
    });

    hideSpinner();
}

function searchField() {
    $('#dtAccounts thead tr:eq(0) th').each(function (i) {

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

function clickViewAccount(index) {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accounts[index].Reference + "&type=account", '_blank');
}
function clickViewEndorsement(index) {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accounts[index].Reference + "&type=endorsement", '_blank');
}