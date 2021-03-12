/*
TODO: Complete locationpath.json file with all 63 areas.
Show in tooltip average attendance based on each area for each gender.
Show total attendance rate.
Comment code for the sake of whoever will end up marking.
*/
const width = 600;
const height = 600;
let allAttendanceArray=[];
let positiveAttendanceArray=[];
let pStatusAttendance= [];
let pdgStatusAttendance = [];

const topo_url = "https://martinjc.github.io/UK-GeoJSON/json/eng/topo_lad.json";

//const uk_url = "https://bost.ocks.org/mike/map/uk.json";
const projection = d3.geoMercator().translate([width/2,height/1.4]), path = d3.geoPath(projection);
const zoom = d3.zoom().scaleExtent([1, 100]).on('zoom', zoomed);

const svg = d3.select('body').append('svg').attr('width',width).attr('height',height)
.attr('style', 'border: 1px solid black').attr('id', 'svgMain');

//const div = d3.select("body").append("div")	.attr("class", "tooltip").style("opacity", 0);
const group = svg.append("g");

svg.call(zoom);


function zoomed(event,d) {
    group.attr('transform', event.transform);
  }

var files = ["attendancedata.json", topo_url, "locationpath.json"];

Promise.all(files.map(url => d3.json(url))).then(function(values) {
    
    const cities = topojson.object(values[1], values[1].objects.lad).geometries;
    const locationPath = values[2].postcodes;
    
    group.selectAll('path').data(cities).enter().append('path').attr('class','cities').attr('d',path);

    group.selectAll(".dots").data(locationPath).enter().append("circle").attr("r","0.2")
    .attr('fill', 'rgba(100, 2, 255, 0.8)').attr("transform",function(d){                 
    return "translate(" + projection([d.longitude,d.latitude]) + ")";
  }).append('title').text((d)=>{return d.city;});

    group.append('path').datum(topojson.mesh(values[1],values[1].objects.lad, function(a,b){return a!==b;}))
    .attr('class','borders').attr('d',path);

    let attendanceData = values[0].attendanceData;

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
        return isNaN(obj.postCode.substring(0));
    });
    //console.log(positiveAttendanceArray);
    
    /*Let's see how many students live in each area based on postcode
    To do that replace all postcodes starting with 'TS' with 'Middlesbrough' to fit topojson...
    .see how many unique postcodes we have also to accomplish this and change to respective city names
    First let's count the number of students in the positiveAttendanceArray
    Distance/Region vs Attendace for both male & female
    */
    const distinctPostocdesSet = new Set(positiveAttendanceArray.map(e => JSON.stringify(e.postCode.substring(0,2))));
    const distinctPostocdesArray = Array.from(distinctPostocdesSet).map(e => JSON.parse(e));

    console.log(distinctPostocdesArray);

});