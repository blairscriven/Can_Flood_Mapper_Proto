		 /*************************
         * Add OpenStreetMap map using Leaflet
         ************************/
		const mymap = L.map("mapid").setView([43.356, -80.316], 13);
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(mymap);
		 

		 /*************************
         * Set up the Click function for the Catchment Polygon layer -
		 * Will trigger a rendering of the HAND model based on the 
		 * simulation type selected and feature properties 
         *************************/
		var Cors_enable = "https://cors-anywhere.herokuapp.com/";
		var Return_ori_text = document.getElementById("disclaimer").innerHTML;
		function onEachFeature(feature, layer) {
			//Collect all the needed attribute data from Catchment polygon
			var base = feature.properties.BASE;
			var QMIN_A = feature.properties.Qmin_a; //CERC-HAND-D Equation: Q = a(H^n)
			var QMIN_N = feature.properties.Qmin_n;
			var QMAX_A = feature.properties.Qmax_a;
			var QMAX_N = feature.properties.Qmax_n;
			var url_hand = feature.properties.HAND_URL;
			var url_Hydro_station = Cors_enable + feature.properties.HYDRO_URL;
			plotty.addColorScale("mycolorscale", ["#1e00ff"], [1]); //Renders inundated areas blue
			const plottyRenderer = L.LeafletGeotiff.plotty({
				displayMin: -2,
				displayMax: -1,
				clampLow: false,
				clampHigh: false,
				colorScale: "mycolorscale"
			});
			const GeoTiff_Layer = L.leafletGeotiff(url_hand, {
				renderer: plottyRenderer
			}).addTo(mymap);
			layer.on('click', function (e) {
				console.log(e);
				document.getElementById("disclaimer").innerHTML = Return_ori_text; //Returns original disclaimer
				var sim_type = document.getElementById("simformat").value //user selected simulation type
				if (sim_type == 'H_sim') {
					var sql_value = document.getElementById('HRange').value;
					var math = Number(sql_value);
					sql_value = math;
					var sql_text =  sql_value;
					console.log(sql_text);
					GeoTiff_Layer.options.renderer.setDisplayRange(0, sql_text); //Sets Threshold to render the flood map
				} else if (sim_type == 'Qmin_sim') {
					var sql_value = document.getElementById('QRange').value;
					var math = (QMIN_A * (sql_value ** QMIN_N)); //CERC-HAND-D Qmin equation
					sql_value = math;
					var sql_text =  sql_value;
					console.log(sql_text);
					GeoTiff_Layer.options.renderer.setDisplayRange(0, sql_text);
				} else if (sim_type == 'Qmax_sim') {
					var sql_value = document.getElementById('QRange').value;
					var math = (QMAX_A * (sql_value ** QMAX_N)); //CERC-HAND-D Qmax equation
					sql_value = math;
					var sql_text =  sql_value;
					console.log(sql_text);
					GeoTiff_Layer.options.renderer.setDisplayRange(0, sql_text);
				} else if (sim_type == 'now_sim') { 
					var ECCC_discharge = 0
					var ECCC_level = 0
					fetch(url_Hydro_station, 
						{}).then(function(response){
						return response.text();
					}).then(function(text){
						//Extract the values from the discharge and water level columns (feilds) in the last row(line)
						var lines = text.trim().split('\n');
						var lastLine = lines.slice(-1)[0];

						var fields = lastLine.split(',');
						ECCC_discharge = fields[6];
						ECCC_level = fields[2];

						console.log(ECCC_discharge);
						console.log(ECCC_level);
						if(ECCC_level !== null){ //Checks first if there is water level data; if not, discharge is used
							sql_value = Number(ECCC_level) - base;
							var sql_text = sql_value;
							console.log(sql_value);
							GeoTiff_Layer.options.renderer.setDisplayRange(0, sql_text);
						} else if (ECCC_discharge !== null) {
							sql_value = (QMAX_A * (Number(ECCC_discharge) ** QMAX_N));
							var sql_text = sql_value;
							console.log(sql_text);
							GeoTiff_Layer.options.renderer.setDisplayRange(0, sql_text);
						} else {
							document.getElementById("disclaimer").innerHTML = "No station data available"; //error handling; changes disclaimer
						}
					});
				} else {
				}
			});
		}

		 /*************************
         * Add a GEOJson layer - Catchment Polygons
         *************************/
		// Define the symbology of the catchment polygons
		var myStyle = {
			"color": "#f50515",
			"fillOpacity": 0,
			"weight": 5,
			"opacity": 0.65
		};
		
		//Create a GeoJSON layer
		var geojsonLayer = new L.GeoJSON(geojsonLayer, {
			style: myStyle,
			onEachFeature: onEachFeature
		}).addTo(mymap);

		//Request the GeoJson data from GitHub using Ajax
		const Catchment_url = "https://blairscriven.github.io/test/Catchment_polygons.geojson";
		$.ajax({
		dataType: "json",
		url: Catchment_url,
		success: function(data) {
				geojsonLayer.addData(data);
		}
		}).error(function() {});