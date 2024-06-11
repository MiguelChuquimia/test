var script = document.createElement('script');

console.log("03_05_21 - ActualizarListas")

script.onload = function () {
    $(function(){
    	$("#DeltaPageStatusBar").hide()
    	$.getScript("../SiteAssets/js/Sinaptic.Willis.Service.js")
			.done(function(script, textStatus){
				$.getScript("../SiteAssets/js/ActualizarListas_process.js?v=0.1")
					.done(function(script, textStatus){
						
					}
				)
					.fail(function(jqxhr, settings, exception){
						console.log("Dio un error carga ActualizarListas_process.js")
						console.log(exception)
					}
				);
			}
		)
			.fail(function(jqxhr, settings, exception){
				console.log("Dio un error carga Sinaptic.Willis.Service.js")
				console.log(exception)
			}
		);
	})
};
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';

document.head.appendChild(script);