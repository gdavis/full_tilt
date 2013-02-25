function microTrack()
{
	alert( "microTrack()" );
}

function trackPage(pageName)
{
	document.getElementById("_history").src = "tracking.php?pageName=" + pageName;
}