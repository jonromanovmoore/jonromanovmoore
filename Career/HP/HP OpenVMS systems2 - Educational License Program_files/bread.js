
var dList = new Array();
var nList = new Array();

// dir staging to This is a test
dList[0] = 'new';
nList[0] = 'What\'s New';
dList[1] = 'ebusiness';
nList[1] = 'e-Business';
dList[2] = 'openvms';
nList[2] = 'OpenVMS';
dList[3] = 'ips';
nList[3] = 'Web Enabled';
dList[4] = 'solutions';
nList[4] = 'Solutions';
dList[5] = 'wizard';
nList[5] = 'Ask the Wizard';
dList[6] = 'matrix';
nList[6] = 'Application Status Report';
dList[7] = 'swcat';
nList[7] = 'Software Catalog';
dList[8] = 'doc';
nList[8] = 'Documentation';
dList[9] = 'us';
nList[9] = 'United States';
dList[10] = 'opensource';
nList[10] = 'Open Source';
dList[11] = 'openvmsedu';
nList[11] = 'OpenVMS Edu';
dList[12] = 'taf';
nList[12] = 'OpenVMS Advisory Forum';
dList[13] = 'adaptenterprise';
nList[13] = 'Adaptive Enterprise';
dList[14] = 'products';
nList[14] = 'Products';
dList[15] = 'wizardi64';
nList[15] = 'Ask the I64 Wizard';
dList[16] = 'oov_doc';
nList[16] = 'Documentation';
dList[17] = 'journal';
nList[17] = 'Technical Journal';
dList[18] = 'partners';
nList[18] = 'Business Partners';
dList[19] = 'openvmsft';
nList[19] = 'Field Test';
dList[20] = 'integrity';
nList[20] = 'OpenVMS on Integrity';
dList[21] = 'faq';
nList[21] = 'OpenVMS FAQ';
dList[22] = 'symposium';
nList[22] = 'Advanced Techncial Bootcamp';
dList[23] = 'news';
nList[23] = 'News & Features';
dList[24] = 'june_2005';
nList[24] = 'June 2005';
dList[25] = 'transition';
nList[25] = 'OpenVMS Transition Modules';
dList[26] = 'advantage';
nList[26] = 'Integrity Advantage';
dList[27] = 'ft1';
nList[27] = 'OpenVMS 8.3 FT';
dList[28] = 'ft2';
nList[28] = 'HBMM FT';
dList[29] = 'ft4';
nList[29] = 'Layered Products FT';
dList[30] = 'vax';
nList[30] = 'VAX';
dList[31] = 'may_2006';
nList[31] = 'May 2006';
dList[32] = 'commercial';
nList[32] = 'Commercial software';
dList[33] = 'custlab';
nList[33] = 'Customer Lab';

function breadcrumbs(sClass, sDelimiter)
{
var xtit = '> '
	if ( document.title.indexOf('-&-') != -1) {
	xtit += (document.title.indexOf('-&-') != -1) ? document.title.substring(document.title.indexOf('-&-')+4,document.title.length) : document.title;
	}
	else
	{
	xtit = ' '
	}
var sClass= "udrlinesmall";
    if(!sDelimiter) sDelimiter = '>';
    if(typeof theme == 'undefined') sDelimiter = '|';
        if ( location.pathname.toUpperCase().indexOf('/EXECUTIVE_COUNCIL' ) != -1 ) { 
    var sURL = (location.pathname.indexOf('?') != -1) ? location.pathname.substring(0, location.pathname.indexOf('?')) : location.pathname;
        sURL = (location.pathname.charAt(18) == '/') ? location.pathname.substring(1) : location.pathname;
	}
	else
	{
    var sURL = (location.pathname.indexOf('?') != -1) ? location.pathname.substring(0, location.pathname.indexOf('?')) : location.pathname;
        sURL = (location.pathname.charAt(0) == '/') ? location.pathname.substring(1) : location.pathname;
	}
    var aURL = sURL.toLowerCase().split('/');
    if(aURL)
    {
        if ( location.pathname.toUpperCase().indexOf('/EXECUTIVE_COUNCIL' ) != -1 ) { 
		var sOutput = '<a href="/executive_council" class="udrlinesmall">Executive Council</a> ' ;
		var sPath = '/executive_council/';
		var i = 1
		}
		else
		{
		var sOutput = '<a href="http://welcome.hp.com/country/us/eng/prodserv/software.html" class="udrlinesmall">Software</a>&nbsp; <span class="color666666">&gt;</span> &nbsp;<a href="/" class="udrlinesmall">OpenVMS Systems</a> ' ;
		var sPath = '/';
		var i = 0
		}
      for( i ; i < aURL.length-1; i++)
      {

        if(aURL[i].toUpperCase().indexOf('CGI')!=-1)continue;
        if(aURL[i].toUpperCase().indexOf('.HTML')!=-1)continue;
        if(aURL[i].toUpperCase().indexOf('.HTM')!=-1)continue;
        sOutput += ' ' + sDelimiter + ' ';
        sPath += aURL[i] + '/';
        for(var s = 0; s < dList.length; s++)if(aURL[i]==dList[s])aURL[i]=nList[s];        
        sOutput += '<a href="' + sPath + '"';
        if(sClass) sOutput += ' class="' + sClass +'"';
        sOutput += '>' + aURL[i] + '</a>';
      }
	if( sOutput.substring(sOutput.length-1, sOutput.length-1) == '>')
		{
	      var sWrite = sOutput.substring(0,sOutput.length-1) + xtit

		}
		else
		{
	      var sWrite = sOutput.substring(0,sOutput.length) + xtit
		}
	        if ( location.pathname.toUpperCase().indexOf('CGI' ) == -1 )  {
		      document.write(sWrite);
		    }
    }
}
