pURL = "data/fearonLaitinPreprocess4.json";
metadataurl="data/fearonLaitin.xml"; 
var preprocess = {};
var zparams = { zdata:[], zedges:[], ztime:[], znom:[], zcross:[], zmodel:"", zvars:[], zdv:[], zdataurl:"", zsubset:[], zsetx:[], zmodelcount:0, zplot:[], zsessionid:"", zdatacite:""};

//globals for reading from csv

// From .csv
var dataset2 = [];
var valueKey = [];
var lablArray = [];
var hold = [];
var allNodes = [];
var allResults = [];
var subsetNodes = [];
var links = [];
var nodes = [];
var transformVar = "";
var summaryHold = false;
var selInteract = false;
var modelCount = 0;
var callHistory = []; // unique to the space. saves transform and subset calls.
var citetoggle = false;

//globals for d3 variable pebbles
var colors = d3.scale.category20();

var varColor = '#f0f8ff';   //d3.rgb("aliceblue");
var selVarColor = '#fa8072';    //d3.rgb("salmon");
var taggedColor = '#f5f5f5';    //d3.rgb("whitesmoke");
var d3Color = '#1f77b4';  // d3's default blue
var grayColor = '#c0c0c0';

var lefttab = "tab1"; //global for current tab in left panel



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
					 
                      };

                      //TESTME see if we have a list of variables print out
                      console.log("hey do we have valuekey here");
                      console.log(valueKey);




 });
});
   

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
            };

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