console.log("Loading: Sinaptic.Willis.ViewClaim.js")

var claims;
var userOffice;
var isNew = false;
var reference;
var businessReference;
var attach = true;
var accountData;
var accountList = "Accounts";
var newClaimId;
var firstTaskListLoaded = true;
var sessionData = {};
Dropzone.autoDiscover = false;
var isViewMode = false;

var teamLeaderClaimsId = 6;
var analystClaimsId = 7;

var teamLeaderClaimsName = "Team Leader Claims";
var claimHandlerName = "Claim Handler";

var claimData = {};

var selectedNameFile = "";

var modalConfirm = function (callback) {
    $("#modal-btn-yes").on("click", function () {
        $(this).prop("onclick", null).off("click");
        callback(true);
    });
    $("#modal-btn-no").on("click", function () {
        $(this).prop("onclick", null).off("click");
        callback(false);
    });
};

$(function () {
    this.$slideOut = $('#slideOut');
    this.$slideOutList = $('#slideOutList');

    $("#divDropzone").show();

    // Slideout show
    this.$slideOut.find('.slideOutTab').on('click', function () {
        $("#slideOut").toggleClass('showSlideOut');
        $("#slideOut").hasClass('showSlideOut') ? $("#slideOut").attr('position', 'absolute') : $("#slideOut").attr('position', 'fixed');
    });

    this.$slideOutList.find('.slideOutTabList').on('click', function () {
        $("#slideOutList").toggleClass('showSlideOut');
        $("#slideOutList").hasClass('showSlideOut') ? $("#slideOutList").attr('position', 'absolute') : $("#slideOut").attr('position', 'fixed');
    });
    $(document).ready(function () {
        clickReset();
        formatClaimedAmount('viewClaimedAmount');
        formatClaimedAmount('claimedAmount');

        $("#dropzoneCommon").dropzone({
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
    });

    $("#bUploadFile").on("click", async function () {
        uploadFileList("#dropzoneCommon")
    });

    $("#bDiscardFile").on("click", function () {
        $("#dropzoneCommon")[0].dropzone.removeAllFiles();
    });

    clickAttach();

    validatePage();

    //validateDocumentLibrary(sharePointLibrary + "/" + reference);
});

async function validatePage() {
    reference = window.location.search.substring(window.location.search.substring().search("ref")).split("&")[0].split("=")[1];

    if (window.location.search.substring(window.location.search.substring().search("type")).split("=")[1] == "new")
        isNew = true;

    if (window.location.search.substring(window.location.search.substring().search("mode")) != null)
        if (window.location.search.substring(window.location.search.substring().search("mode")).split("=")[1] == "view") {
            //disableCommandBar();
            isViewMode = true;
        }


    userOffice = await getUserOffice();

    accountData = await getData(accountList, "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(Reference eq '" + reference + "')");
    //$("#office").val(userOffice.Office);
    var OfficeArray = [];
    var OfficeStr = "";
    for (var indexOffice = 0; indexOffice < userOffice.results.length; indexOffice++) {
        OfficeArray.push(userOffice.results[indexOffice].Office);
        OfficeStr += userOffice.results[indexOffice].Office;
        if (userOffice.results.length > (indexOffice + 1)) {
            OfficeStr += ";";
        }
    };

    //$("#office").val(OfficeStr);

    var arrayOffices = OfficeStr.split(";");
    for (var i = 0; i < arrayOffices.length; i++) {

        $("#office").append($("<option value=\"" + arrayOffices[i] + "\">" + arrayOffices[i] + "</option>"));

    }

    getListsFlowTypeClaim("#oFlowType", "clickCreateTask");

    if (isNew) {
        setNewConfigControls();
        getNewClaim();
    }
    else {
        $("#referenceTitle").html("");
        getViewClaim();
    }

    $("#mDocumentation").on("click", function () {

        clickViewRelatedDocuments();

    });

    $("#closeRelatedDoc").on("click", function () {
        $("#relatedDocumentModal").modal("hide");
    });
}

async function getNewClaim() {
    $("#subtitle").html("New Claim");

    $(".row-info-account").hide();

    $("#bEditClaim").prop("disabled", true);
    $("#bNewClaim").prop("disabled", true);
    $("#bRequestProcess").prop("disabled", true);

    $("#bAttach").prop("disabled", true);
    $("#reinsured").prop("disabled", true);
    $("#office").prop("disabled", false);

    $("#businessReference").val(reference);

    $("#client").val(accountData[0].Client);
    $("#reinsured").val(accountData[0].OriginalInsured);
    $("#confirmedAmount").prop("disabled", true);
    $("#prescriptionDate").prop("disabled", false);
    //$("#client").prop("disabled", true);
    //$("#reinsured").prop("disabled", true);

    $('#processRequestUser').append($("<option value=\"" + _spPageContextInfo.userDisplayName + "\">" + _spPageContextInfo.userDisplayName + "</option>"));

    $("#processRequestUser").val(_spPageContextInfo.userDisplayName || "");

    //clickEditClaim();

    getListsViewClaim().then(res => {


    });

    loadRelatedTasks();
}

async function getViewClaim() {
    $("#subtitle").html("View Claim");

    claim = await getData("Claims", "?$select=*,ProcessRequestUser/Title&$expand=ProcessRequestUser&$filter=(ID eq '" + reference + "')");

    getDataClaimWebApi(claim[0].ClaimReference, function (data) {
        claimData = (data == null) ? {} : data;
    });

    selectedClaimID = claim[0].ID;
    businessReference = claim[0].BusinessReference;

    if (!isNew) {
        accountData = await getData(accountList, "?$select=*,UserAccount/Title&$expand=UserAccount&$filter=(Reference eq '" + businessReference + "')");
    }

    sessionData = { reference: businessReference }
    localStorage.setItem('sessionData', JSON.stringify(sessionData));

    //$("#linebusiness").val(claim[0].BusinessLine || "");

    $("#office").val(claim[0].Office || "");
    $("#claimDescription").val(claim[0].Description || "");
    $("#occurrenceDate").val(claim[0].OccurrenceDate != null ? claim[0].OccurrenceDate.split("T")[0] : "");
    $("#reinsured").val(claim[0].Reinsured || "");
    $("#cedentReference").val(claim[0].CedentReference || "");
    $("#businessReference").val(claim[0].BusinessReference || "");
    $("#client").val(claim[0].Client || "");
    //$("#wUKReference").val(claim[0].WillisUKReference || "");
    $("#claimReference").val(claim[0].ClaimReference || "");
    $("#prescriptionDate").val(claim[0].PrescriptionDate != null ? claim[0].PrescriptionDate.split("T")[0] : "");

    if (claim[0].ProcessRequestUser != null)
        $('#processRequestUser').append($("<option value=\"" + claim[0].ProcessRequestUser.Title + "\">" + claim[0].ProcessRequestUser.Title + "</option>"));

    $("#processRequestUser").val(claim[0].ProcessRequestUser.Title || "");
    $("#comments").val(claim[0].Comments || "");
    //$("#montoReclamado").val(claim[0].ClaimedAmount || 0);

    $('#confirmedAmount').prop('checked', (claim[0].ConfirmedAmount)).change();

    $("#bActionSave").prop("disabled", true);
    $("#office").prop("disabled", true);
    $("#bActionReset").prop("disabled", true);
    $("#bCreateTask").prop("disabled", false);

    if (!isViewMode) {
        $("#bEditClaim").prop("disabled", false);
        $("#bNewClaim").prop("disabled", false);
    }

    var profile = await getUserProfile();
    if (profile.ProfileId == teamLeaderClaimsId || profile.ProfileId == analystClaimsId) {
        $("#viewClaimedAmount").prop("disabled", false);
        $("#bModalTaskSave").show();
    }
    else {
        $("#viewClaimedAmount").prop("disabled", true);
        $("#bModalTaskSave").hide();
    }

    $("#referenceTitle").html("");
    $("#referenceTitle").append(claim[0].ClaimReference);

    //validateDocumentLibrary(sharePointLibrary + "/" + claim[0].BusinessReference + "/" + claim[0].Id);
    var pathDocumentLibrary = claim[0].BusinessReference.replace(/\-/g, "") + "\\" + selectedClaimID;

    //varable used to create browser file module in Sinaptic.Willis.Service.js
    currentRootPath = pathDocumentLibrary;
    getRelatedDocuments(pathDocumentLibrary, "#tRelatedDocuments");

    getListsViewClaim().then(res => {
        $("#cause").val(claim[0].Cause);
        $("#coverBasis").val(claim[0].CoverBasis);
        $("#status").val(claim[0].ClaimStatus || "");
    });

    loadRelatedTasks();
}

function disableCommandBar() {
    $("#bEditClaim").prop("disabled", true);
    $("#bCreateTask").prop("disabled", true);
}


async function clickEditClaim() {
    $("#claimDescription").prop("disabled", true);
    $("#occurrenceDate").prop("disabled", true);
    $("#reinsured").prop("disabled", true);
    $("#cedentReference").prop("disabled", true);
    $("#coverBasis").prop("disabled", true);
    $("#cause").prop("disabled", true);
    //$("#processRequestUser").prop("disabled", false);
    $("#businessReference").prop("disabled", true);
    $("#client").prop("disabled", true);
    //$("#wUKReference").prop("disabled", false);
    $("#claimReference").prop("disabled", false);
    $("#comments").prop("disabled", false);
    $("#office").prop("disabled", false);

    $("#bActionSave").prop("disabled", false);
    $("#bActionReset").prop("disabled", false);

    var profile = await getUserProfile();
    if (profile.ProfileId !== teamLeaderClaimsId && profile.ProfileId !== analystClaimsId) {
        $("#status").prop("disabled", false);
        $("#prescriptionDate").prop("disabled", false);
    }
}

function setNewConfigControls() {
    $("#claimDescription").prop("disabled", false);
    $("#occurrenceDate").prop("disabled", false);
    $("#reinsured").prop("disabled", false);
    $("#coverBasis").prop("disabled", false);
    $("#cause").prop("disabled", false);
    $("#cedentReference").prop("disabled", false);
    $("#comments").prop("disabled", false);
    $("#status").prop("disabled", false);
    //$("#montoReclamado").prop("disabled", false);
    //$("#processRequestUser").prop("disabled", false);
    $("#businessReference").prop("disabled", true);
    $("#client").prop("disabled", true);
    //$("#wUKReference").prop("disabled", true);
    $("#claimReference").prop("disabled", true);
    $("#prescriptionDate").prop("disabled", false);

    $("#bActionSave").prop("disabled", false);
    $("#bActionReset").prop("disabled", false);
}

async function clickSave() {

    showSpinner();

    var status = isNew ? "Abierto" : $("#status").val();
    var processRequestUsertId = isNew ? _spPageContextInfo.userId : claim[0].ProcessRequestUserId;

    if (validateForm()) {

        var dataSave = {
            '__metadata': { type: "SP.Data.ClaimsListItem" },
            'Office': $("#office").val(),
            'Description': $("#claimDescription").val(),
            'OccurrenceDate': $("#occurrenceDate").val(),
            'Reinsured': $("#reinsured").val(),
            'CedentReference': $("#cedentReference").val(),
            'ClaimStatus': status,
            'ProcessRequestUserId': processRequestUsertId,
            'BusinessReference': $("#businessReference").val(),
            'BusinessLine': accountData[0].LineBusiness,
            'Client': $("#client").val(),
            'WillisUKReference': accountData[0].WillisUKReference,
            'ClaimReference': $("#claimReference").val(),
            'Cause': $("#cause").val(),
            'CoverBasis': $("#coverBasis").val(),
            'ObjectType': accountData[0].ObjectType,
            //'ClaimedAmount': $("#montoReclamado").val(),
            'ConfirmedAmount': $("#confirmedAmount").prop("checked"),
            'Comments': $("#comments").val(),
            'PrescriptionDate': $("#prescriptionDate").val()
        }

        $("#referenceTitle").html("");
        $("#tRelatedDocuments").html("");

        if (isNew) {
            var newClaim = await addData("Claims", dataSave);
            newClaimId = newClaim.Id;
            $("#bAttach").prop("disabled", false);

            if (newClaim.ClaimReference == null) {
                var updateClaim = {
                    '__metadata': { type: "SP.Data.ClaimsListItem" },
                    'ClaimReference': "ProvisionalId:" + newClaim.Id.toString()
                }

                updateData("Claims", newClaim.Id, updateClaim);
            }

            var newDataClaim = {
                Reference: $("#businessReference").val(),
                ClaimReference: newClaim.Id.toString(),
                UserSharepoint: _spPageContextInfo.userEmail,
                Prescription: $("#prescriptionDate").val()
            }

            updateClaimWebApi(newDataClaim, function (data) {
                claimData = data;
            }, function (error) {
                console.log(error);
            });

            //addFolderDocumentLibrary(sharePointLibrary + "/" + $("#businessReference").val(), newClaim.Id, function (resp) {

            //    if (resp == "Ok")
            //        successNewFolder(newClaim.Id);
            //    else
            //        showErrorMessage("An error occurred while saving the item. Please try again or contact your system admin.");

            //});

            hideSpinner();
            successNewClaim(newClaim.Id);
        }
        else {
            updateData("Claims", claim[0].Id, dataSave, "updateAccount");

            hideSpinner();

            if (claim[0].ClaimReference != $("#claimReference").val()) {

                showSpinnerWithText("Updating task references. One moment please.");

                var tasks = await getData("TasksClaims", "?$filter=InternalReference eq '" + claim[0].Id + "'");

                $("#tAccounts").html("");

                tasks.forEach((task, indexAccount) => {

                    var dataSave = {
                        '__metadata': { type: "SP.Data.TasksClaimsListItem" },
                        'Title': $("#claimReference").val()
                    }

                    updateData("TasksClaims", task.ID, dataSave);
                });

                hideSpinner();
            }

            claimData.Reference = $("#businessReference").val();
            claimData.ClaimReference = $("#claimReference").val();
            claimData.UserSharepoint = _spPageContextInfo.userEmail;
            claimData.Prescription = $("#prescriptionDate").val();

            updateClaimWebApi(claimData, function (data) {
                claimData = data;
            }, function (error) {
                console.log(error);
            });

            showErrorMessage("The claim has been updated succesfully.");
        }
    }
    else {
        showErrorMessage("There are required fields or the date is incorrect.");
        hideSpinner();
    }
}

function successNewClaim(ref) {
    showErrorMessage("The claim has been registered succesfully.");

    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + ref + "&type=view", '_self');
}

function clickCancel() {
    window.open(_spPageContextInfo.webAbsoluteUrl, '_self');
}

function clickReset() {
    $("#office").prop("disabled", true);
    $("#cause").prop("disabled", true);
    $("#coverBasis").prop("disabled", true);
    $("#prescriptionDate").prop("disabled", true);

    $("#claimDescription").prop("disabled", true);
    $("#occurrenceDate").prop("disabled", true);
    $("#reinsured").prop("disabled", true);
    $("#cedentReference").prop("disabled", true);
    $("#processRequestUser").prop("disabled", true);
    $("#businessReference").prop("disabled", true);
    $("#status").prop("disabled", true);
    $("#linebusiness").prop("disabled", true);
    $("#client").prop("disabled", true);
    //$("#wUKReference").prop("disabled", true);
    $("#claimReference").prop("disabled", true);
    $("#comments").prop("disabled", true);
    //$("#montoReclamado").prop("disabled", true);

    $("#bActionSave").prop("disabled", true);
    $("#bActionReset").prop("disabled", true);

    $("#referenceTitle").html("");
    $("#tRelatedDocuments").html("");

    getViewClaim();
}

async function uploadFileList(selector) {
    var uploadFiles = [];
    for (var i = 0; i < $(selector)[0].dropzone.files.length; i++) {
        file = $(selector)[0].dropzone.files[i];
        if (i != $(selector)[0].dropzone.files.length - 1) {
            var str = file.name.substr(0, file.name.lastIndexOf('.')) || file.name;
            if (containsInvalidCharacters(str) || (file.name.length > 200)) {
                alert('El documento: ' + file.name + ' no puede contener caracteres especiales o ser mayor a 150 caracteres.');
            }
            else {
                uploadFiles.push(UploadMe(file, file.name, false));
            }
        } else {
            var str = file.name.substr(0, file.name.lastIndexOf('.')) || file.name;
            if (containsInvalidCharacters(str) || (file.name.length > 200)) {
                alert('El documento: ' + file.name + ' no puede contener caracteres especiales o ser mayor a 150 caracteres.');
            }
            else {
                uploadFiles.push(UploadMe(file, file.name, true));
            }
        }
    }

    Promise.all(uploadFiles).then(() => {
        hideSpinner();
        var basePathDocument = businessReference.replace(/\-/g, "") + "\\" + selectedClaimID;
        getRelatedDocuments(basePathDocument, "#tRelatedDocuments");
        $("#dropzoneCommon")[0].dropzone.removeAllFiles();
        resetBreadcrumb();
    });
}

async function UploadMe(readFile, fileName, isLast) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(readFile);
    reader.fileName = fileName;
    reader.isLast = isLast;
    reader.onprogress = updateProgress;
    reader.onload = await loadedFileClaim(readFile);
}

var nameFile = "";
var dataFile = "";
var pathDocumentLibrary = "";
async function loadedFileClaim(evt) {
    dataFile = {
        '__metadata': { type: "SP.Data.FileLogListItem" }
    }
    showSpinner();
    if (reference == null) {
        hideSpinner();
        showErrorMessage("First you need to create an account and then try to attach files.");
    }
    else {
        var section = `Documentos ${(userProfile === claimHandlerName) ? "iniciales" : "finales"} de la tarea`;
        var ref = `${businessReference.replace(/\-/g, "")}`;
        var dateFolder = new Date().toISOString().split("T")[0];

        console.log(levelsBreadcrumb);
        if (levelsBreadcrumb.paths.length == 4) {
            if (levelsBreadcrumb.paths[1] == "Documentos iniciales de la tarea") {
                var formData = new FormData();
                formData.append('filesUploads.File', evt);
                formData.append('filesUploads.FilePath.Reference', ref);
                formData.append('filesUploads.FilePath.Section', section);
                formData.append('filesUploads.FilePath.ClaimId', selectedClaimID);
                formData.append('filesUploads.FilePath.TaskType', levelsBreadcrumb.paths[2]);
                formData.append('filesUploads.FilePath.TaskId', levelsBreadcrumb.paths[3]);
                formData.append('filesUploads.FilePath.Path', `${ref}\\${selectedClaimID}\\${section}\\${levelsBreadcrumb.paths[2]}\\${levelsBreadcrumb.paths[3]}\\${dateFolder}`);
                formData.append('filesUploads.FilePath.FileName', evt.name);
                formData.append('filesUploads.FilePath.Date', dateFolder);
                formData.append('filesUploads.FilePath.UserEmail', _spPageContextInfo.userEmail);

                nameFile = evt.name;

                await uploadFileWebApi(formData);
            }
            else {
                showErrorMessage("You must select the task folder");
            }
        }
        else {
            showErrorMessage("You must select the task folder");
        }

        hideSpinner();
    }
}

function showErrorFile(error) {
    var html = "<div class='modal' id='ErrorFileModal' aria-hidden='true' style='opacity: initial; overflow: auto;'>";
    html += "<div class='modal-dialog modal-dialog-centered' role='document'>";
    html += "<div class='modal-content'>";
    html += "<div class='modal-header popup-header'>";
    html += "<h5 class='modal-title'>System Message</h5>";
    html += "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>×</span> </button> </div>";
    html += "<div class='modal-body'>";
    html += "<p id='error'>" + error + "</p>";
    html += "</div>";
    html += "<div class='modal-footer'>";
    html += "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button> </div>";
    html += "</div>";
    html += "</div>";
    html += "</div>";
    $("#errorMsgModal").after(html);
    $('#ErrorFileModal').modal("show");
}

function updateProgress(evt) { }

function validateDeleteFile(nameFile) {
    var basePathDocument = businessReference.replace(/\-/g, "") + "\\" + selectedClaimID;
    selectedNameFile = nameFile;

    if (levelsBreadcrumb.paths[1] == "Documentos iniciales de la tarea") {
        var pathValDocument = basePathDocument + "\\" + "Documentos finales de la tarea";
        getRelatedDocumentsCallback(pathValDocument, callbackDeleteFile, function (error) {
            clickDeleteFile();
        });
    }
    else {
        if (userProfile == teamLeaderClaimsName)
            clickDeleteFile();
        else
            showErrorMessage("You do not have permissions for this action.");
    }
}

function callbackDeleteFile(data) {
    if (data.length != 0)
        showErrorMessage("You do not have permissions for this action.");
    else
        clickDeleteFile();
}

async function clickDeleteFile() {
    $('#mMsjConfirmar').html("Do you confirm to delete this file?");
    $("#mConfirm").modal("show");

    modalConfirm(async function (confirm) {
        if (confirm) {
            var basePathDocument = businessReference.replace(/\-/g, "") + "\\" + selectedClaimID;
            var pathDocument = basePathDocument;
            for (let index = 1; index < levelsBreadcrumb.paths.length; index++) {
                pathDocument += "\\" + levelsBreadcrumb.paths[index];
            }
            showSpinner();
            deleteFileWebApi(pathDocument + "\\" + selectedNameFile, function (succesData) {
                hideSpinner();
                if (succesData.msg == "Ok") {
                    showSpinner();
                    selectedNameFile = "";
                    getRelatedDocuments(basePathDocument, "#tRelatedDocuments");
                    hideSpinner();
                    showErrorMessage("The document has been deleted");
                }
                else {
                    showErrorMessage("The file could not be deleted. Please, try again later or contact your sys admin. Ref error: " + succesData);
                }
            });
        }
    });
}

function ClickModalSaveTask() {
    ClickModalSave($("#claimReference").val(), reference);
}

function clickViewFile(Name) {
    var pathDocument = businessReference.replace(/\-/g, "") + "/" + selectedClaimID;
    if (levelsBreadcrumb.paths.length == 1) {

        window.open(urlDocumentManagerApiReinsurance + "File/download?filePath=" + pathDocument + "/" + Name);
    }
    else {
        var pathToQueryList = levelsBreadcrumb.paths.slice();

        pathToQueryList.shift();

        var pathToQuery = pathToQueryList.length == 0 ? "/" : pathToQueryList.join("/");
        window.open(urlDocumentManagerApiReinsurance + "File/download?filePath=" + pathDocument + "/" + pathToQuery + "/" + Name);
    }
}

function clickAttach() {
    attach = !attach;
    if (attach) $("#divDropzone").show();
    else $("#divDropzone").hide();
}

async function getListsViewClaim() {
    //await getListStatus();
    await getStaus();
    //await getListClaimHandler("#processRequestUser", userOffice.Office);
    await getListLineBusiness();

    // getListCurrency()

    $("#cause").append($("<option value=''>Select option</option>"));
    await getCauses("#cause", "Cause");
    $("#coverBasis").append($("<option value=''>Select option</option>"));
    await getGenericOptions("#coverBasis", "CoverBasis");
}

function validateForm() {
    var val = true;

    if ($("#claimDescription").val() == "") {
        val = false;
        $("#claimDescription").css('border-color', 'red');
    }
    else $("#claimDescription").css('border-color', '');

    if ($("#processRequestUser").val() == null) {
        val = false;
        $("#processRequestUser").css('border-color', 'red');
    }
    else $("#processRequestUser").css('border-color', '');

    if ($("#occurrenceDate").val() == "") {
        val = false;
        $("#occurrenceDate").css('border-color', 'red');
    }
    else $("#occurrenceDate").css('border-color', '');

    if ($("#reinsured").val() == "") {
        val = false;
        $("#reinsured").css('border-color', 'red');
    }
    else $("#reinsured").css('border-color', '');

    if ($("#cedentReference").val() == "") {
        val = false;
        $("#cedentReference").css('border-color', 'red');
    }
    else $("#cedentReference").css('border-color', '');

    if ($("#businessReference").val() == "") {
        val = false;
        $("#businessReference").css('border-color', 'red');
    }
    else $("#businessReference").css('border-color', '');

    if ($("#client").val() == "") {
        val = false;
        $("#client").css('border-color', 'red');
    }
    else $("#cause").css('border-color', '');

    if ($("#cause").val() == "") {
        val = false;
        $("#cause").css('border-color', 'red');
    }
    else $("#cause").css('border-color', '');


    if ($("#coverBasis").val() == "") {
        val = false;
        $("#coverBasis").css('border-color', 'red');
    }
    else $("#coverBasis").css('border-color', '');

    if ($("#prescriptionDate").val() == "") {
        val = false;
        $("#prescriptionDate").css('border-color', 'red');
    }
    else $("#prescriptionDate").css('border-color', '');

    return val;
}

function resetValues() {
    $("#claimDescription").val("");
    $("#occurrenceDate").val("");
    $("#reinsured").val("");
    $("#cedentReference").val("");
    $("#businessReference").val("");
    $("#status").val("");
    $("#linebusiness").val("");
    $("#client").val("");
    //$("#wUKReference").val("");
    $("#claimReference").val("");
    $("#comments").val("");
}

function clickCreateTask(idFlowTypeClaim) {

    CreateNewTaskClaim(reference, idFlowTypeClaim);
}


async function getStaus() {
    var status = null;
    status = await getData("StatusClaim", "?$select=*&$orderby=Title asc");

    status.forEach(async item => {
        $("#status").append($("<option value='" + item.Title + "'>" + item.Title + "</option>"));
    });
}

async function loadRelatedTasks() {

    if (!firstTaskListLoaded) {
        dataTableTasks.destroy();
    }
    var tasks = null;
    tasks = await getData("TasksClaims", "?$select=*,AssignTo/Title&$expand=AssignTo&$select=FlowTypeClaim/Title&$expand=FlowTypeClaim&$select=TaskClaimStatus/Title&$expand=TaskClaimStatus&$select=Author/Title&$expand=Author" +
        "&$filter=(InternalReference eq '" + reference + "')&$orderby=ID desc");


    $("#tAllTaskClaims").html("");
    if (tasks.length > 0) {


    }
    tasks.forEach(async task => {

        $("#tAllTaskClaims").append($("<tr></tr>")
            .append($("<td>" + task.ID + "</td>"))
            .append($("<td>" + task.FlowTypeClaim.Title + "</td>"))
            .append($("<td>" + task.Modified.split('T')[0] + "</td>"))
            .append($("<td>" + (task.AssignToId == null ? "Not assigned" : task.AssignTo.Title) + "</td>"))
            .append($("<td>" + (task.ClaimedAmount == null ? "" : task.ClaimedAmount) + "</td>"))
            .append($("<td>" + task.Author.Title + "</td>"))
            .append($("<td class='" + setColorStatus(task.TaskClaimStatus.Title, "label") + "'>" + task.TaskClaimStatus.Title + "</td>"))
            .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"clickViewTask('" + task.ID + "');\">View Task</button></td>"))
        );

    });

    dataTableTasks = addDataTable('dtAllClaimTasks');
    dataTableTasks.column(0).visible(false);

    if (firstTaskListLoaded)
        firstTaskListLoaded = false;

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
            $("#divCurrencyModalTask").hide();
            break;
        case 2:
            $("#divClaimedAmount").show();
            $("#divCurrencyModalTask").show();

            $("#mClosureReason").html("");
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
            $("#divCurrencyModalTask").hide();
            break;
        case 9:
            $("#mClosureReason").html(viewTaskClaim[0].ClosureReason);

            $("#dataTask").hide();
            $("#divClaimedAmount").hide();
            $("#divCurrencyModalTask").hide();
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
            $("#divCurrencyModalTask").hide();
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
    $("#mDocumentation").html("<a class='btn btn-primary button-modal view-docs' role='button'><i class='fas fa-folder-open' aria-hidden='true'></i> View Documents</a>");
    $("#viewCurrency").val(accountData[0].Currency);
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

    $("#modalViewTask").modal("show");
}

async function GetTaskClaimStatus() {
    return await getData("TasksClaimsStatus", "");
}

async function ClickModalUpdate() {
    var updateTask = {
        '__metadata': { type: "SP.Data.TasksClaimsListItem" },
        'TaskClaimStatusId': parseInt($("#selectStatus").val())
    }

    var changeClaimedAmount = (viewTaskClaim[0].ClaimedAmount != $("#claimedAmount").val())

    if (changeClaimedAmount)
        updateTask["ClaimedAmount"] = $("#claimedAmount").val();

    updateData("TasksClaims", viewTaskClaim[0].ID, updateTask, "ModalSave");
    AddRegisterHistoryProcess(viewTaskClaim[0].InternalReference, (changeClaimedAmount) ? "change claimed amount" : "modified", $("#modalTitle").text(), $("#selectStatus option:selected").html(), "HistoryClaimTasks");
}

function clickViewRelatedDocuments() {

    resetBreadcrumb();
    getRelatedDocuments(currentRootPath, "#tModalRelatedDocuments");

    $("#relatedDocumentModal").modal("show");

}