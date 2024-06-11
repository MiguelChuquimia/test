var dataTableResult;
var dataExcel;

$(function () {
    $('#spinnerBulkLoad').hide();

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

async function clickBulkLoad(event) {
    event.preventDefault();

    const approve = confirm(`¿Está seguro de continuar con la carga masiva de siniestros?`);

    if (approve) {
        $('#tbl-data').hide();
        $('#spinnerBulkLoad').show();
        $('#btnBulkLoad').prop('disabled', true);

        if (dataTableResult != undefined)
            dataTableResult.destroy()
                .clear();

        $("#tbody-tbl-result").html("");

        var arrayInfo = [];
        var arrayClaimReferences = [];
        var valArrayClaimReferences = [];
        var valArrayReferences = [];
        var promisesValClaimRef = [];
        var promisesValRef = [];

        dataExcel.forEach(async (e, index) => {
            if (index > 0) {
                if (e[0] == null) {
                    arrayInfo.push({ "Reference": `${e[0]}`, "Date": new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(), "Status": "Los campos ClaimReference y Reference no pueden ser nulos" });
                } else {
                    var claimReference = e[0];
                    //var reference = e[2].toString().replace('&', '%26');

                    arrayClaimReferences.push({ claimReference });

                    // promisesValClaimRef.push(getDataPromise("Claims", "?$select=ClaimReference&$filter=(ClaimReference eq " + claimReference + ")"));
                    // promisesValRef.push(getDataPromise("Accounts", "?$select=Reference&$filter=(Reference eq '" + reference + "')"));
                }
            }
        });

        Promise.all([arrayClaimReferences].map(Promise.all.bind(Promise))).then(async (results) => {
            console.log(results);
            for (let index = 0; index < results[0].length; index++) {
                var date = new Date();
                var valArrayClaimRef = valArrayClaimReferences.find(f => f == results[0][index].claimReference);

                if (valArrayClaimRef == undefined) {
                    // var valClaimRef = results[1][index].d.results || [];
                    valArrayClaimReferences.push(results[0][index].claimReference);
                    // if (valClaimRef.length == 0) {
                        var createClaim = {
                            '__metadata': { type: "SP.Data.TPPListItem" },
                            'Title': dataExcel[index + 1][0].toString(),
                            'CodBroker': dataExcel[index + 1][1].toString()
                        }

                        try {
                            await addData("TPP", createClaim);
                            arrayInfo.push({ "Reference": "Claim Reference:" + results[0][index].claimReference, "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Exitoso" });
                        } catch (error) {
                            arrayInfo.push({ "Reference": "Claim Reference:" + results[0][index].claimReference, "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Error" });
                        }
                    // }
                    // else {
                    //     arrayInfo.push({ "Reference": "Claim Reference:" + results[0][index].claimReference, "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Siniestro existente" });
                    // }

                    // var valArrayRef = valArrayReferences.find(f => f == results[0][index].reference);

                    // var valRef = results[2][index].d.results || [];
                    // if (valRef.length == 0 && valArrayRef == undefined) {
                    //     valArrayReferences.push(results[0][index].reference);
                    //     var createAccount = {
                    //         '__metadata': { type: "SP.Data.AccountsListItem" },
                    //         'Title': dataExcel[index + 1][2].toString(),
                    //         'Reference': dataExcel[index + 1][2].toString(),
                    //         'Office': dataExcel[index + 1][3],
                    //         'Client': dataExcel[index + 1][6],
                    //         'Currency': dataExcel[index + 1][13],
                    //         'Status': "Completed"
                    //     }

                    //     try {
                    //         await addData("Accounts", createAccount);
                    //         arrayInfo.push({ "Reference": "Reference:" + dataExcel[index + 1][2].toString(), "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Exitoso" });
                    //     } catch (error) {
                    //         arrayInfo.push({ "Reference": "Reference:" + dataExcel[index + 1][2].toString(), "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Error" });
                    //     }
                    // }
                    // else
                    //     arrayInfo.push({ "Reference": "Reference:" + dataExcel[index + 1][2], "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Referencia existente" });
                }
                else
                    arrayInfo.push({ "Reference": "Claim Reference:" + results[0][index].claimReference, "Date": date.toLocaleDateString() + " " + date.toLocaleTimeString(), "Status": "Referencia duplicada en Excel" });
            }

            arrayInfo.forEach((info, indexInfo) => {
                $("#tbody-tbl-result").append($(`
                    <tr><td>${info.Reference}</td><td>${info.Date}</td><td>${info.Status}</td></tr>
                `));
            });

            $('#btnBulkLoad').prop('disabled', false);
            $('#spinnerBulkLoad').hide();
            $('#tbl-data').show();

            document.querySelectorAll('li.tab-item')[2].click();

            dataTableResult = addDataTable('tbl-result');
        });
    }
}

async function getRefByTitle(refRenewal) {
    return Promise.resolve(getDataPromise("Accounts", "?$select=Title&$filter=(Reference eq '" + refRenewal + "')"));
}