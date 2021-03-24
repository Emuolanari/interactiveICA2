/*
Comment code for the sake of whoever will end up marking.

Add remaining postcodes to locationpathjson file

Explain some postcodes were wrong so you removed the attendance for those entries

*/
const width = 600;
const height = 600;
let allAttendanceArray=[];
let positiveAttendanceArray=[];
let pStatusAttendance= [];
let pdgStatusAttendance = [];
let femaleAttendanceArray =[];
let maleAttendanceArray = [];
//let center = d3.geoCentroid(json);
//let scale  = 150;
const topo_url = "https://martinjc.github.io/UK-GeoJSON/json/eng/topo_lad.json";
const wales_url = "https://martinjc.github.io/UK-GeoJSON/json/wal/topo_lad.json";
const scotland_url = "https://martinjc.github.io/UK-GeoJSON/json/sco/topo_lad.json";
const northern_ireland_url = "https://martinjc.github.io/UK-GeoJSON/json/ni/topo_lgd.json";

//used scale to increase initial size of projected map and longitude & latitude of England for projection's center 
const projection = d3.geoMercator().translate([width/2,height/1.4]).scale(2500).center([-1.1743,52.3555]), 
path = d3.geoPath(projection);
const zoom = d3.zoom().scaleExtent([1, 70]).on('zoom', zoomed);

const svg = d3.select('body').append('svg').attr('width',width).attr('height',height)
.attr('style', 'border: 1px solid black').attr('id', 'svgMain');

//const div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
const group = svg.append("g");

svg.call(zoom);


function zoomed(event,d) {
    group.attr('transform', event.transform);
  }

var files = ["attendancedata.json", topo_url, "locationpath.json", wales_url, scotland_url,northern_ireland_url];

/*After drawing the circles over the map, I decided to add the topojson for all countries in the UK, so the circle
outside England is not just on white space*/
Promise.all(files.map(url => d3.json(url))).then(function(values) {
    const attendanceData = values[0].attendanceData;
    const cities = topojson.object(values[1], values[1].objects.lad).geometries;
    const locationPath = values[2].postcodes;
    const welsh_cities = topojson.object(values[3], values[3].objects.lad).geometries;
    const scottish_cities = topojson.object(values[4], values[4].objects.lad).geometries;
    const irish_cities = topojson.object(values[5], values[5].objects.lgd).geometries;

    group.selectAll('england').data(cities).enter().append('path').attr('class','cities').attr('d',path);
    group.selectAll('wales').data(welsh_cities).enter().append('path').attr('class','cities').attr('d',path);
    group.selectAll('scotland').data(scottish_cities).enter().append('path').attr('class','cities').attr('d',path);
    group.selectAll('ireland').data(irish_cities).enter().append('path').attr('class','cities').attr('d',path);


    group.append('path').datum(topojson.mesh(values[1],values[1].objects.lad, function(a,b){return a!==b;}))
    .attr('class','borders').attr('d',path);
    group.append('path').datum(topojson.mesh(values[3],values[3].objects.lad, function(a,b){return a!==b;}))
    .attr('class','borders').attr('d',path);
    group.append('path').datum(topojson.mesh(values[4],values[4].objects.lad, function(a,b){return a!==b;}))
    .attr('class','borders').attr('d',path);
    group.append('path').datum(topojson.mesh(values[5],values[5].objects.lgd, function(a,b){return a!==b;}))
    .attr('class','borders').attr('d',path);

    for (let i=0; i<attendanceData.length; i++){
        
        let studentDetails =  attendanceData[i];
        for (const key in studentDetails) {
            let [studentId,gender,status,postCode]
                =[studentDetails.StudentID,studentDetails.Gender,studentDetails.Status,studentDetails.PostalArea];
                allAttendanceArray.push({studentId,gender,status,postCode});
        }  
    }

    pStatusAttendance = allAttendanceArray.filter(function( obj ) {
        return obj.status == 'P';
    });
    pdgStatusAttendance = allAttendanceArray.filter(function( obj ) {
        return obj.status == 'PDG';
    });

    positiveAttendanceArray = pStatusAttendance.concat(pdgStatusAttendance);
    positiveAttendanceArray=positiveAttendanceArray.filter(function( obj ) {
        return isNaN(parseInt(obj.postCode.substring(0)));
    });

    group.selectAll(".dots").data(locationPath).enter().append("circle").attr("r","2")
    .attr('fill', 'rgba(100, 2, 255, 0.8)').attr("transform",function(d){                 
    return "translate(" + projection([d.longitude,d.latitude]) + ")";
  }).append('title').text((d)=>{
      return `${d.city}- Male: ${((d.maleAttendance/positiveAttendanceArray.length)*100).toFixed(2)}% Female: ${
          (d.femaleAttendance/positiveAttendanceArray.length*100).toFixed(2)}%`;});
        

    const totalAttendanceRate = (positiveAttendanceArray.length/allAttendanceArray.length * 100).toFixed(2)+'%';
    //console.log(positiveAttendanceArray.length);
    //console.log(allAttendanceArray.length);

    maleAttendanceArray = positiveAttendanceArray.filter(function( obj ) {
        return obj.gender == 'M';
    });
    femaleAttendanceArray = positiveAttendanceArray.filter(function( obj ) {
        return obj.gender == 'F';
    });

    /*students in each locations contribution to the overall attendance grouped by gender
     For each location, divide the attendance for males and females by the overall attendance 
     multiplied by 100%
     */
    totalFemaleAttendance = (femaleAttendanceArray.length/positiveAttendanceArray.length * 100).toFixed(2)+'%';

    totalMaleAttendance = (maleAttendanceArray.length/positiveAttendanceArray.length * 100).toFixed(2)+'%';

    //console.log(totalMaleAttendance+'male');
    //console.log(totalFemaleAttendance+'female');

    document.getElementById('rate').innerHTML = totalAttendanceRate+" Overall attendance rate"+"<br>"
    +totalFemaleAttendance+" Overall Female attendance rate"+"<br>"
    +totalMaleAttendance+" Overall Male attendance rate"+"<br>";
    //console.log(positiveAttendanceArray);

    //to get unique postcodes from data
    const distinctPostocdesSet = new Set(positiveAttendanceArray.map(e => JSON.stringify(e.postCode.substring(0,2))));
    const distinctPostcodesArray = Array.from(distinctPostocdesSet).map(e => JSON.parse(e));

    //console.log(distinctPostcodesArray);

     //I am using first two letters of postcode to get city names where I draw my circles over map, so I am creating
     //a new array (genderCityObjects) to count the number of males & females in each city
     let genderCityObjects = [];
     positiveAttendanceArray.forEach(function(details){
        let [sex, twoDigitPostCode] = [details.gender,details.postCode.substring(0,2)];
        genderCityObjects.push({sex, twoDigitPostCode});
     })
     /*Creating another array based on genderCityObjects with counts of each unique occurences so I can know how many
     males and females for each potcode*/
     let countMalesAndFemalesPerCity = {};
     let splitCount = [];
     for (let i=0; i<genderCityObjects.length; i++){
         let id = JSON.stringify(genderCityObjects[i]);
         if (countMalesAndFemalesPerCity.hasOwnProperty(id)){
             countMalesAndFemalesPerCity[id].count++;
         }else{
             splitCount.push(genderCityObjects[i]);
             countMalesAndFemalesPerCity[id] = splitCount[splitCount.length-1];
             countMalesAndFemalesPerCity[id].count = 1;
         }
     }

    //console.log(splitCount);
    //console.log(genderCityObjects.length);
});