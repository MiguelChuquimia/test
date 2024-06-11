var dataTableResult;
var dataExcel;

$(function () {
    $("#inputYear").val(new Date().getFullYear());
    $('#spinnerRenewal').hide();

    var input = document.getElementById('input');
    input.addEventListener('change', function () {
        readXlsxFile(input.files[0]).then(function (data) {
            var i = 0;

            $("#tbl-data").html("");

            dataExcel = data;
            data.map((row, index) => {
                if (i == 0) {
                    let table = document.getElementById('tbl-data');
                    generateTableHead(table, row);
                }

                if (i > 0) {
                    let table = document.getElementById('tbl-data');
                    generateTableRows(table, row);
                }

                i++;
            })
        })
    });

    let tabSwitchers = document.querySelectorAll('[target-wrapper]')
    tabSwitchers.forEach(item => {
        item.addEventListener('click', (e) => {
            let currentWrapperId = item.getAttribute('target-wrapper')
            let currentWrapperTargetId = item.getAttribute('target-tab')

            let currentWrapper = document.querySelector(`#${currentWrapperId}`)
            let currentWrappersTarget = document.querySelector(`#${currentWrapperTargetId}`)

            let allCurrentTabItem = document.querySelectorAll(`[target-wrapper='${currentWrapperId}']`)
            let allCurrentWrappersTarget = document.querySelectorAll(`#${currentWrapperId} .tab-content`)

            if (currentWrappersTarget) {
                if (!currentWrappersTarget.classList.contains('active')) {
                    allCurrentWrappersTarget.forEach(tabItem => {
                        tabItem.classList.remove('active')
                    })
                    allCurrentTabItem.forEach(item => {
                        item.classList.remove('active')
                    })
                    item.classList.add('active')
                    currentWrappersTarget.classList.add('active')
                }
            }
        })
    });
});

function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement('th');
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTableRows(table, data) {
    let newRow = table.insertRow(-1);
    data.map((row, index) => {
        let newCell = newRow.insertCell();
        let newText = document.createTextNode(row);
        newCell.appendChild(newText);
    })
}

async function clickRenewal(event) {
    event.preventDefault();

    const approve = confirm(`¿Está seguro de continuar con el proceso de renovación ${$("#inputYear").val()}?`);

    if (approve) {
        $('#tbl-data').hide();
        $('#spinnerRenewal').show();
        $('#btnRenewal').prop('disabled', true);

        if (dataTableResult != undefined)
            dataTableResult.destroy()
                .clear();

        $("#tbody-tbl-result").html("");

        var arrayInfo = [];
        var arrayReferences = [];
        var valArrayReferences = [];
        var promisesValRefRenewal = [];
        var promisesUserId = [];

        dataExcel.forEach(async (e, index) => {
            if (index > 0) {
                var date = new Date();
                var year = +$("#inputYear").val().substring(2, 4);
                var refRenewal = e[0].split('-')[0] + "-" + year.toString();

                arrayReferences.push(refRenewal);
                //promisesValRefRenewal.push(getDataPromise("Accounts", "?$select=Title&$filter=(Reference eq '" + refRenewal + "')"));
                // promisesUserId.push(new Promise((resolve, reject) => {
                //     resolve(getUserIdByTitle(e[12]));
                // }));

                promisesValRefRenewal.push(getDataPromise("Accounts", "?$select=Title&$filter=(Reference eq '" + refRenewal + "')"));

                promisesUserId.push(getUserIdByTitle(e[12].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("'","''")));

                // Promise.resolve(getDataPromise("Accounts", "?$select=Title&$filter=(Reference eq '" + refRenewal + "')")).then(val => {
                //     promisesValRefRenewal.push(val);
                // });

                // getRefByTitle(refRenewal).then(val => {
                //     promisesValRefRenewal.push(val);
                // });

                // getUserIdByTitle(e[12]).then(val => {
                //     promisesUserId.push(val);
                // });
            }
        });

        Promise.all([arrayReferences, promisesValRefRenewal, promisesUserId].map(Promise.all.bind(Promise))).then(async (results) => {
            console.log(results);
            for (let index = 0; index < results[0].length; index++) {
                // var valRefRenewal = await getData("Accounts", "?$select=Title&$filter=(Reference eq '" + refRenewal + "')");
                // var userId = await getUserIdByTitle(e[12]);
                var date = new Date();
                var valArrayRef = valArrayReferences.find(f => f == results[0][index]);

                if (valArrayRef == undefined) {
                    var valRef = results[1][index].d.results || [];
                    var valUser = results[2][index].d.results || [];
                    if (valRef.length == 0) {
                        valArrayReferences.push(results[0][index]);

                        var createRenewal = {
                            '__metadata': { type: "SP.Data.AccountsListItem" },
                            'Title': results[0][index],
                            'Reference': results[0][index],
                            'Office': dataExcel[index + 1][2],
                            'Team': dataExcel[index + 1][3],
                            'Renewable': dataExcel[index + 1][4],
                            'Inception': dataExcel[index + 1][5],
                            'Currency': dataExcel[index + 1][6],
                            'Client': dataExcel[index + 1][7],
                            'UserAccountId': (valUser.length == 0) ? null : valUser[0]["UserId"],
                            'GLoB': dataExcel[index + 1][19],
                            'LineBusiness': dataExcel[index + 1][19],
                            'TypePlacement': dataExcel[index + 1][20],
                            'OriginalInsured': dataExcel[index + 1][22],
                            'TypeOfMovement': dataExcel[index + 1][23],
                            'BusinessSource': dataExcel[index + 1][24],
                            'BusinessCountry': dataExcel[index + 1][25],
                            'Status': "Pending"
                        }

                        try {
                            await addData("Accounts", createRenewal);
                            arrayInfo.push({ "Reference": results[0][index], "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Exitoso" });
                        } catch (error) {
                            arrayInfo.push({ "Reference": results[0][index], "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Error" });
                        }
                    }
                    else
                        arrayInfo.push({ "Reference": results[0][index], "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Referencia existente" });
                }
                else
                    arrayInfo.push({ "Reference": results[0][index], "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Referencia duplicada en Excel" });
            }

            arrayInfo.forEach((info, indexInfo) => {
                $("#tbody-tbl-result").append($(`
                    <tr><td>${info.Reference}</td><td>${info.Date}</td><td>${info.Status}</td></tr>
                `));
            });

            $('#btnRenewal').prop('disabled', false);
            $('#spinnerRenewal').hide();
            $('#tbl-data').show();

            document.querySelectorAll('li.tab-item')[2].click();

            dataTableResult = addDataTable('tbl-result');
        });
    }
}

async function getRefByTitle(refRenewal) {
    return Promise.resolve(getDataPromise("Accounts", "?$select=Title&$filter=(Reference eq '" + refRenewal + "')"));
}