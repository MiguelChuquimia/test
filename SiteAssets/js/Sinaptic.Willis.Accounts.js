console.log("Loading: Sinaptic.Willis.Accounts.js 08/04/2022 v1.0.27")

var first = true;
var datatable;
var office;
var accounts;
var profile;
var arrayField = [];
var listButtons;
var listFields;
var positionStatus = 0;
var OfficeArray = [];
var TokenTimeSearch = 0

$(function () {
	showSpinner();
	createTabsAndSearch();
	validatePage();


	$("#bEndorsement").prop("disabled", true);
	$("#bRequestProcess").prop("disabled", true);
	$("#bRenewal").prop("disabled", true);
	$("#bAssingToMe").prop("disabled", true);
	$("#bNTU").prop("disabled", true);

	$(document).on('keyup', '#txtSearchOnMyAccounts', function (event) {
		HandleSearchChange(event)
	})

	$(document).on('keydown', '#txtSearchOnMyAccounts', function (event) {
		if (event.keyCode == 13) {
			event.preventDefault()
		}
	})
});

async function createTabsAndSearch() {
	htmlTabs = `
		<div class="TabsSecundarios">
			<div class="tabSecundario tabDarkViolet tabSeleccionado" data-show="bFilters">Filters buttons</div>
			<div class="tabSecundario tabDarkViolet" data-show="SearchOnMyAccounts">Search in Office Accounts</div>
		</div>
	`

	$(htmlTabs).insertBefore($("#bFilters"))

	$(".tabSecundario").click(function () {
		HandleClickTab($(this))
	})

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
		<div id="SearchOnMyAccounts" style="display: none;">
		<input id="txtSearchOnMyAccounts" placeholder="Enter an Account Reference" class="form-control" type="" disabled/>
			<div id="SearchOnMyAccountsFilters">
				<span class="mini-spinner" style="margin-right: 5px;"></span>
				<span style="font-size: 14px;">Getting filters...</span>
			</div>
		</div>
	`

	$(htmlSearch).insertBefore($("#bFilters"));

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

	$("input[value='Completed']").prop("checked", true);
	$("input[value='byReference']").prop("checked", true);

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

	$(htmlCargando).insertBefore($("#dtAccounts").closest('.table-responsive'));


}

function HandleClickTab(pTab) {
	$("#bFilters, #SearchOnMyAccounts").hide()
	$("#" + $(pTab).data('show')).show()

	$(".tabSecundario").removeClass("tabSeleccionado")
	$(pTab).addClass("tabSeleccionado")

	if ($(pTab).data('show') == "bFilters") {
		$(".filters-bar-clear .button-subcommands").show()

		TokenTimeSearch = 0
		HideSearchingMessage()

		clickClearFilters()
	} else {
		$(".filters-bar-clear .button-subcommands").hide()
	}
}

function HandleSearchChange(event) {
	if (((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 32 || event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 27 || event.keyCode == 189)) {

		BeginToSearch()
	}
}

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
				StatusFilter = "and(Status eq '" + vSelectedFilter + "')"
			}



			OfficeAccounts = await getData("Accounts", `?$select=*,UserAccount/Title&$expand=UserAccount&$filter=${StrFilter}${StatusFilter}and(Office eq '${Office}')`);

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
	})

	return pGetFilteredAccountsWithTokenTime
}

function getFieldsSearchQuery() {
	// Este JSON es el mismo que existe para los Filter Buttons de All Accounts Pending y All Accounts On Hold - In Progress

	return `
		[{"Title": "ID", "Field": "ID", "SecondField": "", "TypeFilter": "", "Disabled": false, "Type": ""},{"Title": "Reference", "Field": "Reference", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": ""},{"Title": "Original Insured", "Field": "OriginalInsured", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": ""},{"Title": "Client", "Field": "Client", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": ""},{"Title": "Type Of Movement", "Field": "TypeOfMovement", "SecondField": "", "TypeFilter": "select", "Disabled": false, "Type": ""},{"Title": "Inception", "Field": "Inception", "SecondField": "", "TypeFilter": "search", "Disabled": false, "Type": "Date"},{"Title": "GL of Business", "Field": "GLoB", "SecondField": "", "TypeFilter": "select", "Disabled": false, "Type": ""},{"Title": "Business Country", "Field": "BusinessCountry", "SecondField": "", "TypeFilter": "", "Disabled": false, "Type": ""},{"Title": "Income USD", "Field": "IncomeUSD", "SecondField": "", "TypeFilter": "", "Disabled": false, "Type": ""},{"Title": "Main Responsible", "Field": "UserAccount", "SecondField": "Title", "TypeFilter": "select", "Disabled": false, "Type": ""},{"Title": "Status", "Field": "Status", "SecondField": "", "TypeFilter": "select", "Disabled": false, "Type": ""}]
	`
}

async function validatePage() {
	profile = await getUserProfile();

	office = await getUserOffice();

	for (var indexOffice = 0; indexOffice < office.results.length; indexOffice++) {
		OfficeArray.push(office.results[indexOffice].Office);
	};

	getListsAccountManager("#oTeamManager", OfficeArray, "clickAssignTeamManager");

	listFields = loadListFieldsvalue(profile.ProfileId, OfficeArray);

	validateFilters(profile.ProfileId);

	//setKpisOnHold();

	hideSpinner();
}

//?$select =*, UserAccount / Title & $expand=UserAccount & $filter=(UserAccountId eq * UserId *) and(Status eq 'On Hold')


function clickAccount(index) {
	window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accounts[index].Reference + "&type=account", '_self');
}

function clickViewAccount(index) {
	window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accounts[index].Reference + "&type=account", '_self');
}
function clickViewEndorsement(index) {
	window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accounts[index].Reference + "&type=endorsement", '_self');
}

function clickEndorsement() {
	if (datatable.rows('.selected').data().length == 1) window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/NewEndorsement.aspx?reference=" + datatable.rows('.selected').data()[0][1], '_self');
}

function clickAssign() {
	for (let index = 0; index < datatable.rows('.selected').data().length; index++) {
		var dataSave = {
			'__metadata': { type: "SP.Data.AccountsListItem" },
			'UserAccountId': _spPageContextInfo.userId
		}

		if (index != datatable.rows('.selected').data().length - 1) updateData("Accounts", datatable.rows('.selected').data()[index][0], dataSave);
		else updateData("Accounts", datatable.rows('.selected').data()[index][0], dataSave, "account");
	}
}

function clickNTU() {
	sessionData = { reference: datatable.rows('.selected').data()[0][1], entityType: datatable.rows('.selected').data()[0][11] }
	localStorage.setItem('sessionData', JSON.stringify(sessionData));
	if (datatable.rows('.selected').data().length == 1) window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/FormularioNTU.aspx?reference=" + datatable.rows('.selected').data()[0][1], '_self');
}

function clickNew() {
	window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?type=account", '_self');
}

function disabledButtons() {
	$("#bEndorsement").prop("disabled", true);
	$("#bRequestProcess").prop("disabled", true);
	$("#bRenewal").prop("disabled", true);
	$("#bAssingToMe").prop("disabled", true);
	$("#bNTU").prop("disabled", true);
}

function clickAssignTeamManager(id) {
	for (let index = 0; index < datatable.rows('.selected').data().length; index++) {
		var dataSave = {
			'__metadata': { type: "SP.Data.AccountsListItem" },
			'UserAccountId': id
		}

		if (index != datatable.rows('.selected').data().length - 1) updateData("Accounts", datatable.rows('.selected').data()[index][0], dataSave);
		else {
			updateData("Accounts", datatable.rows('.selected').data()[index][0], dataSave, "account");
			showErrorMessage("Completed update Assign Team Manager");
		}
	}
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

function clickRenewal() {
	if (datatable.rows('.selected').data().length == 1) window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + datatable.rows('.selected').data()[0][1] + "&type=renewal", '_self');
}

async function validateFilters(profileId) {
	listButtons = await getData("FiltersButtons", "?$filter=(ProfileId eq " + profileId + ")&$orderby=OrderColumn");

	listButtons.forEach((element, index) => {
		createFilters(element, index, "Accounts");
	});

	hideSpinner();

	clickFilterAccounts(0);
}

async function setKpisOnHold() {


	var cantOnHoldAccounts = await getData("Accounts", "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(UserAccountId eq " + listFields[1].value + ")and(Status eq 'On Hold')");
	var cantOnHoldEndorsments = await getData("Endorsement", "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(UserAccountId eq " + listFields[1].value + ")and(Status eq 'On Hold')");
	console.log(cantOnHoldAccounts.length);
	console.log(cantOnHoldEndorsments.length);

	//listButtons.forEach((element, index) => {
	//    createFilters(element, index, "Accounts");
	//});

	//hideSpinner();

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
	Filtrostr = data.Filters;
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

	if (data.Filters.indexOf("Office") > 0) {
		getItems(data.ListName, OfficeArray, Filtrostr, cantOffice, data);
	} else {

		accounts = await getData(data.ListName, data.Filters);
		ArmarTabla(data);
	}

}

function ArmarTabla(data) {
	if (accounts.length > 0 && accounts[0] == 0)
		accounts.shift();

	if (!first)
		datatable.destroy();

	$("#tAccounts").html("");
	$("#dtSelect").html("");
	$("#dtHeader").html("");
	validateFieldsHeaders(JSON.parse(data.Fields));


	accounts.forEach((account, indexAccount) => {

		$("#tAccounts").append($("<tr id=\"trAccount" + indexAccount + "\"></tr>"));
		JSON.parse(data.Fields).forEach((field, indexField) => {
			if (indexField == 0) {
				$("#trAccount" + indexAccount).append($("<td style=\"display: none;\">" + account[field.Field] + "</td>"));
			}
			else {
				var value = "";

				if (field.Type == "Date") {
					if (field.SecondField != "") {
						if (account[field.Field][field.SecondField.toString()]) {
							value = account[field.Field][field.SecondField.toString()].split("T")[0];
						}
					} else {
						if (account[field.Field.toString()]) {
							value = account[field.Field.toString()].split("T")[0];
						}
					}
				}
				else {
					if (field.SecondField != "")
						value = account[field.Field][field.SecondField];
					else
						value = account[field.Field];


				}

				if (field.Field == "Status")
					$("#trAccount" + indexAccount).append($("<td class='" + setColorStatus(value, "label") + "'>" + value + "</td>"));
				else
					$("#trAccount" + indexAccount).append($(`<td> ${value ?? ""} </td>`));
			}

			if (field.Field == "Status") positionStatus = indexField;
		});

		var buttonEvent = data.ListName == "Accounts" ? "Account" : "Endorsement";
		$("#trAccount" + indexAccount).append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickView" + buttonEvent + "(" + indexAccount +
			");\">View Account</button><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"ClickViewSummary('" +
			account.Reference + "','" + data.ListName + "');\">View Summary</button></td>"))
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

	if (data.ImSearchingByText) {
		HideSearchingMessage()
	}
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
			hideSpinner();
			showErrorMessage("Filter error. Consult with administrator.");
		});
	});
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
};

async function clickRequestProcess() {

	showSpinner();

	var selectedRow = datatable.rows('.selected').data()[0][1];
	var list;
	if (datatable.rows('.selected').data()[0][11] == "Endorsement")
		list = "Endorsement";
	else
		list = "Accounts";
	var selectedAccount = await getData(list, "?$filter=ID eq " + datatable.rows('.selected').data()[0][0]);



	getRelatedDocumentsCallback(selectedAccount[0].Reference.replace(/\-/g, ""), function (data) {

		var date = new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-" + new Date().getDate().toString().padStart(2, "0");

		var dueDate = addDays(new Date(selectedAccount[0].Inception), 30);
		var accountObj = {
			'reference': selectedAccount[0].Reference,
			'idAccount': selectedAccount[0].Id,
			'startDate': date,
			'office': selectedAccount[0].Office,
			'client': selectedAccount[0].Client,
			'dueDate': formatDate(dueDate),
			'inception': selectedAccount[0].Inception,
			'insured': selectedAccount[0].OriginalInsured,
			'ObjectType': selectedAccount[0].ObjectType
		}

		list == "Accounts" ? AccountRequestProcess(accountObj, "requestProcessAccount") : EndorsementRequestProcess(accountObj, "requestProcessAccount");
	}, function (dataError) {

		showErrorMessage("You must attach at least one document before requesting a process.");
		hideSpinner();

	});
}

function clickClearFilters() {
	clickFilterAccounts(0);
}

async function MigrarOfficeATexto() {
	if (confirm("¿Confirma realizar la migración de Office a OfficeText?")) {
		showSpinner()

		MostrarTextoMasInfoSpinner("Migrando información...")
		MostrarBarraMasInfoSpinner(0)

		var UsersOffice = await getData("Users", "?$select=Id, Office/Title, OfficeText&$expand=Office");

		for (var i = 0; i < UsersOffice.length; i++) {
			if (!UsersOffice[i].OfficeText && UsersOffice[i].Office.results.length > 0) {
				Offices = UsersOffice[i].Office.results

				strOffices = ""
				for (var j = 0; j < Offices.length; j++) {
					if (strOffices != "") {
						strOffices += "; "
					}

					strOffices += Offices[j].Title
				}

				var datos = {
					'__metadata': { 'type': 'SP.Data.UsersListItem' },
					'OfficeText': strOffices,
				}

				await updateDataAsync("Users", UsersOffice[i].Id, datos)
			}

			porcentaje = i * 100 / UsersOffice.length
			MostrarBarraMasInfoSpinner(porcentaje)
		}
	}

	hideSpinner()
	alert("Se ha migrado correctamente la información de Office (Lookup) a OfficeText")
}

function NumeroRandom(pMin, pMax) {
	pMin = Math.ceil(pMin);
	pMax = Math.floor(pMax);
	return Math.floor(Math.random() * (pMax - pMin + 1)) + pMin;
}