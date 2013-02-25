/**
 * Client-side wysiwyg html editor (richtextarea) with standard textarea
 * fallback.
 *
 * Version 3.1
 *
 * Based on technologies from Kevin Roths Cross-Browser Rich Text Editor (found
 * at http://www.kevinroth.com/rte/demo.htm).
 */

/*

//for (var a in e) alert(a + ":\n" + e[a]);

*/

var VIEW_SOURCE = 0;
var VIEW_PREVIEW = 1;

var BUTTON_SEPERATOR = 0;
var BUTTON_PUSH = 1;
var BUTTON_TOGGLE = 2;
var BUTTON_PULLDOWN = 3;
var BUTTON_FEEDBACK = 4;

var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_TEXT = 3;
var NODE_TYPE_COMMENT = 8;

/**
 *
 */
function RichTextarea(includePath, inheritCSS, debugMode)
{
	// get and define the parameters passed.
	this.m_includePath = includePath + 'includes/';

	// turn on the debug mode if we should.
	if (typeof(debugMode) == 'undefined') this.m_debugMode = false;
	else this.m_debugMode = debugMode;

	// figure out what user agent (browser) is being used so we can use it
	// later to confirm if it's got what it takes and also handle browser
	// specific features or limitations.
	var agent = navigator.userAgent.toLowerCase();
	this.m_isIE = ((agent.indexOf("msie") != -1) && (agent.indexOf("opera") == -1) && (agent.indexOf("webtv") == -1));
	this.m_isGecko = (agent.indexOf("gecko") != -1);
	this.m_isSafari = (agent.indexOf("safari") != -1);
	this.m_isKonqueror = (agent.indexOf("konqueror") != -1);

	// m_doc is used throughout as a reference to the document containing the 'content' or regions
	// each instance must have all regions in one document, they can't span over more than one
	this.m_doc = window.document;

	// enable tracking of each instance of RichTextarea.
	this.m_id = 'richtextarea' + (RichTextarea.idSeed++);
	RichTextarea.instances[this.m_id] = this;

	// load the configuration in such a way that it can be customized.
	RichTextarea_loadCfg(this);

	// m_isContentEditable is set from the first call to _writeToolbar() and
	// _writeRegion().
	this.m_isContentEditable = (this.m_doc.getElementById && this.m_doc.designMode && !this.m_isSafari && !this.m_isKonqueror) ? true : false;

	// m_toolbarCount stores the number of toolbars in this instance, and is added to with each
	// call to _writeToolbar()
	this.m_toolbarCount = 0;

	// this stores the toolbar that most recently was used
	this.m_toolbar = 0;

	// m_regions contains all the regions in this instance
	this.m_regions = new Object();
	this.m_regionCount = 0;

	// m_region is set after the first call to _writeRegion() and stores the currently active
	// region
	this.m_region = '';

	// m_stylesheet is set after the first call to _setupDocument()
	this.m_styleSheet = '';

	// write the style sheet include tag (for the toolbar and editable
	// regions).
	this.m_doc.write('<link rel="STYLESHEET" type="text/css" href="' + includePath + 'richtextarea.css">');

	// get the css rules for all the included style sheets from the containing
	// document.
	if (inheritCSS) this.m_styleSheet = this._getStyleSheetRules(this.m_doc);

	//
	this.rng = null;
}


/**
 * Creates a toolbar as well as an editable region together, which can be
 * better than calling them seperatly because the toolbar will get the proper
 * association with the editable region.  You should use this function if you
 * plan to have more than one toolbar and region on the page.
 *
 * idName is the name of the form element you want to use (it's also used to
 *   generate the id).
 * fullMode allows you to specify between which toolbar mode to use -- which
 *   can be setup in RichTextarea_loadCfg().
 * content is the content to be loaded into the region.
 * height is the height of the region, not including the toolbar (defaults to
 *   120px if null or undefined).
 * cssIncludes should be an array containing any number of css files, however
 *   remote css's can't be loaded in firefox/gecko.
 */
function _writeRichTextarea(idName, mode, content, height, inheritCSS, baseUrl)
{
	// write the div that will contain the entire area.
	this.m_doc.writeln('<div id="rta_area">');

	// make the toolbar and region together.
	if (mode !== false) this.writeToolbar(mode, idName);
	this.writeRegion(idName, content, height, inheritCSS, baseUrl);

	// close the div that contains the entire area.
	this.m_doc.writeln('</div>');
}


/**
 * Creates the toolbar which can be placed anywhere on the page or alternately
 * in a frame.
 *
 * mode (int) allows you to specify between different toolbar modes which can
 *   be setup in RichTextarea_loadCfg().
 * idName (optional) can be passed where one region is used, and you want the
 *   region to get focus when the toolbar is clicked.
 */
function _writeToolbar(mode, idName, extraControls)
{
	// if the user agent (browser) is able to handle editing then display the
	// toolbar.
	if (this.m_isContentEditable)
	{
		var onClick = '';
		if (typeof(idName) != 'undefined' && idName != '') onClick = 'RichTextarea.getInstance(\'' + this.m_id + '\')._onFocus(null, \'rta_' + idName + this.m_id + '\');';

		// write the button toolbar.
		if (mode >= 0)
		{
			this.m_doc.writeln('<div id="rta_toolbar">');
			for (var i = 0; i < this.m_buttons.length; i++)
			{
				var button = this.m_buttons[i];

				var but = '';
				
				if (button.length == 2) but = '<img class="rta_sep" src="' + this.m_includePath + 'images/seperator.gif" width="1">';
				else
				{
					but = '<img class="rta_button" id="rta_button_' + button[1] + this.m_id + this.m_toolbarCount + '" " src="' + this.m_includePath + 'images/' + button[1] + '.gif" alt="' + button[2] + '" title="' + button[2] + '" ' +
					'onClick="' + onClick + 'RichTextarea.getInstance(\'' + this.m_id + '\').m_toolbar = ' + this.m_toolbarCount + ';RichTextarea.getInstance(\'' + this.m_id + '\').' + button[3] + ';' +
					((button[4] == BUTTON_TOGGLE) ? ' this.className = (this.className != \'rta_button_toggle\') ? \'rta_button_toggle\' : \'rta_button\';"' : '"') +
					((button[4] == BUTTON_PULLDOWN) ? ' style="width:27px"' : '') + '>';
				}

				if (button[0] <= mode && button[0] != -1) this.m_doc.write(but);
			}
			this.m_doc.writeln('</div>');

			// write the palette dialogs, which will be hidden until the
			// correct button is pressed.
			for (var i = 0; i < this.m_palettes.length; i++)
			{
				var palette = this.m_palettes[i];
				this.m_doc.writeln('<iframe frameborder="0" id="rta_palette_' + palette[0] + this.m_id + this.m_toolbarCount + '" width="' + palette[2] + '" height="' + palette[3] + '" src="' + this.m_includePath + 'dialogs/' + palette[1] + '" scrolling="no" marginwidth="0" marginheight="0" style="visibility:hidden;margin:0;border:0;position:absolute;border:1px solid #cdcdcd;"></iframe>');
			}
		}

		// write the debug div tag
		if (this.m_debugMode) this.m_doc.writeln('<div id="rta_debug_div" style="border:1px dotted red">debug:</div>');

		// add to the number of toolbars in this instance
		this.m_toolbarCount++;
	}

	if (mode < 0) return;

	// handle ie and gecko specific mouse events
	if (this.m_isIE)
	{
		this.m_doc.onmouseover = this._buttonOver;
		this.m_doc.onmouseout  = this._buttonOut;
		this.m_doc.onmouseup   = this._buttonOver;
		this.m_doc.onmousedown = this._buttonDown;
		this.m_doc.attachEvent('onmouseup', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._interfaceHandler(e);"));
	}
	else
	{
		this.m_doc.addEventListener('mouseup', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._interfaceHandler(e, null, " + this.m_toolbarCount + ");"), true);
	}

	// set the onbeforeunload event so we can check for changes
	if (mode == 2) window.onbeforeunload = rta_onBeforeUnload;
}


/**
 * Defines an area of the page that's content editable.
 */
function _writeRegion(idName, content, height, inheritCSS, baseUrl)
{
	toolBar = this.m_toolbarCount - 1;

	// set the default height.
	if (!height) height = '130px';

	// write the iframe and make it editable, or fall back to a textarea if
	// that's all we can do.
	if (this.m_isContentEditable)
	{
		this.m_doc.writeln('<iframe id="rta_' + idName + this.m_id + '" name="rta_' + idName + '" frameborder="0" class="rta_editable_region" style="width:100%;height:' + height + ';" src="about:blank" marginwidth="0" marginheight="0"></iframe>');
		this._enableDesignMode(idName, content, toolBar, baseUrl);
	}
	else
	{
		this.m_doc.writeln('<div><textarea name="rta_' + idName + this.m_id + '" id="rta_' + idName + this.m_id + '" style="width:100%;height:' + height + ';">' + content + '</textarea></div>');
	}

	// update the form's onsubmit, so we can save our stuff
	//this._updateFormOnSubmit(idName);

	// set the first region created to be the active one
	if (this.m_regionCount == 0) this.m_region = idName + this.m_id;

	// make the hidden field for form submission and the preview area
	this.m_doc.writeln('<textarea name="' + idName + '" id="rta_' + idName + this.m_id + '_hidden" style="display:none"></textarea>');
	this.m_doc.writeln('<div name="' + idName + '" id="rta_' + idName + this.m_id + '_preview" style="display:none"></div>');

	// add the region to the list of regions in this instance
	// array structure: source view, preview mode, [more to come]
	if (this.m_regionCount == 0) this.m_region = 'rta_' + idName + this.m_id;
	this.m_regions[idName + this.m_id] = new Array(false, false);
	this.m_regionCount++;
}


/**
 * Handles all the button and pulldown commands.
 */
function _handleCommand(cmd, option, button)
{
	if (typeof(option) == 'undefined') option = '';

	switch (cmd)
	{
		case 'commandsave':
			this.m_hasChanges = false;

			// create a new form element
			var body = this.m_doc.body;
			var form = body.appendChild(this.m_doc.createElement('FORM'));
			form.method = 'POST';
			form.action = window.location.href;

			// add a default field to the form so we'll know server side what's going on
			var field = this.m_doc.createElement('INPUT');
			field.name = 'rta_submitted';
			field.value = 'realsubmit';
			field.type = 'hidden';
			form.appendChild(field);

			// go through each region, update the hidden field, and make a textarea in the form
			for (var r in this.m_regions)
			{
				this.updateField(r);

				// add the textarea to the form we just created
				var textarea = this.m_doc.createElement('TEXTAREA');
				textarea.name = r.replace(this.m_id, "");
				textarea.value = this.m_doc.getElementById('rta_' + r + '_hidden').value;
				textarea.style.display = 'none';
				form.appendChild(textarea);
			}

			// submit the form
			form.submit();
			break;

		case 'commandpreview':
			// loop through each region, update the hidden field, hide the editable area, and
			// show the real html
			for (var r in this.m_regions)
			{
				if (this.m_regions[r][VIEW_PREVIEW])
				{
					// hide the preview
					var preview = this.m_doc.getElementById('rta_' + r + '_preview');
					preview.innerHTML = '';
					preview.style.display = 'none';

					// display the editable region
					this.m_doc.getElementById('rta_' + r).style.display = 'block';

					this.m_regions[r][VIEW_PREVIEW] = false;
				}
				else
				{
					this.updateField(r);

					// hide the editable region
					this.m_doc.getElementById('rta_' + r).style.display = 'none';

					// fill the preview and display it
					var preview = this.m_doc.getElementById('rta_' + r + '_preview');
					preview.innerHTML = this.m_doc.getElementById('rta_' + r + '_hidden').value;
					preview.style.display = 'block';

					this.m_regions[r][VIEW_PREVIEW] = true;
				}
			}
			break;

		case 'actionclass':
			if (typeof(option) != 'string')
			{
				this.getSelectedText(this.m_region);
				this._dialogPalette('class' + this.m_id + this.m_toolbar, option);
			}
			else
			{
				if (document.all && this.rng)
				{
					//retrieve selected range
					var sel = frames[this.m_region].document.selection; 
					if (sel != null)
					{
						var newRng = sel.createRange();
						newRng = this.rng;
						newRng.select();
					}
				}

				this.handleCommand('insertHTML', '<span class="' + option + '">' + this.getSelectedText(this.m_region) + '</span>');
				//this.handleCommand('insertspan', option);

 				this._dialogPalette('class' + this.m_id + this.m_toolbar, button, true);
			}
			break;

		case 'actionbackcolor':
			if (typeof(option) != 'string')
			{
				this.getSelectedText(this.m_region);
				this._dialogPalette('backcolor' + this.m_id + this.m_toolbar, option);
			}
			else
			{
				if (document.all && this.rng)
				{
					//retrieve selected range
					var sel = frames[this.m_region].document.selection; 
					if (sel != null)
					{
						var newRng = sel.createRange();
						newRng = this.rng;
						newRng.select();
					}
				}
				
				if (this.m_doc.all)
	 				this.handleCommand('backcolor', option);
				else
	 				this.handleCommand('insertHTML', '<span style="background-color:' + option + '">' + this.getSelectedText(this.m_region) + '</span>');

 				this._dialogPalette('backcolor' + this.m_id + this.m_toolbar, button, true);
			}
			break;

		case 'actionforecolor':
			if (typeof(option) != 'string')
			{
				this.getSelectedText(this.m_region);
				this._dialogPalette('forecolor' + this.m_id + this.m_toolbar, option);
			}
			else
			{
				if (document.all && this.rng)
				{
					//retrieve selected range
					var sel = frames[this.m_region].document.selection; 
					if (sel != null)
					{
						var newRng = sel.createRange();
						newRng = this.rng;
						newRng.select();
					}
				}

 				this.handleCommand('forecolor', option);

				this._dialogPalette('forecolor' + this.m_id + this.m_toolbar, button, true);
			}
			break;

		case 'commandeditnode': // allows editing a nodes attributes (as well as moving upwards in the dom to edit parent node attributes)
			if (!option) this._dialogPopup(this.m_includePath + 'dialogs/commandeditnode.php?rta_id=' + this.m_id + '&rta_region=' + this.m_region, cmd, 580, 334);
			break;

		case 'insertlink': // inserts an anchor tag
			if (!option) this._dialogPopup(this.m_includePath + 'dialogs/insertlink.php?rta_id=' + this.m_id + '&rta_region=' + this.m_region, cmd, 542, 373);
			else this.handleCommand('insertHTML', option);
			break;

		case 'inserttable': // inserts an table
			if (!option) this._dialogPopup(this.m_includePath + 'dialogs/inserttable.php?rta_id=' + this.m_id + '&rta_region=' + this.m_region, cmd, 542, 350);
			else this.handleCommand('insertHTML', option);
			break;

		case 'insertimage': // inserts an image
			if (!option) this._dialogPopup(this.m_includePath + 'dialogs/insertimage.php?rta_id=' + this.m_id + '&rta_region=' + this.m_region, cmd, 470, 240);
			else this.handleCommand('insertHTML', option);
			break;

		case 'insertentity': // inserts an html entity
			if (!option) this._dialogPopup(this.m_includePath + 'dialogs/insertentity.php?rta_id=' + this.m_id + '&rta_region=' + this.m_region, cmd, 395, 446);
			else this.handleCommand('insertHTML', option);
			break;

		case 'insertcomponent': // inserts a component (weblisher)
			if (!option) this._dialogPopup(this.m_includePath + 'dialogs/insertcomponent.php?rta_id=' + this.m_id + '&rta_region=' + this.m_region, cmd, 420, 133);
			else this.handleCommand('insertHTML', option);
			break;

		case 'insertspan': // inserts a span tag with a given class
			var newNode = this.m_doc.createElement('span');
			newNode.setAttribute('class', option);
			this.handleCommand('wrapInNode', newNode);
			break;

		case 'actionclean': // removes any formating for the selected text
			html = this.getSelectedText(this.m_region);
			if (html) this.handleCommand('insertHTML', html);
			break;

		case 'actionsource': // switches between design view and source view
			var h = this.m_doc.getElementById(this.m_region + '_hidden');
			var r = this.m_region.replace("rta_", "");

			if (this.m_regions[r][VIEW_SOURCE])
			{
				// switch to design view
				if (this.m_doc.all)
				{
					var f = this.m_doc.frames[this.m_region].document.body;
					var output = escape(f.innerText);
					output = output.replace("%3CP%3E%0D%0A%3CHR%3E", "%3CHR%3E");
					output = output.replace("%3CHR%3E%0D%0A%3C/P%3E", "%3CHR%3E");
					f.innerHTML = unescape(output);
				}
				else
				{
					var f = this.m_doc.getElementById(this.m_region).contentWindow.document;
					var htmlSrc = f.body.ownerDocument.createRange();
					htmlSrc.selectNodeContents(f.body);
					f.body.innerHTML = htmlSrc.toString();
				}

				this.m_regions[r][VIEW_SOURCE] = false;
				//this.toggleToolbar(true);
			}
			else
			{
				// switch to source view
				var html = null;
				if (this.m_doc.all) html = this.m_doc.frames[this.m_region].document.body.innerHTML;
				else html = this.m_doc.getElementById(this.m_region).contentWindow.document.body.innerHTML;

				h.value = html;

				if (this.m_doc.all) this.m_doc.frames[this.m_region].document.body.innerText = h.value;
				else
				{
					var f = this.m_doc.getElementById(this.m_region).contentWindow.document;
					var htmlSrc = f.createTextNode(h.value);
					f.body.innerHTML = '';
					f.body.appendChild(htmlSrc);
				}

				this.m_regions[r][VIEW_SOURCE] = true;
				//this.toggleToolbar(false);
			}
			break;

		case 'insertHTML': // handles all special html inserts
			var f;
			if (this.m_doc.all) f = this.m_doc.frames[this.m_region];
			else f = this.m_doc.getElementById(this.m_region).contentWindow;

			f.focus();
			if (this.m_doc.all)
			{
				var of = f.document.selection.createRange();
				of.pasteHTML(option);
				of.collapse(false);
				of.select();
			}
			else
			{
				 if (option) f.document.execCommand('insertHTML', false, option);
			}
			break;

		case 'wrapInNode': // handles wrapping the selected nodes in a new node
			if (option)
			{
				f = this.m_doc.getElementById(this.m_region).contentWindow;
				var selection = f.getSelection();
				if (selection != null)
				{
					var selRange = selection.getRangeAt(0);

					selRange.surroundContents(option);
					selection.collapseToStart();
				}
			}
			break;

		case 'debug': // is here for debugging purposes

			body = this.m_doc.getElementById(this.m_region).contentWindow.document.body;
			body.innerHTML = this._sanitizeNode(body);

			break;

		default: // handles all the standard commands not defined above
			var f;
			if (this.m_doc.all) f = this.m_doc.frames[this.m_region];
			else f = this.m_doc.getElementById(this.m_region).contentWindow;
			try
			{
				f.focus();
				f.document.execCommand(cmd, false, option);
				f.focus();
			}
			catch (e)
			{
				//alert(e);
			}
	}
}


/**
 * Opens dialogs for inserting hyperlinks etc.
 */
function _dialogPopup(url, win, width, height, options)
{
	if (typeof(options) == 'undefined') options = 'location=0,status=0,scrollbars=no,';

	var left = (screen.availWidth - width) / 2;
	var top = (screen.availHeight - height) / 2;

	options += 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;

	return window.open(url, win, options);
}


/**
 * Returns the selected text in the editable region.
 */
function _getSelectedText(region)
{
	var f;
	if (this.m_doc.all)
	{
		f = frames[region];
		var selection = f.document.selection; 
		if (selection != null)
		{
			this.rng = selection.createRange();
		}
	}
	else
	{
		f = document.getElementById(region).contentWindow;
		var selection = f.getSelection();
		this.rng = selection.getRangeAt(selection.rangeCount - 1).cloneRange();
	}
	
	return selection;
}


/**
 * Returns the selected node and handles if the selected node is an image, or other
 * special element.
 */
function _getSelectedNode(region)
{
	var ret = null;

	f = this.m_doc.getElementById(region).contentWindow;
	var selection = f.getSelection();

	if (selection != null)
	{
		if (selection.isCollapsed || selection.anchorNode == selection.focusNode)
		{
			// if the selection is just the carat, or if the start and end are the same node
			ret = selection.anchorNode;

			// figure out if it's a special element (image or something else)
			if (!selection.isCollapsed && selection.anchorNode == selection.focusNode && selection.anchorNode.nodeName != '#text')
				ret = selection.anchorNode.childNodes[selection.getRangeAt(0).startOffset];
		}
		else if (selection.anchorNode.parentNode == selection.focusNode.parentNode)
		{
			// if the start and end of the selection are in the same parent node
			ret = selection.anchorNode.parentNode;
		}
		else
		{
			// move up in the dom to find a common parent node and that's what we'll want
			//!!
			//alert(selection.anchorNode.parentNode + ":" + selection.focusNode.parentNode + ":bad");
		}

		// if the node is a text node we always want the parent of it
		if (ret != null) while (ret != null && (ret.nodeName.toLowerCase() == '#text' || ret.nodeName.toLowerCase() == 'br') && ret.parentNode != null) ret = ret.parentNode;
	}

	if (ret != null && ret.nodeName.toLowerCase() != 'body') return ret;
	else return false;
}


/**
 * Updates the hidden field for an editable region.
 */
function _updateField(region)
{
	// if source view, switch back to design view
	if (this.m_regions[region][0]) this.handleCommand('toggleHTML', region);

	var hf = this.m_doc.getElementById('rta_' + region + '_hidden');
	if (hf.value == null) hf.value = '';

	body = this.m_doc.getElementById('rta_' + region).contentWindow.document.body;
	body.innerHTML = this._sanitizeNode(body);

	var html;
	if (this.m_doc.all) html = this.m_doc.frames['rta_' + region].document.body.innerHTML;
	else html = this.m_doc.getElementById('rta_' + region).contentWindow.document.body.innerHTML;

	//h.value = get_xhtml(this.m_doc.getElementById('dm_' + region).contentWindow.document.body, lang, encoding);
	hf.value = html;
}


/**
 * Walk up the DOM until a form tag is found -- when it is, we assume it's the
 * form that contains the editable region, and we update the onsubmit function
 * to rta_submitWithRichTextareas().
 */
function _updateFormOnSubmit(idName)
{
	var el = this.m_doc.getElementById('rta_' + idName + this.m_id);
	if (el == null)
	{
		setTimeout("RichTextarea.getInstance('" + this.m_id + "')._updateFormOnSubmit('" + idName + "');", 10);
		return;
	}

	// walk up the DOM until we find the form that we're in so we can handle when we're submitted
	while (el.parentNode)
	{
		if (el.tagName == 'FORM')
		{
			var os = el.onsubmit;
			if (typeof(os) == 'undefined') el.onsubmit = function onsubmit(event) { return rta_submitWithRichTextareas() };

			break;
		}
		else el = el.parentNode
	}
}


/**
 * Turns on design mode for the editable areas.
 */
function _enableDesignMode(idName, content, toolBar, baseUrl)
{
	var extraStyle = 'TABLE, TD { border: 1px dotted red; }';

	if (this.m_isIE)
	{
		// get the editable region, and it's parent node (if it's in a div, or td etc)
		var f = this.m_doc.getElementById('rta_' + idName + this.m_id);
		var p = f.parentNode;

		// make the content for the iframe by first getting the calculated styles of it's parent node
		inheritedStyles = this._getComputedStyles(p, this.m_desiredStyles);
		var inheritedStyle = '';
		for (var style in inheritedStyles) inheritedStyle += style + ':' + inheritedStyles[style].replace(/"/g, "'") + ';\n';

		// create the html for the region based on the everything we know already
		var frameHtml = '<html id="rta_frame_' + idName + this.m_id + '">' +
			'<head>' + ((baseUrl) ? '<BASE HREF="' + baseUrl + '">' : '') + '<style>' + this.m_styleSheet + extraStyle + '</style></head>' +
			'<body style="' + inheritedStyle + 'margin:0px;padding:0px;">' + content + '</body>' +
			'</html>';

		// put the html into the iframe, and turn designmode on
		var f = this.m_doc.frames['rta_' + idName + this.m_id];
		f.document.open();
		f.document.write(frameHtml);
		f.document.close();
		f.document.designMode = 'On';

		// attach a handler to enable keyboard shortcuts and focus
		f.attachEvent('onfocus', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._onFocus(e, 'rta_" + idName + this.m_id + "', " + toolBar + ");"), true);
		f.attachEvent('onblur', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._onBlur(e, '" + idName + this.m_id + "', " + toolBar + ");"), true);
		f.document.attachEvent('onkeypress', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._keyPress(e, 'rta_" + idName + this.m_id + "');"));
		f.document.attachEvent('onmouseup', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._interfaceHandler(e, 'rta_" + idName + this.m_id + "', " + toolBar + ");"));
	}
	else
	{
		var f = this.m_doc.getElementById('rta_' + idName + this.m_id);
		try
		{
			// turn the designmode on
			f.contentDocument.designMode = 'on';
			try
			{
				var p = f.parentNode;

				// make the content for the iframe by first getting the calculated styles of it's parent node
				inheritedStyles = this._getComputedStyles(p, this.m_desiredStyles);
				var inheritedStyle = '';
				for (var style in inheritedStyles) inheritedStyle += style + ':' + inheritedStyles[style].replace(/"/g, "'") + ';\n';

				// create the html for the region based on the everything we know already
				var frameHtml = '<html id="rta_frame_' + idName + this.m_id + '">' +
					'<head>' + ((baseUrl) ? '<BASE HREF="' + baseUrl + '">' : '') + '<style>' + this.m_styleSheet + extraStyle + '</style></head>' +
					'<body style="' + inheritedStyle + 'margin:0px;padding:0px;">' + content + '</body>' +
					'</html>';

				// put the html into the iframe
				var f = this.m_doc.getElementById('rta_' + idName + this.m_id).contentWindow.document;
				f.open();
				f.write(frameHtml);
				f.close();

				// attach a handler for gecko browsers to enable keyboard shortcuts and focus
				if (this.m_isGecko)
				{
					f.addEventListener('focus', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._onFocus(e, 'rta_" + idName + this.m_id + "', " + toolBar + ");"), true);
					f.addEventListener('blur', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._onBlur(e, '" + idName + this.m_id + "', " + toolBar + ");"), true);
					f.addEventListener('keypress', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._keyPress(e);"), true);
					f.addEventListener('mouseup', new Function("e", "return RichTextarea.getInstance('" + this.m_id + "')._interfaceHandler(e, 'rta_" + idName + this.m_id + "', " + toolBar + ");"), true);
				}
			}
			catch (e)
			{
				alert('Error preloading content.');
			}
		}
		catch (e)
		{
			// gecko may take some time to enable design mode so loop until set
			if (this.m_isGecko) setTimeout("RichTextarea.getInstance('" + this.m_id + "')._enableDesignMode('" + idName + "', '" + content + "', '" + toolBar + "', '" + baseUrl + "');", 10);
			else return false;
		}
	}
}


/**
 * Gets the computed style attributes of any element.  In our case we typically use it to get the
 * style attributes of the parent node of an editable region.
 * Returns an object containing the style attributes, and their values.
 */
function _getComputedStyles(element, desiredStyles)
{
	if (!element || element.nodeType != 1 || !element.tagName) return;

	var styles = new Object();

	if (window.getComputedStyle)
	{
		compStyle = element.ownerDocument.defaultView.getComputedStyle(element, '');

		for (var i = 0; i < compStyle.length; ++i)
		{
			var a = compStyle.item(i),
				v = compStyle.getPropertyValue(a);

			if (desiredStyles[a]) styles[a] = v;
		}
	}
	else if (element.currentStyle)
	{
		for (var i in desiredStyles)
		{
			var v = eval('element.currentStyle.' + desiredStyles[i]);
			if (v)
			{
				if (typeof(v) != 'string') v = v.toString();
				styles[i] = v;
			}
		}
	}

	return styles;
}


/**
 * Loops through each of the stylesheets linked in a document passed to it
 * and returns a string containing all of the css rules from each one.
 */
function _getStyleSheetRules(doc)
{
	var ret = '';

	// get the all the css styles defined in the containing document
	// so they can be applied to the iframe
	if (this.m_isIE)
	{
		for (var i = 0; i <= doc.styleSheets.length - 1; i++)
		{
			ret += doc.styleSheets[i].cssText;
		}
	}
	else
	{
		for (var i = 0; i < doc.styleSheets.length; i++)
		{
			try
			{
				var c = doc.styleSheets[i].cssRules;
				for (var j in c)
				{
					if (typeof(c[j].cssText) != 'undefined') ret += c[j].cssText + '\n';
				}
			}
			catch(e)
			{
				//alert('Error including remote stylesheet.');
			}
		}
	}

	return ret;
}


/**
 * Displays a palette dialog (button pulldown).
 */
function _dialogPalette(palette, button, hide)
{
	// get the elements we'll deal with
	var pal = document.getElementById('rta_palette_' + palette);

	if (hide)
	{
		pal.style.visibility = "hidden";
		if (button) button.className = 'rta_button';
		return;
	}

	// set the dialog position
	pal.style.left = this._findOffsetLeft(button) + "px";

	// if palette is currently open, close it, otherwise show it
	if (pal.style.visibility == "hidden")
	{
		pal.style.visibility = "visible";
		button.className = 'rta_button_over';

		// set a variable in the palette frame that we can use to return the information back to the
		// correct instance that opened it
		var f;
		if (this.m_doc.all) f = this.m_doc.frames['rta_palette_' + palette];
		else f = this.m_doc.getElementById('rta_palette_' + palette).contentWindow;
		try
		{
			f.owner = this;
			f.ownerButton = button;
			f.setup();
		}
		catch (e)
		{
			alert(e);
		}
	}
	else
	{
		pal.style.visibility = "hidden";
		button.className = 'rta_button';
	}
}



/**
 * Finds the left offset of an element on the page regardless of relation to other elements.
 */
function _findOffsetLeft(el)
{
	var ret = 0;

	if (el.offsetParent)
	{
		while (el.offsetParent)
		{
			ret += el.offsetLeft
			el = el.offsetParent;
		}
	}
	else if (el.x) ret += el.x;

	return ret;
}


/**
 * Functioin handles when a click or action is made to do all the interface cleanup (hide palettes
 * etc).
 */
function _interfaceHandler(e, idName, toolBar)
{
	/*
	!! this needs more work before being included.
	if (e && e.target)
	{
		var desiredStyles = new Object();
		desiredStyles['text-decoration'] = 'textDecoration';
		desiredStyles['font-style'] = 'fontStyle';
		desiredStyles['font-weight'] = 'fontWeight';

		var attr = this._getComputedStyles(e.target, desiredStyles);

		//for (var a in attr) alert(a + ":\n" + attr[a]);

		if (attr)
		{
			var b = this.m_doc.getElementById('rta_button_font_bold' + this.m_id + this.m_toolbar);
			if (b && (attr['font-weight'] == '800' || attr['font-weight'] == 'bold')) b.className = 'rta_button_active';
			else if (b) b.className = 'rta_button';

			var i = this.m_doc.getElementById('rta_button_font_italic' + this.m_id + this.m_toolbar);
			if (i && attr['font-style'] == 'italic') i.className = 'rta_button_active';
			else if (i) i.className = 'rta_button';

			var u = this.m_doc.getElementById('rta_button_font_underline' + this.m_id + this.m_toolbar);
			if (u && attr['text-decoration'] == 'underline') u.className = 'rta_button_active';
			else if (u) u.className = 'rta_button';
		}
	}
	*/

	// get each instance of the rta and handle what needs to be handled
	for (var i in RichTextarea.instances)
	{
		var rta = RichTextarea.getInstance(i);

		// loop through each toolbar
		for (var t = 0; t < rta.m_toolbarCount; t++)
		{
			// hide all the palettes
			for (var i = 0; i < rta.m_palettes.length; i++) rta._dialogPalette(rta.m_palettes[i][0] + rta.m_id + t, null, true);

			// switch off all the palette buttons
			for (var b in rta.m_buttons)
			{
				if (rta.m_buttons[b][0] == 3) rta.m_doc.getElementById('rta_button_' + rta.m_buttons[b][2] + rta.m_id + t).className = 'rta_button';
			}
		}
	}
}


/**
 * Function monitors for mouse clicks on the editable regions and sets the member variable to the
 * region that should get focus.
 */
function _onFocus(e, idName, toolBar)
{
	if (idName)
	{
		this.m_region = idName;
		if (this.m_debugMode) this.m_doc.getElementById('rta_debug_div').innerHTML = 'debug: ' + idName;
	}
	if (toolBar) this.m_toolbar = toolBar;

	if (this.m_isGecko && e) e.stopPropagation();
}


/**
 * Function handles when a region loses focus.
 */
function _onBlur(e, idName, toolBar)
{
	//if (idName) this.updateField(idName);
	if (this.m_isGecko && e) e.stopPropagation();
}


/**
 * Function monitors for keypresses on the editable regions and handles various keypresses as
 * commands.
 */
function _keyPress(e, idName)
{
	if (idName) this.m_region = idName;

	this.m_hasChanges = true;

	var key = (e.which || e.charCode || e.keyCode);
	var stringKey = String.fromCharCode(key).toLowerCase();

	if (this.m_isIE)
	{
		// pressing ctrl+enter will result in a <br> tag instead of <p>
		switch (key)
		{
			case 10:
				if (e.ctrlKey)
				{
					this.handleCommand('insertHTML', '<br>');
					e.keyCode = 0;
				}
				break;
		};
	}
	else if (this.m_isGecko)
	{
		// handle bold, italic, and underline shortcut commands
		if (e.ctrlKey)
		{
			var cmd;
			var stop;
			if (key == 13)
			{
				this.handleCommand('insertHTML', '<p>');
				stop = true;
			}
			else
			{
				switch (stringKey)
				{
					case 'b': cmd = "bold"; break;
					case 'i': cmd = "italic"; break;
					case 'u': cmd = "underline"; break;
				};
			}

			if (cmd || stop)
			{
				if (cmd) this.handleCommand(cmd, null);

				// stop the event bubble
				e.preventDefault();
				e.stopPropagation();
			}
		}
	}
}


/**
 * Function that converts the contents of an html node to xhtml while also
 * stripping out any unwanted tags and attributes; returns the results as a
 * string.
 */
function _sanitizeNode(node, lang, encoding, _insidePre, _indentLevel)
{
	var text = '';
	var pageMode = true;

	for (var i = 0; i < node.childNodes.length; i++)
	{
		var child = node.childNodes[i];
		
		// add to the return string based on the type of node.
		switch (child.nodeType)
		{
			case NODE_TYPE_ELEMENT:
				var tagName = String(child.tagName).toLowerCase();
				
				// ignore specific tags that we don't want to handle
				if (tagName == '') break;
				if (tagName == 'meta' && String(child.name).toLowerCase() == 'generator') break;
				
				// decide if we should be an html fragment.
				if (tagName == 'body') pageMode = false;

				// put the xml information at the beginning of the string.
				if (tagName == 'html')
					text = '<?xml version="1.0" encoding="' + encoding + '"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n';

				// handle the comment nodes for ie 5.0 and 5.5.
				if (tagName == '!')
				{
					var parts = this.m_re_comment.exec(child.text);
					if (parts)
					{
						innerText = String(parts[1]).replace(/--/g, '__');
						if (this.m_re_hyphen.exec(innerText)) innerText += ' ';
						text += '<!--' + innerText + '-->';
					}
				}
				else
				{
					// figure out if the tag is one we want to keep.
					var isValidTag = false;
					if (this.m_allowedTags[tagName]) isValidTag = true;

					// replace any tags that we want to replace.
					var applyAttr = '';
					if (this.m_replaceTags[tagName])
					{
						isValidTag = true;
						applyAttr = ' ' + this.m_replaceTags[tagName][1];
						tagName = this.m_replaceTags[tagName][0];
					}

					// start creating the tag.
					var tagText = '';
					var writeTag = true;

					// if this is a tag we actually want to keep, get the attributes
					if (isValidTag)
					{
						// add all the existing attributes, leaving out the ones we
						// don't want.
						var hasAltAttr = false;
						var hasLangAttr = false;
						var hasXMLLangAttr = false;
						var hasXMLNSAttr = false;
						var validAttrCount = 0;

						for (var j = 0; j < child.attributes.length; j++)
						{
							var attrName = child.attributes[j].nodeName.toLowerCase();
							var attrValue = '';
							var isValidAttr = true;

							// handle attributes we should ignore because of
							// browser stuff.
							if (!child.attributes[j].specified && (attrName != 'selected' || !child.selected) && (attrName != 'style' || child.style.cssText == '') && attrName != 'value')
								continue; //IE 5.0
							if (attrName == '_moz_dirty' || attrName == '_moz_resizing' || tagName == 'br' && attrName == 'type' && child.getAttribute('type') == '_moz')
								continue;

							// do some special handling for certain types of
							// attributes.
							switch (attrName)
							{
								case "style":
									attrValue = child.style.cssText;
									tempAttrValue = String(attrValue).toLowerCase();
									
									// pull any styles out of the style tag so we can
									// choose a related class.
									for (var className in this.m_replaceStyles)
									{
										params = this.m_replaceStyles[className];

										if (params[0] != tagName) continue;
										for (var value in params[2])
										{
											if (String(tempAttrValue).indexOf(params[1] + ": " + params[2][value]) != -1)
											{
												tagText += ' class="' + className + '"';
												break;
											}
										}
									}

									break;
								case "class":
									attrValue = child.className;
									break;
								case "http-equiv":
									attrValue = child.httpEquiv;
									break;
								case "noshade":
								case "checked":
								case "selected":
								case "multiple":
								case "nowrap":
								case "disabled": break;
								default:
									try
									{
										attrValue = child.getAttribute(attrName, 2);
									}
									catch (e)
									{
										isValidAttr = false;
									}
									break;
							}

							// ignore attributes we don't want.
							if (String(this.m_allowedTags[tagName][1]).indexOf('|' + attrName + '|') == -1)
								continue;
							
							// handle the special html tag attributes.
							if (attrName == 'lang')
							{
								hasLangAttr = true;
								attrValue = lang;
							}
							else if (attrName == 'xml:lang')
							{
								hasXMLLangAttr = true;
								attrValue = lang;
							}
							else if (attrName == 'xmlns') hasXMLNSAttr = true;
	
							if (isValidAttr)
							{
								// values set to "0" aren't handled correctly in gecko.
								attrValue = String(attrValue).replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
								
								if (!(tagName == 'li' && attrName == 'value'))
									tagText += ' ' + attrName + '="' + attrValue + '"';
	
								if (attrName == 'alt') hasAltAttr = true;
								
								validAttrCount++;
							}
						}

						// add an alt attribute to any img tags that don't have
						// them already.
						if (tagName == 'img' && !hasAltAttr) tagText += ' alt=""';

						// put any attributes on the tag that we're supposed to
						// replace.
						tagText += applyAttr

						// figure out if we should bother to write the tag or not.
						if (this.m_allowedTags[tagName][0] == true && validAttrCount == 0 && applyAttr == '') writeTag = false;
						
						// put the language and namespace attributes onto the
						// html tag if we've got the info.
						if (tagName == 'html')
						{
							if (!hasLangAttr) tagText += ' lang="' + lang + '"';
							if (!hasXMLLangAttr) tagText += ' xml:lang="' + lang + '"';
							if (!hasXMLNSAttr) tagText += ' xmlns="http://www.w3.org/1999/xhtml"';
						}
					}

					// handle the child nodes, by calling recursively, or just
					// close the tag and fill in it's contents.
					if (child.canHaveChildren || child.hasChildNodes())
					{
						var innerText = this._sanitizeNode(child, lang, encoding, _insidePre || tagName == 'pre' ? true : false);

						if (isValidTag && writeTag && innerText) text += '<' + tagName + tagText + '>';
						//if (innerText) 
						text += innerText;
						if (isValidTag && writeTag && innerText) text += '</' + tagName + '>';
					}
					else if (isValidTag)
					{

						// handle a few of the special type of tags that can be
						// in the head tag.
						if (tagName == 'style' || tagName == 'title' || tagName == 'script')
						{
							if (writeTag) text += '<' + tagName + tagText + '>';

							var innerText = '';
							if (tagName == 'script') innerText = child.text;
							else innerText = child.innerHTML;

							if (tagName == 'style') innerText = String(innerText).replace(/[\n]+/g,'\n');
							
							text += innerText + ((writeTag) ? '</' + tagName + '>' : '');
						}
						else if (writeTag) text += '<' + tagName + tagText + ' />';
					}
				}
				break;

			case NODE_TYPE_TEXT:
				// remember not to change text inside pre tags.
				if (_insidePre)
					text += child.nodeValue;
				else if (child.nodeValue != '\n')
					text += String(child.nodeValue).replace(/\n{2,}/g, "\n").replace(/\&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\u00A0/g, "&nbsp;");

				break;

			case NODE_TYPE_COMMENT:
				// make sure the comment doesn't end in a hyphen.
				innerText = String(child.nodeValue).replace(/--/g, '__');
				if (this.m_re_hyphen.exec(innerText)) innerText += ' ';
				text += '<!--' + innerText + '-->';

				break;
		}
	}
	
	// delete head and body tags from html fragments.
	if (!pageMode)
	{
		text = String(text).replace(/<\/?head>[\n]*/gi, "");
		text = String(text).replace(/<head \/>[\n]*/gi, "");
		text = String(text).replace(/<\/?body>[\n]*/gi, "");
	}

	// replace the microsoft word specific quote marks.
	var re1 = new RegExp(String.fromCharCode(8220), "g");
	var re2 = new RegExp(String.fromCharCode(8221), "g");
	var re3 = new RegExp(String.fromCharCode(8216), "g");
	var re4 = new RegExp(String.fromCharCode(8217), "g");
	var re5 = new RegExp(String.fromCharCode(8482), "g");
	var re6 = new RegExp(String.fromCharCode(8226), "g");

	return String(text).replace(re1, '"').replace(re2, '"').replace(re3, "'").replace(re4, "'").replace(re5, "&trade;").replace(re6, "&middot;");
}


/**
 * IE specific functions, handles the class changes to replicate the handy css :hover and :active
 * that most other browsers actually support.
 */
function _buttonOver(e)
{
	var el;
	if (!window.event) el = rta_toolbar.event.srcElement;
	else el = window.event.srcElement;
	var cn = el.className;

	if (cn == 'rta_button' || cn == 'rta_button_down') el.className = 'rta_button_over';
}

function _buttonOut(e)
{
	var el;
	if (!window.event) el = rta_toolbar.event.srcElement;
	else el = window.event.srcElement;
	var cn = el.className;

	if (cn == 'rta_button_over' || cn == 'rta_button_down') el.className = 'rta_button';
}

function _buttonDown(e)
{
	var el;
	if (!window.event) el = rta_toolbar.event.srcElement;
	else el = window.event.srcElement;
	var cn = el.className;

	if (cn == 'rta_button' || cn == 'rta_button_over') el.className = 'rta_button_down';
}


/**
 * Setup the class functions, etc.
 */
RichTextarea.prototype.writeRichTextarea = _writeRichTextarea;
RichTextarea.prototype.writeToolbar = _writeToolbar;
RichTextarea.prototype.writeRegion = _writeRegion;
RichTextarea.prototype.handleCommand = _handleCommand;
RichTextarea.prototype.getSelectedText = _getSelectedText;
RichTextarea.prototype.getSelectedNode = _getSelectedNode;
RichTextarea.prototype.updateField = _updateField;

RichTextarea.prototype._updateFormOnSubmit = _updateFormOnSubmit;
RichTextarea.prototype._enableDesignMode = _enableDesignMode;
RichTextarea.prototype._getComputedStyles = _getComputedStyles;
RichTextarea.prototype._getStyleSheetRules = _getStyleSheetRules;
RichTextarea.prototype._sanitizeNode = _sanitizeNode;

RichTextarea.prototype._dialogPalette = _dialogPalette;
RichTextarea.prototype._dialogPopup = _dialogPopup;
RichTextarea.prototype._findOffsetLeft = _findOffsetLeft;

RichTextarea.prototype._interfaceHandler = _interfaceHandler;
RichTextarea.prototype._onFocus = _onFocus;
RichTextarea.prototype._onBlur = _onBlur;
RichTextarea.prototype._keyPress = _keyPress;

// IE specific functions
RichTextarea.prototype._buttonOver = _buttonOver;
RichTextarea.prototype._buttonOut = _buttonOut;
RichTextarea.prototype._buttonDown = _buttonDown;


// Instance handling
RichTextarea.instances = new Object();
RichTextarea.getInstance = function(id) { return RichTextarea.instances[id]; }
RichTextarea.idSeed = 0;


/**
 *
 */
function RichTextarea_loadCfg(instance)
{
	// mode, image, tooltip, command/action, type.
	// mode: -1 = never show, all other buttons will be shown if mode passed to
	//       _writeToolbar() is greater than the mode for each button.
	// type: one of BUTTON_SEPERATOR, BUTTON_PUSH, BUTTON_TOGGLE,
	//       BUTTON_PULLDOWN, or BUTTON_FEEDBACK.
	instance.m_buttons = new Array(
		new Array(2, 'command_save', 	'Save',				'handleCommand(\'commandsave\')', 		BUTTON_PUSH),
		new Array(2, 'command_preview',	'Preview',			'handleCommand(\'commandpreview\')',	BUTTON_TOGGLE),

		new Array(2, BUTTON_SEPERATOR),
		new Array(2, 'command_undo',	'Undo',				'handleCommand(\'undo\')',				BUTTON_PUSH),
		new Array(2, 'command_redo',	'Redo',				'handleCommand(\'redo\')',				BUTTON_PUSH),

		new Array(2, BUTTON_SEPERATOR),
		new Array(2, 'command_cut',		'Cut',				'handleCommand(\'cut\')',				BUTTON_PUSH),
		new Array(2, 'command_copy',	'Copy',				'handleCommand(\'copy\')',				BUTTON_PUSH),
		new Array(2, 'command_paste',	'Paste',			'handleCommand(\'paste\')',				BUTTON_PUSH),

		new Array(2, BUTTON_SEPERATOR),
		new Array(2, 'action_class',	'Defined Class',	'handleCommand(\'actionclass\', this)',	BUTTON_PULLDOWN),

		new Array(2, BUTTON_SEPERATOR),
		new Array(0, 'font_bold',		'Bold',				'handleCommand(\'bold\')',				BUTTON_FEEDBACK),
		new Array(0, 'font_italic',		'Italic',			'handleCommand(\'italic\')',			BUTTON_FEEDBACK),
		new Array(0, 'font_underline',	'Underline',		'handleCommand(\'underline\')',			BUTTON_FEEDBACK),

		new Array(1, BUTTON_SEPERATOR),
		new Array(1, 'script_sub',		'Subscript',		'handleCommand(\'subscript\')',			BUTTON_FEEDBACK),
		new Array(1, 'script_super',	'Superscript',		'handleCommand(\'superscript\')',		BUTTON_FEEDBACK),

		new Array(1, BUTTON_SEPERATOR),
		new Array(1, 'justify_left',	'Align Left',		'handleCommand(\'justifyleft\')',		BUTTON_FEEDBACK),
		new Array(1, 'justify_center',	'Center',			'handleCommand(\'justifycenter\')',		BUTTON_FEEDBACK),
		new Array(1, 'justify_right',	'Align Right',		'handleCommand(\'justifyright\')',		BUTTON_FEEDBACK),
		new Array(1, 'justify_full',	'Justify Full',		'handleCommand(\'justifyfull\')',		BUTTON_FEEDBACK),

		new Array(1, BUTTON_SEPERATOR),
		new Array(1, 'list_numbered',	'Numbered List',	'handleCommand(\'insertorderedlist\')',	BUTTON_PUSH),
		new Array(1, 'list_unordered',	'Unordered List',	'handleCommand(\'insertunorderedlist\')',BUTTON_PUSH),
		new Array(1, 'indent_decrease',	'Decrease Indent',	'handleCommand(\'outdent\')',			BUTTON_PUSH),
		new Array(1, 'indent_increase',	'Increase Indent',	'handleCommand(\'indent\')',			BUTTON_PUSH),

		new Array(0, BUTTON_SEPERATOR),
		new Array(0, 'action_clean',	'Remove Formating',	'handleCommand(\'actionclean\')',		BUTTON_PUSH),
		new Array(1, 'action_inserthr',	'Horizontal Rule',	'handleCommand(\'inserthorizontalrule\')',BUTTON_PUSH),
		new Array(1, 'action_backcolor','Background Color',	'handleCommand(\'actionbackcolor\', this)',BUTTON_PULLDOWN),
		new Array(1, 'action_forecolor','Text Color',		'handleCommand(\'actionforecolor\', this)',BUTTON_PULLDOWN),

		new Array(0, BUTTON_SEPERATOR),
		new Array(1, 'command_editnode','Edit Properties',	'handleCommand(\'commandeditnode\')',	BUTTON_PUSH),
		new Array(0, 'command_source',	'HTML View',		'handleCommand(\'actionsource\')',		BUTTON_TOGGLE),

		new Array(0, BUTTON_SEPERATOR),
		new Array(0, 'insert_link',		'Hyperlink',		'handleCommand(\'insertlink\')',		BUTTON_PUSH),
		new Array(1, 'insert_table',	'Table',			'handleCommand(\'inserttable\')',		BUTTON_PUSH),
		new Array(1, 'insert_image',	'Image',			'handleCommand(\'insertimage\')',		BUTTON_PUSH),
		new Array(0, 'insert_entity',	'Special Character','handleCommand(\'insertentity\')',		BUTTON_PUSH)
		);

	if (instance.m_debugMode) instance.m_buttons[instance.m_buttons.length] = new Array(0, 'debug', 'Debug Button', 'handleCommand(\'debug\')', BUTTON_PUSH);

	// palette dialogs, which are only shown when a toolbar button is clicked check
	// _handleCommand() for more information about how the buttons and palettes are linked
	instance.m_palettes = new Array(
		new Array('backcolor', 'backcolor.html', 155, 122, 'color_backcolor'),
		new Array('forecolor', 'forecolor.html', 155, 122, 'color_forecolor'),
		new Array('class', 		'class.html',		155, 200, 'actionwrapclass')
		);

	// classes styles, fonts, and sizes to include in the pulldowns
	instance.m_classes = new Array(
		new Array('', '[Class]'),
		new Array('', 'None'),
		new Array('red', 'Red Text'),
		new Array('blue', 'Blue Text'),
		new Array('green', 'Green Text'),
		new Array('large', 'Large'),
		new Array('code', 'Code'),
		new Array('small', 'small'),
		new Array('long', 'Long Description for a class definition')
		);

	// styles to calculate and pull from the containing page for the editable regions
	// these styles will be calculated from the td, div, or whatever contains the editable region
	// they should be formated with the actual css defined attribute = the javascript defined
	// properties
	instance.m_desiredStyles = new Object();
	instance.m_desiredStyles['background-color'] = 'backgroundColor';
	instance.m_desiredStyles['color'] = 'color';
	instance.m_desiredStyles['font-family'] = 'fontFamily';
	instance.m_desiredStyles['font-size'] = 'fontSize';
	instance.m_desiredStyles['font-stretch'] = 'fontStretch';
	instance.m_desiredStyles['font-style'] = 'fontStyle';
	instance.m_desiredStyles['font-variant'] = 'fontVariant';
	instance.m_desiredStyles['font-weight'] = 'fontWeight';
	instance.m_desiredStyles['line-height'] = 'lineHeight';
	instance.m_desiredStyles['text-align'] = 'textAlign';
	instance.m_desiredStyles['text-indent'] = 'textIndent';
	instance.m_desiredStyles['text-shadow'] = 'textShadow';
	instance.m_desiredStyles['text-transform'] = 'textTransform';
	instance.m_desiredStyles['vertical-align'] = 'verticalAlign';
	instance.m_desiredStyles['word-spacing'] = 'wordSpacing';
	instance.m_desiredStyles['direction'] = 'direction';

	// list of 'allowable' html tags to leave in when saving, previewing, and
	// editing source view. currently this is a list of tags that flash is
	// capible of displaying, however we can restrict this list as much as we'd
	// like. the first array item is if the tag should be removed if it doesn't
	// have any remaining attributes -- an empty span shouldn't be there for
	// example, but it's fine for a paragraph, or br tag, and the second array
	// item is the list of allowable attributes.
	instance.m_allowedTags = new Object();
	instance.m_allowedTags['span']	= new Array(true,  '|class|style|');
	instance.m_allowedTags['a']		= new Array(true,  '|href|target|');
	instance.m_allowedTags['br']	= new Array(false, '');
	instance.m_allowedTags['p']		= new Array(false, '');
	instance.m_allowedTags['img']	= new Array(true,  '|src|id|align|hspace|vspace|alt|');
	instance.m_allowedTags['ul']	= new Array(false, ''); // not supported in flash, but if you allow li, they should be included
	instance.m_allowedTags['ol']	= new Array(false, ''); // not supported in flash, but if you allow li, they should be included
	instance.m_allowedTags['li']	= new Array(false, '');
	instance.m_allowedTags['b']		= new Array(false, '');
	instance.m_allowedTags['i']		= new Array(false, '');
	instance.m_allowedTags['u']		= new Array(false, '');
	//instance.m_allowedTags['font']	= new Array('|color|face|size|');

	// list of tags to replace with different tags (typically a span tag),
	// along with a string containing attributes and values to apply to the
	// new tag.
	instance.m_replaceTags = new Object();
	instance.m_replaceTags['b']		= new Array('span', 'class="bodyBold"');
	instance.m_replaceTags['strong']= new Array('span', 'class="bodyBold"');
	instance.m_replaceTags['i']		= new Array('span', 'class="bodyItalic"');
	instance.m_replaceTags['em']	= new Array('span', 'class="bodyItalic"');
	instance.m_replaceTags['u']		= new Array('span', 'class="bodyUnderline"');
	instance.m_replaceTags['p']		= new Array('br', ''); // this replaces paragraph tags with br tags (and is sort of questionable)

	// list of styles to replace with classes. the structure of the object is
	// the css representation of the style = the javascript representation of
	// the style, what class to use when replacing, an array containing any of
	// the possible values that we want to look for.
	// these are listed in order of importance -- if it comes accross one style
	// that it want's to keep it doesn't continue looking for more -- because
	// flash can't handle class="class1 class2" style cascading.
	instance.m_replaceStyles = new Object();
	instance.m_replaceStyles['bodyBold']		= new Array('span', 'font-weight', new Array('bold', '800'));
	instance.m_replaceStyles['bodyItalic']		= new Array('span', 'font-style', new Array('italic'));
	instance.m_replaceStyles['bodyUnderline']	= new Array('span', 'text-decoration', new Array('underline'));
}


/**----------------------------------------------------------------------------
 * Everything below this line are non-class helper functions.  Some of the
 * functions are expected to be there by the class (rta_onBeforeUnload for
 * example).
 *----------------------------------------------------------------------------/


/**
 * Handles the floating toolbar for when the editor is using the entire page.
 */
function rta_floatingToolbar(margin)
{
	var startX = 0; // x offset of toolbar in pixels
	var startY = 0; // y offset of toolbar in pixels

	var ns = (navigator.appName.indexOf('Netscape') != -1) || window.opera;
	var doc = ((document.compatMode && document.compatMode != 'BackCompat') ? document.documentElement : document.body);

	var ftlObj = document.getElementById('rta_floating_toolbar');

	document.body.style.marginTop = margin + 'px';

	if (document.layers) ftlObj.style = ftlObj;

	ftlObj.sP = function(x, y) {this.style.left = x + 'px'; this.style.top = y + 'px';};
	ftlObj.x = startX;
	ftlObj.y = startY;

	window.stayTopLeft = function()
	{
		var pY = ns ? pageYOffset : doc.scrollTop;
		ftlObj.y += (pY + startY - ftlObj.y);

		ftlObj.sP(ftlObj.x, ftlObj.y);
		setTimeout('stayTopLeft()', 1);
	}

	stayTopLeft();
}


/**
 * Handle leaving the page when there have been changes made.
 */
function rta_onBeforeUnload()
{
	var ask = false;
	for (var i in RichTextarea.instances) if (RichTextarea.getInstance(i).m_hasChanges) ask = true;
	if (ask) return "You've made changes to this page without saving.  Are you sure you'd like to leave the page without saving your changes?";
}


/**
 * Sets the hidden fields for each editable region of each RichTextarea in a given form to the
 * content of the editiable regions so the form can be submitted normally.
 */
function rta_submitWithRichTextareas()
{
	for (var i in RichTextarea.instances)
	{
		var rta = RichTextarea.getInstance(i);

		for (var r in rta.m_regions) rta.updateField(r);
	}

	return true;
}
