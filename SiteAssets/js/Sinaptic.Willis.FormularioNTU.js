console.log("Loading: Sinaptic.Willis.FormularioNTU.js")

var dueDate;
var dataAccount;
var userOffice;
var listToSave;

$(function () {
    $("#QNPUser").hide();
    $("#nextPeriodDate").hide();
    $("#QNPUserLabel").hide();
    $("#nextPeriodDateLabel").hide();
    getListQNPUser();

    getAccountInfo();
});

async function getAccountInfo() {
        
    var reference = window.location.search.substring(1).split("=")[1];
    var objectType = window.location.search.substring(1).split("=")[3];
    sessionData = JSON.parse(localStorage.getItem("sessionData"));
    listToSave = sessionData.entityType == "Account" ? "Accounts":"Endorsement";

    dataAccount = await getData(listToSave, "?$filter=(Reference eq '" + window.location.search.substring(1).split("=")[1] + "')");
    $("#reference").val(reference);
    $("#reason").val("");
}

async function clickSave() {
    if (validateForm()) {
        var today = new Date();

        var todayFormat = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate().toString();
        var dataSave = {
            '__metadata': { type: "SP.Data."+listToSave+"ListItem" },
            'NTUReason': $("#reason").val(),
            'NTUComments': $("#comment").val(),
            'NTUDate': todayFormat,
            'NTUUserId': _spPageContextInfo.userId,
            'Status': 'Cancelled',
            'QuoteNextPeriod': $("#QNP")[0].checked,
            'QNPUserId': parseInt($("#QNPUser").val()),
            'QuoteNextPeriodDate': $("#QNP")[0].checked ? $("#nextPeriodDate").val():null
        }

        await updateData(listToSave, dataAccount[0].Id, dataSave);

        showErrorMessage("Successfully registered.");
        //clickCancel();
    }
    else showErrorMessage("There are required fields or the date is incorrect.");
}

function clickCancel() {
    window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Accounts.aspx", '_self');
}

function validateForm() {
    var val = true;

    if ($("#reason").val() == null) {
        val = false;
        $("#reason").css('border-color', 'red');
    }
    else $("#reason").css('border-color', '');

    
    if ($("#QNP")[0].checked && $("#nextPeriodDate").val()== "") {
        val = false;
        $("#nextPeriodDate").css('border-color', 'red');
    }
    else { $("#nextPeriodDate").css('border-color', ''); }

    return val;
}

function changeQNP() {
    if ($("#QNP")[0].checked == true) {
        $("#QNPUser").show();
        $("#nextPeriodDate").show();
        $("#QNPUserLabel").show();
        $("#nextPeriodDateLabel").show();

    }
    else {
        $("#QNPUser").hide();
        $("#nextPeriodDate").hide();
        $("#QNPUserLabel").hide();
        $("#nextPeriodDateLabel").hide();
    }
}

async function getListQNPUser() {
    userOffice = await getUserOffice();

    await getListAccountManagerTeam("#QNPUser", userOffice.results);


    //var listQNPUser = await getData("Users", "?$select=*,Office/Title&$expand=Office&$select=User/Title&$expand=User&$filter=(Office/Title eq '" + userOffice.Office + "')");

    //listQNPUser.forEach(element => {
    //    $("#QNPUser").append($("<option value=\"" + element.UserId + "\">" + element.User.Title + "</option>"));
    //});

    $("#QNPUser").val(_spPageContextInfo.userId);
}