console.log("Loading: Sinaptic.Willis.ViewAccount.js");

var account;
var endorsementList;
var claimsList;
var userOffice;
var isNew = false;
var isAccount = false;
var reference;
var attach = true;
var isViewMode = false;
var currentUser;
var isRenewal = false;
Dropzone.autoDiscover = false;
var usersToAssign;
var tppCollection;
var offices;

var accountManagerId = 1;
var claimHandlerId = 4;
var subBranchArray;
var profileIdTeamLeader = 3;
var teamLeaderName = "Team Leader";
var profileIdAnalyst = 5;
var analystName = "Analyst";

var selectedNameFile = "";

var formatNumber = {
    separator: ",",
    sepDecimal: '.',
    format: function (num) {
        num += '';
        var splitStr = num.split('.');
        var splitLeft = splitStr[0];
        var splitRight = splitStr.length > 1 ? this.sepDecimal + splitStr[1] : '';
        var regx = /(\d+)(\d{3})/;
        while (regx.test(splitLeft)) {
            splitLeft = splitLeft.replace(regx, '$1' + this.separator + '$2');
        }
        return this.symbol + splitLeft + splitRight;
    },
    new: function (num, symbol) {
        this.symbol = symbol || '';
        return this.format(num);
    }
}

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

    $(document).ready(function () {
        clickReset(false);

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
    });
    $("#divDropzone").show();

    // Slideout show
    this.$slideOut.find('.slideOutTab').on('click', function () {
        $("#slideOut").toggleClass('showSlideOut');
        $("#slideOut").hasClass('showSlideOut') ? $("#slideOut").css('position', 'absolute') : $("#slideOut").css('position', 'fixed');
    });

    this.$slideOutList.find('.slideOutTabList').on('click', function () {
        $("#slideOutList").toggleClass('showSlideOut');
        $("#slideOutList").hasClass('showSlideOut') ? $("#slideOutList").css('position', 'absolute') : $("#slideOutList").css('position', 'fixed');
    });

    $("#bUploadFile").on("click", async function () {
        uploadFileList("#dropzoneCommon");
    });

    $("#bDiscardFile").on("click", function () {
        $("#dropzoneCommon")[0].dropzone.removeAllFiles();
    });

    $("#btnAddNewTPP").on("click", function () {
        clickAddNewTPP();
        $('#txtNewTPP').val("");
        $('#modalNewTPP').modal('hide');
    });

    $("#alertTPPMessage").html('<a href="#" class="alert-link">Attention:</a> This TPP will be previously audited before to add it to the TPP list.');

    //VALIDACIï¿½N DE Pï¿½GINA
    validatePage();
});

async function validatePage() {
    $("#assginedTeam").attr("multiple", "");

    isRenewal = (window.location.search.substring(window.location.search.substring().search("type")).split("=")[1] == "renewal");
    currentUser = await getProfile();

    var mode = window.location.search.substring(window.location.search.substring().search("type")).split("=")[1];
    mode = (mode.includes("mode") || mode.includes("nocache")) ? mode.split("&")[0] : mode;
    if (mode == "account") {
        isAccount = true;
    }

    if (window.location.search.substring(window.location.search.substring().search("mode")) != null)
        if (window.location.search.substring(window.location.search.substring().search("mode")).split("=")[1] == "view") {
            disableCommandBar();
            isViewMode = true;
        }

    if (window.location.search.substring().search("ref") == -1) isNew = true;
    else reference = window.location.search.substring(window.location.search.substring().search("ref")).split("&")[0].split("=")[1];

    sessionData = { reference: reference }
    localStorage.setItem('sessionData', JSON.stringify(sessionData));

    userOffice = await getUserOffice();
    var OfficeArray = [];
    var OfficeStr = "";
    for (var indexOffice = 0; indexOffice < userOffice.results.length; indexOffice++) {
        OfficeArray.push(userOffice.results[indexOffice].Office);
        OfficeStr += userOffice.results[indexOffice].Office;
        if (userOffice.results.length > (indexOffice + 1)) {
            OfficeStr += ";";
        }
    };

    $("#office").val(OfficeStr);
    var arrayOffices = OfficeStr.split(";");
    for (var i = 0; i < arrayOffices.length; i++) {

        $("#office").append($("<option value=\"" + arrayOffices[i] + "\">" + arrayOffices[i] + "</option>"));

    }

    await getTPP();
    await getBranches();
    await getSubBranches();
    await getOffices();

    if (isNew) getNewAccount();
    else {
        if (isRenewal)
            await getViewRenewal();
        else
            await getViewAccount();

        getRelatedDocuments(reference.replace(/\-/g, ""), "#tRelatedDocuments");
    }

    changePaymentClause();
}


async function getOffices() {

    offices = await getData("Offices", "");

}

function disableCommandBar() {

    $("#bEditAccount").html("Edit Account");

    //$(".row-info-account").hide();

    $("#bEditAccount").prop("disabled", true);
    $("#bNewEndorsement").prop("disabled", true);
    $("#bRenewal").prop("disabled", true);
    $("#bNTU").prop("disabled", true);
    $("#bRequestProcess").prop("disabled", true);
    $("#bNewClaim").prop("disabled", true);

    $("#bAttach").prop("disabled", true);

}


async function getNewAccount() {


    $("#subtitle").html("New Account");

    $("#bEditAccount").html("Edit Account");

    $(".row-info-account").hide();

    $("#bEditAccount").prop("disabled", true);
    $("#office").prop("disabled", false);
    $("#bNewEndorsement").prop("disabled", true);
    $("#bRenewal").prop("disabled", true);
    $("#bNTU").prop("disabled", true);
    $("#bRequestProcess").prop("disabled", true);

    $("#bAttach").prop("disabled", true);

    $("#renewable").val("");
    $("#branch").val("");
    $("#subBranch").val("");
    //$("#glob").val("");
    $("#typeplacement").val("P1");
    var today = new Date();
    var stringToday = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
    $("#receptionDate").val(stringToday);



    changeTypeMovement();

    await getUsersToAssign();

    getLists().then(res => {

        $("#accountManager").val(_spPageContextInfo.userId);
    });

    clickEditAccount();
}

async function getViewAccount() {
    var listName = "Accounts";

    if (!isAccount) {
        listName = "Endorsement";
        $("#tableEndorsement").hide();
        $("#tableClaims").hide();
        disableCommandBar();
    }

    account = await getData(listName, "?$select=*,UserAccount/Title&$expand=UserAccount&$select=AccountTeam/Title&$expand=AccountTeam&$filter=(Reference eq '" + reference + "')");

    await getUsersToAssign();

    if (account.length > 0) {
        if (!isNew) {
            $("#accountManager").val(account[0].UserAccountId);
            $("#branch").val(account[0].Ramo);
            $("#subBranch").val(account[0].SubRamo);
            if (account[0].EquipoDeTrabajoIds != null) {
                $('#assginedTeam').selectpicker('val', account[0].EquipoDeTrabajoIds.split(","));
                $("#assginedTeam").selectpicker("refresh");
            }

            if (account[0].TPP != null) {
                var options = $("#tpp options");
                var values = $.map(options, e => $(e).val());

                if (values.findIndex(x => x == account[0].TPP) == -1) {
                    $("#tpp").append('<option value="' + account[0].TPP + '">' + account[0].TPP + '</option>');
                    $("#tpp").selectpicker("refresh");
                }


            }
            $('#tpp').selectpicker('val', account[0].TPP);
            $("#linebusiness").val(account[0].LineBusiness);
            $("#renewable").val(account[0].Renewable == "Renewable" ? "Renewable" : "OneOff");
            $("#office").attr("disabled", true);
            $(".selectpicker").attr("disabled", true);
            $("#tpp").attr("disabled", true);

            if (userOffice.results.findIndex(x => x.Office == account[0].Office) == -1) {
                $("#office").append($("<option value=\"" + account[0].Office + "\">" + account[0].Office + "</option>"));
            }

            $("#office").val(account[0].Office);
            $("#linebusiness").attr("disabled", true);
            $("#team").attr("disabled", true);

            //getRelatedDocuments(reference.replace(/\-/g, ""));

            $("#bSummary").on("click", function () {
                ClickViewSummary(account[0].Reference, listName);
            });

            if (isRenewal) $("#status").val("Pending");
            else $("#status").val(account[0].Status);
        }
        else {
            $("#status").val("");
            $("#accountManager").val(account.userAccountId);
            $("#office").attr("disabled", false);

            $("#ukReference").prop("disabled", true);
            $('#assginedTeam').selectpicker();
            $("#assginedTeam").selectpicker("refresh");
        }
    }
    else {
        showErrorMessage("Reference not found.");
        window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Accounts.aspx", '_self');
    }

    $("#bActionSave").prop("disabled", true);
    $("#bActionReset").prop("disabled", true);

    if (!isAccount) {
        $("#title").html("Endorsement");
        $("#subtitle").html("View Endorsement");

        $("#bEditAccount").html("Edit Endorsement");

        $("#bNewEndorsement").prop("disabled", true);
        $("#bRenewal").prop("disabled", true);
        if (!isViewMode) $("#bRequestProcess").prop("disabled", false);
        $("#bEditAccount").prop("disabled", (account[0].Status !== "Pending"));
    }
    else {
        if (!isViewMode) {
            $("#title").html("Account");
            $("#subtitle").html("View Account");

            $("#bEditAccount").html("Edit Account");

            switch (account[0].Status) {
                case "Pending":
                    $("#bEditAccount").prop("disabled", false);
                    $("#bNewEndorsement").prop("disabled", true);
                    $("#bRenewal").prop("disabled", true);
                    $("#bRequestProcess").prop("disabled", false);
                    break;
                case "In Progress":
                    $("#bEditAccount").prop("disabled", true);
                    $("#bNewEndorsement").prop("disabled", true);
                    $("#bRenewal").prop("disabled", true);
                    $("#bRequestProcess").prop("disabled", true);
                    $("#branch").prop("disabled", true);
                    $("#subBranch").prop("disabled", true);
                    break;
                case "Cancelled":
                    $("#bEditAccount").prop("disabled", true);
                    $("#bNewEndorsement").prop("disabled", true);
                    $("#bRenewal").prop("disabled", true);
                    $("#bRequestProcess").prop("disabled", true);
                    $("#bNTU").prop("disabled", true);
                    $("#branch").prop("disabled", true);
                    $("#subBranch").prop("disabled", true);
                    break;
                default:
                    $("#bEditAccount").prop("disabled", true);
                    $("#bNewEndorsement").prop("disabled", false);
                    $("#bRenewal").prop("disabled", false);
                    $("#bNTU").prop("disabled", false);
                    $("#bRequestProcess").prop("disabled", true);
                    $("#branch").prop("disabled", true);
                    $("#subBranch").prop("disabled", true);
                    break;
            }
        }

        endorsementList = await getData("Endorsement", "?$filter=(AccountReference eq '" + reference + "')and(Status ne 'Cancelled')&$orderby=Reference");

        $("#tEndorsementList").html("");

        endorsementList.forEach((element, index) => {
            $("#tEndorsementList").append($("<tr></tr>")
                .append($("<td style=\"cursor: pointer;\" onclick=\"clickEndorsement(" + index + ")\">" + element.Reference + "</td>"))
                .append($("<td style=\"cursor: pointer;\" onclick=\"clickEndorsement(" + index + ")\">" + element.Inception.split("T")[0] + "</td>"))
                .append($("<td style=\"cursor: pointer;\" onclick=\"clickEndorsement(" + index + ")\">" + element.Status + "</td>"))
                .append($("<td><button type=\"button\" class=\"btn btn-info btn-sm button-table\" onclick=\"ClickViewSummary('" + element.Reference +
                    "','Endorsement');\">View Summary</button>" + "</td>"))
            )
        });

        claimsList = await getData("Claims", "?$filter=(BusinessReference eq '" + reference + "')and(Status ne 'Cancelled')&$orderby=BusinessReference");

        $("#tClaimsList").html("");

        claimsList.forEach((element, index) => {

            var ocurrenceDate = element.OccurrenceDate == null ? "" : element.OccurrenceDate.split("T")[0];
            $("#tClaimsList").append($("<tr style=\"cursor: pointer;\" onclick=\"clickClaim(" + index + ")\"></tr>")
                .append($("<td>" + element.ClaimReference + "</td>"))
                .append($("<td>" + ocurrenceDate + "</td>"))
                .append($("<td>" + element.LastTaskRequested + "</td>"))
                .append($("<td id=\"commentClaim\"" + index + ">" + ((element.Comments != "" && element.Comments != null) ?
                    (element.Comments.length > 30) ? element.Comments.substring(0, 30) : element.Comments : "") + "</td>"))
            )

            $("#commentClaim" + index).popover({
                trigger: 'focus',
                content: (element.Comments != "" && element.Comments != null) ? element.Comments : ''
            });
        });
    }

    $("#referenceTitle").append(account[0].Reference);

    currentRootPath = account[0].Reference.replace(/\-/g, "");

    getValuesFields();

    var OfficeArgentina = false;
    for (var i = 0; i < userOffice.results.length; i++) {
        if (userOffice.results[i].Office === "Argentina") {
            OfficeArgentina = true;
        }
    }
    if (OfficeArgentina && account[0].BusinessCountry == "Argentina") {
        $("#divCore").show();
        $("#core").val(account[0].CORE);
    }


    else $("#divCore").hide();

    getLists().then(res => {

        if (!isNew) {
            $("#accountManager").val(account[0].UserAccountId);
            $("#status").val(account[0].Status);
        }

        else
            $("#accountManager").val(_spPageContextInfo.userId);
    });
}

async function getBusinessSources() {
    var listTypesMovements = await getData("BusinessSource", "");

    listTypesMovements.forEach(element => {
        $("#businessSource").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });

    if (!isNew) {
        $("#businessSource").val(account[0].BusinessSource);
    }
    else $("#businessSource").val("");
}


async function getLineBusiness() {
    var listBusinessLine = await getData("Business Line", "?$filter=(Active eq 1)");

    listBusinessLine.forEach(element => {
        $("#linebusiness").append($("<option value=\"" + element.BusinessLine + "\">" + element.BusinessLine + "</option>"));
    });

    if (!isNew) {
        $("#linebusiness").val(account[0].GLoB);
    }
    else $("#linebusiness").val("");
}

async function getBusinessCountries() {
    var listTypesMovements = await getData("BusinessCountries", "");

    listTypesMovements.forEach(element => {
        $("#businessCountry").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });

    if (!isNew) {
        $("#businessCountry").val(account[0].BusinessCountry);
    }
    else $("#businessCountry").val("");
}

async function getClients() {
    var listTypesMovements = await getData("Entities", "?$orderby=Description%20asc");

    listTypesMovements.forEach(element => {
        $("#client").append($("<option value=\"" + element.Description + "\">" + element.Description + "</option>"));
    });

    if (!isNew) {
        $("#client").val(account[0].Client);
    }
    else $("#client").val("");
}


async function getTPP() {



    tppCollection = await getData("TPP", "?$orderby=Title%20asc&$select=*");


    await tppCollection.forEach(element => {
        $("#tpp").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });


    //     var content = "<input type='text' class='bss-input' onKeyDown='event.stopPropagation();' onKeyPress='addSelectInpKeyPress(this,event)' onClick='event.stopPropagation()' placeholder='Add new TPP'> <span class='glyphicon glyphicon-plus addnewicon' onClick='addSelectItem(this,event,1);'></span>";

    //     var divider = $('<option/>')
    //             .addClass('divider')
    //             .data('divider', true);


    //   var addoption = $('<option/>', {class: 'addItem'})
    //           .data('content', content);

    // $('#tpp').append(divider)
    //          .append(addoption)
    //          .selectpicker();

    $('#tpp').selectpicker("destroy");
    $('#tpp').selectpicker();


    // if (!isNew) {
    //     $("#client").val(account[0].Client);
    // }
    // else $("#client").val("");
}


function addSelectItem(t, ev) {
    ev.stopPropagation();

    var bs = $(t).closest('.bootstrap-select')
    var txt = bs.find('.bss-input').val().replace(/[|]/g, "");
    var txt = $(t).prev().val().replace(/[|]/g, "");
    if ($.trim(txt) == '') return;

    // Changed from previous version to cater to new
    // layout used by bootstrap-select.
    var p = bs.find('select');
    var o = $('option', p).eq(-2);
    o.before($("<option>", { "selected": true, "text": txt }));
    p.selectpicker('refresh');
}

function addSelectInpKeyPress(t, ev) {
    ev.stopPropagation();

    // do not allow pipe character
    if (ev.which == 124) ev.preventDefault();

    // enter character adds the option
    if (ev.which == 13) {
        ev.preventDefault();
        addSelectItem($(t).next(), ev);
    }
}

async function getLocalUserOffice() {
    var office;

    if (isNew) {
        if (userOffice?.results == undefined)
            alert("This user does not have an assigned office!");
        office = userOffice.results[0];
    }
    else {
        office = userOffice.results.find(x => x.Office == account[0].Office);

        if (office == undefined) {
            office = offices.find(x => x.Office == account[0].Office);
        }
    }

    return office.Id;
}

async function getUsersToAssign() {
    var selectedOffice = await getData("Offices", "?$filter=(Title eq '" + $("#office").val() + "')");

    usersToAssign = await getData("Users", "?$orderby=User%20asc&$select=ProfileId,OfficeId,User/Id,User/EMail,Title,FullName&$filter=(ProfileId eq 1) and (Active eq 1)&$expand=User");

    var filteredUsersByOffice = usersToAssign.filter(x => x.OfficeId.results.includes(selectedOffice[0].Id));

    $("#assginedTeam").html("");

    filteredUsersByOffice.forEach(element => {
        $("#assginedTeam").append($("<option value=\"" + element.User.Id + "\">" + element.FullName + "</option>"));
    });

    $('#assginedTeam').selectpicker("destroy");
    $('#assginedTeam').selectpicker();
}

async function getBranches() {
    var branches = await getData("Branch", "?$orderby=Title");

    branches.forEach(element => {
        $("#branch").append($("<option value=\"" + element.ID + "\">" + element.Title + "</option>"));
    });

    $("#branch").change(function () {
        var branchId = $('#branch option:selected').val();
        getSubBranches(branchId);
    });
}

async function getSubBranches(branchId) {
    var subBranches = branchId == null ? await getData("Sub-Branch", "?$orderby=Title&$select=*") : await getData("Sub-Branch", "?$orderby=Title&$select=*&$filter=BranchId eq " + branchId);
    $("#subBranch").empty();
    subBranches.forEach(element => {
        $("#subBranch").append($("<option value=\"" + element.ID + "\">" + element.Title + "</option>"));
    });
}

async function getListTypesMovements() {
    var listTypesMovements = await getData("TypesOfMovements", "?$filter=(IsAccount eq " + `${(isAccount) ? "1" : "0"}` + ")");

    listTypesMovements.forEach(element => {
        $("#typeofmovement").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });

    if (!isNew) {
        if (isRenewal) {
            listTypesMovements.
                $("#typeofmovement").val("Renewal");
        }
        else $("#typeofmovement").val(account[0].TypeOfMovement);
    }
    else $("#typeofmovement").val("");
}

async function getListCurrency() {
    var listCurrency = await getData("Currency", "");

    listCurrency.forEach(element => {
        $("#currency").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });

    if (!isNew) $("#currency").val(account[0].Currency);
    else $("#currency").val("");
}

async function getListTeams() {
    var office = await getData("Offices", "?$filter=(Title eq '" + $("#office").val() + "')");
    var listTeams = await getData("Teams", "?$filter=(OfficeId eq '" + office[0].Id + "')");
    $("#team").html("");

    listTeams.forEach(element => {
        $("#team").append($("<option value=\"" + element.Title + "\">" + element.Title + "</option>"));
    });

    if (!isNew) { $("#team").val(account[0].Team); }
    else { $("#team").val(""); }
}

function clickAddNewTPP() {
    var options = $("#tpp options");
    var values = $.map(options, e => $(e).val());

    var selectedOption = $("#txtNewTPP").val();

    if (values.findIndex(x => x == selectedOption) == -1) {
        $("#tpp").append('<option value="' + selectedOption + '">' + selectedOption + '</option>');
        $('#tpp').val(selectedOption);
        $("#tpp").selectpicker("refresh");
    }
}

function clickNewEndorsement() {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/NewEndorsement.aspx?reference=" + reference, '_self');
}

function clickEditAccount() {
    $("#typeofmovement").prop("disabled", false);
    $("#inception").prop("disabled", false);
    $("#comments").prop("disabled", false);
    $("#tpp").prop("disabled", false);
    $(".btn-light").removeClass("disabled");
    $("#paymentClause").prop("disabled", false);
    $("#businessCountry").prop("disabled", false);
    $("#businessSource").prop("disabled", false);
    $("#currency").prop("disabled", false);
    $("#contactMails").prop("disabled", false);
    $("#firstDueDate").prop("disabled", false);
    $("#typeplacement").prop("disabled", false);
    $("#renewable").prop("disabled", false);

    if (isAccount || isRenewal) {
        $("#accountManager").prop("disabled", false);
        $("#grossPremiumUSD").prop("disabled", false);
        $("#originalInsured").prop("disabled", false);
        $("#accountTeam").prop("disabled", false);
        $("#receptionDate").prop("disabled", false);
        $("#incomeUSD").prop("disabled", false);
        $("#industry").prop("disabled", false);
        $(".selectpicker").prop("disabled", false);
        $("#client").prop("disabled", false);
        $("#linebusiness").prop("disabled", false);
        $("#ukReference").prop("disabled", false);

        $("#branch").prop("disabled", ((account === undefined) ? false : (account.length !== 0) ? (account[0].Status !== "Pending" && !isRenewal) : false));
        $("#subBranch").prop("disabled", ((account === undefined) ? false : (account.length !== 0) ? (account[0].Status !== "Pending" && !isRenewal) : false));

        var OfficeArgentina = false;
        for (var i = 0; i < userOffice.results.length; i++) {
            if (userOffice.results[i].Office === "Argentina") {
                OfficeArgentina = true;
            }
        }
        if (OfficeArgentina) $("#core").prop("disabled", false);
    }
    else {
        $("#branch").prop("disabled", false);
        $("#subBranch").prop("disabled", false);
    }

    if (isNew) {
        $("#branch").prop("disabled", false);
        $("#subBranch").prop("disabled", false);
    }

    $("#team").prop("disabled", false);
    $("#bActionSave").prop("disabled", false);
    $("#bActionReset").prop("disabled", false);
}

function verifyObjectType() {

    if (isNew) {
        return "Accounts";
    }
    else {
        return isAccount ? "Accounts" : "Endorsement";
    }
}

async function clickSave() {

    showSpinner();
    var status = (isNew || isRenewal) ? "Pending" : account[0].Status || "";

    var userAccountId = isNew ? ($("#accountManager").val() == null) ? _spPageContextInfo.userId : $("#accountManager").val() : $("#accountManager").val();

    var OfficeStr = "";
    var OfficeStr = isNew ? $("#office option:selected").val() : account[0].Office;
    var Branch = $("#branch option:selected").val();
    var SubBranch = $("#subBranch option:selected").val();
    var TPP = $("#tpp option:selected").val();
    var AssignedTeamIds = $('#assginedTeam').val().join(",").toString();

    if (validateForm()) {
        var dataSave = {
            '__metadata': { type: `SP.Data.${(isAccount) ? "Accounts" : "Endorsement"}ListItem` },
            'Office': OfficeStr,
            'BusinessCountry': $("#businessCountry").val(),
            'UserAccountId': userAccountId,
            'TypeOfMovement': $("#typeofmovement").val(),
            'Inception': $("#inception").val(),
            'Comments': $("#comments").val(),
            'Team': $("#team").val(),
            'Renewable': $("#renewable").val(),
            'BusinessSource': $("#businessSource").val(),
            'Currency': $("#currency").val(),
            'OriginalInsured': $("#originalInsured").val(),
            'ReceptionDate': $("#receptionDate").val(),
            'Status': status,
            'TPP': TPP || "",
            'Client': $("#client").val(),
            'CORE': $("#core").val(),
            'GLoB': $("#linebusiness").val(),
            'LineBusiness': $("#linebusiness").val(),
            'TypePlacement': $("#typeplacement").val(),
            'AllContactMails': $("#contactMails").val(),
            'WillisUKReference': $("#ukReference").val(),
            'PaymentClause': ($("#paymentClause").val() == "1"),
            'FirstDueDate': $("#firstDueDate").val() || null,
            "ObjectType": isAccount ? "Account" : "Endorsement",
            'Ramo': Branch || null,
            'SubRamo': SubBranch || null,
            'EquipoDeTrabajoIds': AssignedTeamIds || null,
        }

        $("#referenceTitle").html("");
        $("#tRelatedDocuments").html("");
        $("#tEndorsementList").html("");
        $("#tClaimsList").html("");

        if (isNew || isRenewal) {
            var newAccount = await addData("Accounts", dataSave);

            var zero = "0";
            var length = newAccount.Id.toString().length;
            var linebusdata = await getData("Business Line", "?$filter=(Active eq 1)and(BusinessLine eq '" + ($("#linebusiness").val().includes('&') ? $("#linebusiness").val().replace('&', '%26') : $("#linebusiness").val()) + "')");
            var refRenewal;

            if (isRenewal)
                refRenewal = getUrlVars()["ref"].split("-")[0] + "-" + (parseInt(getUrlVars()["ref"].split("-")[1]) + 1).toString();

            var ref = isRenewal ? refRenewal : linebusdata[0].Initials + zero.repeat(5 - length) + newAccount.Id + userOffice.results.find(x => x.Office == $("#office option:selected").val()).Initials + "-" + new Date().getFullYear().toString().substring(2, 4);

            var dataUpdate = {
                '__metadata': { type: "SP.Data.AccountsListItem" },
                'Reference': ref,
                'Title': ref
            }

            await updateData("Accounts", newAccount.Id, dataUpdate);

            hideSpinner();
            showErrorMessage("Successfully registered.");

            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + ref + "&type=account", '_self');
        }
        else {
            await updateData(verifyObjectType(), account[0].Id, dataSave, "updateAccount");
            hideSpinner();
        }
    }
    else {
        hideSpinner();

    }
}

function successNewFolder(ref) {
    showErrorMessage("Successfully registered.");

    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + ref + "&type=account", '_self');
}

function clickCancel() {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Accounts.aspx", '_self');
}

function clickReset(isGetViewAccount) {
    $("#branch").prop("disabled", true);
    $("#subBranch").prop("disabled", true);
    $("#status").prop("disabled", true);
    $("#paymentClause").prop("disabled", true);
    $("#firstDueDate").prop("disabled", true);
    $("#typeofmovement").prop("disabled", true);
    $("#inception").prop("disabled", true);
    $("#accountManager").prop("disabled", true);
    $("#documentLink").prop("disabled", true);
    $("#grossPremiumUSD").prop("disabled", true);
    $("#comments").prop("disabled", true);
    $("#team").prop("disabled", true);
    $("#renewable").prop("disabled", true);
    $("#businessSource").prop("disabled", true);
    $("#currency").prop("disabled", true);
    $("#originalInsured").prop("disabled", true);
    $("#accountTeam").prop("disabled", true);
    $("#receptionDate").prop("disabled", true);
    $("#incomeUSD").prop("disabled", true);
    $("#industry").prop("disabled", true);
    $("#tpp").prop("disabled", true);
    $("#client").prop("disabled", true);
    $("#core").prop("disabled", true);
    $("#linebusiness").prop("disabled", true);
    $("#typeplacement").prop("disabled", true);
    $("#contactMails").prop("disabled", true);
    $("#businessCountry").prop("disabled", true);
    $("#ukReference").prop("disabled", true);

    $("#bActionSave").prop("disabled", true);
    $("#bActionReset").prop("disabled", true);

    $("#referenceTitle").html("");
    $("#tRelatedDocuments").html("");

    if (isGetViewAccount)
        getViewAccount();
}

function clickEndorsement(index) {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + endorsementList[index].Reference + "&type=endorsement&mode=view", '_blank');
}

function clickClaim(index) {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + claimsList[index].ID + "&type=view&mode=view", '_blank');
}

function changeTypeMovement() {
    if (isNew && ($("#typeofmovement").val() == "New New" || $("#typeofmovement").val() == "New Existing")) $("#divRenewable").show();
    else $("#divRenewable").hide();
}

var nameFile = "";
var dataFile = "";
var pathDocumentLibrary = "";

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
        getRelatedDocuments(reference.replace(/\-/g, ""), "#tRelatedDocuments");
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
    reader.onload = await loadedFile(readFile);
}

async function loadedFile(evt) {
    dataFile = {
        '__metadata': { type: "SP.Data.FileLogListItem" }
    }
    showSpinner();
    if (reference == null) {
        hideSpinner();
        showErrorMessage("First you need to create an account and then try to attach files.");
    }
    else {
        var section = (currentUser.ProfileId === profileIdTeamLeader || currentUser.ProfileId === profileIdAnalyst) ? `Analyst` : `Account Manager`;
        var dateFolder = new Date().toISOString().split("T")[0];
        var ref = reference.replace(/\-/g, "");

        var formData = new FormData();
        formData.append('filesUploads.File', evt);
        formData.append('filesUploads.FilePath.Reference', ref);
        formData.append('filesUploads.FilePath.Section', section);
        formData.append('filesUploads.FilePath.Path', `${ref}\\${section}\\${dateFolder}`);
        formData.append('filesUploads.FilePath.FileName', evt.name);
        formData.append('filesUploads.FilePath.Date', dateFolder);
        formData.append('filesUploads.FilePath.UserEmail', _spPageContextInfo.userEmail);

        nameFile = evt.name;

        await uploadFileWebApi(formData);
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
    var basePathDocument = reference.replace(/\-/g, "");
    selectedNameFile = nameFile;

    if (levelsBreadcrumb.paths[1] == "Account Manager") {
        var pathValDocument = basePathDocument + "\\" + "Analyst";
        getRelatedDocumentsCallback(pathValDocument, callbackDeleteFile, function (error) {
            clickDeleteFile();
        });
    }
    else {
        if (userProfile == teamLeaderName || userProfile == analystName)
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
            var basePathDocument = reference.replace(/\-/g, "");
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

function clickViewFile(Name) {

    if (levelsBreadcrumb.paths.length == 1)
        window.open(urlDocumentManagerApiReinsurance + "File/download?filePath=" + reference.replace(/\-/g, "") + "/" + Name);
    else {

        var pathToQueryList = levelsBreadcrumb.paths.slice();

        pathToQueryList.shift();

        var pathToQuery = pathToQueryList.length == 0 ? "/" : pathToQueryList.join("/");

        window.open(urlDocumentManagerApiReinsurance + "File/download?filePath=" + reference.replace(/\-/g, "") + "/" + pathToQuery + "/" + Name);
    }
}

function clickAttach() {
    attach = !attach;
    if (attach) $("#divDropzone").show();
    else $("#divDropzone").hide();
}

function clickNTU() {
    sessionData = JSON.parse(localStorage.getItem("sessionData"));
    sessionData.entityType = account[0].ObjectType;
    localStorage.setItem('sessionData', JSON.stringify(sessionData));

    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/FormularioNTU.aspx?reference=" + reference, '_self');
}

async function getLists() {


    var office = await getLocalUserOffice();



    if (currentUser.ProfileId == accountManagerId)
        await getListAccountManagerTeamByOffice("#accountManager", office);
    else
        await getListAccountManagers("#accountManager");

    getListTypesMovements();
    getListCurrency();
    await getListStatus();
    getListTeams();
    getLineBusiness();
    getClients();
    getBusinessSources();
    getBusinessCountries();


}

function validateForm() {
    if (!isAccount) return true;

    var val = true;
    var msg = "There are required fields or the date is incorrect.";

    if ($("#office").val() == "Argentina" && $("#businessCountry").val() == "Argentina") {

        if ($("#core").val() == "") {
            val = false;
            $("#core").css('border-color', 'red');
        }
        else $("#core").css('border-color', '');

    }

    if ($("#typeofmovement").val() == null) {
        val = false;
        $("#typeofmovement").css('border-color', 'red');
    }
    else $("#typeofmovement").css('border-color', '');

    if ($("#inception").val() == "") {
        val = false;
        $("#inception").css('border-color', 'red');
    }
    else {

        if (!isNew && !isRenewal) {
            var currentYear = $("#inception").val().split("-")[0];
            var savedYear = account[0].Inception.split("-")[0];

            if (currentYear != savedYear) {
                val = false;
                msg = "The inception year cannot be different.";
            }
        }
        $("#inception").css('border-color', '');

    }

    if ($("#linebusiness").val() == null) {
        val = false;
        $("#linebusiness").css('border-color', 'red');
    }
    else $("#linebusiness").css('border-color', '');

    if ($("#team").val() == null) {
        val = false;
        $("#team").css('border-color', 'red');
    }
    else $("#team").css('border-color', '');

    if ($("#renewable").val() == null && ($("#typeofmovement").val() == "New New" || $("#typeofmovement").val() == "New Existing")) {
        val = false;
        $("#renewable").css('border-color', 'red');
    }
    else $("#renewable").css('border-color', '');

    if ($("#businessSource").val() == "") {
        val = false;
        $("#businessSource").css('border-color', 'red');
    }
    else $("#businessSource").css('border-color', '');

    if ($("#originalInsured").val() == "") {
        val = false;
        $("#originalInsured").css('border-color', 'red');
    }
    else $("#originalInsured").css('border-color', '');

    if ($("#typeplacement").val() == null) {
        val = false;
        $("#typeplacement").css('border-color', 'red');
    }
    else $("#typeplacement").css('border-color', '');

    if ($("#client").val() == null) {
        val = false;
        $("#client").css('border-color', 'red');
    }
    else $("#client").css('border-color', '');

    if ($("#receptionDate").val() == "") {
        val = false;
        $("#receptionDate").css('border-color', 'red');
    }
    else $("#receptionDate").css('border-color', '');

    if ($("#paymentClause").val() == "") {
        val = false;
        $("#paymentClause").css('border-color', 'red');
    }
    else $("#paymentClause").css('border-color', '');

    if ($("#contactMails").val() == "") {
        val = false;
        $("#contactMails").css('border-color', 'red');
    }
    else $("#contactMails").css('border-color', '');

    if ($("#branch").val() == null) {
        val = false;
        $("#branch").css('border-color', 'red');
    }
    else $("#branch").css('border-color', '');

    if ($("#subBranch").val() == null) {
        val = false;
        $("#subBranch").css('border-color', 'red');
    }
    else $("#subBranch").css('border-color', '');

    if ($("#assginedTeam").val().length == 0) {
        val = false;
        $("#div-assignedTeam .dropdown .btn").css('border', '1px solid red');
    }
    else $("#div-assignedTeam .dropdown .btn").css('border', '');

    if ($("#tpp").val() == "") {
        val = false;
        $("#tpp").css('border-color', 'red');
    }
    else $("#tpp").css('border-color', '');

    if (!val) {
        showErrorMessage(msg);
    }
    return val;
}

function formatCurrency(idValue) {
    $(idValue).on({
        "focus": function (event) {
            $(event.target).select();
        },
        "keyup": function (event) {
            $(event.target).val(function () {
                var splitValue = event.target.value.split(",");
                var newValue = "";
                splitValue.forEach(element => newValue += element);
                return formatNumber.new(newValue.replace("$", ""), "$");
            });
        }
    });
}

async function getViewRenewal() {
    $("#title").html("Renewal");
    $("#subtitle").html("New Account");

    $("#bEditAccount").prop("disabled", true);
    $("#bNewEndorsement").prop("disabled", true);
    $("#bRenewal").prop("disabled", true);
    $("#bNTU").prop("disabled", true);
    $("#bRequestProcess").prop("disabled", true);

    isAccount = true;

    account = await getData("Accounts", "?$select=*,UserAccount/Title&$expand=UserAccount&$select=AccountTeam/Title&$expand=AccountTeam&$filter=(Reference eq '" + reference + "')");

    await getUsersToAssign();
    getLists();

    getValuesFields();

    clickEditAccount();
}

function getValuesFields() {
    if (isRenewal) {


        //Requerimiento solicitado originalmente por Willis
        //var date = (new Date().getFullYear() + 1) + "-" + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-" + new Date().getDate().toString().padStart(2, "0");
        //Nuevo cambio solicitado el 19/03/2021 por Martín, en el cual especifica que el Inception de una renovación deberá ser un año más que el inception original.
        var inceptionDate = new Date(account[0].Inception);

        var date = (inceptionDate.getFullYear() + 1) + "-" + (inceptionDate.getMonth() + 1).toString().padStart(2, "0") + "-" + inceptionDate.getDate().toString().padStart(2, "0");

        $("#inception").val(date);
        $("#receptionDate").val(date);
        $("#status").val("Pending");
    }
    else {
        $("#inception").val(account[0].Inception.split("T")[0]);
        $("#receptionDate").val(account[0].ReceptionDate == null ? "" : account[0].ReceptionDate.split("T")[0]);
        $("#status").val(account[0].Status);
    }

    $("#comments").val(account[0].Comments);
    $("#renewable").val(account[0].Renewable == "Renewable" ? "Renewable" : "OneOff");
    $("#businessSource").val(account[0].BusinessSource);
    $("#originalInsured").val(account[0].OriginalInsured);
    $("#tpp").val(account[0].TPP);
    $("#client").val(account[0].Client);
    $("#linebusiness").val(account[0].LineBusiness);
    $("#typeplacement").val(account[0].TypePlacement || "P1");
    $("#contactMails").val(account[0].AllContactMails);
    $("#businessCountry").val(account[0].BusinessCountry);
    $("#ukReference").val(account[0].WillisUKReference);
    $("#paymentClause").val(account[0].PaymentClause ? "1" : "0");
    $("#firstDueDate").val(account[0].FirstDueDate?.split("T")[0]);

    changePaymentClause();
}

function clickRenewal() {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + reference + "&type=renewal", '_self');
}

function clickNewClaim() {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaim.aspx?ref=" + reference + "&type=new", '_self');
}

async function getProfile() {
    var profile = await getUserProfile();

    if (profile.ProfileId != claimHandlerId) $("#bNewClaim").prop("disabled", true);

    return profile;
}

function clickRequestProcess() {
    getRelatedDocumentsCallback(reference.replace(/\-/g, ""), function (data) {
        var date = new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-" + new Date().getDate().toString().padStart(2, "0");

        var dueDate = addDays(new Date(account[0].Inception), 30);
        var accountObj = {
            'reference': reference,
            'idAccount': account[0].Id,
            'startDate': date,
            'office': account[0].Office,
            'client': account[0].Client,
            'dueDate': formatDate(dueDate),
            'inception': account[0].Inception,
            'insured': account[0].OriginalInsured,
            'ObjectType': account[0].ObjectType
        }

        verifyObjectType() == "Accounts" ? AccountRequestProcess(accountObj, "requestProcessViewAccount") : EndorsementRequestProcess(accountObj, "requestProcessViewAccount");
    }, function (dataError) {

        showErrorMessage("You must attach at least one document before requesting a process.");
        hideSpinner();

    });

}

function changePaymentClause() {
    if ($("#paymentClause").val() == "1") {
        $("#divFirstDueDate").show();
    }
    else {
        $("#divFirstDueDate").hide();
        $("#firstDueDate").val("");
    }
}

function changeOffice() {
    getListTeams();
    getUsersToAssign();
}