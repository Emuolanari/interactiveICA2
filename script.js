const width = 500;
const height = 500;
let attendanceArray=[];
const url = "https://martinjc.github.io/UK-GeoJSON/json/eng/topo_eer.json";
//const url = "https://bost.ocks.org/mike/map/uk.json";
const projection = d3.geoMercator().translate([width/2,height/1.4]), path = d3.geoPath(projection);
const zoom = d3.zoom().scaleExtent([1, 100]).on('zoom', zoomed);

const svg = d3.select('body').append('svg').attr('width',width).attr('height',height)
.attr('style', 'border: 1px solid black').attr('id', 'svgMain');


const group = svg.append("g");

svg.call(zoom);


function zoomed(event,d) {
    group
      .selectAll('path') 
      .attr('transform', event.transform);
  }

var files = ["attendancedata.json", "https://martinjc.github.io/UK-GeoJSON/json/eng/topo_eer.json"];

Promise.all(files.map(url => d3.json(url))).then(function(values) {
    console.log(values[1].objects.eer.geometries)
    const cities = topojson.object(values[1], values[1].objects.eer).geometries;
        group.selectAll('path').data(cities).enter().append('path').attr('class','cities').attr('d',path);

        group.append('path').datum(topojson.mesh(values[1],values[1].objects.eer, function(a,b){return a!==b;}))
        .attr('class','borders').attr('d',path);

    let attendanceData = values[0].attendanceData;

        for (let i=0; i<attendanceData.length; i++){
            let studentDetails =  attendanceData[i];
            for (const key in studentDetails) {
                //console.log(`${key}: ${studentDetails[key]}`);
                
                let [studentId,gender,moduleCode,groupId,diffgrp,status,postCode]
                 =[studentDetails.StudentID,studentDetails.Gender,studentDetails.Gender,studentDetails.ModuleCode,
                    studentDetails.GroupId,studentDetails.DiffGrp,studentDetails.Status,studentDetails.PostalArea];
                attendanceArray.push({studentId,gender,moduleCode,groupId,diffgrp,status,postCode});
            }  
        }
        console.log(attendanceArray);
});