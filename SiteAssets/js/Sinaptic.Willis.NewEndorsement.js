console.log("Loading: Sinaptic.Willis.NewEndorsement.js")

var dueDate;
var dataAccount;
var count = 1;

$(function () {
    getEndorsement();
});

async function getEndorsement() {
    dataAccount = await getData("Accounts", "?$filter=(Reference eq '" + window.location.search.substring(1).split("=")[1] + "')");

    var dataEndorsement = await getData("Endorsement", "?$filter=(AccountReference eq '" + window.location.search.substring(1).split("=")[1] + "')&$orderby=Reference asc");

    if (dataEndorsement.length > 0) {
        dataEndorsement.sort((a, b) => a["Reference"].split("-")[dataEndorsement[0].Reference.split("-").length - 1] - b["Reference"].split("-")[dataEndorsement[0].Reference.split("-").length - 1]);
        var splitLastReference = dataEndorsement[dataEndorsement.length - 1].Reference.split("-");
        count = parseInt(splitLastReference[splitLastReference.length - 1]) + 1;

        // for (let index = 0; index < dataEndorsement.length; index++) {
        //     if (index == dataEndorsement.length - 1) {
        //         var splitData = dataEndorsement[index].Reference.split("-");
        //         if (splitData[splitData.length - 1] != undefined) count = parseInt(splitData[splitData.length - 1]) + 1;
        //     }
        // }
    }

    $("#reference").val(window.location.search.substring(1).split("=")[1]);
}

async function clickSave() {
    dueDate = sumDate($("#inception").val(), 30);
    if (validateForm()) {
        var dataSave = {
            '__metadata': { type: "SP.Data.EndorsementListItem" },
            'Reference': $("#reference").val() + "-" + count,
            'OriginalInsured': dataAccount[0].OriginalInsured,
            'Inception': new Date($("#inception").val()),
            'TypeOfMovement': $("#movementType").val(),
            'Comments': $("#comment").val(),
            'DueDate': dueDate,
            'UserAccountId': _spPageContextInfo.userId,
            'AccountReference': window.location.search.substring(1).split("=")[1],
            'Status': "Pending",
            'Office': dataAccount[0].Office,
            'Team': dataAccount[0].Team,
            'BusinessSource': dataAccount[0].BusinessSource,
            'Currency': dataAccount[0].Currency,
            'BusinessCountry': dataAccount[0].BusinessCountry,
            'TypePlacement': dataAccount[0].TypePlacement || "",
            'GLoB': dataAccount[0].GLoB || "",
            'Client': dataAccount[0].Client,
            'LineBusiness': dataAccount[0].LineBusiness,
            'TPP': dataAccount[0].TPP || "",
            'Industry': dataAccount[0].Industry,
            'ReceptionDate': dataAccount[0].ReceptionDate,
            'GrossPremiumUSD': dataAccount[0].GrossPremiumUSD,
            'IncomeUSD': dataAccount[0].IncomeUSD,
            'CORE': dataAccount[0].CORE || ""
        }

        var newEndo = await addData("Endorsement", dataSave);

        addFolderDocumentLibrary("Documents/" + $("#reference").val() + "/", newEndo.ID);

        var dataUpdate = {
            '__metadata': { type: "SP.Data.AccountsListItem" },
            'AccountDueDate': dueDate
        }

        updateData("Accounts", dataAccount[0].Id, dataUpdate);

        $("#inception").val("");
        $("#movementType").val("Endorsement");
        $("#comment").val("");
        showErrorMessage("Successfully registered.");
        clickCancel();
    }
    else showErrorMessage("There are required fields or the date is incorrect.");
}

function clickCancel() {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAccount.aspx?ref=" + window.location.search.substring(1).split("=")[1] + "&type=account", '_self');
}

function validateForm() {
    var val = true;

    if ($("#movementType").val() == "") {
        val = false;
        $("#movementType").css('border-color', 'red');
    }
    else $("#movementType").css('border-color', '');

    if ($("#inception").val() == "") {
        val = false;
        $("#inception").css('border-color', 'red');
    }
    else $("#inception").css('border-color', '');

    if ($("#reference").val() == "") {
        val = false;
        $("#reference").css('border-color', 'red');
    }
    else $("#reference").css('border-color', '');

    var dateAccount = Date.parse(dataAccount[0].Inception.split("T")[0]);
    var dateEndorsement = Date.parse($("#inception").val());

    if (dateEndorsement < dateAccount) {
        $("#inception").css('border-color', 'red');
        val = false;
        //showErrorMessage("The expiration date must be between " + dataAccount[0].Inception + " and " + dataAccount[0].AccountDueDate + ".");
    }

    return val;
}