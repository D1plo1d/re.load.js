/**
 * re.load.js by Rob Gilson (D1plo1d)
 *
 * API:
 *	re.authorize(string key) -> loads the google jsapi with the given google api 
 			key
 *	re.ready(function f) -> on load callback to f
 *	re.load(String moduleName, String moduleVersion, Map optionalSettings)
 *	-> see google.load, a null moduleVersion and optionSettings specifies a url 
 *	   to dynamic load.
 *
 * DO NOT PANIC. EVERYWHERE IS SIMPLE.
 */

var re = new Object();

//var jQuery = null;
var google = null;

/** JQuery-imitating on load callbacks*/
re.ready = function(ref)
{

	if (typeof jQuery==='function')
	{
		jQuery(ref);
	}
	else
	{
		re._on_load_callbacks.push(ref);
	}

};

/* temporarily mimics Jquery on load callbacks until Jquery is loaded */
var $ = re.onLoad;

re._modules = [];
re._google_modules = [];
re._on_load_callbacks = [];
re._loaded = false;
re._loaded_modules = 0;

/** loads the google jsapi using the given google api key */
re.authorize = function(key)
{
	re._windowonload = window.onload;
//	window.onload = function()
//	{
//		re._load_url("http://www.google.com/jsapi?callback=re__setup_google_callback&key="+key, true);
		re._load_url("http://www.google.com/jsapi?key="+key, true);
		//if (!(!re._windowonload)) re._windowonload();
//	}
}


/** functional equivalent to google.load + loading of non-google hosted js urls */
re.load = function(moduleName, moduleVersion, optionalSettings)
{
	//hacks
	if (moduleName=="jquery")
	{
		re.load("http://ajax.googleapis.com/ajax/libs/jquery/"+(moduleVersion||"latest")+"/jquery.min.js");
	}
	else if (moduleName=="jqueryui")
	{
		re.load("http://ajax.googleapis.com/ajax/libs/jqueryui/"+(moduleVersion||"latest")+"/jquery-ui.js");
	}
	//not hacks
	else if (moduleName != null && !moduleVersion && !optionalSettings)
	{
		re._load_url(moduleName);
	}
	else
	{
		if (re._loaded == true)
		{
			google.load(moduleName, moduleVersion, optionalSettings);
		}
		else
		{
			re._google_modules.push([moduleName, moduleVersion, optionalSettings]);
		}
	}

}


/** Private method for loading js files from their url either now or once 
    JQuery has loaded (if this is not already the case)
    isGoogle: true if the url is the google jsapi itself*/
re._load_url = function(url, isGoogle)
{

	if (!isGoogle)
	{
		re._modules.push(url);
		if (re._loaded != true) return;
	}

//	alert(url);
	var script = document.createElement('script');
	script.src = url;
	script.type = 'text/javascript';

	if (!isGoogle)
	{
		script.onload = function()
		{
			re._modules.pop();
			re._loaded_modules += 1;
			re._send_on_load();

		}
	}

	document.getElementsByTagName("head")[0].appendChild(script);

	if (isGoogle == true) re._setup_google_callback();
}

/** Private method for the logic to figure out when to send the on load callbacks */
re._send_on_load = function()
{
//	alert("left:"+re._modules.length +":"+ re._loaded_modules);
	if (re._modules.length - re._loaded_modules > 0 || 	!(typeof jQuery==='function')) return

//	alert("jquery:"+(typeof jQuery==='function'));
	for (i in re._on_load_callbacks)
	{
		re._on_load_callbacks[i]();
	}
}


re._setup_google_callback = function()
{

	if (!google)
	{
		setTimeout(re._setup_google_callback, 100);
		return;
	}

	var onload = function() {

			re._loaded = true;
			//if there are no modules to load otherwise sent after last module is loaded
			re._send_on_load();
			var size = re._modules.length;

			for (var i = 0; i < size; i++)
			{
//alert("length"+size+" "+re._modules[i]);
				re._load_url(re._modules[i]);
			}

	};

	if (re._google_modules.length > 0)
	{
		google.setOnLoadCallback(onload);

		for (var i = 0; i < re._google_modules.length-1; i++)
		{
			var m = re._google_modules[i];
//			alert("A");
			m[2] = (m[2]||{});
			m[2]["callback"] = "function(){"+( (m[2]["callback"]+";")||"" )+"}";
			google.load(m[0], m[1], m[2]);
		}
	}
	else
	{
//		alert("aaaa");
		onload();
	}

};

var re__setup_google_callback = re._setup_google_callback;

if (!(!google)) re._setup_google_callback();
