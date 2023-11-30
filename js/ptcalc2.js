var maxPwrTubes = 8, maxPreTubes = 8, selPreTubes = 3, selPwrTubes = 2,
        trafVoltage = 0, selRecto = 0, seltubewatts = 0, seltubeheaterdraw = 0,
        rectifiers = [1.37, 1.36, 1.30, 1.28, 1.25, 1.41],
        tubewatts = [42, 25, 25, 12, 12, 30, 23, 19],
        tubeheaterdraw = [1.6, 1.3, 1.5, 0.45, 0.76, 0.9, 0.9, 0.9],
        tubedata = [{tube: 'KT66', Va: 600, Ia: 303, l: 'pp'}];

function handleButton(type, val, clicked) {

    let bclicked = (clicked === "undefined") ? false : clicked;
    resetShow(bclicked);

    var customTraf = document.getElementById('customtraf'),
        customTube = document.getElementById('customtube'),
        customTubeFilament = document.getElementById('customtubefilament');
    

    if (type === 'pwr' || type === 'pre') {
        for (var i = 1; i < maxPwrTubes + 1; i++) {
            document.getElementById('btn' + (type === 'pwr' ? 'Pwr' : 'Pre') + 'Tubes' + i).className = (i === val ? 'switchbtn pressed' : 'switchbtn');
        }
        if (type === 'pwr') {
            selPwrTubes = val;
        } else {
            selPreTubes = val;
        }
    } else if (type === 'traf') {
        
        trafVoltage = (!isNaN(customTraf.value) && (customTraf.value > 0) && (bclicked === "customtraf"))? customTraf.value : val;
        if (!validateTrafVoltage(trafVoltage)) {
            return;
        }
        var trafBtns = document.getElementsByName("trafV");
        for (var j = 0; j < trafBtns.length; j++) {
            document.getElementById(trafBtns[j].id).className = ('btnTraf' + val === trafBtns[j].id ? 'switchbtn pressed' : 'switchbtn');
        }
    } else if (type === 'rectos') {
        selRecto = rectifiers[val];
        var rectBtns = document.getElementsByName("rectos");
        for (var k = 0; k < rectBtns.length; k++) {
            document.getElementById(rectBtns[k].id).className = ('rect' + val === rectBtns[k].id ? 'switchbtn pressed' : 'switchbtn');
        }
    } else if (type === 'tubetype') {
        seltubewatts =  (!isNaN(customTube.value) && (customTube.value > 0) && (bclicked === "customtube"))  ? customTube.value : tubewatts[val];
        seltubeheaterdraw = (!isNaN(customTubeFilament.value) && (customTubeFilament.value > 0) && (bclicked === "customtube"))? customTubeFilament.value :tubeheaterdraw[val];
        console.log("tube watage", seltubewatts);
        console.log("current draw", seltubeheaterdraw);
        var tubeBtns = document.getElementsByName("pwrtubes");
        for (var l = 0; l < tubeBtns.length; l++) {
            document.getElementById(tubeBtns[l].id).className = ('pwr' + val === tubeBtns[l].id ? 'switchbtn pressed' : 'switchbtn');
        }
    }
}

function validateTrafVoltage(val) {
    if (isNaN(val)) {
        return false;
    }
    if (val < 0) {
        alert("Transformer voltage cannot be less than zero!");
        return false;
    }

    if (val > 1000) {
        alert("You put a realy huge voltage. Please, check.");
        return true;
    }
    return true;
}

function returnCalc() {
    if (!validate()) {
        resetShow();
        return;
    }

    var result = document.getElementById('result'),
            radio = document.getElementById('fake');

    var DC = trafVoltage * selRecto,
            pwrDraw = (selPwrTubes * 1000 * seltubewatts) / DC,
            preDraw = (2000 * selPreTubes * 0.0036),
            load = (DC * DC / seltubewatts),
            totalDraw = 0,
            totalload = 0;
    
    //rounding to 0.01
    pwrDraw = Math.round((pwrDraw + 0.00001) * 100) / 100;
    var rload = parseFloat(document.getElementById('rload').value);
    if (document.getElementById('PP').className.indexOf('pressed') > 0) {
        // push pull
        if (!isNaN(rload) && rload > 0) {
            //2 * (HT-50)^2 / Rload 
            pwrDraw = 2 * ((DC - 50) * (DC - 50)) / rload;
            pwrDraw = 1000 * pwrDraw / (DC - 50);
        } else {
            pwrDraw = 2 * ((DC - 50) * (DC - 50)) / load;
            pwrDraw = 1000 * pwrDraw / (DC - 50);
        }
    } else {
        //se
       rload = 0; 
    }
    
    totalDraw = Math.round((1.10 * (pwrDraw + preDraw) + 0.00001) * 100) / 100;
    totalload = (!isNaN(rload) && rload !== 0) ? rload : (Math.round((load + 0.00001) * 100) / 100);

    result.innerHTML = '<p> Selected HT Voltage: <b>' + '0-' + trafVoltage + 'V' + '</b></p>' +
            '<p> Calculated Voltage at B+: <b>' + (Math.round(((trafVoltage * selRecto) + 0.00001) * 100) / 100) + 'V</b>. Subtract 6V, If using choke.</p>' +
            '<p> Calculated Heater Current (6.3V AC): <b>' + (Math.round(((selPwrTubes * seltubeheaterdraw + selPreTubes * 0.33) + 0.00001) * 100) / 100) + 'A</b></p>' +
            '<p> Calculated Current: <b>' + totalDraw + 'mA </b>at<b>' + totalload.toFixed(0) + 'R</b>' + ((!isNaN(rload) && rload !== 0) ? '' : ' Calculated') + ' Load Plus 10%' +
            '<h5>Preamp Valves Current Draw Estimated at 3.6mA Per Triode</h5></p>' +
            '<input style="margin:auto auto;" type=button class="btn btnsmaller" value = "Hide" onclick="resetShow()">';
    radio.checked = true;
     $('html, body').animate({ scrollTop: 50 }, 'slow', function () {
    });
}

function resetShow(clicked) {
    document.getElementById('fake').checked = false;
    document.getElementById('rload').value = 0;
    if (clicked === "traf") {
      document.getElementById('customtraf').value = 0;
  }
    if (clicked === "tubetype") {
        document.getElementById('customtube').value = 0;
        document.getElementById('customtubefilament').value = 0;
    }
}

function showReferences() {
    var html = `<style>
* {
  box-sizing: border-box;
}

.row {
  display: flex;
  margin-left:-5px;
  margin-right:-5px;
}

.column {
  flex: auto;
  padding: 5px;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  width: auto;
  border: 1px solid #ddd;
}

th, td {
  text-align: center;
  padding: 5px;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
DC = Rectifier Coefficients * Transformer AC <br>
P<sup>(1)</sup>  = ( 2 * ( DC - 50 ) ^ 2 ) / Rload <br>
I = P / ( DC - 50 ) <br>
Calculated load = DC ^ 2 / PT<sup>(2)</sup> <br>
I<sup>(3)</sup> = Watts * PT<sup>(2)</sup> / DC <br>
<div class="row">
<div class="column">
<table>
<tr>
<th>Rectifier</th>
<th>Coefficient</th>
</tr>
<tr>
<td>Solid State</td>
<td>1.37</td>
</tr>
<tr>
<td>GZ34</td>
<td>1.36</td>
</tr>
<tr>
<td>EZ81</td>
<td>1.30</td>
</tr>
<tr>
<td>5U4B</td>
<td>1.28</td>
</tr>
<tr>
<td>5Y3</td>
<td>1.25</td>
</tr>
</table>
</div>
<div class="column">
<table>
<tr>
<th>Tube</th>
<th>Max Wattage</th>
</tr>
<tr>
<td>KT88 / 6550</td>
<td>42</td>
</tr>
<tr>
<td>KT66 / EL34 / 6CA7</td>
<td>25</td>
</tr>
<tr>
<td>6V6 / EL84 / 6BQ5</td>
<td>12</td>
</tr>
<tr>
<td>6L6GC</td>
<td>30</td>
</tr>
<tr>
<td>6L6WGB / 5881</td>
<td>23</td>
</tr>
<tr>
<td>6L6 | G | GA | GB | WGA / 5932</td>
<td>19</td>
</tr>
</table>
</div>
</div>`;
    document.getElementById("formulas").innerHTML = html;
    
    if (document.getElementById("formularadio").checked) {
        document.getElementById("btnFrm").value = "Show formulas";
    } else {
        document.getElementById("btnFrm").value = "Hide formulas";
        $('html, body').animate({ scrollTop: $(document).height() - 200 }, 1200);
    }
    document.getElementById("formularadio").checked = !document.getElementById("formularadio").checked;

}

function validate() {
    if (isNaN(trafVoltage) || (trafVoltage === 0)) {
        alert('Please, select valid transformer voltage or enter custom transformer voltage!');
        return false;
    }

    if (isNaN(selRecto) || (selRecto === 0)) {
        alert('Please, select valid rectifier!');
        return false;
    }

    if (isNaN(seltubeheaterdraw) || (seltubeheaterdraw === 0)) {
        alert('Please, select valid tube type or enter custom power and filament draw!');
        return false;
    }
	
    return true;
}

function handlePPSE(which){
    if (document.getElementById("switchformula")) {
      document.getElementById("switchformula").checked = false;
    }
    if (which === 'SE'){
        document.getElementById("SE").className = "switchbtn pressed";
        document.getElementById("PP").className = "switchbtn";
        
        document.getElementById("SEPP").innerHTML = "<p style='line-height:1em'>I = 2 * P<sub>max per tube</sub>/DC; Rload entered is not considered.</p>";
    } else{
        document.getElementById("SE").className = "switchbtn";
        document.getElementById("PP").className = "switchbtn pressed";
       
        document.getElementById("SEPP").innerHTML = "<p style='line-height:1em'>P = (2 * (DC - 50)^2)/Rload or Calculated Load (if Rload = 0); Calculated load = DC^2/P<sub>max per tube</sub></p>";
    }
    
    window.setTimeout(function(){
    document.getElementById("switchformula").checked = true;    
    }, 750);
     
}

(function() {
   handlePPSE('PP');
})();