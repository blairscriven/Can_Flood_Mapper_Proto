		 /*************************
         * Add OpenStreetMap map using Leaflet
         ************************/
		const mymap = L.map("mapid").setView([43.356, -80.316], 13);
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(mymap);
		 
		 /*************************
         * Add legends
         ************************/
		function getColorQ(d) {
			return d == 'Min. Flood Extent' ? '#1e00ff' :
				   d == 'Max. Flood Extent'  ? '#00eaff' :
							  '#FFEDA0';
		}
		
		function getColorH(d) {
			return d == 'Flood Extent' ? '#1e00ff' :
							  '#FFEDA0';
		}

		var legendQ = L.control({position: 'bottomright'});
		legendQ.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend'),
				categories = ['Min. Flood Extent', 'Max. Flood Extent'],
				labels = [];
			// loop through our density intervals and generate a label with a colored square for each interval
			for (var i = 0; i < categories.length; i++) {
				div.innerHTML +=
					'<i style="background:' + getColorQ(categories[i]) + '"></i> ' +
					categories[i] + (categories[i] ? '&ndash;' + '<br><br>' : '+');
			}
			return div;
		};
		
		var legendH = L.control({position: 'bottomright'});
		legendH.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend'),
				categories = ['Flood Extent'],
				labels = [];
			// loop through our density intervals and generate a label with a colored square for each interval
			for (var i = 0; i < categories.length; i++) {
				div.innerHTML +=
					'<i style="background:' + getColorH(categories[i]) + '"></i> ' +
					categories[i] + (categories[i] ? '&ndash;' + '<br><br>' : '+');
			}
			return div;
		};

		 /*************************
         * Set up the MouseOver function for the Catchment Polygon layer -
		 * Will trigger a rendering of the HAND model based on the 
		 * simulation type selected and feature properties 
         *************************/
		var Cors_enable = "https://cors-anywhere.herokuapp.com/"; //https://cors-anywhere.herokuapp.com/corsdemo
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
			plotty.addColorScale("Dark_Blue", ["#1e00ff"], [1]); //Renders inundated areas as dark blue
			const plottyRenderer_dark_blue = L.LeafletGeotiff.plotty({
				displayMin: -2,
				displayMax: -1,
				clampLow: false,
				clampHigh: false,
				colorScale: "Dark_Blue"
			});
			plotty.addColorScale("Light_Blue", ["#00eaff"], [1]); //Renders inundated areas as light blue
			const plottyRenderer_light_blue = L.LeafletGeotiff.plotty({
				displayMin: -2,
				displayMax: -1,
				clampLow: false,
				clampHigh: false,
				colorScale: "Light_Blue"
			});
			const GeoTiff_Layer_Discharge = L.leafletGeotiff(url_hand, {
				renderer: plottyRenderer_light_blue
			}).addTo(mymap);
			const GeoTiff_Layer = L.leafletGeotiff(url_hand, {
				renderer: plottyRenderer_dark_blue
			}).addTo(mymap);
			layer.on('mouseover', function (e) {
				console.log(e);
				document.getElementById("disclaimer").innerHTML = Return_ori_text; //Returns original disclaimer
				var sim_type = document.getElementById("simformat").value //user selected simulation type
				if (sim_type == 'H_sim') {
					var sql_value = document.getElementById('HRange').value;
					var math = Number(sql_value);
					var sql_text =  math;
					console.log(sql_text);
					GeoTiff_Layer.options.renderer.setDisplayRange(0, sql_text); //Sets Threshold to render the flood map
					GeoTiff_Layer_Discharge.options.renderer.setDisplayRange(-2, -1);
					legendH.addTo(mymap);
					legendQ.remove();
				} else if (sim_type == 'Q_sim') {
					var sql_value = document.getElementById('QRange').value;
					var math_min = (QMIN_A * (sql_value ** QMIN_N)); //CERC-HAND-D Qmin equation
					var math_max = (QMAX_A * (sql_value ** QMAX_N)); //CERC-HAND-D Qmax equation
					var sqlmin_text =  math_min;
					var sqlmax_text =  math_max;
					console.log(sqlmin_text);
					console.log(sqlmax_text);
					GeoTiff_Layer.options.renderer.setDisplayRange(0, sqlmin_text);
					GeoTiff_Layer_Discharge.options.renderer.setDisplayRange(0, sqlmax_text);
					legendQ.addTo(mymap);
					legendH.remove();
				} else if (sim_type == 'remove_sim') {
					GeoTiff_Layer.options.renderer.setDisplayRange(-2, -1);
					GeoTiff_Layer_Discharge.options.renderer.setDisplayRange(-2, -1);
					legendQ.remove();
					legendH.remove();
				} else if (sim_type == 'now_sim') { 
					var ECCC_discharge = 0
					var ECCC_level = 0
					GeoTiff_Layer_Discharge.options.renderer.setDisplayRange(-2, -1);
					legendQ.remove();
					legendH.addTo(mymap);
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
		const Catchment_url = "https://blairscriven.github.io/Can_Flood_Mapper_Proto/Catchment_polygons.geojson";
		$.ajax({
		dataType: "json",
		url: Catchment_url,
		success: function(data) {
				geojsonLayer.addData(data);
		}
		}).error(function() {});