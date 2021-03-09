const width = 500;
const height = 500;
const url = "https://bost.ocks.org/mike/map/uk.json";
const projection = d3.geoMercator().translate([width/2,height/1.4]), path = d3.geoPath(projection);
const zoom = d3.zoom().scaleExtent([1, 20]).on('zoom', zoomed);
console.log(d3);
const svg = d3.select('body').append('svg').attr('width',width).attr('height',height)
.attr('style', 'border: 1px solid black');


const group = svg.append("g");

svg.call(zoom);
/*svg.append('path').attr('fill', '#ddd');
svg.append('path').attr('fill', 'none')
.attr('stroke', '#fff').attr('stroke-linejoin','round').attr('stroke-linecap', 'round');*/

d3.json(url).then(function(topology) {
    const cities = topojson.object(topology, topology.objects.subunits).geometries;
    /*svg.selectAll("path")
        .data(topojson.object(topology, topology.objects.subunits).geometries)
    .enter()
        .append("path")
        .attr("d", path);*/
    group.selectAll('path').data(cities).enter().append('path').attr('class','cities').attr('d',path);

    group.append('path').datum(topojson.mesh(topology,topology.objects.subunits, function(a,b){return a!==b;}))
    .attr('class','borders').attr('d',path);

    group.selectAll('text').data(cities).append('text').text(function(d){return d.id;}).attr({
        x:function(d){return path.centroid(d)[0] || 0;},
        y:function(d){return path.centroid(d)[1] || 0;}
    });
}); 


function zoomed(event,d) {
    group
      .selectAll('path') // To prevent stroke width from scaling
      .attr('transform', event.transform);
  }