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
	search=search.split('&');
	search=search.join('|');
	return(search);
}

function getSearchVar(str){
	var search;
	search=location.search;
	search=search.substring(1,search.length);
	search=search.split('&');
	for(i=0;i<search.length;i++){
		query=search[i].split('=');
		if(query[0]==str){
			return(unescape(query[1]));
		}
	}
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
