
// global variables for preprocessing json file
pURL = "data/fearonLaitinPreprocess4.json";
metadataurl="data/fearonLaitin.xml"; 
var preprocess = {};

//globals for d3 related attributes

// space index
var svg = d3.select("#main.left div.carousel-inner").attr('id', 'innercarousel')
.append('div').attr('class', 'item active').attr('id', 'm0').append('svg').attr('id', 'whitespace');

var logArray = [];
var chosenVars = [];
           
//.attr('width', width)
//.attr('height', height);
// var tempWidth = d3.select("#main.left").style("width")
// var width = tempWidth.substring(0,(tempWidth.length-2));

/*var tempHeight = d3.select("#main.left").style("height")
var height = tempHeight.substring(0,(tempHeight.length-2));*/

var height = $(window).height() -120;  // Hard coding for header and footer and bottom margin.


// this is the initial color scale that is used to establish the initial colors of the nodes.  allNodes.push() below establishes a field for the master node array allNodes called "nodeCol" and assigns a color from this scale to that field.  everything there after should refer to the nodeCol and not the color scale, this enables us to update colors and pass the variable type to R based on its coloring
var colors = d3.scale.category20();
var csColor = '#419641';


var varColor = '#f0f8ff';   //d3.rgb("aliceblue");
var selVarColor = '#fa8072';    //d3.rgb("salmon");
var d3Color = '#1f77b4';  // d3's default blue
var dvColor = '#28a4c9';
var timeColor = '#2d6ca2';
var nomColor = '#ff6600';
// var lefttab = "tab1"; //global for current tab in left panel

var myspace = 0;
var private=false;  //Do we want this to be true for PSI tool?


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



                    // populate left side bar with variable names
                    d3.select("#tab1").selectAll("p")
                        .data(valueKey)
                        .enter()
                        .append("p")
                        .text(function(d) { return d; })
                        .style('background-color',function(d) {
                            if(findNodeIndex(d) > 2) {return varColor;}
                            else {return hexToRgba(selVarColor);}
                        })
                        .attr("data-container", "body")
                        .attr("data-toggle", "popover")
                        .attr("data-trigger", "hover")
                        .attr("data-placement", "right")
                        .attr("data-html", "true")
                        .attr("onmouseover", "$(this).popover('toggle');")
                        .attr("onmouseout", "$(this).popover('toggle');")
                        .attr("data-original-title", "Information about this Variable")
                        // .on("click", function() {
                        //     //Do something mundane and annoying on click
                        //     alert("Hey, don't click that!");
                        //
                        .on("click", function varClick(){ // we've added a new variable, so we need to add the listener

                            var myText = d3.select(this).text();
                            console.log(myText);

                            d3.select(this)
                               // .html("HEY WASSUP")

                                .style('background-color',function(d) {
                                    console.log("hey what's zparms");
                                    console.log(zparams);
                                    var myText = d3.select(this).text();
                                    var myColor = d3.select(this).style('background-color');
                                    var mySC = allNodes[findNodeIndex(myText)].strokeColor;

                                    // if mytext is in selectedvarList, splice it. else push it.
                                  //  console.log("zparams GO THERE");
                                    var found = $.inArray(myText, chosenVars);
                                    if (found  > -1){
                                        chosenVars.splice(found, 1);
                                    }
                                    else{
                                        chosenVars.push(myText);
                                    }

                                    console.log(chosenVars);


                                    if(d3.rgb(myColor).toString() === varColor.toString()) { // we are adding a var
                                        if(nodes.length==0) {
                                            nodes.push(findNode(myText));
                                            nodes[0].reflexive=true;
                                        }
                                        else {nodes.push(findNode(myText));}
                                        return hexToRgba(selVarColor);
                                    }
                                    else { // dropping a variable

                                        nodes.splice(findNode(myText)["index"], 1);
                                        spliceLinksForNode(findNode(myText));

                                        if(mySC==dvColor) {
                                            var dvIndex = zparams.zdv.indexOf(myText);
                                            if (dvIndex > -1) { zparams.zdv.splice(dvIndex, 1); }
                                        }
                                        else if(mySC==csColor) {
                                            var csIndex = zparams.zcross.indexOf(myText);
                                            if (csIndex > -1) { zparams.zcross.splice(csIndex, 1); }
                                        }
                                        else if(mySC==timeColor) {
                                            var timeIndex = zparams.ztime.indexOf(myText);
                                            if (timeIndex > -1) { zparams.ztime.splice(dvIndex, 1); }
                                        }
                                        else if(mySC==nomColor) {
                                            var nomIndex = zparams.znom.indexOf(myText);
                                            if (nomIndex > -1) { zparams.znom.splice(dvIndex, 1); }
                                        }

                                        nodeReset(allNodes[findNodeIndex(myText)]);
                                      //  borderState();
                                        return varColor;
                                    }

                                });

                        });



                 });
});


$("#searchvar").ready(function(){
    $("#searchvar").val('');

});


function tog(v){
    return v?'addClass':'removeClass';
}

$(document).on('input', '#searchvar', function() {
    $(this)[tog(this.value)]('x');
}).on('mousemove', '.x', function(e) {
    $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');
}).on('click', '.onX', function(){
    $(this).removeClass('x onX').val('').focus();
    updatedata(valueKey,0);
});





var srchid=[];
var vkey=[];
$("#searchvar").on("keyup",function search(e) {
    //if(e.keyCode == 8 ) {
    //d3.select("#tab1").selectAll("p")

    $("#tab1").children().popover('hide');
    //}
    var flag=0;
    var k=0;
    vkey=[];
    srchid=[];

    if($(this).val()===''){
        srchid=[];
        flag=0;
        updatedata(valueKey,flag);
        return;
    }

    for(var i=0;i<allNodes.length;i++)
    {
        if((allNodes[i]["name"].indexOf($(this).val())!=-1))
        {
            srchid[k]=i;

            k=k+1;}
    }
    for(var i=0;i<allNodes.length;i++)
    {
        if((allNodes[i]["labl"].indexOf($(this).val())!=-1) && ($.inArray(i, srchid)==-1))
        {

            srchid[k]=i;

            k=k+1;}
    }

    //console.log(srchid);
    lngth=srchid.length;
    if(k==0){
        vkey=valueKey;
        //srchid=[];
        //alert("Variable Not Found!");
        //return;
    }
    else{

        flag=1;
        vkey=[];

        k=0;
        var i=0;
        for( i=0;i<srchid.length;i++)	{
            vkey[i]=valueKey[srchid[i]];

        }
        //console.log("value of i= " + i);
        //console.log("vkey before  " + vkey);

        for(var j=0;j<valueKey.length;j++){

            if($.inArray(valueKey[j],vkey)==-1){
                vkey[i]=valueKey[j];
                i++;
            }

        }
    }

    //console.log("vkey Length: "+vkey.length);
    //console.log("valueKey length: "+valueKey.length);

    updatedata(vkey,flag);
    //}
});

function updatedata(value,flag)
{
    var clr='#000000' ;
    //console.log("updatedata() called");
    var nodename=[];
    var bordercol='#000000';
    var borderstyle='solid';
    for(var i=0;i<nodes.length;i++)
    {
        nodename[i]=nodes[i].name;
    }
    //console.log("Name of Nodes: "+nodename);
    d3.select("#tab1").selectAll("p").data(valueKey).remove();


    d3.select("#tab1").selectAll("p")
    //do something with this..

        .data(value)
        .enter()
        .append("p")
        .attr("id",function(d){
            return d.replace(/\W/g, "_"); // replace non-alphanumerics for selection purposes
        }) // perhapse ensure this id is unique by adding '_' to the front?
        .text(function(d){return d;})
        .style('background-color',function(d) {
            if($.inArray(findNode(d).name,nodename)==-1) {return varColor;}
            // if(findNodeIndex(d) > 2) {return varColor;}
            // else if(findNodeIndex(d)==srchid){return clr; }
            else {return hexToRgba(selVarColor);}
        }).style('border-style',function(d){
        if($.inArray(findNodeIndex(d),srchid)!=-1 && flag==1){return borderstyle;}
    })
        .style('border-color',function(d){
            if($.inArray(findNodeIndex(d),srchid)!=-1 && flag==1){return bordercol;}
        })
        .attr("data-container", "body")
        .attr("data-toggle", "popover")
        .attr("data-trigger", "hover")
        .attr("data-placement", "right")
        .attr("data-html", "true")
        .attr("onmouseover", "$(this).popover('toggle');")
        .attr("onmouseout", "$(this).popover('toggle');")
        .attr("data-original-title", "About this Variable")
        .on("click", function varClick(){ // we've added a new variable, so we need to add the listener

            var myText = d3.select(this).text();
            console.log(myText);

            d3.select(this)
            // .html("HEY WASSUP")

                .style('background-color',function(d) {
                    console.log("hey what's zparms");
                    console.log(zparams);
                    var myText = d3.select(this).text();
                    var myColor = d3.select(this).style('background-color');
                    var mySC = allNodes[findNodeIndex(myText)].strokeColor;

                    // if mytext is in selectedvarList, splice it. else push it.
                    //  console.log("zparams GO THERE");
                    var found = $.inArray(myText, chosenVars);
                    if (found  > -1){
                        chosenVars.splice(found, 1);
                    }
                    else{
                        chosenVars.push(myText);
                    }

                    console.log(chosenVars);


                    if(d3.rgb(myColor).toString() === varColor.toString()) { // we are adding a var
                        if(nodes.length==0) {
                            nodes.push(findNode(myText));
                            nodes[0].reflexive=true;
                        }
                        else {nodes.push(findNode(myText));}
                        return hexToRgba(selVarColor);
                    }
                    else { // dropping a variable

                        nodes.splice(findNode(myText)["index"], 1);
                        spliceLinksForNode(findNode(myText));

                        if(mySC==dvColor) {
                            var dvIndex = zparams.zdv.indexOf(myText);
                            if (dvIndex > -1) { zparams.zdv.splice(dvIndex, 1); }
                        }
                        else if(mySC==csColor) {
                            var csIndex = zparams.zcross.indexOf(myText);
                            if (csIndex > -1) { zparams.zcross.splice(csIndex, 1); }
                        }
                        else if(mySC==timeColor) {
                            var timeIndex = zparams.ztime.indexOf(myText);
                            if (timeIndex > -1) { zparams.ztime.splice(dvIndex, 1); }
                        }
                        else if(mySC==nomColor) {
                            var nomIndex = zparams.znom.indexOf(myText);
                            if (nomIndex > -1) { zparams.znom.splice(dvIndex, 1); }
                        }

                        nodeReset(allNodes[findNodeIndex(myText)]);
                        //  borderState();
                        return varColor;
                    }

                });

        });

    //
    //console.log("d3 enter called");

    // fakeClick();
    //restart();
    $("#tab1").children().popover('hide');
   // populatePopover();
    //$("#tab1").children().popover('toggle');
    //addlistener(nodes);

    //callback=layout();
    //console.log("d3 exit called");
}





// TESTING FUNCTIONALITY FOR CLICKING AND ADDING VARIABLES
function layout(v) {


    //console.log("Layout Called");
    var myValues=[];
    nodes = [];
    links = [];

    if(v === "add" | v === "move") {
        d3.select("#tab1").selectAll("p").style('background-color',varColor);
        for(var j =0; j < zparams.zvars.length; j++ ) {
            var ii = findNodeIndex(zparams.zvars[j]);
            if(allNodes[ii].grayout) {continue;}
            nodes.push(allNodes[ii]);
            var selectMe = zparams.zvars[j].replace(/\W/g, "_");
            selectMe = "#".concat(selectMe);
            d3.select(selectMe).style('background-color',function(){
                return hexToRgba(nodes[j].strokeColor);
            });

        }

        for(var j=0; j < zparams.zedges.length; j++) {
            var mysrc = nodeIndex(zparams.zedges[j][0]);
            var mytgt = nodeIndex(zparams.zedges[j][1]);
            links.push({source:nodes[mysrc], target:nodes[mytgt], left:false, right:true});
        }
    }
    else {
        if(allNodes.length > 2) {
            nodes = [allNodes[0], allNodes[1], allNodes[2]];
            links = [
                {source: nodes[1], target: nodes[0], left: false, right: true },
                {source: nodes[0], target: nodes[2], left: false, right: true }
            ];
        }
        else if(allNodes.length === 2) {
            nodes = [allNodes[0], allNodes[1]];
            links = [{source: nodes[1], target: nodes[0], left: false, right: true }];
        }
        else if(allNodes.length === 1){
            nodes = [allNodes[0]];
        }
        else {
            alert("There are zero variables in the metadata.");
            return;
        }
    }

    //panelPlots(); // after nodes is populated, add subset and setx panels
    //populatePopover(); // pipes in the summary stats shown on mouseovers




    //Rohit Bhattacharjee FORCE D3
    // init D3 force layout

    //var
    force=forced3layout(nodes, links, width, height,tick);
    // init D3 force layout
    //function forced3layout(var nodes, var links, var width, var height)
    //var force = d3.layout.force()
    //.nodes(nodes)
    //.links(links)
    //.size([width, height])
    //.linkDistance(150)
    //.charge(-800)
    //.on('tick',tick);  // .start() is important to initialize the layout


    //Rohit Bhattacharjee SVG
    //function svgappend()
    // define arrow markers for graph links
    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#000');

    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .style('fill', '#000');

    // line displayed when dragging new nodes
    //   var drag_line = svg.append('svg:path')
    // .attr('class', 'link dragline hidden')
    //.attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    // var path = svg.append('svg:g').selectAll('path');
    //circle = svg.append('svg:g').selectAll('g');

    // mouse event vars
    //var selected_node = null,
    //selected_link = null,
    //mousedown_link = null,
    //mousedown_node = null,
    //mouseup_node = null;

    //ROHIT BHATTACHARJEE reset mouse
    //function resetMouseVars() {
    //    mousedown_node = null;
    //    mouseup_node = null;
    //    mousedown_link = null;
    //}

    //ROHIT BHATTACHARJEE TICK
    // update force layout (called automatically each iteration)
    //function tick() {
    //    // draw directed edges with proper padding from node centers
    //    path.attr('d', function(d) {
    //              var deltaX = d.target.x - d.source.x,
    //              deltaY = d.target.y - d.source.y,
    //              dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
    //              normX = deltaX / dist,
    //              normY = deltaY / dist,
    //              sourcePadding = d.left ? allR+5 : allR,
    //              targetPadding = d.right ? allR+5 : allR,
    //              sourceX = d.source.x + (sourcePadding * normX),
    //              sourceY = d.source.y + (sourcePadding * normY),
    //              targetX = d.target.x - (targetPadding * normX),
    //              targetY = d.target.y - (targetPadding * normY);
    //              return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    //              });
    //
    //    //  if(forcetoggle){
    //    circle.attr('transform', function(d) {
    //                return 'translate(' + d.x + ',' + d.y + ')';
    //                });
    //    //  };
    //
    //}
    //

    //  add listeners to leftpanel.left.  every time a variable is clicked, nodes updates and background color changes.  mouseover shows summary stats or model description.
    //Rohit BHATTACHARJEE add listener
    addlistener(nodes);
    //unction addlistener(){
    //d3.select("#tab1").selectAll("p")
    //.on("mouseover", function(d) {
    //    // REMOVED THIS TOOLTIP CODE AND MADE A BOOTSTRAP POPOVER COMPONENT
    //    $("body div.popover")
    //    .addClass("variables");
    //    $("body div.popover div.popover-content")
    //    .addClass("form-horizontal");
    //     })
    //.on("mouseout", function() {
    //    //Remove the tooltip
    //    //d3.select("#tooltip").style("display", "none");
    //    })
    //.on("click", function varClick(){
    //    if(allNodes[findNodeIndex(this.id)].grayout) {return null;}
    //
    //    d3.select(this)
    //    .style('background-color',function(d) {
    //           var myText = d3.select(this).text();
    //           var myColor = d3.select(this).style('background-color');
    //           var mySC = allNodes[findNodeIndex(myText)].strokeColor;
    //
    //           zparams.zvars = []; //empty the zvars array
    //           if(d3.rgb(myColor).toString() === varColor.toString()) { // we are adding a var
    //            if(nodes.length==0) {
    //                nodes.push(findNode(myText));
    //                nodes[0].reflexive=true;
    //            }
    //            else {nodes.push(findNode(myText));}
    //            return hexToRgba(selVarColor);
    //           }
    //           else { // dropping a variable
    //
    //                nodes.splice(findNode(myText)["index"], 1);
    //                spliceLinksForNode(findNode(myText));
    //
    //            if(mySC==dvColor) {
    //                var dvIndex = zparams.zdv.indexOf(myText);
    //                if (dvIndex > -1) { zparams.zdv.splice(dvIndex, 1); }
    //                //zparams.zdv="";
    //            }
    //            else if(mySC==csColor) {
    //                var csIndex = zparams.zcross.indexOf(myText);
    //                if (csIndex > -1) { zparams.zcross.splice(csIndex, 1); }
    //            }
    //            else if(mySC==timeColor) {
    //                var timeIndex = zparams.ztime.indexOf(myText);
    //                if (timeIndex > -1) { zparams.ztime.splice(timeIndex, 1); }
    //            }
    //           else if(mySC==nomColor) {
    //                var nomIndex = zparams.znom.indexOf(myText);
    //                if (nomIndex > -1) { zparams.znom.splice(dvIndex, 1); }
    //           }
    //
    //            nodeReset(allNodes[findNodeIndex(myText)]);
    //            borderState();
    //           legend();
    //            return varColor;
    //           }
    //           });
    //    panelPlots();
    //    restart();
    //    });
    //}
    //

    //var drag_line = svg.append('svg:path')
    //    .attr('class', 'link dragline hidden')
    //    .attr('d', 'M0,0L0,0');
    //
    d3.select("#models").selectAll("p") // models tab
        .on("mouseover", function(d) {
            // REMOVED THIS TOOLTIP CODE AND MADE A BOOTSTRAP POPOVER COMPONENT
        })
        .on("mouseout", function() {
            //Remove the tooltip
            //d3.select("#tooltip").style("display", "none");
        })
        //  d3.select("#Display_content")
        .on("click", function(){
            var myColor = d3.select(this).style('background-color');
            d3.select("#models").selectAll("p")
                .style('background-color',varColor);
            d3.select(this)
                .style('background-color',function(d) {
                    if(d3.rgb(myColor).toString() === varColor.toString()) {
                        zparams.zmodel = d.toString();
                        return hexToRgba(selVarColor);
                    }
                    else {
                        zparams.zmodel = "";
                        return varColor;
                    }
                });
            restart();
        });




    // update graph (called when needed)
    //restart();
    //ROHIT BHATTACHARJEE RESTART FUNCTION
    //end restart function

    //ROHIT BHATTACHARJEE MOUSE FUNCTIONS
    // function mousedown(d) {
    //     // prevent I-bar on drag
    //     d3.event.preventDefault();
    //
    //     // because :active only works in WebKit?
    //     svg.classed('active', true);
    //
    //     if(d3.event.ctrlKey || mousedown_node || mousedown_link) {
    //         return;
    //     }
    //
    //     restart();
    // }
    //
    // function mousemove(d) {
    //     if(!mousedown_node) return;
    //
    //     // update drag line
    //     drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    // }
    //
    // function mouseup(d) {
    //     if(mousedown_node) {
    //         // hide drag line
    //         drag_line
    //         .classed('hidden', true)
    //         .style('marker-end', '');
    //     }
    //     // because :active only works in WebKit?
    //     svg.classed('active', false);
    //
    //     // clear mouse event vars
    //     resetMouseVars();
    // }




    // app starts here

    svg.attr('id', function(){
        return "whitespace".concat(myspace);
    })
        .attr('height', height)
        .on('mousedown', function() {
            mousedown(this);
        })
        .on('mouseup', function() {
            mouseup(this);
        });

    d3.select(window)
        .on('click',function(){  //NOTE: all clicks will bubble here unless event.stopPropagation()
            $('#transList').fadeOut(100);
            $('#transSel').fadeOut(100);
        });

    restart(); // this is the call the restart that initializes the force.layout()
    fakeClick();
} 		// end layout














   
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

function fakeClick() {
    var myws = "#whitespace".concat(myspace);
    // d3 and programmatic events don't mesh well, here's a SO workaround that looks good but uses jquery...
    jQuery.fn.d3Click = function () {
        this.each(function (i, e) {
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            e.dispatchEvent(evt);
        });
    };
    $(myws).d3Click();

    d3.select(myws)
        .classed('active', false); // remove active class
}

function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
        return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
        links.splice(links.indexOf(l), 1);
    });
}

function nodeReset (n) {
    n.strokeColor=selVarColor;
    n.strokeWidth="1";
    n.nodeCol=n.baseCol;
}