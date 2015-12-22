/* NEXT CHANGES:
	- objectify stats generation
	- changes to tour - subdivide final step into sub-component steps; add in imgs of sub-divs?
	- table stats for individual countries - make more aesthetic?
*/

// Note: Countries in shapefile but  not in spreadsheet: e.g. Georgia, Estonia, Latvia, Moldova, Ukraine, Russia, Slovakia, Kosovo, Turkey
// Bosnia, Macedonia
 
function generateDashboard(data,geom){
    //var map = new lg.map('#map').geojson(geom).nameAttr('CNTRY_NAME').joinAttr('Iso_Code').zoom(3).center([53.5,20]).onClick(function(f){console.log(f)});
	
	var map = new lg.map('#map').geojson(geom).nameAttr('CNTRY_NAME').joinAttr('Iso_Code').zoom(3).center([53.5,20])
				.onHover(function(country_geom){
					outputCountryStats(country_geom, data);
					console.log("country: ", country_geom.properties.CNTRY_NAME);
					console.log("data: ", data);
				});
	
	var resLocs = new lg.column('Response Locations');   //change this 
	
	var pplReached = new lg.column('Total people reached').label('Total RC interactions');
	
/* 	var domAppeal = new lg.column('Domestic appeal (Y/N)').domain([0,1]).axisLabels(false).valueAccessor(function(d){
        if(d=='Yes' || d== 'No'){
            return 1;
        } else {
            return null;
        }
    })
    .colorAccessor(function(d,i,max){
        if(d=='Yes'){
            return 1;
        } else {
            return 0;
        }
    })
    .colors(['#bd0026','#2E7D32']); 
	
	var appFundLocal = new lg.column('Appeal funding (local currency)').axisLabels(true); 
	
	var maxCHF = d3.max(data, function(d){
		if (!isNaN(d['Appeal funding (CHF)'])){return d['Appeal funding (CHF)'];}
	});
	var appFundCHF = new lg.column('Appeal funding (CHF)').domain([0,Math.ceil(maxCHF).toPrecision(2)]);
	*/

	
	
	var updateDates = new lg.column('Last data update').axisLabels(false)
    .scale(d3.time.scale())
 	.domain([0,Date.now()])   
    .labelAccessor(function(d){
		if (Number(d)!=0){
			var year = d.getFullYear();
			var month = d.getMonth() + 1;
			var day = d.getDate();
			return day+'/'+month+'/'+year;
		} else {
            return 'No data reported';
        }
    })
 	.valueAccessor(function(d){
        if (Number(d)!=0){
			return Number(d);
        } else {
            return null;
        } 
    }) 
    .colorAccessor(function(d,i,max){    
        if (Date.now()-Number(d)<=1.123e+9){   //updated within last 13 days = 1.123e+9ms
            return 0;
		} else if (Date.now()-Number(d)>1.123e+9){  //updated before last 13 days
			return 1;
        } 
    })
    .colors(['#2E7D32','#ff8c1a']);  
	
	
	function getGridWidth(divWidth) {
		if (divWidth<750) {
			return 750;
		} else {
			return divWidth;
		};
	};
 	var grid_width = getGridWidth($("#grid").width());
	//console.log($("#grid").width(), grid_width);
			 
			 
    var grid = new lg.grid('#grid')
        .data(data)
        .width(grid_width)
        .height(750)
        .nameAttr('Country')
        .joinAttr('ISO 3 code')
        .hWhiteSpace(10)
        .vWhiteSpace(5)
 		.columns(['Total Migrants 2015', resLocs, 'Active volunteers', 'Active staff', 'Active full-time equivalent', 'Bednights in long-term shelter - total', 'Bednights in long-term shelter this week', 'Bednights in short-term shelter - total', 'Bednights in short-term shelter this week', 'Distributions: Relief kits', 'Distributions: Hygiene items', 'Distributions: Food parcels', 'Distributions: Meals', 'Distributions: Water bottles', 'Distributions: Hot and cold drinks', 'Distributions: Blankets and sleeping bags', 'Distributions: Clothing', 'Provision of connectivity', 'Provision of medical care', 'Provision of first aid', 'Provision of psychosocial support', 'RFL requests', 'RFL reunifications', pplReached, updateDates]) 
        .margins({top: 180, right: 62, bottom: 20, left: 290});
	//lg.colors(['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c']);  //blue-green multi-hue
	lg.colors(['#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177']);  //pink-purple multi-hue
	//lg.colors(['#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043']); //purple-red multi-hue
	//lg.colors(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']); //yellow-orange-red multi-hue
    lg.init();

    $("#map").width($("#map").width());

    console.log(map.map()); 
}


function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(headers==true && i==0){
            keys = e;
        } else if(headers==true && i>1) {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        } else if(headers!=true){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);

        }
    });
    return output;
}


function generateStats(id,data){
	var formatComma = d3.format(",.0f");
	var formatPerc = d3.format(",.1%");
	totalPplReached = 0;
	totalVols = 0;
	totalFoodDists = 0;
	totalMeds = 0;
	totalTextiles = 0;
	totalConnectivity = 0;

	
	for(var i = 0; i < data.length; i++) {
 		//numPplReached = parseInt(data[i]["Total people reached"]);
		numVols = parseInt(data[i]["Active volunteers"]);
		numFoodParc = parseInt(data[i]["Distributions: Food parcels"]);
		numMeals = parseInt(data[i]["Distributions: Meals"]);
		numMedCare = parseInt(data[i]["Provision of medical care"]);
		numFirstAid = parseInt(data[i]["Provision of first aid"]); 
		numPSS = parseInt(data[i]["Provision of psychosocial support"]);
		numClothing = parseInt(data[i]["Distributions: Clothing"]); 
		numBlanketsSlBags = parseInt(data[i]["Distributions: Blankets and sleeping bags"]); 
		numConnect = parseInt(data[i]["Provision of connectivity"]);
		//if (!isNaN(numPplReached)) {totalPplReached += numPplReached;};
		if (!isNaN(numVols)) {totalVols += numVols;}; 
		if (!isNaN(numFoodParc)) {totalFoodDists += numFoodParc;}; 
		if (!isNaN(numMeals)) {totalFoodDists += numMeals;}; 
		if (!isNaN(numMedCare)) {totalMeds += numMedCare;};
		if (!isNaN(numFirstAid)) {totalMeds += numFirstAid;}; 
		if (!isNaN(numPSS)) {totalMeds += numPSS;}; 	
		if (!isNaN(numClothing)) {totalTextiles += numClothing;}; 
		if (!isNaN(numBlanketsSlBags)) {totalTextiles += numBlanketsSlBags;}; 
		if (!isNaN(numConnect)) {totalConnectivity += numConnect;};
	}; 
	
	var html = '';
	html = html + '<table class="stats_table">';
	html = html + '<tr><th class="stat_heading"></th><td class="stat_heading" id="cntry_name">[Hover over country in map]</td><td class="stat_heading">European Total</td>';
	html = html + '<tr><th class="stat_title">Red Cross Interactions</th><td class="stat" id="cntry_ppl_reached"><i>n/a</i></td><td class="stat"><i>n/a</i></td>'; 
	html = html + '<tr><th class="stat_title">Volunteers Mobilised</th><td class="stat" id="cntry_vols"><i>n/a</i></td><td class="stat">' + formatComma(totalVols) + '</td>';
	html = html + '<tr><th class="stat_title">Food Distributions</th><td class="stat" id="cntry_food_dists"><i>n/a</i></td><td class="stat">' + formatComma(totalFoodDists) + '</td>';
	html = html + '<tr><th class="stat_title">Health Services</th><td class="stat" id="cntry_meds"><i>n/a</i></td><td class="stat">' + formatComma(totalMeds) + '</td>';
	html = html + '<tr><th class="stat_title">Textiles Provided</th><td class="stat" id="cntry_texts"><i>n/a</i></td><td class="stat">' + formatComma(totalTextiles) + '</td>';
	html = html + '<tr><th class="stat_title">Connectivity Provided</th><td class="stat" id="cntry_connectivity"><i>n/a</i></td><td class="stat">' + formatComma(totalConnectivity) + '</td>';
	html = html + '</table>';
	$(id).html(html);
	
}


function getCountryStats(countryData) {
	var formatComma = d3.format(",.0f");
	var formatPerc = d3.format(",.1%");
	numPplReached = parseInt(countryData["Total people reached"]);
			numVols = parseInt(countryData["Active volunteers"]);
			numFoodParc = parseInt(countryData["Distributions: Food parcels"]);
			numMeals = parseInt(countryData["Distributions: Meals"]);
			numMedCare = parseInt(countryData["Provision of medical care"]);
			numFirstAid = parseInt(countryData["Provision of first aid"]); 
			numPSS = parseInt(countryData["Provision of psychosocial support"]);
			numClothing = parseInt(countryData["Distributions: Clothing"]); 
			numBlanketsSlBags = parseInt(countryData["Distributions: Blankets and sleeping bags"]); 
			numConnect = parseInt(countryData["Provision of connectivity"]);
			
			totalFoodDists = 0;
			totalMeds = 0;
			totalTextiles = 0;
			
			
			if (isNaN(numPplReached)) {numPplReached='No data';}
			else {numPplReached=formatComma(numPplReached)};
			if (isNaN(numVols)) {numVols='No data';}
			else {numVols=formatComma(numVols)};
			
			if (!isNaN(numFoodParc)) {totalFoodDists += numFoodParc;}; 
			if (!isNaN(numMeals)) {totalFoodDists += numMeals;}; 
			if (isNaN(numFoodParc) && isNaN(numMeals)) {totalFoodDists='No data';}
			else {totalFoodDists=formatComma(totalFoodDists);};
			
			if (!isNaN(numMedCare)) {totalMeds += numMedCare; formatComma(totalMeds);};
			if (!isNaN(numFirstAid)) {totalMeds += numFirstAid; formatComma(totalMeds);}; 
			if (!isNaN(numPSS)) {totalMeds += numPSS; formatComma(totalMeds);}; 
			if (isNaN(numMedCare) && isNaN(numFirstAid) && isNaN(numPSS)) {totalMeds='No data';}
			else {totalMeds=formatComma(totalMeds);};
			
			if (!isNaN(numClothing)) {totalTextiles += numClothing; formatComma(totalTextiles);}; 
			if (!isNaN(numBlanketsSlBags)) {totalTextiles += numBlanketsSlBags; formatComma(totalTextiles);}; 
			if (isNaN(numClothing) && isNaN(numBlanketsSlBags)) {totalTextiles='No data';}
			else {totalTextiles=formatComma(totalTextiles);};
			
			if (isNaN(numConnect)) {numConnect='No data';}
			else {numConnect=formatComma(numConnect)};
			
			return [numPplReached, numVols, totalFoodDists, totalMeds, totalTextiles, numConnect];
			
}
	
function outputCountryStats(country, data) {
	//console.log("country: ", country);
	//console.log("data: ", data);
	var formatComma = d3.format(",.0f");
	var formatPerc = d3.format(",.1%");
	//console.log("1 - Clicked on ", country.properties.CNTRY_NAME);
	numPplReached = '<i>n/a</i>';
	numVols = '<i>n/a</i>';
	totalFoodDists = '<i>n/a</i>';
	totalMeds = '<i>n/a</i>';
	totalTextiles = '<i>n/a</i>';
	numConnect = '<i>n/a</i>';
	
	var updated = 0;
	
	countryName = country.properties.CNTRY_NAME;
	
	if (country.properties.CNTRY_NAME == 'Bosnia & Herzegovina') {
		for (var i = 0; i < data.length; i++) {
			if (data[i]["Country"]=='Bosnia and Herzegovina') {
				countryName = data[i]["Country"];
				countryStats = getCountryStats(data[i]);
				updated = 1;
			}
		}
	}
	else if (country.properties.CNTRY_NAME == 'Macedonia') {
		for (var i = 0; i < data.length; i++) {
			if (data[i]["Country"]=='The former Yugoslav Republic of Macedonia') {
				countryName = data[i]["Country"];
				countryStats = getCountryStats(data[i]);
				updated = 1;
			}
		}
	}
	else {
		for (var i = 0; i < data.length; i++) {
			if (data[i]["Country"] == country.properties.CNTRY_NAME) {				
				countryStats = getCountryStats(data[i]);
				updated = 1;
			}
		}
	};
	
	if (updated == 0) {
		countryStats = ['<i>n/a</i>','<i>n/a</i>','<i>n/a</i>','<i>n/a</i>','<i>n/a</i>','<i>n/a</i>'];
	};
	
	$(cntry_name).html(countryName);
	$(cntry_ppl_reached).html(countryStats[0]);
	$(cntry_vols).html(countryStats[1]);
	$(cntry_food_dists).html(countryStats[2]);
	$(cntry_meds).html(countryStats[3]);
	$(cntry_texts).html(countryStats[4]);
	$(cntry_connectivity).html(countryStats[5]);
	
}

$('#intro').click(function(){
    var intro = introJs();
    intro.setOptions({
		steps: [
		  {
			intro:"<div style='width: 350px;'><b>This dashboard displays various key indicators for European countries affected by the current Europe Population Movement.</b><br>The map can display any of these indicators, given in the grid below.",
		  },
		  {
			element: '#map',
			intro: "<div style='width: 300px;'><b>The map displays values for the key indicator <i>(i.e. column)</i> either <i>selected</i> or <i>hovered over</i> in the grid below.</b><br><i>[Note: when the map first loads, no data is displayed].</i><br>1. When an indicator is displayed on the map, its column heading appears in bold in the grid below, and its maximum and minimum values are displayed at the bottom of the column.<br>2. Hovering over individual countries in the map displays their respective key indicator values in the top right.",
			position: 'right'
		  },
		  {
			element: '#key_stats_container',
			intro: "<div style='width: 120px;'><b>Key statistics are displayed here.</b><br>These appear for individual countries when hovered over in the map. Totals for European countries included in the grid below are also given.",
			position: 'left'
		  },
/* 		  {
			element: '#grid',
			intro: "<div style='width: 300px;'><b>The grid displays all key indicator values for all countries. Individual values can be viewed by hovering over a grid 'cell'. To display a key indicator on the map, a column must either be <i>selected</i> or <i>hovered over</i>.</b>",
			position: 'bottom'
		  },	
		  {
			element: '#grid',
			intro: "<div style='width: 300px;'>1. To <i>select</i> an indicator and display it on the map, click on the indicator column's data values (but not on its heading).<br/>2. To <i>de-select</i> an indicator, click a second time on the indicator column's data values (but again not on its heading).",
			position: 'bottom'
		  },	
		  {
			element: '#grid',
			intro: "<div style='width: 300px;'>3. When no indicator is selected, it is possible to hover over an indicator column (its data values <i>or</i> its heading) to display it on the map.",
			position: 'bottom'
		  },	
		  {
			element: '#grid',
			intro: "<div style='width: 300px;'>4. Click on an indicator's column heading to sort the data from largest to smallest (or most recent to least recent for the date column).",
			position: 'bottom'
		  },	
		  {
			element: '#grid',
			intro: "<div style='width: 300px;'>5. To highlight a country in the map, hover over its row's data values (but not country name) in the grid.",
			position: 'bottom'
		  }	 */
 		  {
			element: '#grid',
			intro: "<div style='width: 500px;'><b>The grid displays all key indicator values for all countries. Individual values can be viewed by hovering over a grid 'cell'. To display a key indicator on the map, a column must either be <i>selected</i> or <i>hovered over</i>.</b><br>1. To <i>select</i> an indicator and display it on the map, click on the indicator column's data values (but not on its heading).<br>2. To <i>de-select</i> an indicator, click a second time on the indicator column's data values (but again not on its heading).<br>3. When no indicator is selected, it is possible to hover over an indicator column (its data values <i>or</i> its heading) to display it on the map.<br>4. Click on an indicator's column heading to sort the data from largest to smallest (or most recent to least recent for the date column).<br>5. To highlight a country in the map, hover over its row's data values (but not country name) in the grid.",
			position: 'bottom'
		  } 
		]
	});
    intro.start();
});



/*
function stickydiv(){
    var window_top = $(window).scrollTop();
    var div_top = $('#sticky-anchor').offset().top;
    if (window_top > div_top){
        $('#map-container').addClass('sticky');
    }
    else{
        $('#map-container').removeClass('sticky');
    }
};

$(window).scroll(function(){
    stickydiv();
}); 
*/

//load data

// WITH THE FORCE...
var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?filter01=replace-map&replace-map-url01=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D493036357%26single%3Dtrue%26output%3Dcsv&filter02=merge&merge-url02=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&merge-tags02=%23country%2Bcode&merge-keys02=%23country-code&force=on&url=https%3A//docs.google.com/spreadsheets/d/17UV2Zqkz6YDWIEgzT16_XCMLE7_VXjo7U-Wme01fnXQ/edit%3Fusp%3Ddrive_web',
    dataType: 'json',
});   

// WITHOUT THE FORCE...
/* var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'http://proxy.hxlstandard.org/data.json?filter01=replace-map&replace-map-url01=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D493036357%26single%3Dtrue%26output%3Dcsv&filter02=merge&merge-url02=https%3A//docs.google.com/spreadsheets/d/12TdWAO9BmavBkGEM-7hPV7IMjN_EOJY_2iGnW_ezjuk/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&merge-tags02=%23country%2Bcode&merge-keys02=%23country-code&url=https%3A//docs.google.com/spreadsheets/d/17UV2Zqkz6YDWIEgzT16_XCMLE7_VXjo7U-Wme01fnXQ/edit%3Fusp%3Ddrive_web',
    dataType: 'json',
});  */


//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/geom.json', 
    dataType: 'json',
});

//when both ready construct dashboard

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = topojson.feature(geomArgs[0],geomArgs[0].objects.geom);
    //console.log(geom);
    var data = hxlProxyToJSON(dataArgs[0],true);
    //console.log(data);
	var dateFormat = d3.time.format("%m/%d/%Y");
    data.forEach(function(d){
        d['Last data update'] = dateFormat.parse(d['Last data update']);
    });
    generateDashboard(data,geom);
	generateStats("#key_stats",data);
	
});

