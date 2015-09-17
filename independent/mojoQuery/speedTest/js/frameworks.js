/**
 * test frameworks
 */
var oldIE = window.ActiveXObject && !document.addEventListener,
    jquery_name = oldIE ? "jquery-1.11.3" : "jquery-2.1.4";

window.frameworks = [
//[iframe name, file name, css query method]

["native", "native", "document.querySelectorAll"],

["mojoQuery", "../mojoQuery.js", "mojoQuery"],

[jquery_name, "https://code.jquery.com/" + jquery_name + ".js", "$.find"],

["sizzle-1.10.19", "http://apps.bdimg.com/libs/sizzle/1.10.19/sizzle.min.js", "Sizzle"],

["Ext-core-3.1.0", "http://apps.bdimg.com/libs/ext-core/3.1.0/ext-core.js", "Ext.query"],

["MooTools-1.4.5", "http://apps.bdimg.com/libs/mootools/1.4.5/mootools-yui-compressed.js", "$$"],

["dojo-1.8.3", "http://apps.bdimg.com/libs/dojo/1.8.3/dojo.js", "dojo.query"]

];

if (!("querySelectorAll" in document)) frameworks = frameworks.slice(1);