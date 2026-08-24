<!--
// <summary>Global functions for MMC Feed</summary>
// <remarks>
//	<para>Project: MMC Feed version 1.0</para>
//	<para>Author:	John McCormick {Audacity, Inc.}</para>
//	<para>Created:	23 May 2001</para>
//	<para>Modified:	07 Jan 2003</para>
// 	<para>Media Player Detection</para>
//	<para>The code below attempts to embed the older 6.x control and the newer v7-v9 control in the page.</para>
//	<para>Once at the END of the player detection code below the  following variables will be set:</para>
//	<global>fHasWMP - True if either WMP v6.4 or v7.0+ detected else False.</global>
//	<global>fHasWMP64 - True if WMP v6.4 detected else False.</global>
//	<global>fHasWMP7x - True if WMP v7.0+ detected else False.</global>
//	<global>WMPVer - String stating the Media Player version detected (e.g"6.4", "7.xx", "8.xx", "9.xx").</global>
// </remarks>
var WMPVer = "unknown";	// Set to WMP version string detected
var fHasWMP = false;		// True if either WMP v6.4 or v7+ found
var fHasWMP64 = false;	// True if WMP v6.4 found
var fHasWMP7x = false;	// True if WMP v7+ (8, 9) found

function ClientBrowserData(sUA)
{
	this.userAgent = sUA.toString();
	var rPattern = /(MSIE)\s(\d+)\.(\d+)((b|p)([^(s|;)]+))?;?([^;]*(98|95|NT|3\.1|32|Mac|X11))?\s*([^\)]*)/;

	var rBotPattern = /Mozilla/i;
	var rSSBotPattern = /Site Server 3\.0 Robot/i;
	this.bot = ( !rBotPattern.test( this.userAgent ) || rSSBotPattern.test( this.userAgent ) );
		
	if (this.userAgent.match(rPattern))
	{
		this.browser = "MSIE";
		this.majorVer = parseInt(RegExp.$2) || 0;
		this.minorVer = RegExp.$3.toString() || "0";
		this.betaVer = RegExp.$6.toString() || "0";
		this.platform = RegExp.$8 || "Other";
		this.platVer = RegExp.$9 || "0";
	}
	else if (this.userAgent.match(/Mozilla[\/].*(95[\/]NT|95|NT|98|3.1).*Opera.*(\d+)\.(\d+)/))
	{
		//"Mozilla/4.0 (Windows NT 5.0;US) Opera 3.60  [en]";
		this.browser = "Opera";
		this.majorVer = parseInt(RegExp.$2) || 0;
		this.minorVer = RegExp.$3.toString() || "0";
		this.platform = RegExp.$1 || "Other";
	}
	else if (this.userAgent.match(/Mozilla[\/](\d*)\.?(\d*)(.*(98|95|NT|32|16|68K|PPC|X11))?/))
	{
		//"Mozilla/4.5 [en] (WinNT; I)"
		this.browser = "Nav";
		this.majorVer = parseInt(RegExp.$1) || 0;
		this.minorVer = RegExp.$2.toString() || "0";
		this.platform = RegExp.$4 || "Other";
	}
	else
	{
		this.browser = "Other";
		this.majorVer = 0;
		this.minorVer = 0;
		this.platform = "NotDetected";
	}
	this.getsNavBar = ( ("MSIE" == this.browser) && (4 <= parseInt(this.majorVer)) && ("Mac" != this.platform) && ("X11" != this.platform) );
	this.doesActiveX = ( ("MSIE" == this.browser) && (3 <= this.majorVer) && (("95" == this.platform) || ("98" == this.platform) || ("NT" == this.platform)) );
	this.doesPersistence = ("MSIE" == this.browser && 5 <= this.majorVer && "Mac" != this.platform && "X11" != this.platform);
	this.fullVer = parseFloat( this.majorVer + "." + this.minorVer );
}
var oCBD = new ClientBrowserData(window.navigator.userAgent);

if ( (true == oCBD.doesActiveX) && (5 <= oCBD.majorVer) )
{
	try
	{
		var objWMP64 = new ActiveXObject("MediaPlayer.MediaPlayer.1"); 
		if ("undefined" != typeof(objWMP64.FileName)) { fHasWMP64 = true;}
	}
	catch(e)
	{	fHasWMP64 = false; }
	
	try
	{
		var objWMP7x = new ActiveXObject("WMPlayer.OCX");
		if ("undefined" != typeof(objWMP7x.URL)) { fHasWMP7x = true;}
	}
	catch(e)
	{	fHasWMP7x = false; }
		
	if ( (fHasWMP64) || (fHasWMP7x) ) { fHasWMP=true; }
	
	if ( fHasWMP7x )			{	WMPVer=objWMP7x.versionInfo; 	}
	else if ( fHasWMP64 ) 	{	WMPVer="6.4";	}
	else 						{	WMPVer="unknown"; }
}

//<function>
//	<summary>Shows/Hides specified div tag and changes displayed image</summary>
//	<param name="objDiv">Div tag to modify</param>
//	<param name="objImg">Image tag to modify</param>
function ToggleDisplay(objDiv, objImg)
{
	if (objDiv.style.display == "none") 
	{
		objDiv.style.display = "";
		objImg.src = "/Seminar/Images/iconMinus.gif";
	}
	else 
	{
		objDiv.style.display = "none";
		objImg.src = "/Seminar/Images/iconPlus.gif";
	}
}
//</function>

//<function>
//	<summary>Displays standard seminars (type='seminar') in new window of correct dimensions</summary>
//	<param name="sDemoFile">Url of seminar to display</param>
function ShowWindow(sViewURI)
{
	sViewURI = sViewURI.replace("&amp;", "&");  // This is REQUIRED to fix damnable XSLT bug with output escaping
	sViewURI = sViewURI.toLowerCase();
	if ( ("undefined" != typeof(fHasWMP)) && (true == fHasWMP) )
		{	sViewURI += "&WMPVer=" + WMPVer;	}

	var sAttribs = "width=636,height=555,directories=no,status=no,menubar=no,resizable=yes";
	window.open(sViewURI, "_blank", sAttribs);
}
//</function>

//<function>
//	<summary>Displays standard seminars (type='seminarold') in new window of correct dimensions</summary>
//	<param name="sDemoFile">Url of seminar to display</param>
function ShowWindow1(sViewURI)
{
	sViewURI = sViewURI.replace("&amp;", "&");  // This is REQUIRED to fix damnable XSLT bug with output escaping
	sViewURI = sViewURI.toLowerCase();
	if ( ("undefined" != typeof(fHasWMP)) && (true == fHasWMP) )
		{	sViewURI += "&WMPVer=" + WMPVer;	}

	var sAttribs = "width=636,height=555,directories=no,status=no,menubar=no,resizable=yes";
	window.open(sViewURI, "_blank", sAttribs);
	var sAttribs = "width=647,height=593,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
	window.open(sDemoFile, "_blank", sAttribs);
}
//</function>

//<function>
//	<summary>Displays video seminars (type='Video') in new window of correct dimensions</summary>
//	<param name="sDemoFile">Url of seminar to display</param>
//	<param name="sSize">Width x Height of video to display</param>
function ShowWindow2(sDemoFile, sSize) 
{
	sSize = sSize.toUpperCase();
	var x = sSize.indexOf("X", 1);
	var sWidth = 661;
	var sHeight = 540;
	if ( x > 0 ) 
	{
		sWidth = sSize.substring(0, x);
		sHeight = sSize.substring(x+1, sSize.length);
		sHeight = sHeight * 1.2;  // Increase height to show UI
	}
	if (!oBD.doesActiveX) 
	{
		//
		// Netscape can't embed the player, so launch media file directly.
		//
		sWidth = 100;
		sHeight = 100;
		sDemoFile = sDemoFile.replace("htm", "asx");
	}
	var sAttribs = "width=" + sWidth + ",height=" + sHeight + ",directories=no,status=no,menubar=no,scrollbars=no,resizable=yes";
	window.open(sDemoFile, "Demonstration", sAttribs);
}
//</function>

//<function>
//	<summary>Displays the MS.com footer information pages in a new window</summary>
//	<param name="sUrl">Url to open</param>
function ShowFooterUrl(sUrl)
{
	window.open(sUrl,"_blank");
}
////</function>
//-->
  