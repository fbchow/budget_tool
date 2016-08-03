// JSON data of r-libraries and functions (Fanny's work will provide these)
var JSON_file = '{"rfunctions":[' +
    '{"statistic": "Mean", "stat_info": "Average", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound"]}, {"stype": "Boolean", "parameter": []}]},' + 
    '{"statistic": "Histogram", "stat_info": "Frequency", "statistic_type": [{"stype": "Numerical", "parameter": ["Number of Bins"]}, {"stype": "Boolean", "parameter": []}, {"stype": "Categorical", "parameter": ["Number of Bins"]}]},' +
    '{"statistic": "Quantile", "stat_info": "Range", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound", "Granularity"]}, {"stype": "Boolean", "parameter": []}]} ],' +
    '"type_label": [ {"stype": "Numerical", "type_info": "Numbers"}, {"stype": "Boolean", "type_info": "True or False"}, {"stype": "Categorical", "type_info": "Categories"} ],' +
    '"parameter_info": [ {"parameter": "Lower Bound", "entry_type": "number", "pinfo": "Lowest Value"}, {"parameter": "Upper Bound", "entry_type": "number", "pinfo": "Highest Value"}, {"parameter": "Number of Bins", "entry_type": "pos_integer", "pinfo": "Number of Categories"}, {"parameter": "Granularity", "entry_type": "pos_integer", "pinfo": "Spread"} ] }';


// List of variables to make form bubbles (Fanny's work will provide these)
var JSON_file2 = '{ "varlist": ["var1", "var2", "var3", "var4", "var5"] }'; 


// Parses the function and varlist data structure
var rfunctions = JSON.parse(JSON_file);
var varlist = JSON.parse(JSON_file2);

// List of possible variable
var variable_list = varlist.varlist;

// Active and inactive variable list
var varlist_active = [];
var varlist_inactive = variable_list; 




// Unique array function (source: http://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array)
Array.prototype.unique = function () {
    var arr = this;
    return $.grep(arr, function (v, i) {
        return $.inArray(v, arr) === i;
    });
};





// List of possible statisitics
var statistic_list = [];
for (n = 0; n < rfunctions.rfunctions.length; n++) {
    statistic_list.push(rfunctions.rfunctions[n].statistic);
};

// List of all types
var type_list = [];
for (n = 0; n < rfunctions.type_label.length; n++) {
    type_list.push(rfunctions.type_label[n].stype);
};


// List of statistics per type and metadata required
for (n = 0; n < type_list.length; n++) {
    var var_type = type_list[n];
    eval("var " + var_type.replace(/\s/g, '_') + "_stat_list = [];");
    eval("var " + var_type.replace(/\s/g, '_') + "_stat_parameter_list = [];");
    for (m = 0; m < rfunctions.rfunctions.length; m++) {
        for (l = 0; l < rfunctions.rfunctions[m].statistic_type.length; l++) {
            if (rfunctions.rfunctions[m].statistic_type[l].stype == var_type) {
                eval(var_type.replace(/\s/g, '_') + "_stat_list.push('" + rfunctions.rfunctions[m].statistic + "');");
                eval(var_type.replace(/\s/g, '_') + "_stat_parameter_list.push({'rfunctions_index': " + m + ", 'parameter_index': " + l + "});");
            }
            else {}
        };
    };
};

// List of all metadata
var metadata_list = [];
for (n = 0; n < rfunctions.parameter_info.length; n++) {
    metadata_list.push(rfunctions.parameter_info[n].parameter);
};







// Column index dictionary
// Format: inputted_metadata[variable_name] = ['Variable_Type', 'Statistic1', 'Epsilon1', 'Accuracy1', 'Hold1', ... Repeats for all possible statistics ... All Possible Metadata];
var column_index = {}
column_index["Variable_Type"] = 0; 
for (n = 0; n < statistic_list.length; n ++) {
    var m = 4 * n; 
    var statistic_index = statistic_list[n].replace(/\s/g, '_');
    column_index[statistic_index] = m + 1;
    column_index["epsilon_" + statistic_index] = m + 2;
    column_index["accuracy_" + statistic_index] = m + 3;
    column_index["hold_" + statistic_index] = m + 4;
};
for (n = 0; n < metadata_list.length; n++) {
    m = 4 * statistic_list.length + 1;
    column_index[metadata_list[n].replace(/\s/g, '_')] = m + n;
};

column_index_length = 1 + 4 * statistic_list.length + metadata_list.length;

// Array that is to be passed to the R-servers
// Format: inputted_metadata[variable_name] = ['Variable_Type', 'Statistic1', 'Epsilon1', 'Accuracy1', 'Hold1', ... Repeats for all possible statistics ... All Possible Metadata];
var inputted_metadata = {};

// Inputting the given variables
for (n = 0; n < varlist_active.length; n++) {
    default_array = ['default']
    for (m = 0; m < statistic_list.length; m ++) {
        default_array.push(0);
        default_array.push(0);
        default_array.push(0);
        default_array.push(0);
    };
    for (l = 0; l < metadata_list.length; l++) {
        default_array.push("");
    };
    inputted_metadata[varlist_active[n].replace(/\s/g, '_')] = default_array;
};

// A reset function for rows
function reset (row) {
    row[0] = "default";
    for (m = 0; m < statistic_list.length; m ++) {
        var n = 4 * m + 1;
        row[n] = 0;
        row[n + 1] = 0;
        row[n + 2] = 0;
        row[n + 3] = 0;
    };
    for (l = 0; l < metadata_list.length; l++) {
        var n = 1 + 4 * statistic_list.length;
        row[n + l] = "";
    };
};

// A default array 
function array_default () {
    var array_default = ['default'];
    for (m = 0; m < statistic_list.length; m ++) {
        array_default.push(0);
        array_default.push(0);
        array_default.push(0);
        array_default.push(0);
    };
    for (l = 0; l < metadata_list.length; l++) {
        array_default.push("");
    };
    return array_default;
};


// Make the category dropdown
// Tooltip: http://stackoverflow.com/questions/682643/tooltip-on-a-dropdown-list
function list_of_types (variable) {
    type_menu = "";
    for (m = 0; m < type_list.length; m++) {
        type_menu += "<option id='" + type_list[m] + "_" + variable + "' value='" + type_list[m] + "' title='" + rfunctions.type_label[m].type_info + "'>" + type_list[m] + "</option>";
    };
    return type_menu;
};

// Produces checkboxes on selected type
function type_selected (type_chosen, variable) {
    reset(inputted_metadata[variable]);
    inputted_metadata[variable][0] = type_chosen;
    generate_epsilon_table();

    if (type_chosen != "default") {
        document.getElementById("released_statistics_" + variable).innerHTML = list_of_statistics(type_chosen, variable);
        document.getElementById('necessary_parameters_' + variable).innerHTML = "";
    }
    else {
        document.getElementById("released_statistics_" + variable).innerHTML = "";
        document.getElementById('necessary_parameters_' + variable).innerHTML = "";
    }
};

// Makes the checkboxes
function list_of_statistics (type_chosen, variable) {
    variable = variable.replace(/\s/g, '_');
    var options = "";
    eval("var type_chosen_list = " + type_chosen + "_stat_list;")
    for (n = 0; n < type_chosen_list.length; n++) {
        options += "<input type='checkbox' name='" + type_chosen_list[n].replace(/\s/g, '_') + "' onclick='Parameter_Populate(this," + n + ",\"" + variable + "\",\"" + type_chosen + "\"); generate_epsilon_table();' id='" + type_chosen_list[n].replace(/\s/g, '_') + "_" + variable + "'> <span title='" + rfunctions.rfunctions[(column_index[type_chosen_list[n].replace(/\s/g, '_')] - 1) / 4].stat_info + "'>" + type_chosen_list[n] + "</span><br>";
    };
    return options;
};

// Makes bubbles and takes in variable name as unique identifier
// Forces each variable to have an unique name
function make_bubble (variable) {
    var variable_raw = variable;
    variable = variable.replace(/\s/g, '_');
    var blank_bubble = 
    "<div id='" + variable + "'>" + 
        "<div class='bubble' id='bubble_" + variable + "'>" +
            "<button class='accordion' id='accordion_" + variable + "' onclick='accordion(this)'>" +
                variable_raw +
            "</button>" +
            "<div id='panel_" + variable + "' class='panel'>" +
                "<div id='variable_types_" + variable + "' class='variable_types'>" +
                    "Variable Type: " +
                    "<select id='variable_type_" + variable + "' onchange='type_selected(value,\"" + variable + "\")'>" + 
                        "<option id='default_" + variable + "' value='default'>Please select a type</option>" +
                        list_of_types(variable) +
                    "</select>" +
                "</div>" +
                "<hr style='margin-top: -0.25em'>" +
                "<div id='released_statistics_" + variable + "' class='released_statistics'>" +
                "</div>" +
                "<hr style='margin-top: -0.25em'>" +
                "<div id='necessary_parameters_" + variable + "' class='necessary_parameters'></div>" + 
                "<div><button onclick='delete_variable(\"" + variable_raw + "\")'>DELETE</button></div>" + 
            "</div>" +
        "</div>" +
        "<br>" +
    "</div>";
    return blank_bubble;
};

// Enables Collapsable Sections for JS Generated HTML
function accordion (bubble) {
    var variable = bubble.id.slice(10, bubble.id.length);
    if (bubble.className == "accordion") {
        bubble.className = "accordion active";
        document.getElementById("panel_" + variable).className = "panel show";
    }
    else {
        bubble.className = "accordion";
        document.getElementById("panel_" + variable).className = "panel";
    };
};

// Generates bubbles from variable list recieved
function variable_bubble () {
    for (i = 0; i < varlist_active.length; i++) {
        $("#bubble_form").append(make_bubble(varlist_active[i]));
    };
};






// Generates html based on statistics choosen
function parameter_fields (variable, type_chosen) {
    eval("var pparameter = " + type_chosen + "_stat_list;");
    eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");

    var needed_parameters = [];
    for (i = 0; i < ppparameter.length; i++) {
        if (inputted_metadata[variable][column_index[pparameter[i].replace(/\s/g, '_')]] > 0) {
            needed_parameters = needed_parameters.concat(rfunctions.rfunctions[ppparameter[i].rfunctions_index].statistic_type[ppparameter[i].parameter_index].parameter);
        }
        else {}
    };
    needed_parameters = needed_parameters.unique();

    // makes blank html text
    var parameter_field = "";

    // uses .unique() to get all unique values and iterate through
    for (j = 0; j < needed_parameters.length; j++) {
        // creates html list in .sort() (alphabet order)
        parameter_field += "<span title='" + rfunctions.parameter_info[(column_index[needed_parameters[j].replace(/\s/g, '_')] - (4 * type_list.length) - 1)].pinfo + "'>" + needed_parameters[j] + ":</span> <input type='text' value='" + inputted_metadata[variable][column_index[needed_parameters[j].replace(/\s/g, '_')]] + "' name='" + needed_parameters[j].replace(/\s/g, '_') + "'id='input_" + needed_parameters[j].replace(/\s/g, '_') + "_" + variable + "' oninput='Parameter_Memory(this,\"" + variable + "\")' onfocusout='ValidateInput(this, \"" + rfunctions.parameter_info[(column_index[needed_parameters[j].replace(/\s/g, '_')] - (4 * type_list.length) - 1)].entry_type + "\", \"" + variable + "\")'><br>"
    };

    // prints this all out, display seems smooth
    document.getElementById('necessary_parameters_' + variable).innerHTML = parameter_field; 
};

// Produce parameter fields
// http://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_oninput
function Parameter_Populate (stat, stat_index, variable, type_chosen) {    
    eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");

    // checks if thing is checked
    if ($("#" + stat.id).prop('checked')) {
        // Updating the master data-array
        inputted_metadata[variable][column_index[stat.name]] = 1;

        // In case zero parameters needed
        epsilon_table_validation(variable); 
        
        // calls the parameter HTML generating function
        parameter_fields(variable, type_chosen);
    }

    // if not checked
    else {
        // splice.() help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_fobjects/Array/splice
        // index() help: https://api.jquery.com/index/

        // Updating the master data-array
        inputted_metadata[variable][column_index[stat.name]] = 0;

        // calls the parameter HTML generating function
        parameter_fields(variable, type_chosen);
    }
};

// Stores metadata in memory
function Parameter_Memory (parameter, variable) {
    inputted_metadata[variable][column_index[parameter.name]] = parameter.value;
};






// Regex: http://www.w3schools.com/jsref/jsref_obj_regexp.asp
// Validate form based on entry_type info
function ValidateInput (input, valid_entry, variable) {
    // Actual input validation
    var entry = input.value;

    if (entry == "") {
        epsilon_table_validation(variable);    
        return false;
    } 

    if (valid_entry == "general_text") {
        if (!entry.match(/^[a-zA-Z0-9]+$/)) {
            alert("Invalid entry. Entry can only contain numbers and letters only!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    if (valid_entry == "text_only") {
        if (!entry.match(/^[a-zA-Z]+$/)) {
            alert("Invalid entry. Entry can only contain letters only!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    if (valid_entry == "pos_decimal") {
        if (!entry.match(/^[+]?[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be positive decimals!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    if (valid_entry == "neg_decimal") {
        if (!entry.match(/^[-]{1}[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be negative decimals. Must have negative sign (-) in front!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "decimal") {
        if (!entry.match(/^[+-]?[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be decimals!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "pos_integer") {
        if (!entry.match(/^[+]?[0-9]+$/)) {
            alert("Invalid entry. Entry can only be positive integer!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "neg_integer") {
        if (!entry.match(/^[-]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be negative integer. Must have negative sign (-) in front!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "integer") {
        if (!entry.match(/^[+-]?[0-9]+$/)) {
            alert("Invalid entry. Entry can only be integers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "pos_number") {
        if (!(entry.match(/^[+]?[0-9]+[.]?$/) || entry.match(/^[+]?[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be positive numbers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "neg_number") {
        if (!(entry.match(/^[-]{1}[0-9]+[.]?$/) || entry.match(/^[-]{1}[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be negative numbers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "number") {
        if (!(entry.match(/^[+-]?[0-9]+[.]?$/) || entry.match(/^[+-]?[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be numbers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    epsilon_table_validation(variable);    
};


// Epsilon Table Validation
function epsilon_table_validation (variable) {
    var type_chosen = inputted_metadata[variable][0];
    eval("var pparameter = " + type_chosen + "_stat_list;");
    eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");    
    for (q = 0; q < pparameter.length; q++) {
        if (inputted_metadata[variable][column_index[pparameter[q]]] > 0) {
            var sparameter = rfunctions.rfunctions[(ppparameter[(pparameter.indexOf(pparameter[q]))].rfunctions_index)].statistic_type[ppparameter[pparameter.indexOf(pparameter[q])].parameter_index].parameter;
            inputted_metadata[variable][column_index[pparameter[q]]] = 2 + sparameter.length;
            for (r = 0; r < sparameter.length; r++) {
                if (inputted_metadata[variable][column_index[sparameter[r].replace(/\s/g, '_')]] != "") {
                    inputted_metadata[variable][column_index[pparameter[q]]] = inputted_metadata[variable][column_index[pparameter[q]]] - 1;  
                }
            };
        }
    };
    generate_epsilon_table();  
};




// Does the hold function
function hold_status (hold_checkbox, variable, statistic) {
    if ($("#" + hold_checkbox.id).prop('checked')) {
        inputted_metadata[variable][column_index["hold_" + statistic]] = 1;
    }
    else {
        inputted_metadata[variable][column_index["hold_" + statistic]] = 0;
    }
};



// Creates Epsilon 
function generate_epsilon_table () {
    var epsilon_table = 
    "<table id='epsilon_table' style='width: 100%;'>" +
        "<tr>" +
            "<td style='font-weight: bold;'>" +
                "Variable Name" +
            "</td>" +
            "<td style='font-weight: bold;'>" +
                "Statistic" +
            "</td>" +
            "<td title='Privacy parameter' style='font-weight: bold;'>" +
                "Epsilon" +
            "</td>" +
            "<td title='How accurate?' style='font-weight: bold;'>" +
                "Accuracy" +
            "</td>" +
            "<td title='Wanna fix the epsilon/accuracy value?' style='font-weight: bold;'>" +
                "Hold" +
            "</td>" +
        "</tr>";
    for (n = 0; n < varlist_active.length; n++) {
        for (m = 0; m < statistic_list.length; m++) {
            var stat_index = 4 * m + 1;
            if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] > 0) {
                epsilon_table += 
                "<tr>" +
                    "<td>" +
                        varlist_active[n] +
                    "</td>" +
                    "<td>" +
                        statistic_list[m] +
                    "</td>"; 

                    if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] == 2) {
                        epsilon_table += 
                        "<td>" +
                            "0" +
                        "</td>" +
                        "<td>" +
                            "<input type='text' value='" + inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index + 2] + "' name='accuracy_" + statistic_list[m] + "' onfocusout='ValidateInput(this, \"pos_number\", \"" + varlist_active[n].replace(/\s/g, '_') + "\")' oninput='Parameter_Memory(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\")'>" +
                        "</td>" +
                        "<td>";
                        
                        if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][column_index["hold_" + statistic_list[m]]] == 1) {    
                            epsilon_table += "<input type='checkbox' id='hold_" + varlist_active[n].replace(/\s/g, '_') + "_" + statistic_list[m] + "' onclick='hold_status(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\",\"" + statistic_list[m] + "\")' checked>";
                        }
                        else {
                            epsilon_table += "<input type='checkbox' id='hold_" + varlist_active[n].replace(/\s/g, '_') + "_" + statistic_list[m] + "' onclick='hold_status(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\",\"" + statistic_list[m] + "\")'>";
                        }
                    }

                    else {
                        epsilon_table += 
                        "<td title='Epsilon will be edittable after putting in the necessary metadata fields.'>" +
                        "</td>" +
                        "<td title='Accuracy will be edittable after putting in the necessary metadata fields.'>" +
                        "</td>" +
                        "<td title='Hold status will be edittable after putting in the necessary metadata fields.'>";
                    }
                    
                epsilon_table +=    
                    "</td>" +
                "</tr>";
            }
            else {}
        };
    };
    epsilon_table += 
    "</table>";

    document.getElementById('epsilon_sidebar').innerHTML = epsilon_table;
};






// Reverse column_index: http://stackoverflow.com/questions/1159277/array-flip-in-javascript
var index_column = {};
$.each(column_index, function(i, el) {
    index_column[el]=i;
});



// copied from wireframe.js
function getGlobalParameters(){
    var epsval=document.getElementById("epsilonbox").value;
    var delval=document.getElementById("deltabox").value;
    var betaval=document.getElementById("betabox").value;
    var nval = 1223992 //Need to get this from metadata too
    var globals={eps:epsval, del:delval, beta:betaval, n:nval};

    console.log(globals);

    return globals;
}


// Get length of js dictionary length: http://jsfiddle.net/simevidas/nN84h/
// Generates a HTML datapage with all the info collected 
function report () {
    info =
    "<style>" +
    "#epsilon_table table, #epsilon_table th, #epsilon_table td {" +
        "border: 1px solid black;" +
        "border-collapse: collapse;" +
    "}" +
    "#epsilon_table th, #epsilon_table td {" +
        "padding: 5px;" +
        "text-align: center;" +
    "}" +
    "</style>" + 
    "<table id='epsilon_table' style='width: 100%;'>" +
        "<tr>" +
            "<td style='font-weight: bold;'>" +
                "Variable Name" +
            "</td>";

    for (n = 0; n < column_index_length; n++) {
        info +=             
        "<td style='font-weight: bold;'>" +
            index_column[n] +
        "</td>";
    };
    
    info += "</tr>";

    for (m = 0;  m < varlist_active.length; m++) {
        info += 
        "<tr>" +
            "<td>" +
                varlist_active[m] +
            "</td>";
        
        for (l = 0; l < column_index_length; l++) {
            info +=             
            "<td>" +
                inputted_metadata[varlist_active[m].replace(/\s/g, '_')][l] +
            "</td>";
        };

        info += "</tr>";
    };

    var report_info = window.open("");
    report_info.document.write(info + "</table>");

    //TESTME
    var globalVars;
    globalVars = console.log(globals);
    console.log(globals);
};


// json
// mouseover label telling what the statistic is
// what metadata needs (numerical (whole number), text, decimal (can have .), positive, negative #, is order a < b, )
// custom logic (metadata checking rules)
// shift over dynamic table to below


// issues to resolve:
// form logic (check if numerials), 
// epsilon/accuracy table




// $(document).ready(function () {	
// 	// sidebar action, with toggle and text-switch
// 	$("#sidebar-toggle").click(function() {
//         $(this).text(function(i, v){
//         	return v === '>>' ? '<<' : '>>'
//         });
//         $("#wrapper").toggleClass("toggled");
//     });
// });




// Search box logic: https://www.html5andbeyond.com/live-search-a-html-list-using-jquery-no-plugin-needed/
jQuery(document).ready(function($) {
    $('.live-search-list li').each(function() {
        $(this).attr('data-search-term', $(this).text().toLowerCase());
    });

    $('.live-search-box').on('keyup', function() {
        var searchTerm = $(this).val().toLowerCase();

        $('.live-search-list li').each(function() {
            if ($(this).filter('[data-search-term *= ' + searchTerm + ']').length > 0 || searchTerm.length < 1) {
                $(this).show();
            } 
            else {
                $(this).hide();
            }
        });
    });
});




// Adding variables to the variable selection column
function populate_variable_selection_sidebar () {
    variable_selection_sidebar = ""
    for (n = 0; n < variable_list.length; n++) {
        variable_selection_sidebar += "<li id='selection_sidebar_" + variable_list[n] + "' data-search-term='" + variable_list[n] + "' onclick='variable_selected(\""+variable_list[n]+"\")'>" + variable_list[n] + "</li>";
    };
    $("#variable_sidebar").append(variable_selection_sidebar);
};




// CSS when variable selected
var variable_selected_class = 
    "color: black;" +
    "list-style: none;" +
    "padding: 5px;" + 
    "margin: 5px 0;" +
    "border: solid 5px green;"+
    "text-align: center;";

// CSS when variable unselected
var variable_unselected_class = 
    "color: black;" +
    "list-style: none;" +
    "padding: 5px;" + 
    "margin: 5px 0;" +
    "border: solid 5px red;"+
    "text-align: center;";

// Variable selection boxes change to signify selection
function variable_selected (variable) {
    if (inputted_metadata[variable] == undefined) {
        //document.getElementById("selection_sidebar_" + variable).style.cssText = variable_selected_class;
        create_new_variable(variable);
    }
    else {
        delete_variable(variable);
    }
    //document.getElementById("live-search-box").value = "";
    //$('.live-search-list li').each(function() {
    //    $(this).show();
    //});
};





// Updates varlist_active, varlist_inactive, and creates bubble
function create_new_variable (variable) {
    var variable_index = varlist_inactive.indexOf(variable);
    varlist_inactive.splice(variable_index, 1);
    varlist_active.push(variable);
    inputted_metadata[variable] = array_default();
    $("#bubble_form").append(make_bubble(variable));
};


// Remove variable
function delete_variable (variable) {
    //document.getElementById("selection_sidebar_" + variable).style.cssText = variable_unselected_class;
    var variable_index = varlist_active.indexOf(variable);
    varlist_active.splice(variable_index, 1);
    varlist_inactive.push(variable);
    delete inputted_metadata[variable.replace(/\s/g, '_')];
    document.getElementById(variable.replace(/\s/g, '_')).remove();
    generate_epsilon_table();
};