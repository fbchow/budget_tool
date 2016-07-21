
// global variables for preprocessing json file
pURL = "data/fearonLaitinPreprocess4.json";
metadataurl="data/fearonLaitin.xml"; 
var preprocess = {};

//globals for d3 related attributes

// space index
var svg = d3.select("#main.left div.carousel-inner").attr('id', 'innercarousel')
.append('div').attr('class', 'item active').attr('id', 'm0').append('svg').attr('id', 'whitespace');

var logArray = [];

           
//.attr('width', width)
//.attr('height', height);
// var tempWidth = d3.select("#main.left").style("width")
// var width = tempWidth.substring(0,(tempWidth.length-2));

/*var tempHeight = d3.select("#main.left").style("height")
var height = tempHeight.substring(0,(tempHeight.length-2));*/

var height = $(window).height() -120;  // Hard coding for header and footer and bottom margin.


// this is the initial color scale that is used to establish the initial colors of the nodes.  allNodes.push() below establishes a field for the master node array allNodes called "nodeCol" and assigns a color from this scale to that field.  everything there after should refer to the nodeCol and not the color scale, this enables us to update colors and pass the variable type to R based on its coloring
var colors = d3.scale.category20();



var varColor = '#f0f8ff';   //d3.rgb("aliceblue");
var selVarColor = '#fa8072';    //d3.rgb("salmon");
var d3Color = '#1f77b4';  // d3's default blue

// var lefttab = "tab1"; //global for current tab in left panel



var zparams = { zdata:[], zedges:[], ztime:[], znom:[], zcross:[], zmodel:"", zvars:[], zdv:[], zdataurl:"", zsubset:[], zsetx:[], zmodelcount:0, zplot:[], zsessionid:"", zdatacite:""};


// Radius of circle
var allR = 40;

//Width and height for histgrams
// var barwidth = 1.3*allR;
// var barheight = 0.5*allR;
// var barPadding = 0.35;
// var barnumber =7;
//

// var arc0 = d3.svg.arc()
// .innerRadius(allR + 5)
// .outerRadius(allR + 20)
// .startAngle(0)
// .endAngle(3.2);
//
// var arc1 = d3.svg.arc()
// .innerRadius(allR + 5)
// .outerRadius(allR + 20)
// .startAngle(0)
// .endAngle(1);
//
// var arc2 = d3.svg.arc()
// .innerRadius(allR + 5)
// .outerRadius(allR + 20)
// .startAngle(1.1)
// .endAngle(2.2);
//
// var arc3 = d3.svg.arc()
// .innerRadius(allR + 5)
// .outerRadius(allR + 20)
// .startAngle(2.3)
// .endAngle(3.3);
//
// var arc4 = d3.svg.arc()
// .innerRadius(allR + 5)
// .outerRadius(allR + 20)
// .startAngle(4.3)
// .endAngle(5.3);



// arry of objects containing allNode, zparams, transform vars
// var spaces = [];
// var trans = []; //var list for each space contain variables in original data plus trans in that space
//


//globals for reading from csv
// From .csv
// var dataset2 = [];
var valueKey = [];
var lablArray = [];
var hold = [];
var allNodes = [];
// var allResults = [];
// var subsetNodes = [];
var links = [];
var nodes = [];
// var transformVar = "";
// var summaryHold = false;
// var selInteract = false;
// var modelCount = 0;
// var callHistory = []; // unique to the space. saves transform and subset calls.
var citetoggle = false;



//APPROXIMATE END OF GLOBAL VARIABLE DECLARATIONS


// collapsible user log
$('#collapseLog').on('shown.bs.collapse', function () {
                     d3.select("#collapseLog div.panel-body").selectAll("p")
                     .data(logArray)
                     .enter()
                     .append("p")
                     .text(function(d){
                           return d;
                     });
                     //$("#logicon").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
                     });
//
// $('#collapseLog').on('hidden.bs.collapse', function () {
//                      d3.select("#collapseLog div.panel-body").selectAll("p")
//                      .remove();
//                      //$("#logicon").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
//                      });


// text for the about box
// note that .textContent is the new way to write text to a div
// $('#about div.panel-body').text('BUDGET TOOL PROTOTYPE 2.0 FANNY CHOW AND NABIB AHMED');








readPreprocess(url=pURL, p=preprocess, v=null, callback=function(){
				// console.log("top of readPreprocess function");
				d3.xml(metadataurl, "application/xml", function(xml){
                      var vars = xml.documentElement.getElementsByTagName("var");
                      var temp = xml.documentElement.getElementsByTagName("fileName");


                      zparams.zdata = temp[0].childNodes[0].nodeValue;
                      
                      // function to clean the citation so that the POST is valid json
                      function cleanstring(s) {
                        s=s.replace(/\&/g, "and");
                        s=s.replace(/\;/g, ",");
                        s=s.replace(/\%/g, "-");
                        return s;
                      }
                      
                      var cite = xml.documentElement.getElementsByTagName("biblCit");
                      zparams.zdatacite=cite[0].childNodes[0].nodeValue;
                      zparams.zdatacite=cleanstring(zparams.zdatacite);
                      
                      
                      // dataset name trimmed to 12 chars
                      var dataname = zparams.zdata.replace( /\.(.*)/, "") ;  // regular expression to drop any file extension
                      // Put dataset name, from meta-data, into top panel
                      d3.select("#dataName")
                      .html(dataname);
                      
                      $('#cite div.panel-body').text(zparams.zdatacite);

                      // Put dataset name, from meta-data, into page title
                      d3.select("title").html("TwoRavens " +dataname)


                      //TESTME iterate through vars

                      // temporary values for hold that correspond to histogram bins
                      hold = [.6, .2, .9, .8, .1, .3, .4];
                      var myvalues = [0, 0, 0, 0, 0];
                      // console.log("GOT HERE A");
                      // console.log(vars);
                      for (i=0;i<vars.length;i++) {
                      
                      valueKey[i] = vars[i].attributes.name.nodeValue;
                      
                      if(vars[i].getElementsByTagName("labl").length === 0) {lablArray[i]="no label";}
                      else {lablArray[i] = vars[i].getElementsByTagName("labl")[0].childNodes[0].nodeValue;}
                      
                      //don't need this histograms code
                      // var datasetcount = d3.layout.histogram()
                      // .bins(barnumber).frequency(false)
                      // (myvalues);
                      
                      // this creates an object to be pushed to allNodes. this contains all the preprocessed data we have for the variable, as well as UI data pertinent to that variable, such as setx values (if the user has selected them) and pebble coordinates
                      var obj1 = {id:i, reflexive: false, "name": valueKey[i], "labl": lablArray[i], data: [5,15,20,0,5,15,20], count: hold, "nodeCol":colors(i), "baseCol":colors(i), "strokeColor":selVarColor, "strokeWidth":"1", "subsetplot":false, "subsetrange":["", ""],"setxplot":false, "setxvals":["", ""], "grayout":false};
                      
                      jQuery.extend(true, obj1, preprocess[valueKey[i]]);
                      
                      // console.log(vars[i].childNodes[4].attributes.type.ownerElement.firstChild.data);
                      allNodes.push(obj1);
					 
                      }

                      //TESTME see if we have a list of variables print out
                      console.log("hey do we have valuekey here");
                      console.log(valueKey);




 });
});


    // populating the variable list in the left panel



d3.select("#tab1").selectAll("p")
    .html("SOMETHING HERE")
    .data(valueKey);       //do something with this..
// d3.select("#tab1").html("SOMETHING HERE");       //do something with this..

// d3.select("#tab1").html(valueKey[1]);
//     .data(valueKey)
//     .enter()
//     .append("p")
//     .attr("id",function(d){
//         return d.replace(/\W/g, "_"); // replace non-alphanumerics for selection purposes
//         }) // perhapse ensure this id is unique by adding '_' to the front?
//     .text(function(d){return d;})
//     .style('background-color',function(d) {
//           if(findNodeIndex(d) > 2) {return varColor;}
//           else {return hexToRgba(selVarColor);}
//           })
//     .attr("data-container", "body")
//     .attr("data-toggle", "popover")
//     .attr("data-trigger", "hover")
//     .attr("data-placement", "right")
//     .attr("data-html", "true")
//     .attr("onmouseover", "$(this).popover('toggle');")
//     .attr("onmouseout", "$(this).popover('toggle');")
//     .attr("data-original-title", "Summary Statistics");
//
//












   
//FUNCTION TO PROCESS JSON FILE
function readPreprocess(url, p, v, callback) {
    console.log(url);

    d3.json(url, function(error, json) {
            if (error) return console.warn(error);
            var jsondata = json;

            //console.log("inside readPreprocess function");
            //console.log(jsondata);
            //console.log(jsondata["variables"]);

            if(jsondata.dataset.private){
              private = jsondata["dataset"]["private"];
            }

            //copying the object
            for(var key in jsondata["variables"]) {
                p[key] = jsondata["variables"][key];
            }
             console.log("we're here")
             console.log(p);

            if(typeof callback === "function") {
                callback();
            }
            });
}



// FUNCTIONS TO ITERATE THROUGH NODES OF SELECTORS
// returns id
var findNodeIndex = function(nodeName) {
    for (var i in allNodes) {
        if(allNodes[i]["name"] === nodeName) {return allNodes[i]["id"];}
    
    }
}

var nodeIndex = function(nodeName) {
    for (var i in nodes) {
        if(nodes[i]["name"] === nodeName) {return i;}
    }
}

var findNode = function(nodeName) {
    for (var i in allNodes) {if (allNodes[i]["name"] === nodeName) return allNodes[i]}
}


// FUNCTIONS FOR CLICK ACTIONS
function about() {
    $('#about').show();
}

function closeabout() {
    $('#about').hide();
}

function opencite() {
    $('#cite').show();
}

function closecite(toggle) {
    if(toggle==false) {
        $('#cite').hide();
    }
}

function clickcite(toggle) {
    if(toggle==false) {
        $('#cite').show();
        return true;
    }else {
        $('#cite').hide();
        return false;
    }
}


 // function to convert color codes
function hexToRgba(hex) {
    var h=hex.replace('#', '');
    
    var bigint = parseInt(h, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    var a = '0.5';
    
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

