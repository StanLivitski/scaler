/*!************************************************************************
   Scaler - a Javascript library for responsive layout of sites and
            web apps consistent across devices
   Copyright © 2017 Stan Livitski

   Licensed under the Apache License, Version 2.0 with modifications,
   (the "License"); you may not use this file except in compliance
   with the License. You may obtain a copy of the License at

    https://raw.githubusercontent.com/StanLivitski/scaler/master/LICENSE

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

var scaler = function()
{
	// Save the old value of this handler in case it needs to be restored. 
	var _old_scaler = scaler;

	// Capture the current jQuery reference and use it throughout the code. 
	var $ = jQuery;

	var api = 
	{

		// Class name of HTML elements that scaler will operate on.
		SCALER_CLASS_NAME: 'scaler',	

		// Additional prefix of the scaler's data attributes.
		SCALER_DATA_PREFIX: 'sc',

		// Prefix of the scaler's function cache items.
		SCALER_CACHE_PREFIX: 'scFP',

		// A table of style properties recognized by scaler.
		// The keys in this table are camel-cased CSS property
		// names, and its values are either:
		// 
		//  - handler functions that run in the context of
		//  an HTML element being styled and receive
		//  (property, value, params, context) arguments,
		//  where `property` is a camel-cased CSS property name
		//  `value` is the data attribute value given to that
		//  property by the styled HTML element, `params` is
		//  an empty array, and `context` is the object returned
		//  by `prepareContext` function; or
		//  
		//  - arrays with such handler function followed
		//  by the parameters that will be passed to it as
		//  the `params` argument.
		STYLES: {
			'width': defaultHandler,
			'height': defaultHandler,
			'left': defaultHandler,
			'top': defaultHandler,
			'right': defaultHandler,
			'bottom': defaultHandler,
			'marginTop': defaultHandler,
			'marginLeft': defaultHandler,
			'marginBottom': defaultHandler,
			'marginRight': defaultHandler,
			'margin': defaultHandler,
			'paddingTop': defaultHandler,
			'paddingLeft': defaultHandler,
			'paddingBottom': defaultHandler,
			'paddingRight': defaultHandler,
			'padding': defaultHandler,
			'fontSize': defaultHandler,
		},

		// This function gets called when the page's DOM is fully
		// loaded and each time the browser window is resized. 
		// It should compute common variables needed for styling
		// various elements and store them in the `context` object.
		// The `$` argument will contain the scaler's jQuery reference.
		prepareContext: function(context, $)
		{
			$window = $(window);
			context.windowWidth = $window.width();
			context.windowHeight = $window.height();
		},

		// The default implementation of a CSS property handler.
		// Assuming that the scaler data value for the property
		// is a JavaScript expression, it evaluates that expression
		// in the context of the `context` argument and logs
		// any errors that might occur. The result is then treated
		// depending on the `params` argument, which is expected to
		// be an array.
		// If `params[2]` is a function, this handler calls it with
		// the current HTML element as `this`, and the intermediate
		// result and `context` as arguments, and assigns the result
		// to a CSS property. Otherwise the assigned value is obtained
		// by appending a suffix to an intermediate finite numeric
		// result, or, if that result is an array, to each of
		// its finite numeric elements, and concatenating all
		// elements thus converted using space as the separator. The
		// suffix is equal to `params[0]`, or "px" if `params[0]` is
		// undefined or null.
		// If `params[1]` is defined, it is then used as CSS property
		// key. Otherwise, the key is derived from the `property`
		// argument. The handler assigns a CSS property with the above
		// key and value to the current HTML element.
		// That assignment is made using jQuery. Note that jQuery may
		// append its own suffix to a CSS value if a suffix is required
		// and missing. 
		defaultHandler: defaultHandler,

		// Call this function to change values of Scaler attributes
		// on specific page element(s), or after changing such values
		// with jQuery.data(). It can also add Scaler attributes to
		// DOM elements of class "scaler". Scaler will recompute the
		// Javascript expressions and re-apply styles to selected
		// elements before this function returns.
		//  
		// `elements` takes a DOM element, an array of DOM elements,
		// a jQuery object that wraps DOM elements, or a jQuery selector
		// expression to look up DOM elements that will have new
		// Scaler's attributes applied to them.
		//  
		// `attrs` should be an object with camel-cased CSS property
		// names (DOM format) mapped to new Scaler attribute values.
		//  
		// This function does not return a value.
		update: function(elements, attrs)
		{
			if (!(elements instanceof $))
				elements = $(elements);
			var prefix = api.SCALER_DATA_PREFIX;
			var unprefix = api.SCALER_CACHE_PREFIX;
			if (attrs instanceof Object)
				for (var key in attrs)
				{
					var cssKey = key[0].toLowerCase() + key.slice(1);
					var params = propertyHandler(cssKey).slice(1);
					if (undefined != params[1]) cssKey = params[1];
					elements.css(cssKey, '');
					elements.removeData(unprefix + key);
					var value = attrs[key];
					key = key[0].toUpperCase() + key.slice(1);
					if (undefined === value)
						elements.removeData(prefix + key);
					else
						elements.data(prefix + key, value);
				}
			else
				elements.each(function() {
					var data = $(this).data();
					for (var key in data)
						if (key.slice(0, unprefix.length) == unprefix)
							$(this).removeData(key);
				});
			var context = {};
			api.prepareContext(context, $);
			elements.each(function() { updateCSS(this, context) });
		}
	};
	function propertyHandler(key)
	{
		var handler = [];
		var params = api.STYLES[key];
		if (params === undefined)
		{
			if (console !== undefined && 'warn' in console)
				console.warn('Unknown scaler property: ' + key);
		}
		else if (params instanceof Array)
			handler = params;
		else
			handler[0] = params;
		return handler;
	}
	function updateCSS(domElement, context)
	{
		var prefix = api.SCALER_DATA_PREFIX;
		var unprefix = api.SCALER_CACHE_PREFIX;
		var data = $(domElement).data();
		for (var key in data)
			if (key.length > prefix.length
			&& key.slice(0, prefix.length) == prefix
			&& key.slice(0, unprefix.length) != unprefix)
			{
				var value = data[key];
				key = key[prefix.length].toLowerCase() +
					key.slice(prefix.length + 1);
				var handler = propertyHandler(key);
				if (handler[0] instanceof Function)
					handler[0].call(domElement, key, value, handler.slice(1), context);
			}
	}
	function onResize()
	{
		var context = {};
		api.prepareContext(context, $);
		var elements = $('.' + api.SCALER_CLASS_NAME);
		elements.each(function() { updateCSS(this, context) });
	}
	function defaultHandler(property, value, params, context)
	{
		var element = $(this);
		var cacheKey = api.SCALER_CACHE_PREFIX + property;
		var cached = element.data(cacheKey);
		if (undefined === cached)
		{
			cached = Function(
				'context',
				'with (context) return (' + value + ');'
			);
			element.data(cacheKey, cached);
		}
		var result;
		try {
			result = cached.call(this, context);
		}
		catch (error) {
			if (console !== undefined && 'error' in console)
				console.error(
					'Evaluation failed for scaler property "' + property
					+ '" = "' + value + '" caused by '
					+ ('message' in error ?	error.message : error)
					+ ('outerHTML' in this ? ' in '
						+ this.outerHTML.split('>',1)[0] + '>' : ''));
		}
		var suffix = params[0] !== undefined ? params[0] : 'px';
		var converter = params[2];
		if (converter instanceof Function)
			result = converter.call(this, result, context);
		else if (result instanceof Array)
		{
			if (0 == result.length)
				result = '0';
			else
			{
				var resultStr = '';
				for (var i = 0;;)
				{
					var item = result[i];
					resultStr += '' == item ? '0' : String(item);
					if (Number(item) === item && isFinite(item))
						resultStr += suffix;
					if (++i < result.length)
						resultStr += ' ';
					else
						break;
				}
				result = resultStr;
			}
		}
		else if (Number(item) === item && isFinite(item))
			result += String(suffix);
		var cssKey = undefined == params[1] ? property : params[1];
		element.css(cssKey, result);
	}
	$(function()
	{
		$(window).resize(onResize);
		onResize();
		$('.' + api.SCALER_CLASS_NAME).toggleClass('scaler-done', true);
	});
	return api;
}();