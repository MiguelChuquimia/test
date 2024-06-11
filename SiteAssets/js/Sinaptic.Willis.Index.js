console.log("Loading: Sinaptic.Willis.Index.js");

var accountManagerId = 1;
var headId = 2;
var teamLeaderId = 3;
var claimHandlerId = 4;
var analystId = 5;
var teamLeaderClaimsId = 6;
var analystClaimsId = 7;
var adminId = 8;

$(function () {
    showSpinner();
    validatePage();
});

async function validatePage() {
    var profile = await getUserProfile();

    switch (profile.ProfileId) {
        case accountManagerId:
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Accounts.aspx", '_self');
            break;
        case headId:
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Accounts.aspx", '_self');
        break;
        case teamLeaderId:
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAnalyst.aspx", '_self');
            break;
        case claimHandlerId:
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Claims.aspx", '_self');
            break;
        case analystId:
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewAnalyst.aspx", '_self');
            break;
        case teamLeaderClaimsId:
        case analystClaimsId:
            window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/ViewClaimsTasks.aspx", '_self');
            break;
        case adminId:
           window.open(_spPageContextInfo.webAbsoluteUrl + "/Pages/Accounts.aspx", '_self');
        break;
    
        default:
            break;
    }
}