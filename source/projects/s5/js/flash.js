d = document;

var w = 960;
var h = 625;

var frameW = 0;
var frameH = 0;

d.status = d.title;

// Hook for Internet Explorer. 
// This writes the "moviename_DoFScommand" function to VB script in order to receive fscommand calls from flash. 
if (navigator.appName && navigator.appName.indexOf("Microsoft") != -1 && navigator.userAgent.indexOf("Windows") != -1 && navigator.userAgent.indexOf("Windows 3.1") == -1) {
	document.write('<SCRIPT LANGUAGE=VBScript\> \n');
	document.write('on error resume next \n');
	document.write('sub player_FSCommand(ByVal command, ByVal args)\n');
	document.write(' call player_DoFSCommand(command, args)\n');
	document.write('end sub\n');
	document.write('</SCRIPT\> \n');
}

// This javascript function acts as a handler for all fscommands
// called by the flash app. The prefix of the function name must 
// match the id given to the embedded flash object.
// The command passed to this function should be a complete string
// of the javascript call. i.e. command = functionName( 'arg 1', arg2, "arg3" ); 
function player_DoFSCommand( command )
{
	eval( command );
}

// Fix for Safari 3: SWFAddress seems to want to reload the entire page when first
// setting the # location. This forces the URL to contain the # if its left off, fixing the problem. 
var agent = navigator.userAgent;
var isSafari = ( agent.indexOf( 'Safari' ) != -1 );

var version=asual.util.Browser.version

if ( isSafari )
{
	var theRef = window.location.href;
	if ( theRef.indexOf( "?#") == -1 && version >= 500)
	{
		window.location = '?#';
	}
}

function popWin( url, name, width, height )
{
	var t = ( screen.height - height ) / 2;
	var l = ( screen.width - width ) / 2;
	
	window.open( url, name, 'width='+width+',height='+height+',top='+t+',left='+l+',location=0,status=0,scrollbars=0,toolbar=0,resizeable=no,noresize');
}

function popScroll( url, name, width, height )
{
	var t = ( screen.height - height ) / 2;
	var l = ( screen.width - width ) / 2;
	
	window.open( url, name, 'width='+width+',height='+height+',top='+t+',left='+l+',location=0,status=0,scrollbars=1,toolbar=0,resizeable=no,noresize');
}

function getObject(name)
{
	if(document.getElementById) return document.getElementById(name);
	if(document.all) return document.all[name];
	if(document.layers) return this.findLayer(name);
}

function getStyle(name)
{
	var el = this.getObject(name);
	return document.layers ? el : el.style;
}

function getStyleProp(el,styleProp)
{
	var y;
	var x = getObject(el);
	if (x.currentStyle)
		y = x.currentStyle[styleProp];
	else if (window.getComputedStyle)
		y = document.defaultView.getComputedStyle(x,null).getPropertyValue(styleProp);
	return y;
}

function setFrame()
{
	if (self.innerWidth)
	{
		frameW = self.innerWidth;
		frameH = self.innerHeight;
	}
	else if (document.documentElement && document.documentElement.clientWidth)
	{
		frameW = document.documentElement.clientWidth;
		frameH = document.documentElement.clientHeight;
	}
	else if (document.body)
	{
		frameW = document.body.clientWidth;
		frameH = document.body.clientHeight;
	}
}

function sizeMain()
{
	var argW = arguments[0];
	var argH = arguments[1];
  
	var mainW = 0;
	var mainH = 0;
	var main = getStyle('main');
  
	scroll(0,0);
	setFrame();
  
	if(argW) w = argW; // width
	if(argH) h = argH; // height
  
	mainW = w;
	mainH = h;
  
	if(mainW<frameW) mainW = frameW;
	if(mainH<frameH) mainH = frameH;
  
	if(navigator.appName.indexOf("Microsoft")==-1){
		if( mainH > frameH ) mainW = mainW - getScrollerWidth();
		if( mainW > frameW ) mainH = mainH - getScrollerWidth();
	}
  
	main.width = mainW + 'px';
	main.height = mainH + 'px';
}

function getScrollerWidth() 
{
  var scr = null;
  var inn = null;
  var wNoScroll = 0;
  var wScroll = 0;
  
  scr = document.createElement('div');
  scr.style.position = 'absolute';
  scr.style.top = '-1000px';
  scr.style.left = '-1000px';
  scr.style.width = '100px';
  scr.style.height = '50px';
  
  scr.style.overflow = 'hidden';
  
  inn = document.createElement('div');
  inn.style.width = '100%';
  inn.style.height = '200px';
  
  scr.appendChild(inn);
  
  document.body.appendChild(scr);
  
  wNoScroll = inn.offsetWidth;
  
  scr.style.overflow = 'auto';
  
  wScroll = inn.offsetWidth;
  
  document.body.removeChild(
      document.body.lastChild);
  
  return (wNoScroll - wScroll);
}

function getScrollXY() 
{
	var scrOfX = 0, scrOfY = 0;
	
	if( typeof( window.pageYOffset ) == 'number' ) 
	{
		scrOfY = window.pageYOffset;
		scrOfX = window.pageXOffset;
	} 
	else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) 
	{
		scrOfY = document.body.scrollTop;
		scrOfX = document.body.scrollLeft;
	}
	else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) 
	{
		scrOfY = document.documentElement.scrollTop;
		scrOfX = document.documentElement.scrollLeft;
	}
	
	return [ scrOfX, scrOfY ];
}

window.onmousewheel = document.onmousewheel = function()
{
	this.focus();
	//window.scroll(getScrollXY()[0], getScrollXY()[1] + (-event.wheelDelta))
}

function scrollUp()
{
	var i = getScrollXY()[1] - 10;
	scroll(0,i);
}

function scrollDown()
{
	var i = getScrollXY()[1] + 10;
	scroll(0,i);
}

function scrollPageUp()
{
	var i = getScrollXY()[1] - 50;
	scroll(0,i);
}

function scrollPageDown()
{
	var i = getScrollXY()[1] + 50;
	scroll(0,i);
}

function scrollHome()
{
	scroll(0,0);
}

function scrollEnd()
{
	scroll(0,main.offsetHeight);
}

function getBase(){
	var base;
	
	base=document.location.href;
	
	base=base.split('/');
	base.pop();
	base=base.join('/');
  
	return(base+'/');
}

function getDate(){
	var date;
	
	date = new Date();
	
	year=date.getFullYear();
	month=date.getMonth()+1;
	day=date.getDate();
	
	year=year.toString();
	month=month.toString();
	day=day.toString();
	
	if(month.length==1) month='0'+month;
	if(day.length==1) day='0'+day;

	return(year+month+day);
}

function getTime(){
	var date;
	var time;
	
	date = new Date();
	
	time=getDate();
	
	hour=date.getMinutes();
	minute=date.getHours();
	second=date.getSeconds();
	
	hour=hour.toString();
	minute=minute.toString();
	second=second.toString();
	
	return(time+hour+minute+second);
}

function parseSearch(value,variable)
{
	value=value.substring(1);
	var vars = value.split("&");
  	for (var i=0;i<vars.length;i++) {
    	var pair = vars[i].split("=");
    	if (pair[0] == variable) {
      		return pair[1];
    	}
  	} 
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
  	for (var i=0;i<vars.length;i++) {
    	var pair = vars[i].split("=");
    	if (pair[0] == variable) {
      		return pair[1];
    	}
  	} 
}

function bookmark(value)
{
	title=document.title;
	
	url=document.location.href+parseSearch(_history.location.search,'label');
  
	if(window.sidebar){
		window.sidebar.addPanel(title,url,'');
	}else if(window.external){
		window.external.AddFavorite(url,title);
	}else if(window.opera&&window.print){
		return true; 
	}else{
		prompt('create a bookmark and use this URL',title+url);
	}
}

function handleFlash( friendlyUrl, view, callout ) {
	var so = new SWFObject("app_loader.swf", "player", "100%", "100%", "9", "#000000");
	so.addParam( "allowScriptAccess", "always");
	if( friendlyUrl ) so.addVariable("friendlyUrl", friendlyUrl);
	if( view ) so.addVariable("view", view);
	if( callout ) so.addVariable("callout", callout);
	so.addVariable("baseURL", getBase());
	so.addVariable("formparameters", "model=S5");
	so.addVariable("xmldata", "http://www.audiusa.com/audi/us/en2/connect.flash_data.ModuleColumn_0001_ModuleGroup_0001_Module_0001.xml");
	so.useExpressInstall('media/swf/expressinstall.swf');
	so.write("main");
	sizeMain();
}