var urlBase = "/_api/web/lists/getbytitle";

IdDesde = 1
IdHasta = 4000
chunk = []
estado = {}

console.log("03_05_21 - ActualizarListas_process")

$(async function(){
	$("<div id='app'></div>").insertAfter($("h1#pageTitle"))

	ArmarAplicacion()
	$("#app").hide()

	SP.SOD.executeFunc('sp.js', 'SP.ClientContext',	async function () {
		$("#app").show()
	});

	$(document).on('click', '#btnActualizarAccounts', function(event){
		ActualizarObjectType('Accounts')
	});

	$(document).on('click', '#btnActualizarEndorsments', function(event){
		ActualizarObjectType('Endorsement')
	});

	$(document).on('click', '#btnActualizarDates', function(event){
		ActualizarProcessRequestDate()
	});

	setInterval(function () {
        RefreshToken()
    }, 5 * 60000);

    // PruebitaActualizar()
})

/*async function PruebitaActualizar(){
	console.log("Voy!")

	var url = urlBase + "('Process')/Items?$filter=(Id eq 2)&$top=4000";

	const result = await $.ajax({
		url: _spPageContextInfo.webAbsoluteUrl + url,
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" }
	});

	console.log(result)
	console.log(formatDate(result.d.results[0].Created))
	console.log(result.d.results[0].Created)

	console.log("Actualizo!")

	var dataSave = {
		'__metadata': { type: "SP.Data.EndorsementListItem" },
		'ProcessRequestDate': result.d.results[0].Created
	}

	updateEntityData('Endorsement', 8, dataSave, function (data) {
		console.log("Actualizado correctamente!")
	},function(data){
		console.log("Error :(")
		console.log(data)
	})
}*/









function ActualizarObjectType(pTipo){
	IdDesde = 1
	IdHasta = 4000

	$(".botonAccion").prop("disabled", true);
	$(".botonAccion").css("opacity", "0.5")

	$("#estadoActualizacion").empty()

	estado = {
		procesados: 0,
		actualizados: 0,
		conError: 0,
		idsError: []
	}

	ArmarContador()
	BuscarDatos(pTipo)
}

async function BuscarDatos(pTipo){
	htmlInfo = "<br><b>******************************************************************************************************************************************************************************</b>"
	htmlInfo += "<h1>Busco bloque | De id: " + IdDesde + " a id: " + IdHasta + "</h1>"
	$("#estadoActualizacion").prepend(htmlInfo)

	var url = urlBase + "('" + pTipo + "')/Items?$filter=(Id ge " + IdDesde + ") and (Id le " + IdHasta + ")&$top=4000";

	const result = await $.ajax({
		url: _spPageContextInfo.webAbsoluteUrl + url,
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" }
	});

	chunk = result.d.results
	console.log(chunk)

	if(chunk.length > 0){
		ProcesarChunk(0, pTipo)
	}else{
		htmlInfo = "<br><b>//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////</b><br>"
		htmlInfo += "<h1 style='color: green'>¡Terminó!</h1>"
		$("#estadoActualizacion").prepend(htmlInfo)
		window.scrollTo(0,document.body.scrollHeight);

		$(".botonAccion").prop("disabled", false);
		$(".botonAccion").css("opacity", "1")
	}
}

async function ProcesarChunk(i, pTipo){
	htmlInfo = "<h2 id='line" + i + "' style='display: inline-block; margin-bottom: 10px;'>" + (i + 1) + " de " + chunk.length + " - ID = " + chunk[i].ID + " - " + chunk[i].Title + "</h2>"
	$("#estadoActualizacion").prepend(htmlInfo)
	window.scrollTo(0,document.body.scrollHeight);

	var dataSave = {
		'__metadata': { type: "SP.Data." + pTipo + "ListItem" },
		'ObjectType': pTipo
	}

	updateEntityData(pTipo, chunk[i].ID, dataSave, function (data) {
		$("#line" + i).text($("#line" + i).text() + " | ¡Actualizado!")
		$("#estadoActualizacion").prepend("<br/>")
		window.scrollTo(0,document.body.scrollHeight);

		estado.procesados = estado.procesados + 1
		estado.actualizados = estado.actualizados + 1
		ArmarContador()

		i++

		if(i < chunk.length){
			setTimeout(
				function(){ 
					ProcesarChunk(i, pTipo)
				}
			, 10);
		}else{
			IdDesde = IdDesde + 4000
			IdHasta = IdHasta + 4000

			BuscarDatos(pTipo)
		}
	},function (data){
		console.log(data)

		$("#line" + i).text($("#line" + i).text() + " | ERROR :( Id = " + chunk[i].ID)
		$("#estadoActualizacion").prepend("<br/>")

		estado.procesados = estado.procesados + 1
		estado.conError = estado.conError + 1
		estado.idsError.push(chunk[i].ID)
		ArmarContador()

		i++

		if(i < chunk.length){
			setTimeout(
				function(){ 
					ProcesarChunk(i, pTipo)
				}
			, 100);
		}else{
			IdDesde = IdDesde + 4000
			IdHasta = IdHasta + 4000

			BuscarDatos(pTipo)
		}
	})
}

// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------

function ActualizarProcessRequestDate(){
	IdDesde = 1
	IdHasta = 4000

	$(".botonAccion").prop("disabled", true);
	$(".botonAccion").css("opacity", "0.5")

	$("#estadoActualizacion").empty()

	estado = {
		procesados: 0,
		actualizados: 0,
		conError: 0,
		accountsActualizados: 0,
		accountsErrores: 0,
		idsAccountsError: [],
		accountsNoEncontrados: 0,
		idsAccountsNoEncontrados: [],
		endorsementsActualizados: 0,
		endorsementsEnAccounts: 0,
		idsEndorsementsEnAccounts: [],
		endorsementsErrores: 0,
		idsEndorsementsError: [],
		endorsementsNoEncontrados: 0,
		idsEndorsementsNoEncontrados: [],
		registrosDuplicados: 0,
		idsRegistrosDuplicados: [],
		elementosConTitleNulos: 0,
		idsElementosConTitleNulos: [],
		masDeDosGuiones: 0,
		idsMasDeDosGuiones: []
	}

	ArmarContadorDates()
	BuscarDatosDates()
}

async function BuscarDatosDates(){
	htmlInfo = "<br><b>******************************************************************************************************************************************************************************</b>"
	htmlInfo += "<h1>Busco bloque | De id: " + IdDesde + " a id: " + IdHasta + "</h1>"
	$("#estadoActualizacion").prepend(htmlInfo)

	var url = urlBase + "('Process')/Items?$filter=(Id ge " + IdDesde + ") and (Id le " + IdHasta + ")&$top=4000";

	const result = await $.ajax({
		url: _spPageContextInfo.webAbsoluteUrl + url,
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" }
	});

	chunk = result.d.results

	if(chunk.length > 0){
		ProcesarChunkDates(0)
	}else{
		htmlInfo = "<br><b>//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////</b><br>"
		htmlInfo += "<h1 style='color: green'>¡Terminó!</h1>"
		$("#estadoActualizacion").prepend(htmlInfo)

		$(".botonAccion").prop("disabled", false);
		$(".botonAccion").css("opacity", "1")
	}
}

async function ProcesarChunkDates(i){
	htmlInfo = "<h2 id='line" + i + "' style='display: inline-block; margin-bottom: 10px;'>" + (i + 1) + " de " + chunk.length + " - ID Process = " + chunk[i].ID + " - " + chunk[i].Title + "</h2>"
	$("#estadoActualizacion").prepend(htmlInfo)

	var Titulo = chunk[i].Title

	if(Titulo != null){
		if(Titulo != "null"){
			var count = (Titulo.match(/-/g) || []).length;

			if(count == 1){
				$("#line" + i).text($("#line" + i).text() + " | (1) Un guión, es Account")

				buscoAccount = await BuscarEnAccountOEndorsment('Accounts', Titulo)

				if(buscoAccount.length > 0){
					if(buscoAccount.length > 1){
						$("#line" + i).text($("#line" + i).text() + " | Tiene más de un elemento con ese ID | Id Account: " + buscoAccount[0].ID)

						// Actualizo estado y ProcesarSiguiente
						estado.procesados ++
						estado.registrosDuplicados ++
						estado.idsRegistrosDuplicados.push(chunk[i].ID)

						ProcesarSiguiente(i)
					}else{
						$("#line" + i).text($("#line" + i).text() + " | ¡Encontrado! | Id Account: " + buscoAccount[0].ID)

						// Intento actualizar
						ActualizarFecha('Accounts', buscoAccount[0].ID, chunk[i].Created, i)
					}
				}else{
					$("#line" + i).text($("#line" + i).text() + " | NO Encontrado :( ")

					// Actualizo estado y ProcesarSiguiente
					estado.procesados ++
					estado.accountsNoEncontrados ++
					estado.idsAccountsNoEncontrados.push(chunk[i].ID)

					ProcesarSiguiente(i)
				}
			}else{
				if(count == 2){
					$("#line" + i).text($("#line" + i).text() + " | (2) Dos guiones, es Endorsement")

					buscoEndorsment = await BuscarEnAccountOEndorsment('Endorsement', Titulo)

					if(buscoEndorsment.length > 0){
						if(buscoEndorsment.length > 1){
							$("#line" + i).text($("#line" + i).text() + " | Tiene más de un elemento con ese ID | Id Endorsement: " + buscoEndorsment[0].ID)

							// Actualizo estado y ProcesarSiguiente
							estado.procesados ++
							estado.registrosDuplicados ++
							estado.idsRegistrosDuplicados.push(chunk[i].ID)

							ProcesarSiguiente(i)
						}else{
							$("#line" + i).text($("#line" + i).text() + " | ¡Encontrado! | Id Endorsement: " + buscoEndorsment[0].ID)

							// Intento actualizar
							ActualizarFecha('Endorsement', buscoEndorsment[0].ID, chunk[i].Created, i)
						}
					}else{
						$("#line" + i).text($("#line" + i).text() + " | NO Encontrado, busco en Account: ")

						buscoAccount = await BuscarEnAccountOEndorsment('Accounts', Titulo)

						if(buscoAccount.length > 0){
							estado.endorsementsEnAccounts ++
							estado.idsEndorsementsEnAccounts.push(chunk[i].ID)

							if(buscoAccount.length > 1){
								$("#line" + i).text($("#line" + i).text() + " | Tiene más de un elemento con ese ID | Id Account: " + buscoAccount[0].ID)

								// Actualizo estado y ProcesarSiguiente
								estado.procesados ++
								estado.registrosDuplicados ++
								estado.idsRegistrosDuplicados.push(chunk[i].ID)

								ProcesarSiguiente(i)
							}else{
								$("#line" + i).text($("#line" + i).text() + " | ¡Encontrado! | Id Account: " + buscoAccount[0].ID)

								// Intento actualizar Account con dos guiones
								ActualizarFecha('Accounts', buscoAccount[0].ID, chunk[i].Created, i)
							}
						}else{
							$("#line" + i).text($("#line" + i).text() + " | Tampoco encontrado en Account :( ")

							// Actualizo estado y ProcesarSiguiente
							estado.procesados ++
							estado.endorsementsNoEncontrados ++
							estado.idsEndorsementsNoEncontrados.push(chunk[i].ID)

							ProcesarSiguiente(i)
						}
					}
				}else{
					$("#line" + i).text($("#line" + i).text() + " | Tiene más de 2 guiones (?)")

					estado.procesados ++
					estado.masDeDosGuiones ++
					estado.idsMasDeDosGuiones.push(chunk[i].ID)

					ProcesarSiguiente(i)
				}		
			}
		}else{
			$("#line" + i).text($("#line" + i).text() + " | NULL - El Title del elemento es Nulo")

			estado.procesados ++
			estado.elementosConTitleNulos ++
			estado.idsElementosConTitleNulos.push(chunk[i].ID)

			ProcesarSiguiente(i)
		}
	}else{
		$("#line" + i).text($("#line" + i).text() + " | NULL - El Title del elemento es Nulo")

		estado.procesados ++
		estado.elementosConTitleNulos ++
		estado.idsElementosConTitleNulos.push(chunk[i].ID)

		ProcesarSiguiente(i)
	}
}

function ActualizarFecha(pTipo, id, pFecha, i){
	var dataSave = {
		'__metadata': { type: "SP.Data." + pTipo + "ListItem" },
		'ProcessRequestDate': pFecha
	}

	updateEntityData(pTipo, id, dataSave, function (data) {
		$("#line" + i).html($("#line" + i).text() + " | <span style='color: green;'><b>¡Actualizado!</b></span>")
		
		estado.procesados ++
		estado.actualizados ++
		
		if(pTipo == "Accounts"){
			estado.accountsActualizados ++
		}else{
			estado.endorsementsActualizados ++
		}

		ProcesarSiguiente(i)
	},function (data){
		console.log(data)

		$("#line" + i).html($("#line" + i).text() + " | <span style='color: red;'><b>ERROR :( Id = " + chunk[i].ID + "</b></span>")

		estado.procesados ++
		estado.conError ++

		if(pTipo == "Accounts"){
			estado.accountsErrores ++
			estado.idsAccountsError.push(chunk[i].ID)
		}else{
			estado.endorsementsErrores ++
			estado.idsEndorsementsError.push(chunk[i].ID)
		}

		ProcesarSiguiente(i)
	})
}

function ProcesarSiguiente(i){
	$("#estadoActualizacion").prepend("<br/>")

	ArmarContadorDates()

	i++

	if(i < chunk.length){
		setTimeout(
			function(){ 
				ProcesarChunkDates(i)
			}
		, 10);
	}else{
		IdDesde = IdDesde + 4000
		IdHasta = IdHasta + 4000

		BuscarDatosDates()
	}
}

async function BuscarEnAccountOEndorsment(pTipo, pTitulo){
	var url = urlBase + "('" + pTipo + "')/Items?$select=ID,Reference&$filter=(Reference eq '" + pTitulo + "')";

	const result = await $.ajax({
		url: _spPageContextInfo.webAbsoluteUrl + url,
		method: "GET",
		headers: { "Accept": "application/json; odata=verbose" }
	});

	return result.d.results
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ArmarAplicacion(){
	htmlApp = "<span class='botonAccion' id='btnActualizarAccounts'>Actualizar Accounts</span>"
	htmlApp += "<span class='botonAccion' id='btnActualizarEndorsments'>Actualizar Endorsements</span>"
	htmlApp += "<span class='botonAccion' id='btnActualizarDates'>Actualizar ProcessRequestDate</span>"

	htmlApp += "<div id='contador'></div>"
	htmlApp += "<div id='estadoActualizacion'></div>"

	$("#app").html(htmlApp)

	$("span.botonAccion")
		.css("cursor", "pointer")
		.css("padding", "20px")
		.css("margin", "5px")
		.css("border-radius", "5px")
		.css("color", "white")
		.css("background-color", "#1184CA")
		.css("display", "inline-block")
		.css("font-size", "17px")

	$("#app").css("margin-top", "30px")
	$("#estadoActualizacion").css("margin-top", "30px")

	$("#contador")
		.css("font-weight", "bold")
		.css("margin", "15px 0px")
		.css("line-heigth", "2.1")
		.css("font-size", "16px")
}

function ArmarContador(){
	strErrores = ""

	for (var i = 0; i < estado.idsError.length; i++) {
		if(strErrores != ""){
			strErrores += ", " 
		}

		strErrores += estado.idsError[i]
	};

	if(strErrores != ""){
		strErrores = " (Ids de error: " + strErrores + ")"
	}

	htmlContador = "Procesados: " + estado.procesados + "<br/>"
	htmlContador += "Actualizados: " + estado.actualizados + "<br/>"
	htmlContador += "Errores: " + estado.conError + strErrores + "<br/>"

	$("#contador").html(htmlContador)
}

function ArmarContadorDates(){
	strIdsAccountsError = ArmarStrArrays(estado.idsAccountsError, "Ids Accounts con error al actualizar")
	strIdsAccountsNoEncontrados = ArmarStrArrays(estado.idsAccountsNoEncontrados, "Ids Accounts no encontrados")

	strIdsEndorsementsEnAccounts = ArmarStrArrays(estado.idsEndorsementsEnAccounts, "Ids Endorsements en Accounts")
	strIdsEndorsementsError = ArmarStrArrays(estado.idsEndorsementsError, "Ids Endorsements con error al actualizar")
	strIdsEndorsementsNoEncontrados = ArmarStrArrays(estado.idsEndorsementsNoEncontrados, "Ids Endorsements no encontrados")

	strIdsRegistrosDuplicados = ArmarStrArrays(estado.idsRegistrosDuplicados, "Ids registros duplicados")
	strIdsElementosConTitleNulos = ArmarStrArrays(estado.idsElementosConTitleNulos, "Ids Elementos con Title nulo")
	strIdsMasDeDosGuiones = ArmarStrArrays(estado.idsMasDeDosGuiones, "Ids registros con más de dos guiones")

	htmlContador = "Procesados: " + estado.procesados + "<br/>"
	htmlContador += "<span style='color: green;'>Actualizados: " + estado.actualizados + "</span><br/>"
	htmlContador += "<span style='color: red;'>Total errores: " + estado.conError + "</span><br/><br/>"

	htmlContador += "<span style='color: green;'>Accounts actualizados: " + estado.accountsActualizados + "</span><br/>"
	htmlContador += "<span style='color: red;'>Errores al actualizar Accounts: " + estado.accountsErrores + strIdsAccountsError + "</span><br/>"
	htmlContador += "Accounts no encontrados: " + estado.accountsNoEncontrados + strIdsAccountsNoEncontrados + "<br/><br/>"

	htmlContador += "<span style='color: green;'>Endorsements actualizados: " + estado.endorsementsActualizados + "</span><br/>"
	htmlContador += "Endorsements en Accounts: " + estado.endorsementsEnAccounts + strIdsEndorsementsEnAccounts + "<br/>"
	htmlContador += "<span style='color: red;'>Errores al actualizar Endorsements: " + estado.endorsementsErrores + strIdsEndorsementsError + "</span><br/>"
	htmlContador += "Endorsements no encontrados: " + estado.endorsementsNoEncontrados + strIdsEndorsementsNoEncontrados + "<br/><br/>"

	htmlContador += "Registros duplicados: " + estado.registrosDuplicados + strIdsRegistrosDuplicados + "<br/>"
	htmlContador += "Elementos con Title nulo: " + estado.elementosConTitleNulos + strIdsElementosConTitleNulos + "<br/>"
	htmlContador += "Registros con más de dos guiones: " + estado.masDeDosGuiones + strIdsMasDeDosGuiones + "<br/>"

	$("#contador").html(htmlContador)
}

function ArmarStrArrays(pArray, descripcion){
	devuelvo = ""

	for (var i = 0; i < pArray.length; i++) {
		if(devuelvo != ""){
			devuelvo += ", " 
		}

		devuelvo += pArray[i]
	};

	if(devuelvo != ""){
		devuelvo = " (" + descripcion + ": " + devuelvo + ")"
	}

	return devuelvo
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