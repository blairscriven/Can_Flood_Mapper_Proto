			var Hslider = document.getElementById("HRange");
			var Houtput = document.getElementById("Hdemo");
			var Qslider = document.getElementById("QRange");
			var Qoutput = document.getElementById("Qdemo");
			var Sim_menu = document.getElementById("simformat");
			Houtput.innerHTML = Hslider.value;
			Qoutput.innerHTML = Qslider.value;
			
			//Disable sliders based on dropdown menu
			Sim_menu.addEventListener("change", disabling);
			function disabling(event) {
			  if (Sim_menu.value == 'H_sim') {
				document.getElementById("HRange").disabled = false;
				document.getElementById("QRange").disabled = true;
			  } else if (Sim_menu.value == 'Q_sim') {
				document.getElementById("HRange").disabled = true;
				document.getElementById("QRange").disabled = false;
			  } else if (Sim_menu.value == 'now_sim') {
				document.getElementById("HRange").disabled = true;
				document.getElementById("QRange").disabled = true;
			  } else if (Sim_menu.value == 'remove_sim') {
				document.getElementById("HRange").disabled = true;
				document.getElementById("QRange").disabled = true;
			  }
			}
			
			//Code the textboxes to display Q and H
			Hslider.oninput = function() {
			  Houtput.innerHTML = this.value;
			  }
			Qslider.oninput = function() {
			  Qoutput.innerHTML = this.value;
			  }