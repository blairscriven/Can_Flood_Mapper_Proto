			var Hslider = document.getElementById("HRange");
			var Houtput = document.getElementById("Hdemo");
			var Qslider = document.getElementById("QRange");
			var Qoutput = document.getElementById("Qdemo");
			var Sim_menu = document.getElementById("simformat");
			var tens_range = document.getElementById("10s_range");
			var hundreds_range = document.getElementById("100s_range");
			var thousands_range = document.getElementById("1000s_range");
			Houtput.innerHTML = Hslider.value;
			Qoutput.innerHTML = Qslider.value;
			
			
			//Disable sliders based on dropdown menu
			Sim_menu.addEventListener("change", disabling);
			function disabling(event) {
			  if (Sim_menu.value == 'H_sim') {
				document.getElementById("HRange").disabled = false;
				document.getElementById("QRange").disabled = true;
				document.getElementById("10s_range").disabled = true;
				document.getElementById("100s_range").disabled = true;
				document.getElementById("1000s_range").disabled = true;
			  } else if (Sim_menu.value == 'Q_sim') {
				document.getElementById("HRange").disabled = true;
				document.getElementById("QRange").disabled = false;
				document.getElementById("10s_range").disabled = false;
				document.getElementById("100s_range").disabled = false;
				document.getElementById("1000s_range").disabled = false;
			  } else if (Sim_menu.value == 'now_sim') {
				document.getElementById("HRange").disabled = true;
				document.getElementById("QRange").disabled = true;
				document.getElementById("10s_range").disabled = true;
				document.getElementById("100s_range").disabled = true;
				document.getElementById("1000s_range").disabled = true;
			  } else if (Sim_menu.value == 'remove_sim') {
				document.getElementById("HRange").disabled = true;
				document.getElementById("QRange").disabled = true;
				document.getElementById("10s_range").disabled = true;
				document.getElementById("100s_range").disabled = true;
				document.getElementById("1000s_range").disabled = true;
			  }
			}
			
			//Code the textboxes to display Q and H
			Hslider.oninput = function() {
			  Houtput.innerHTML = this.value;
			  }
			Qslider.oninput = function() {
			  Qoutput.innerHTML = this.value;
			  }
			
			//Code for the checkboxes; changes Q Slider range (requires JQuery UI)
			tens_range.addEventListener("change", change0_100);
			function change0_100(event) {
				$("#QRange").prop({
					min: 0,
					max: 100,
					step: 1,
					value: 0
				}).slider("refresh");
			}
			hundreds_range.addEventListener("change", change100_1000);
			function change100_1000(event) {
				$("#QRange").prop({
					min: 100,
					max: 1000,
					step: 10,
					value: 100
				}).slider("refresh");
			}
			thousands_range.addEventListener("change", change1000_5000);
			function change1000_5000(event) {
				$("#QRange").prop({
					min: 1000,
					max: 5000,
					step: 25,
					value: 1000
				}).slider("refresh");
			}