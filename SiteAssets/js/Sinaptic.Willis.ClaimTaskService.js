console.log("Loading: Sinaptic.Willis.ClaimTaskService.js")

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
var closureReasons = [];
var selectFlowTypeClaim;
var selectFlowTypeClaimName;
var claimData;
var taskCreatedID;
var internalReferenceClaim;


async function clickCreateTask(idFlowTypeClaim) {

    $("#sectionClosureReason").hide();
    ValidateFlowType(idFlowTypeClaim);

    //Claim ID que viene desde la seleccion de la tabla en la vista de claims

    claimData = await getData("Claims", "?$filter=(ID eq " + selectedClaimID + ")");


    selectFlowTypeClaimName = getFlowTypeName(idFlowTypeClaim);
    $(".modal-title").html(selectFlowTypeClaimName);
    $("#modalTask").show();
    $("#divDropzone").show();
    $("#description").val("");

    selectFlowTypeClaim = idFlowTypeClaim;
}

function ClickModalSave(title, internalReference) {
    internalReferenceClaim = internalReference;
    showSpinner();
    //var listToQuery = claimData[0].BusinessReference.split("-").length < 3 ? "Accounts" : "Endorsements";
    var listToQuery = claimData[0].ObjectType == "Account" ? "Accounts" : "Endorsement";

    getDataCallback(listToQuery, "?$filter=Reference eq '" + claimData[0].BusinessReference + "'", function (accountInfo) {


        //var date = new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-" + new Date().getDate().toString().padStart(2, "0");

        var dueDate = addDays(new Date(accountInfo[0].Inception), 30);

        if (ValidateFlowTypeClaim()) {

            var createTask = {
                '__metadata': { type: "SP.Data.TasksClaimsListItem" },
                'TaskClaimStatusId': 8,
                'Title': title,//datatable.rows('.selected').data()[0][1],
                'InternalReference': internalReference,//datatable.rows('.selected').data()[0][0],
                'FlowTypeClaimId': selectFlowTypeClaim,
                'DueDate': dueDate,
                'Inception': accountInfo[0].Inception,
                'Client': accountInfo[0].Client,
                'Insured': accountInfo[0].OriginalInsured,
                'Cedent': accountInfo[0].Cedent,
                'Office': accountInfo[0].Office,
                'AccountReference': claimData[0].BusinessReference,
                'ObjectType': claimData[0].ObjectType,
                'Description': $('#description').val(),
                'Cedent': claimData[0].CedentReference
            }

            switch (selectFlowTypeClaim) {
                case 1:
                    createTask["AccountReference"] = claimData[0].BusinessReference;
                    createTask["Cause"] = claimData[0].Cause;
                    break;
                case 2:
                    createTask["ClaimedAmount"] = $("#claimedAmount").val();
                    break;
                case 8:
                    createTask["Cause"] = claimData[0].Cause;
                    break;
                case 9:
                    createTask["ClosureReason"] = $("#closureReason").val()
                    break;
                default:
                    break;
            }



            if ($("#dropzoneTask")[0].dropzone.files.length <= 0 && selectFlowTypeClaim != 9) {

                showErrorMessage("You must attach at least a file, before create a task.");
            }
            else {

                CreateNewTaskClaim(createTask).then(async function (taskCreated) {
                    console.log(taskCreated.ID);
                    taskCreatedID = taskCreated.ID;
                    businessReference = taskCreated.AccountReference;

                    await uploadFileListTask("#dropzoneTask", internalReference, createTask.FlowTypeClaimId, taskCreatedID);
                });
            }

        }
        else {
            showErrorMessage("There are required fields or the date is incorrect.");
        }

        hideSpinner();
    });

}

async function ValidateFlowType(idFlowTypeClaim) {
    switch (idFlowTypeClaim) {
        case 1: //notice
            //$("#accountReference").val(datatable.rows('.selected').data()[0][2]);
            //$("#mAccountReference").show();
            //$("#mDateOfLoss").show();
            //$("#miReportDate").show();
            //$("#mCause").show();
            //$("#mReferenceGrantor").show();
            $("#mDescription").show();
            $("#mClaimedAmount").hide();

            //$("#mAmount").hide();
            //$("#mPercent").hide();
            //$("#mAttachedSupportingDoc").hide();
            //$("#mParticipationPercentage").hide();
            //$("#mAmountRecover").hide();
            break;
        case 2:
            $("#mClaimedAmount").show();
            $("#currency").val(accountData[0].Currency);
            break;
        case 8: //salvage
            //$("#mAmountRecover").show();
            //$("#mParticipationPercentage").show();

            //$("#mAccountReference").hide();
            //$("#mDateOfLoss").hide();
            //$("#miReportDate").hide();
            //$("#mCause").hide();
            //$("#mReferenceGrantor").hide();
            $("#mDescription").show();
            $("#mClaimedAmount").hide();
            //$("#mAmount").hide();
            //$("#mPercent").hide();
            //$("#mAttachedSupportingDoc").hide();
            break;
        case 9: //closure
            {
                //$("#mAmountRecover").hide();
                //$("#mParticipationPercentage").hide();
                //$("#mAccountReference").hide();
                //$("#mDateOfLoss").hide();
                //$("#miReportDate").hide();
                //$("#mCause").hide();
                //$("#mReferenceGrantor").hide();
                $("#mDescription").show();
                $("#sectionClosureReason").show();
                $("#mClaimedAmount").hide();

                //$("#mAmount").hide();
                //$("#mPercent").hide();
                //$("#mAttachedSupportingDoc").hide();
                closureReasons = await getData("ClosureReasons", "");

                closureReasons.forEach((element, index) => {
                    $("#closureReason").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
                })

            }
            break;
        case 10: //reopening
            //$("#mAmountRecover").hide();
            //$("#mParticipationPercentage").hide();
            //$("#mAccountReference").hide();
            //$("#mDateOfLoss").hide();
            //$("#miReportDate").hide();
            //$("#mCause").hide();
            //$("#mReferenceGrantor").hide();
            $("#mDescription").show();
            $("#mClaimedAmount").hide();
            //$("#mAmount").hide();
            //$("#mPercent").hide();
            //$("#mAttachedSupportingDoc").hide();
            break;
        default:
            //$("#mAmount").show();
            //$("#mPercent").show();
            //$("#mAttachedSupportingDoc").show();
            //$("#mParticipationPercentage").show();

            //$("#mAccountReference").hide();
            //$("#mDateOfLoss").hide();
            //$("#miReportDate").hide();
            //$("#mCause").hide();
            //$("#mReferenceGrantor").hide();
            $("#mDescription").show();
            $("#mClaimedAmount").hide();
            //$("#mAmountRecover").hide();
            break;
    }
}

function ClickModalCancel() {
    //$("#accountReference").val("");
    //$("#dateOfLoss").val("");
    //$("#iReportDate").val("");
    //$("#cause").val("");
    //$("#referenceGrantor").val("");
    //$("#amount").val("");
    //$("#percent").val("");
    //$("#attachedSupportingDoc").val("");
    //$("#participationPercentage").val("");
    //$("#amountRecover").val("");
    $("#mDescription").val("");

    $("#modalTask").hide();
}

function getFlowTypeName(idType) {

    switch (idType) {
        case 1: { return "Notice"; } break;
        case 2: { return "Estimate"; } break;
        case 3: { return "Reserve"; } break;
        case 4: { return "Payment on Account"; } break;
        case 5: { return "Partial Settlement"; } break;
        case 6: { return "Final Settlement"; } break;
        case 7: { return "Fees"; } break;
        case 8: { return "Salvage"; } break;
        case 9: { return "Closure"; } break;
        case 10: { return "Reopening"; } break;
        default: { } break;
    }
}

function ValidateFlowTypeClaim() {
    var val = true;

    switch (selectFlowTypeClaim) {
        case 1: //notice
            //if ($("#accountReference").val() == null || $("#accountReference").val() == "") {
            //    val = false;
            //    $("#accountReference").css('border-color', 'red');
            //}
            //else $("#accountReference").css('border-color', '');

            //if ($("#dateOfLoss").val() == null || $("#dateOfLoss").val() == "") {
            //    val = false;
            //    $("#dateOfLoss").css('border-color', 'red');
            //}
            //else $("#dateOfLoss").css('border-color', '');

            //if ($("#iReportDate").val() == null || $("#iReportDate").val() == "") {
            //    val = false;
            //    $("#iReportDate").css('border-color', 'red');
            //}
            //else $("#iReportDate").css('border-color', '');

            //if ($("#cause").val() == null || $("#cause").val() == "") {
            //    val = false;
            //    $("#cause").css('border-color', 'red');
            //}
            //else $("#cause").css('border-color', '');

            //if ($("#referenceGrantor").val() == null || $("#referenceGrantor").val() == "") {
            //    val = false;
            //    $("#referenceGrantor").css('border-color', 'red');
            //}
            //else $("#referenceGrantor").css('border-color', '');

            //if ($("#description").val() == null || $("#description").val() == "") {
            //    val = false;
            //    $("#description").css('border-color', 'red');
            //}
            //else $("#description").css('border-color', '');

            break;
        case 8: //salvage
            //if ($("#amountRecover").val() == null || $("#amountRecover").val() == "") {
            //    val = false;
            //    $("#amountRecover").css('border-color', 'red');
            //}
            //else $("#amountRecover").css('border-color', '');

            //if ($("#participationPercentage").val() == null || $("#participationPercentage").val() == "") {
            //    val = false;
            //    $("#participationPercentage").css('border-color', 'red');
            //}
            //else $("#participationPercentage").css('border-color', '');
            //if ($("#description").val() == null || $("#description").val() == "") {
            //    val = false;
            //    $("#description").css('border-color', 'red');
            //}
            //else $("#description").css('border-color', '');

            break;
        case 9: //closure
            break;
        default:
            //if ($("#amount").val() == null || $("#amount").val() == "") {
            //    val = false;
            //    $("#amount").css('border-color', 'red');
            //}
            //else $("#amount").css('border-color', '');

            //if ($("#percent").val() == null || $("#percent").val() == "") {
            //    val = false;
            //    $("#percent").css('border-color', 'red');
            //}
            //else $("#percent").css('border-color', '');

            //if ($("#attachedSupportingDoc").val() == null || $("#attachedSupportingDoc").val() == "") {
            //    val = false;
            //    $("#attachedSupportingDoc").css('border-color', 'red');
            //}
            ////else $("#attachedSupportingDoc").css('border-color', '');
            //if ($("#description").val() == null || $("#description").val() == "") {
            //    val = false;
            //    $("#description").css('border-color', 'red');
            //}
            //else $("#description").css('border-color', '');

            break;
    }

    return val;
}



async function uploadFileListTask(selector, internalReference, flowTypeClaimId, taskCreatedID) {
    var file = "";
    var uploadFiles = [];
    if ($(selector)[0].dropzone.files.length > 0) {
        for (var i = 0; i < $(selector)[0].dropzone.files.length; i++) {
            file = $(selector)[0].dropzone.files[i];
            if (i != $(selector)[0].dropzone.files.length - 1)
                uploadFiles.push(UploadMeTask(file, file.name, false));
            else uploadFiles.push(UploadMeTask(file, file.name, true));
        }
    }
    else {
        if (selectFlowTypeClaim != 9)
            showErrorMessage("You must attach at least a file, before create a task.");
    }

    Promise.all(uploadFiles).then(async (results) => {
        var allFilesUploaded = results.every(results => results.success);

        if (allFilesUploaded) {
            var basePathDocument = businessReference.replace(/\-/g, "") + "\\" + selectedClaimID;
            getRelatedDocuments(basePathDocument, "#tRelatedDocuments");
            $("#dropzoneCommon")[0].dropzone.removeAllFiles();
            resetBreadcrumb();

            var updateClaim = {
                '__metadata': { type: "SP.Data.ClaimsListItem" },
                'LastTaskRequested': selectFlowTypeClaimName
            }

            updateData("Claims", claimData[0].ID, updateClaim);

            //TODO: Resolve what task type we need record in History List
            AddRegisterHistoryProcess(internalReference, "created", getFlowTypeName(flowTypeClaimId), "Pending", "HistoryClaimTasks");
            hideSpinner();
            $("#modalTask").hide();
        } else {
            await deleteData("TasksClaims", taskCreatedID);
            hideSpinner();
            showErrorMessage("Error upload file.");
        }
    });
}

async function UploadMeTask(readFile, fileName, isLast) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = async function (evt) {
            try {
                await loadedFileTask(readFile);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(readFile);
        reader.fileName = fileName;
        reader.isLast = isLast;
        reader.onprogress = updateProgressTask;
    });
}

var nameFile = "";
var dataFile = "";
var pathDocumentLibrary = "";
async function loadedFileTask(evt) {
    dataFile = {
        '__metadata': { type: "SP.Data.FileLogListItem" }
    }
    var section = "Documentos iniciales de la tarea";
    var dateFolder = new Date().toISOString().split("T")[0];
    var ref = claimData[0].BusinessReference.replaceAll("-", "");
    var pathDocumentLibrary = `${ref}\\${claimData[0].ID}\\${section}\\${selectFlowTypeClaimName}\\${taskCreatedID}\\${dateFolder}`;
    var formData = new FormData();
    formData.append('filesUploads.File', evt);
    formData.append('filesUploads.FilePath.Reference', ref);
    formData.append('filesUploads.FilePath.Section', section);
    formData.append('filesUploads.FilePath.ClaimId', claimData[0].ID);
    formData.append('filesUploads.FilePath.TaskType', selectFlowTypeClaimName);
    formData.append('filesUploads.FilePath.TaskId', taskCreatedID);
    formData.append('filesUploads.FilePath.Path', pathDocumentLibrary);
    formData.append('filesUploads.FilePath.FileName', evt.name);
    formData.append('filesUploads.FilePath.Date', dateFolder);
    formData.append('filesUploads.FilePath.UserEmail', _spPageContextInfo.userEmail);
    nameFile = evt.name;

    await uploadFileWebApi(formData);
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

function updateProgressTask(evt) { }