var urlBase = "/_api/web/lists/getbytitle";
var listFields = [{ "field": "ProfileId", "value": "" }, { "field": "UserId", "value": "" }, { "field": "Office", "value": [] }];

var dataTableTasks;
const environment = new Object();
var sharePointLibrary = "Shared%20Documents";
var levelsBreadcrumb;
var currentRootPath;
var userProfile = "";
var sessionData = {};

//url WebApi desa
var urlDocumentManagerApiReinsurance = "https://arbsa-i-ap20d.int.dir.willis.com/DocumentManager/api/";

//url WebApi prod
// var urlDocumentManagerApiReinsurance = "https://arbsa-i-ap20.int.dir.willis.com/DocumentManager/api/";
// var urlDocumentManagerApiReinsurance = "https://localhost:44386/api/";

$(function () {

    console.log("version 156.0");

    //settingEnvirnmentVars();
    setInterval(function () {
        RefreshToken()
    }, 5 * 60000);

    var levels = '<li class="breadcrumb-item active" aria-current="page">Home<li>';
    levelsBreadcrumb = { levels: levels, paths: [] }
    levelsBreadcrumb.paths.push("Home");
    $(".breadcrumb").html(levels);

    sessionData = JSON.parse(localStorage.getItem('sessionData'));
});

function containsInvalidCharacters(str) {
    return (/^[a-zA-Z0-9\-\_ ]*$/.test(str) == false);
}

function RefreshToken() {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/contextinfo",
        method: "POST",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue)
        },
        error: function (data, errorCode, errorMessage) {
            console.log("Error, no se pudo actualizar el token")
        }
    });
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
//function settingEnvirnmentVars() {

//    getDataCallback("EnvironmentSettings", "? $filter=(Key eq 'DocumentsRootPath')", function (d) {
//        environment.documentRootPath = d[0].Title;
//    });

//}
async function getData(listName, filter = "") {
    try {
        if (filter == "") {
            filter = "?$top=10000";
        }
        else {

            filter = filter.includes("&$top") ? filter : (filter + "&$top=10000");
        }
        var url = urlBase + "('" + listName + "')/Items" + filter;
        const result = await $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + url,
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" }
        });

        return result.d.results || [];
    } catch (error) {
        console.log(error);
        return [];
    }
}

function goHome() {

    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Index.aspx", '_self');
}

function getDataCallback(listName, filter = "", callback) {
    if (filter == "") {
        filter = "?$top=5000";
    }
    else {

        filter = filter.includes("&$top") ? filter : (filter + "&$top=10000");
    }
    var url = urlBase + "('" + listName + "')/Items" + filter;
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (result) {
            callback(result.d.results);
        },
        error: function (error) {
            callback(error);
        }
    });


}

async function addDataAsync(listName, itemProperties, success, error) {
    var url = urlBase + "('" + listName + "')/Items";
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        type: "POST",
        data: JSON.stringify(itemProperties),
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "POST"
        },
        success: function (result) {
            success(result.d);
        },
        error: function (data) {
            error(data);
            console.log(data);
        }
    });


}

async function addData(listName, itemProperties) {
    var url = urlBase + "('" + listName + "')/Items";
    const result = await $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        type: "POST",
        data: JSON.stringify(itemProperties),
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "POST"
        },
        error: function (data) {
            console.log(data);
        }
    });

    return result.d || [];
}

async function deleteData(listName, itemId) {
    var url = urlBase + "('" + listName + "')/Items(" + itemId + ")";
    const result = await $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        type: "DELETE",
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": "*"
        },
        error: function (data) {
            console.log(data);
        }
    });

    return result.d || [];
}

function updateEntityData(listName, itemId, jsonData, completed, error) {
    var url = urlBase + "('" + listName + "')/Items(" + itemId + ")";
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        type: "POST",
        data: JSON.stringify(jsonData),
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
        },
        success: async function (data) {

            completed(data);
        },
        error: function (data) {
            error(data);
            //showErrorMessage("There was an error updating the data");
        }
    });
}
function updateData(listName, itemId, jsonData, method = "") {
    var url = urlBase + "('" + listName + "')/Items(" + itemId + ")";
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        type: "POST",
        data: JSON.stringify(jsonData),
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
        },
        success: async function () {
            switch (method) {
                case "updateAccount":
                    showErrorMessage("The data was updated correctly");
                    clickReset();
                    break;
                case "account":
                    clickFilterAccounts(0);
                case "claim":
                    clickFilterClaims(0);
                case "requestProcessAccount":
                    showErrorMessage("Process Request sent successfully.");
                    disabledButtons();
                    clickFilterAccounts(0);
                    break;
                case "requestProcessViewAccount":
                    showErrorMessage("Process Request sent successfully.");
                    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Accounts.aspx", '_self');
                    break;
                case "viewAnalyst":
                    showErrorMessage("Assign user finished successfully.");
                    await getMyTasks();
                    await getAssignPending();
                    break;
                case "updateStatusProcess":
                    showErrorMessage("States updated.");
                    $("#bSuspend").prop("disabled", true);
                    $("#bActivate").prop("disabled", true);
                    $("#bCancel").prop("disabled", true);
                    await getMyTasks();
                    await getAssignPending();
                    await getProcess();
                    break;
                case "updateProcessSuspend":
                    updateProcess(4);
                    break;
                case "updateProcessCancel":
                    updateProcess(5);
                    break;
                case "updateProcessActivate":
                    updateProcessActivate();
                    break;
                case "ModalSave":
                    $("#modalReason").modal("hide");
                    $("#modalTask").modal("hide");
                    showErrorMessage("The data was saved correctly.");
                    await getMyTasks();
                    await getAssignPending();
                    await getProcess();
                    break;
                case "SaveDocumentation":
                    showErrorMessage("The data was saved correctly.");
                    break;
                default:
                    break;
            }
        },
        error: function (data) {
            console.log(data);
            showErrorMessage("There was an error updating the data");
        }
    });
}



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
                var x = $('.dt-buttons');
                $('.filters-bar-clear').append(x);
            });
        },
        dom: 'Blfrtip',
        buttons: [
            {
                extend: 'excel',
                text: 'Export to Excel',
                exportOptions: {
                    modifier: {
                        page: 'current'
                    }
                }
            }
        ],
        order: [[0, "desc"]],
        oLanguage: {
            "sSearch": "Search all columns"
        },
        "lengthMenu": [[100, 200, 300, 1500], [100, 200, 300, 1500]],
        select: true


    });
}

async function getUserOffice() {
    var userData = await getData("Users", "?$select=*,Office/Office,Office/Initials,Office/Id&$expand=Office&$filter=(UserId eq " + _spPageContextInfo.userId + ")");

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

async function downloadFilesFromFS(completed, resperror, body) {
    showSpinner();
    try {
        var settings = {
            "url": urlDocumentManagerApiReinsurance + "File/getselectedfiles",
            "method": "POST",
            "timeout": 0,
            "xhrFields": {
                responseType: 'blob'
            },
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(body),
        };

        $.ajax(settings)
            .done(function (response) {

                downloadFile(response, body.ref + ".zip", "application/zip");

                hideSpinner();
            })
            .fail(resperror);
    } catch (error) {
        console.log(error);
        hideSpinner();
    }
}

function downloadFile(data, filename, mime) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const blob = new Blob([data], { type: mime || 'application/octet-stream' });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE doesn't allow using a blob object directly as link href.
        // Workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
        return;
    }
    // Other browsers
    // Create a link pointing to the ObjectURL containing the blob
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);
    // Safari thinks _blank anchor are pop ups. We only want to set _blank
    // target if the browser does not support the HTML5 download attribute.
    // This allows you to download files in desktop safari if pop up blocking
    // is enabled.
    if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(blobURL);
    }, 100);
}

async function addFolderDocumentLibrary(folder, nameFolder, returnNew = false) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + folder + "')/Folders/add(url='" + nameFolder + "')",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function () {
            if (returnNew)
                successNewFolder(nameFolder);
        }
    });
}


//Type parameter: Specified if the class apply to box or label(box could  be a table cell or div). 
function setColorStatus(status, type) {

    var cssclass;
    switch (status) {
        case "In Progress": {
            cssclass = "inProgress-" + type;
        } break;
        case "On Hold": {
            cssclass = "onHold-" + type;
        } break;
        case "Completed": {
            cssclass = "completed-" + type;
        } break;
        case "Cancelled": {
            cssclass = "cancelled-" + type;
        } break;
        case "Suspended": {
            cssclass = "suspended-" + type;
        } break;
        case "Pending of Broker": {
            cssclass = "pending-" + type;
        } break;
        case "Pending Reinsurer": {
            cssclass = "pending-" + type;
        } break;
        case "Pending": {
            cssclass = "pending-" + type;
        } break;
        case "Pending of Assigment": {
            cssclass = "pending-" + type;
        } break;
        default: break;
    }

    return cssclass;

}

async function addFolderDocumentLibrary(folder, nameFolder, resolve) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + folder + "')/Folders/add(url='" + nameFolder + "')",
        type: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function () {
            resolve("Ok");
        },
        error: function () {
            resolve("Error");
        }
    });
}

async function uploadFile(pathFolder, fileName, txtContent, isLast = false) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + pathFolder + "')/Files/add(url='" + fileName + "',overwrite=true)",
        type: "POST",
        data: txtContent,
        processData: false,
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            console.log("Document created successfully");

            if (isLast) {
                //clickAttach();
                validateDocumentLibrary(pathFolder);
            }
        }
    });
}

function deleteFileWebApi(filePath, completed) {
    $.ajax({
        url: urlDocumentManagerApiReinsurance + "File/delete?pathToDelete=/" + filePath.replace(/\\/g, '%5C'),
        type: "delete",
        crossDomain: true,
        cache: false,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (data) {
            completed(data);
        },
        error: function (data) {
            console.log(data);
        }
    });
}

async function uploadFileWebApi(formData) {
    return new Promise((resolve, reject) => {
        let url = `${urlDocumentManagerApiReinsurance}File/UploadFiles/`;
        $.ajax({
            url: url,
            type: "post",
            crossDomain: true,
            cache: false,
            processData: false,
            contentType: false,
            data: formData,
            dataType: "text",
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                console.log(error);
                reject(error);
            }
        });
    });
}

async function getUserProfile() {
    var userData = await getData("Users", "?$select=*,Profile/Title&$expand=Profile&$filter=(UserId eq " + _spPageContextInfo.userId + ")");
    userProfile = userData[0].Profile.Title;
    return userData[0];
}

function showSpinner() {
    $("#loadMe").modal({
        backdrop: "static",
        keyboard: false,
        show: true
    });
}

function showSpinnerWithText(text) {
    $("#spinnerMsg").html(text);
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

    // if (userProfile == "Analyst") {
    //     $('.buttons-excel').hide();
    // }
}

async function getListUsersByOffice(office) {
    var filterOffice = "";
    for (var i = 0; i < office.length; i++) {
        filterOffice += "Office/Title eq '" + office[i] + "'";
        if (i + 1 < office.length) {
            filterOffice += " or ";
        }
    }
    return await getData("Users", "?$select=*,Office/Title&$expand=Office&$select=User/Title&$expand=User&$filter=(" + filterOffice + ")");
}

function createFilters(data, index, txt) {
    if (txt == "Accounts" && data.Title == "My Endorsements Pending") {
        $("#bFilters").append("<br/>")
    }
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


function validateFieldsHeadersWithID(dataFields) {
    dataFields.forEach((element, index) => {
        var txtTh = "<th scope=\"col\"";
        // if (index == 0) txtTh += " style=\"display: none;\"";
        if (element.TypeFilter == "select") {
            txtTh += " id=\"select" + index + "\"";
            arrayField.push(index);
        }
        if (element.TypeFilter == "search") txtTh += "><input type=\"text\" placeholder=\"Search " + element.Title + "\" /";

        txtTh += "></th>";

        $("#dtSelect").append(txtTh);

        //if (index == 0) $("#dtHeader").append("<th style=\"display: none;\" scope=\"col\">" + element.Title + "</th>");
        $("#dtHeader").append("<th scope=\"col\">" + element.Title + "</th>");
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

async function getGenericOptions(selector, list) {
    var listStatus = await getData(list, "");


    listStatus.forEach(element => {
        $(selector).append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });
}

async function getCauses(selector, list) {
    var listStatus = await getData(list, "");


    listStatus.forEach(element => {
        $(selector).append($("<option value=\"" + element.Title.toUpperCase() + "\">" + element.Title + "</option>"));
    });
}


async function getListUsersByProfile(selector, functionClick, profile) {
    var listUsers = await getData("Users", "?$select=*,Office/Title&$expand=Office,Profile&$select=User/Title,Profile/Title&$expand=User&$filter=(substringof('" + profile + "',Profile/Title))");

    listUsers.forEach(element => {
        $(selector).append($("<a class=\"dropdown-item\" onclick=\"" + functionClick + "(" + element.UserId + ")\">" + element.User.Title + "</a>"));
    });
}

async function getListAccountManagerTeam(selector, office) {
    var filterOffice = "";
    for (var i = 0; i < office.length; i++) {
        filterOffice += "Office/Title eq '" + office[i].Office + "'";
        if (i + 1 < office.length) {
            filterOffice += " or ";
        }
    }
    var listAccountManagerTeam = await getData("Users", "?$select=*,Office/Title&$expand=Office,Profile&$select=User/Title,Profile/Title&$expand=User&$filter=(" + filterOffice + ")and(Profile/Title eq 'Account Manager')&$orderby=Title desc");

    listAccountManagerTeam.forEach(element => {
        $(selector).append($("<option value=\"" + element.UserId + "\">" + element.User.Title + "</option>"));
    });
}

async function getListAccountManagerTeamByOffice(selector, office) {
    var filterOffice = "";

    filterOffice += "Office/Id eq '" + office + "'";


    var listAccountManagerTeam = await getData("Users", "?$select=*,Office/Title&$expand=Office,Profile&$select=User/Title,Profile/Title&$expand=User&$filter=(" + filterOffice + ")and(Profile/Title eq 'Account Manager')&$orderby=Title desc");

    listAccountManagerTeam.forEach(element => {
        $(selector).append($("<option value=\"" + element.UserId + "\">" + element.User.Title + "</option>"));
    });
}

async function getListAccountManagers(selector) {
    var listAccountManagerTeam = await getData("Users", "?$select=*,Office/Title&$expand=Office,Profile&$select=User/Title,Profile/Title&$expand=User&$filter=Profile/Title eq 'Account Manager' and (Active eq 1)&$orderby=Title desc");

    listAccountManagerTeam.forEach(element => {
        $(selector).append($("<option value=\"" + element.UserId + "\">" + element.User.Title + "</option>"));
    });
}


async function getListsAccountManager(selector, office, functionClick) {
    var filterOffice = "";
    for (var i = 0; i < office.length; i++) {
        filterOffice += "Office/Title eq '" + office[i] + "'";
        if (i + 1 < office.length) {
            filterOffice += " or ";
        }
    }
    var listAccountManager = await getData("Users", "?$select=*,Office/Title&$expand=Office,Profile&$select=User/Title,Profile/Title&$expand=User&$filter=(Active eq 1)and(" + filterOffice + ")and(Profile/Title eq 'Account Manager')&$orderby=Title desc");

    listAccountManager.forEach(element => {
        $(selector).append($("<a class=\"dropdown-item\" onclick=\"" + functionClick + "(" + element.User.Id + ")\">" + element.User.Title + "</a>"));
    });
}

async function getListClaimHandler(selector, office, functionClick) {
    var filterOffice = "";
    for (var i = 0; i < office.length; i++) {
        filterOffice += "Office/Title eq '" + office[i] + "'";
        if (i + 1 < office.length) {
            filterOffice += " or ";
        }
    }
    var listAccountManager = await getData("Users", "?$select=*,Office/Title&$expand=Office,Profile&$select=User/Title,Profile/Title&$expand=User&$filter=(" + filterOffice + ")and(Profile/Title eq 'Claim Handler')");

    listAccountManager.forEach(element => {
        $(selector).append($("<a class=\"dropdown-item\" onclick=\"" + functionClick + "(" + element.UserId + ")\">" + element.User.Title + "</a>"));
        //$(selector).append($("<option value=\"" + element.UserId + "\">" + element.User.Title + "</option>"));
    });
}


async function getListsAnalyst(selector, office, functionClick) {
    var listAccountManager = await getData("Users", "?$select=*,Office/Title,Profile/Title&$expand=Office,Profile&$select=User/Title&$expand=User&$filter=((Profile/Title eq 'Analyst')or(Profile/Title%20eq%20%27Team Leader%27))and(Active eq 1)");

    listAccountManager.forEach(element => {
        $(selector).append($("<a class=\"dropdown-item\" onclick=\"" + functionClick + "(" + element.UserId + ")\">" + element.User.Title + "</a>"));
    });
}

async function getRelatedDocuments(pathDocumentLibrary, element) {

    document.getElementById("overlay").style.display = "flex";
    $.ajax({
        type: 'GET',
        url: `${urlDocumentManagerApiReinsurance}File/Read?path=${pathDocumentLibrary.replace(/\\/g, '%5C')}`,
        dataType: 'json',
        headers: { 'Access-Control-Allow-Headers': '*' },
        cache: false,
        contentType: false,
        processData: false,
        success: async function (data) {
            document.getElementById("overlay").style.display = "none";
            loadRelatedDocumentsFS(data, element);
        },

        error: async function (error) {
            console.log(error);
            document.getElementById("overlay").style.display = "none";
            // addFolderDocumentLibrary(sharePointLibrary, pathDocumentLibrary, false);
        }
    });
}

async function getRelatedDocumentsCallback(pathDocumentLibrary, callback, error) {
    $.ajax({
        type: 'GET',
        url: `${urlDocumentManagerApiReinsurance}File/Read?path=${pathDocumentLibrary.replace(/\\/g, '%5C')}`,
        dataType: 'json',
        headers: { 'Access-Control-Allow-Headers': '*' },
        cache: false,
        contentType: false,
        processData: false,
        success: async function (data) {
            callback(data);
        },
        error: async function (data) {
            error(data);
        }
    });
}

async function getRelatedDocumentsWebApi(formData, callback, error) {
    $.ajax({
        url: `${urlDocumentManagerApiReinsurance}File/GetPathsByReference/`,
        type: "POST",
        crossDomain: true,
        cache: false,
        processData: false,
        contentType: false,
        data: formData,
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: async function (data) {
            callback(data);
        },
        error: async function (data) {
            error(data);
        }
    });
}

async function validateDocumentLibrary(pathDocumentLibrary) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + pathDocumentLibrary + "')/",
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: async function () {
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('" + pathDocumentLibrary + "')/Files?$orderby=TimeLastModified%20desc",
                type: "GET",
                headers: {
                    "accept": "application/json;odata=verbose",
                },
                success: function (data) {
                    if (data.d.results.length != 0) loadRelatedDocuments(data.d.results);
                },
                error: function () { console.log("Error al obtener los datos de la carpeta \"" + pathDocumentLibrary + "\""); }
            });
        },
        error: async function () {
            addFolderDocumentLibrary(sharePointLibrary, pathDocumentLibrary, false);
        }
    });
}

//get documents from sharepoint library
function loadRelatedDocumentsShp(documents) {
    $("#tRelatedDocuments").html("");
    if (documents.length > 0) {
        $("#tRelatedDocuments").append($("<tr class='trDownload'></tr>")
            .append($("<td></td><td><label class='containercontainerCheck'><input class='form-check-input checkListDocumentDownload' type='checkbox' value='' ><span class='checkmark'></span></label></td>"))
            .append($("<td><div class='ListDocumentDownload'><i class=\"fas fa-arrow-down button-icon-No-download\"></i></div></td>"))
        )
        $("#tRelatedDocuments").append($("<tr></tr>")
            .append($("<td></td><td></td><td></td>"))
        )

    }

    documents.forEach(element => {
        var splitName = element.Name.split('.');

        var icon = validateIcons(splitName[splitName.length - 1]);

        $("#tRelatedDocuments").append($("<tr class='trListDocument'></tr>")
            .append($("<td></td><td><label class='containercontainerCheck'><input class='form-check-input checkListDocument' type='checkbox' value='' ><span class='checkmark'></span></label></td>"))
            .append($("<td><div class='checkListDocumentName'><i class=\"" + icon + " button-icon\" onclick=\"clickViewFile('" + element.Name + "')></i><span>" + element.Name + "</span></div></td>"))
            .append($("<td><div class=''></div><i data-toggle=\"modal\" onclick=\"validateDeleteFile('" + element.Name + "')\" class=\"fas fa-trash-alt button-icon\"></i></div></td>"))
        )
    });
    RelatedDocumentsAction(documents);
}
function RelatedDocumentsAction(documents) {
    $(".checkListDocumentDownload").click(function (e) {
        var IScheck = $(this).prop("checked");
        if (IScheck) {
            $(".trListDocument").addClass("ListSelected");
            $(".checkListDocument").prop("checked", true);
            $(".button-icon-No-download").addClass("button-icon-Si-download");
        } else {
            $(".trListDocument").removeClass("ListSelected");
            $(".checkListDocument").prop("checked", false);
            $(".button-icon-No-download").removeClass("button-icon-Si-download");
        }
    });
    $(".trListDocument").click(function () {
        var IScheck = $(this).find(".checkListDocument").prop("checked");
        if (!IScheck) {
            $(this).addClass("ListSelected");
            $(this).find(".checkListDocument").prop("checked", true);
        } else {
            $(this).removeClass("ListSelected");
            $(this).find(".checkListDocument").prop("checked", false);
        }
        CheckList(documents);
    });
}
function CheckDocumentDownload() {
    var files = [];
    var folder = [];
    var ref = reference;
    var rootPath = "";
    $(".ListDocumentDownload").click(function () {
        files = [];
        folder = [];
        $(".checkListDocument").each(function (index) {
            var IScheck = $(this).prop("checked");
            if (IScheck) {
                var DocumentName = $(this).parent().parent().parent().find(".checkListDocumentName");
                DocumentName = DocumentName.find("span").prop("innerText");
                files.push(DocumentName);
            }
        });
        var strrootPath = "";
        var strrootPathName = "";

        $(".breadcrumb li").each(function (index) {
            if (index > 1) {
                strrootPath = $(this).prop("dataset");
                strrootPathName += "/" + strrootPath.folder;
            }
        });

        var objeto = {
            "ref": ref.replace("-", ""),
            "rootPath": strrootPathName,
            "files": files,
            "folders": folder
        };

        console.log(JSON.stringify(objeto));

        downloadFilesFromFS(function (data) { }, function (error) { hideSpinner(); }, objeto);
    });
}
function CheckDocumentNoDownload() {
    $(".ListDocumentDownload").unbind("click");
}
function CheckList(documents) {
    if (documents.length === $(".ListSelected").length) {
        $(".checkListDocumentDownload").prop("checked", true);
        $(".checkListDocumentDownload").prop("indeterminate", false);
        // CheckDocumentDownload();
    }
    else if ($(".ListSelected").length > 0) {
        $(".checkListDocumentDownload").prop("indeterminate", true);
        $(".button-icon-No-download").addClass("button-icon-Si-download");
        // CheckDocumentDownload();
    } else {
        $(".checkListDocumentDownload").prop("checked", false);
        $(".button-icon-No-download").removeClass("button-icon-Si-download");
        // CheckDocumentNoDownload();
    }
    if ($(".ListSelected").length == 0) {
        $(".button-icon-No-download").removeClass("button-icon-Si-download");
        $(".checkListDocumentDownload").prop("indeterminate", false);
        // CheckDocumentNoDownload();
    }
}
//get documents from File Server
function loadRelatedDocumentsFS(documents, elementId) {
    var files = [];
    var folder = [];

    $(elementId).html("");
    if (documents.length > 0) {
        $(elementId).append($("<tr class='trDownload'></tr>")
            .append($("<td></td><td><label class='containercontainerCheck'><input class='form-check-input checkListDocumentDownload' type='checkbox' value='' ><span class='checkmark'></span></label></td>"))
            .append($("<td><div class='ListDocumentDownload'><i class=\"fa fa-download button-icon-No-download\"></i></div></td>"))
        )
        $(elementId).append($("<tr></tr>")
            .append($("<td></td><td></td><td></td>"))
        )
    }

    $(".ListDocumentDownload").click(function () {
        files = [];
        folder = [];
        var ref = sessionData.reference;

        $(".checkListDocument").each(function (index) {
            var IScheck = $(this).prop("checked");
            if (IScheck) {
                var DocumentName = $(this).parent().parent().parent().find(".checkListDocumentName");
                var DocumentNameFinal = DocumentName.find("span").prop("innerText");
                if (DocumentName.find("i").prop("class").includes("fa-folder"))
                    folder.push(DocumentNameFinal);
                else
                    files.push(DocumentNameFinal);
            }
        });
        var strrootPath = "";
        var strrootPathName = "";
        $(".breadcrumb li").each(function (index) {
            if (index > 0) {
                strrootPath = $(this).prop("dataset");
                if (strrootPath.folder !== undefined)
                    strrootPathName += "/" + strrootPath.folder;
            }
        });
        var datos = [];
        var objeto = {
            "ref": ref.replace(/\-/g, ""),
            "rootPath": strrootPathName,
            "files": files,
            "folders": folder
        };

        console.log(JSON.stringify(objeto));
        downloadFilesFromFS(
            function (data) { },
            function (error) {
                hideSpinner();
                showErrorMessage("Hubo un inconveniente al descargar el archivo.");
            },
            objeto);
    });

    documents.forEach(element => {
        var splitName = element.name.split('.');

        var icon = validateIcons(splitName[splitName.length - 1]);
        var normalizedName = element.isDirectory == false ? element.name.split('.')[0] : element.name;
        var htmlButtons = "";
        var htmlItemName = "";
        var htmlBtnDelete = "";

        if (element.isDirectory) {

            icon = validateIcons("folder");
            htmlButtons = "<label></label>";
            htmlItemName = "<i class='" + icon + " files-icons'></i><a class='folderItem'>" + normalizedName + "</a>";

        }
        else {
            //icon = validateIcons(normalizedName[normalizedName.length - 1]);
            htmlButtons = "<i onclick=\"clickViewFile('" + element.name + "')\" class=\"" + icon + " files-icons\" style='padding-left: 5%;cursor: pointer;'></i>";
            //BUtton delete documents, has been removed by customer requirenment
            htmlBtnDelete = "<i data-toggle=\"modal\" onclick=\"validateDeleteFile('" + element.name + "')\" class=\"fas fa-trash-alt button-icon\" style='padding-right: 8%;'></i>"
            htmlItemName = element.name.replace(/^"(.*)"$/, '$1');
        }


        $(elementId).append($("<tr></tr>")
            .append($("<td></td><td><label class='containercontainerCheck trListDocument'><input class='form-check-input checkListDocument' type='checkbox' value='' ><span class='checkmark'></span></label></td>"))
            .append($("<td><div style='display: flex;align-items: baseline;justify-content: space-between;'><div style='display: flex;width: 100%' class='checkListDocumentName'>" + htmlButtons + "<span>" + htmlItemName + "</span></div>" + htmlBtnDelete + "</div></td>"))
        )
    });

    RelatedDocumentsAction(documents);

    $('.folderItem').on("click", function () {

        var folderName = $(this).html();

        folderClick(folderName, true, function (newPath) {

            getRelatedDocuments(currentRootPath + "\\" + newPath, elementId);

        });

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
        case "folder":
            ret = "far fa-folder";
            break;
        default:
            break;
    }

    return ret;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    var dateToFormat = new Date(date);
    return dateToFormat.getFullYear() + "-" + (dateToFormat.getMonth() + 1).toString().padStart(2, "0") + "-" + dateToFormat.getDate().toString().padStart(2, "0");
}

async function RequestProcess(listName, processObj, funct) {
    showSpinner();

    var len = processObj.reference.split('-').length;

    if (!await ValidateNewProcess(processObj.reference)) {
        await CreateNewProcess(processObj, 12);
        var listType = "SP.Data." + listName + "ListItem";
        var updateStatus = {
            '__metadata': { type: listType },
            'Status': "In Progress",
            'RequestProcessDate': new Date()
        }

        updateData(listName, processObj.idAccount, updateStatus, funct);
    }
    else showErrorMessage("There is a process with the same reference.");

    hideSpinner();
}

async function AccountRequestProcess(processObj, funct) {

    RequestProcess("Accounts", processObj, funct);
}

async function EndorsementRequestProcess(processObj, funct) {
    RequestProcess("Endorsement", processObj, funct);
}

async function ValidateNewProcess(reference) {
    var process = await getData("Process", "?$filter=(Title eq '" + reference + "')");

    if (process.length != 0) return true;
    else return false;
}

async function CreateNewProcess(processObj, idFlowType) {
    var createProcess = {
        '__metadata': { type: "SP.Data.ProcessListItem" },
        'Title': processObj.reference,
        'CurrentFlowId': idFlowType,
        'StatusId': 1,
        'StartDate': processObj.startDate,
        'Office': processObj.office,
        'Client': processObj.client,
        'DueDate': processObj.dueDate,
        'Inception': processObj.inception,
        'Insured': processObj.insured,
        'ObjectType': processObj.ObjectType
    }

    var newProcess = await addData("Process", createProcess);

    var createTask = {
        '__metadata': { type: "SP.Data.TasksListItem" },
        'Title': processObj.reference,
        'FlowTypeId': idFlowType,
        'ProcessId': newProcess.Id,
        'TaskStatusId': 1,
        'IsLast': true,
        'Office': processObj.office,
        'Client': processObj.client,
        'DueDate': processObj.dueDate,
        'Inception': processObj.inception,
        'Insured': processObj.insured,
        'ObjectType': processObj.ObjectType
    }

    var newTask = await addData("Tasks", createTask);

    AddRegisterHistoryProcess(processObj.reference, "created", await GetFlowTypeName(idFlowType), "Pending", "HistoryProcessBilling");

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

    if (flowType.length == 0)
        return true;
    else
        return (flowType[0].TaskType == "Generic") ? true : false;
}

async function AddAllDocumentsTasks(ref) {
    for (let index = 1; index < 6; index++) {
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


async function UpdateStatusAccountEndorsement(status, idEntity, type) {


    var updatedata = {
        '__metadata': { type: "SP.Data." + type + "ListItem" },
        'Status': status
    }

    updateData(type, idEntity, updatedata);
}

async function UpdateStatusAccountReason(status, idAccount, reason) {
    var updatedata = {
        '__metadata': { type: "SP.Data.AccountsListItem" },
        'Status': status,
        'ReasonId': reason
    }

    updateData("Accounts", idAccount, updatedata);
}

async function UpdateStatusEndorsementReason(status, idEndorsement, reason) {
    var updatedata = {
        '__metadata': { type: "SP.Data.EndorsementListItem" },
        'Status': status,
        'ReasonId': reason
    }

    updateData("Endorsement", idEndorsement, updatedata);
}

async function GetStatusNameById(idStatus) {
    var status = await getData("TaskStatus", "?$filter=(ID eq " + idStatus + ")");

    return status[0].Title;
}

async function CreateNewTaskClaim(taskClaim) {
    showSpinner();

    return addData("TasksClaims", taskClaim);

    //showErrorMessage("Create new task successfully.");

    //hideSpinner();
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


async function GetDocuments(reference, selector, resolve) {

    var docs;
    $(selector).html("");
    docs = await getData("DocumentsTasks", "?$select=*,DocumentStatus/Title&$expand=DocumentStatus&$select=Editor/Title&$expand=Editor" +
        "&$filter=(Title eq '" + reference + "')");


    docs.forEach((doc, index) => {
        $(selector).append($("<li class='list-group-item li-modal li-documents'><div class='row'><div class='col'>" + doc.DocumentStatus.Title + "</div><div class='col'>" + (doc.N_x002f_A == true ? "<span class='badge badge-primary badge-pill'><i class='fa fa-circle' aria-hidden='true'></i></span>" : "") + "</div><div class='col'>" + (doc.Pending == true ? "<span class='badge badge-danger badge-pill'><i class='fa fa-circle' aria-hidden='true'></i></span>" : "") + "</div><div class='col'>" + (doc.OK == true ? "<span class='badge badge-success badge-pill'><i class='fa fa-circle' aria-hidden='true'></i></span>" : "") + "</div></div></li>"

        ));


    });
    resolve();
}

async function ClickViewSummary(ref, listName) {
    showSpinner();
    var type;
    if (ref.split("-").length > 2)
        type = "endorsement";
    else
        type = "account"

    var accountData = await getData(listName, "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(Reference eq '" + ref + "')");


    $("#mSummaryReference").html("<a href=\"" + _spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accountData[0].Reference + "&type=" + type + "\" target='_blank'>" + accountData[0].Reference + "</a>");
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

    var processData = await getData("Process", "?$select=*,Reason/Title&$expand=Reason&$select=Status/Title&$expand=Status&$filter=(Title eq '" + ref +
        "')&$orderby=ID desc");

    if (processData.length > 0) {
        $("#mSummaryStatus").html(processData[0].Status.Title);
        $("#mSummaryStatus").removeClass();
        $("#mSummaryStatus").addClass("modal-label-info " + setColorStatus(processData[0].Status.Title, "label"));
        var dueDate = processData[0].DueDate != null ? processData[0].DueDate.split("T")[0] : "-";
        $("#mSummaryDueDate").html(dueDate);

        if (processData.ReasonId) {
            $("#mSummaryReason").html(accountData[0].Reason.Title);
        } else $("#divSummaryReason").hide();

        GetDocuments(ref, "#documentList", function () {
            console.log("documents loaded");
        });
        LoadComments("#mSummaryComments", ref);

        if (processData[0].Status.ID != 6) {
            var tasks = await getData("Tasks", "?$select=*,FlowType/Title&$expand=FlowType&$select=Author/Title,AssignTo/Title&$expand=Author,AssignTo&$select=TaskStatus/Title&$expand=TaskStatus&$select=Reason/Title&$expand=Reason" +
                "&$filter=(Title eq '" + ref + "')and(IsLast eq 1)&$orderby=ID desc");

            tasks.forEach(async task => {
                if (task.FlowTypeId != 9 && task.FlowTypeId != 10 && task.FlowTypeId != 11) {
                    $("#mSummaryBillingFlowType").html(task.FlowType.Title + ": ");
                    $("#mSummaryBillingTaskStatus").html(task.TaskStatus.Title);
                    $("#mSummaryBillingTaskStatus").removeClass();
                    $("#mSummaryBillingTaskStatus").addClass("modal-label-info " + setColorStatus(task.TaskStatus.Title, "label"));
                    $("#mSummBillingAssignedTo").html(task.AssignTo.Title);



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
                    $("#mSummaryEoCTaskStatus").removeClass();
                    $("#mSummaryEoCTaskStatus").addClass("modal-label-info " + setColorStatus(task.TaskStatus.Title, "label"));
                    $("#mSummEoCAssignedTo").html(task.AssignTo.Title);

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
                        .append("<label class=\"modal-label-title\">Status:</label>&nbsp;<label class=\"modal-label-info " + setColorStatus(endorsement.Status, "label") + "\">" + endorsement.Status + "  </label>")
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
                var strTask = (log.Title == "created") ? "Se creó la tarea" : "La tarea";
                var strStatus = (log.Title == "created") ? "en estado" : "pasó a estado";
                var color = "";
                switch (log.Status) {
                    case "Suspended":
                        color = "orange";
                        break;
                    case "Cancelled":
                        color = "red";
                        break;
                    case "Completed":
                        color = "#009619";
                        break;
                    default:
                        color = "#f0e800";
                        break;
                }
                $("#collapseProcessLog").append($("<div class=\"\"></div>")
                    .append("&nbsp;<label class=\"modal-label-info\">" + log.Created.split('T')[0] + " " + log.Created.split('T')[1].replace('Z', "") + " " + log.Author.Title +
                        " </label>&nbsp;<label class=\"modal-label-info\">" + strTask + "</label>&nbsp;<label class=\"modal-label-title\">" + log.Task + "</label>" +
                        "&nbsp;<label class=\"modal-label-info\">" + strStatus +
                        "</label>&nbsp;<label class=\"modal-label-title\" style=\"color: " + color + ";\">" + log.Status + "</label>" +
                        "<br>")
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


//TODO: Finalize this method. We have pending renderize the task panel.

async function ClickViewClaimSummary(ref, listName) {
    showSpinner();

    var accountData = await getData(listName, "?$select=*&$filter=(ID eq '" + ref + "')");
    if ($.fn.DataTable.isDataTable('#dtAllClaimTasks')) {
        $('#dtAllClaimTasks').dataTable().fnClearTable();
        $('#dtAllClaimTasks').dataTable().fnDestroy();
    }

    $("#mSummaryReference").html(accountData[0].ClaimReference);
    $("#mSummaryReference").attr('href', _spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + accountData[0].ID + "&type=view&mode=view");
    $("#mSummaryReference").attr('target', "_blank");

    $("#mSummaryBusinessReference").html(accountData[0].BusinessReference);
    $("#mSummaryBusinessReference").attr('href', _spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + accountData[0].BusinessReference + "&type=account&mode=view");
    $("#mSummaryBusinessReference").attr('target', "_blank");

    $("#mSummaryReinsured").html(accountData[0].Reinsured);
    $("#mSummaryClient").html(accountData[0].Client);
    $("#mSummaryDescription").html(accountData[0].Description);
    $("#mSummaryOcurrenceDate").html(accountData[0].OccurrenceDate);

    //$("#mSummaryBusinessLine").html(accountData[0].BusinessLine);
    $("#mSummaryCedentReference").html(accountData[0].CedentReference);
    $("#mSummaryOcurrenceDate").html(accountData[0].OccurrenceDate);

    $("#divSummaryCurrentTasks").show();

    $("#collapseProcessLog").html("");


    $("#tAllTaskClaims").html('');
    LoadComments("#mSummaryComments", ref);

    var tasks = await getData("TasksClaims", "?$select=*,AssignTo/Title&$expand=AssignTo&$select=FlowTypeClaim/Title&$expand=FlowTypeClaim&$select=TaskClaimStatus/Title&$expand=TaskClaimStatus" +
        "&$filter=(InternalReference eq '" + ref + "')&$orderby=ID desc");

    tasks.forEach(async task => {

        $("#tAllTaskClaims").append($("<tr></tr>")
            .append($("<td>" + task.ID + "</td>"))
            .append($("<td>" + task.FlowTypeClaim.Title + "</td>"))
            .append($("<td>" + task.Modified.split('T')[0] + "</td>"))
            .append($("<td>" + (task.AssignToId == null ? "Not assigned" : task.AssignTo.Title) + "</td>"))
            .append($("<td class='" + setColorStatus(task.TaskClaimStatus.Title, "label") + "'>" + task.TaskClaimStatus.Title + "</td>"))
            //.append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + task.ID + "');\">View Task</button></td>"))
        );

    });

    dataTableTasks = addDataTable('dtAllClaimTasks');

    dataTableTasks.column(0).visible(false);

    var taskHistoryLogs = await getData("HistoryClaimTasks", "?$select=*,Author/Title&$expand=Author&$filter=(Reference eq '" + ref + "')&$orderby=ID")


    taskHistoryLogs.forEach(log => {
        var strTask = (log.Title == "created") ? "Se creó la tarea" : "La tarea";
        var strStatus = (log.Title == "created") ? "en estado" : "pasó a estado";
        var color = "";
        switch (log.Status) {
            case "Suspended":
                color = "orange";
                break;
            case "Cancelled":
                color = "red";
                break;
            case "Completed":
                color = "#009619";
                break;
            default:
                color = "#f0e800";
                break;
        }
        $("#collapseProcessLog").append($("<div class=\"\"></div>")
            .append("&nbsp;<label class=\"modal-label-info\">" + log.Created.split('T')[0] + " " + log.Created.split('T')[1].replace('Z', "") + " " + log.Author.Title +
                " </label>&nbsp;<label class=\"modal-label-info\">" + strTask + "</label>&nbsp;<label class=\"modal-label-title\">" + log.Task + "</label>" +
                "&nbsp;<label class=\"modal-label-info\">" + strStatus +
                "</label>&nbsp;<label class=\"modal-label-title\" style=\"color: " + color + ";\">" + log.Status + "</label>" +
                "<br>")
        );
    });

    //    else {
    //        $("#divSummaryReason").hide();
    //        $("#divSummaryCurrentTasks").hide();
    //        //$("#divSummaryEndorsements").hide();
    //    }
    //}
    //else {
    //    $("#divSummaryReason").hide();
    //    $("#divSummaryCurrentTasks").hide();
    //    //$("#divSummaryEndorsements").hide();
    //}

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


//TODO: Change method to receive list parameter.
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


async function LoadClaimTasksComments(selector, ref) {
    $(selector).html("");

    var comments = await getData("ClaimsTasksComments", "?$select=*,Author/Title&$expand=Author&$filter=(ClaimReference eq '" + ref + "')&$orderby=ID desc");

    if (comments.length > 0) {
        comments.forEach(item => {
            $(selector).append($("<div class=\"modal-comment-content\"><label>" + item.Created.replace('T', " ").replace('Z', "") + " - " + item.Author.Title +
                " - " + item.TaskType + "</label><br><label class=\"label-comment\">" + item.Comments + "</label></div>"));
        });
    }
    else {
        if (selector == "#mSummaryComments") $(selector).append($("<div style=\"text-align-last: center; padding: 20%;\"><label>Sin Comentarios</label></div>"));
    }
}

function showErrorMessage(msg) {

    $("#error").html(msg);
    $('#errorMsgModal').modal("show");
}

function searchDocs() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("docSearchInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("tbRelatedDocuments");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 2; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[2];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}




//Folder Navigator

function folderClick(selectedFolder, goup, complete) {

    if (goup) { levelsBreadcrumb.paths.push(selectedFolder.trim()); }
    $(".breadcrumb").html("");

    var liHtml = "";

    levelsBreadcrumb.paths.forEach(function (value, index) {

        if (index == levelsBreadcrumb.paths.length - 1) {

            liHtml = '<li class="breadcrumb-item active" data-folder="' + value + '" aria-current="page">' + value + '</li>';

        }

        else {

            liHtml = '<li class="breadcrumb-item" data-folder="' + value + '" aria-current="page"><a href="#" onclick=breadcrumbClick("' + value + '")>' + value + '</a></li>';

        }
        $(".breadcrumb").append(liHtml);
    });

    var pathToQueryList = levelsBreadcrumb.paths.slice();

    pathToQueryList.shift();

    var pathToQuery = pathToQueryList.length == 0 ? "/" : pathToQueryList.join("/");

    complete(pathToQuery);
}

function breadcrumbClick(selectedFolder) {

    var count = levelsBreadcrumb.paths.length - 1;
    var indexSelected = levelsBreadcrumb.paths.indexOf(selectedFolder);

    levelsBreadcrumb.paths.splice(indexSelected + 1, (levelsBreadcrumb.paths.length - 1 == indexSelected + 1 ? 1 : levelsBreadcrumb.paths.length - 1));

    folderClick(selectedFolder, false, function (newPath) {
        if (newPath == "/") {
            getRelatedDocuments(currentRootPath, "#tRelatedDocuments");
        }
        else {
            getRelatedDocuments(currentRootPath + "/" + newPath, "#tRelatedDocuments");
        }
    });

}

function resetBreadcrumb() {

    var levels = '<li class="breadcrumb-item active" aria-current="page">Home<li>';
    levelsBreadcrumb = { levels: levels, paths: [] }
    levelsBreadcrumb.paths.push("Home");
    $(".breadcrumb").html(levels);
}

async function getUserIdByTitle(title) {
    return getDataPromise("Users", "?$select=*,User/Id&$expand=User&$filter=(substringof('" + title + "',Title))");
}

async function getDataPromise(listName, filter = "") {
    if (filter == "") {
        filter = "?$top=10000";
    }
    else {

        filter = filter.includes("&$top") ? filter : (filter + "&$top=10000");
    }
    var url = urlBase + "('" + listName + "')/Items" + filter;

    return $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" }
    });
}

async function addDataPromise(listName, itemProperties) {
    var url = urlBase + "('" + listName + "')/Items";
    return $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + url,
        type: "POST",
        data: JSON.stringify(itemProperties),
        headers:
        {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "POST"
        }
    });
}

function isValidDateFormat(dateString) {
    var regexDate = /^\d{4}-\d{2}-\d{2}$/;

    if (!regexDate.test(dateString)) {
        return false;
    }

    return true;
}

function getArrayDistinct(array, field, isDirectory) {
    let distinct = [];
    let seen = new Set();

    array.forEach(element => {
        if (field != "") {
            if (!seen.has(element[field])) {
                seen.add(element[field]);
                distinct.push({ name: element[field], isDirectory });
            }
        }
        else {
            distinct.push({ name: element.fileName, isDirectory });
        }
    });

    return distinct;
}

function getDataClaimWebApi(claimReference, completed) {
    $.ajax({
        url: urlDocumentManagerApiReinsurance + "Claims/GetClaimByClaimReference?claimReference=" + claimReference,
        type: "get",
        crossDomain: true,
        cache: false,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function (data) {
            completed(data);
        }
    });
}

function updateClaimWebApi(data, completed, error) {
    let url = `${urlDocumentManagerApiReinsurance}Claims/UpdateClaim/`;
    $.ajax({
        url: url,
        type: "post",
        crossDomain: true,
        cache: false,
        processData: false,
        contentType: "application/json",
        data: JSON.stringify(data),
        dataType: "text",
        success: function (data) {
            completed(data);
        },
        error: function (err) {
            console.log(err);
            error(err);
        }
    });
}

function formatMoney() {
    let amount = document.getElementById("claimedAmount").value;
    // let clearAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));

    // if (!isNaN(clearAmount)) {
    //     let amountFormat = clearAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    //     document.getElementById("claimedAmount").value = amountFormat;
    // }

    let numericInput = amount.replace(/[^\d.,]/g, '');
    numericInput = numericInput.replace(/[,|.](?=.*[,.])/g, '');
    let parts = numericInput.split(/[,.]/);
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (decimalPart.length === 1) {
        decimalPart = decimalPart.padEnd(2, '0');
    }
    else {
        if (decimalPart.length >= 3) {
            decimalPart = decimalPart.slice(0, 2);
        }
    }
    let formattedInput = integerPart + (decimalPart ? ',' + decimalPart : '');
    formattedInput = '$' + formattedInput;
    document.getElementById("claimedAmount").value = formattedInput;
}

function formatClaimedAmount(element) {
    document.getElementById(element).addEventListener('input', function () {
        var newVal = this.value;
        newVal = parseFloat(newVal.replace(/[^\d.-]/g, '').replaceAll('.', ''));

        if (!isNaN(newVal)) {
            var long = newVal.toString().length;
            var firstPart = parseFloat(newVal.toString().substring(0, long - 2)).toLocaleString('es-ES');
            var secondPart = newVal.toString().substring(long - 2);

            let amountFormat = (isNaN(parseFloat(firstPart))) ? newVal : firstPart + ',' + secondPart;
            this.value = amountFormat;
        }
    });
}