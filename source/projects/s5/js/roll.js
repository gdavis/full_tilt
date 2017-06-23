d = document;

var w = 1023;
var h = 768;

var frameW = 0;
var frameH = 0;

d.status = d.title;

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
};

function sizeMain()
{
	var argW = arguments[0];
	var argH = arguments[1];

	var mainW = 0;
	var mainH = 0;

	scroll(0,0);
	setFrame();

	if(argW) w = argW; // width
	if(argH) h = argH; // height

	mainW = w;
	mainH = h;

	if(mainW<frameW) mainW = frameW;
	if(mainH<frameH) mainH = frameH;

	if(navigator.appName.indexOf("Microsoft")==-1){
		if(mainH>frameH) mainW = mainW - getScrollerWidth();
		if(mainW>frameW) mainH = mainH - getScrollerWidth();
	}
	
	$('main').setStyle({width: mainW, height: mainH});
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

function getFlashVars(){
	var search;

	search=location.search;
	search=search.substring(1,search.length);

	return(search.replace('&','|'));
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
