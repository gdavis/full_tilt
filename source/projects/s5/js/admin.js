d = document;

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

function handleClick(section,method,action,id)
{
	var object=getObject('form_main');

	if(action=='delete'){
		if(!confirm('Do you really want to delete this item?')){
			return;
		}
	}
	
	object.section.value=section;
	object.method.value=method;
	object.action.value=action;
	object.id.value=id;
	
	object.submit();
}

function handlePaginate(number)
{
	var object=getObject('form_main');

	object.paginate.value=number;

	object.submit();
}

function getObject(name)
{
	if(document.getElementById) return document.getElementById(name);
	else if(document.all) return document.all[name];
	else if(document.layers) return this.findLayer(name);
}

function popHelp()
{
	popScroll( 'template/help/help.php', 'help', 800, 600 );
}

function popFile( which, width, height )
{
	popWin( 'php/popfile.php?which=' + which + '&width=' + width + '&height=' + height, 'image', width, height );

}

function popImages( cat )
{
	window.open('php/popimages.php?cat=' + cat, 'images', 'width='+1000+',height='+750+',top='+500+',left='+375+',location=0,status=0,scrollbars=0,toolbar=0,resizeable=1');
}

function toggleCheck(toggle)
{
	count = document.form_main.elements.length;

    for (i=0; i < count; i++){
	    document.form_main.elements[i].checked = toggle;
	}
}
function checkAll()
{
	toggleCheck(1);
}

function uncheckAll()
{
	toggleCheck(0);
}