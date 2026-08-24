
<%

Function OriginvDate()  
  OriginvDate = FormatDateTime(Date, 1) 
End Function



%>


<BODY bgcolor="#00344A">

<OBJECT classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
 codebase="http://active.macromedia.com/flash2/cabs/swflash.cab#version=4,0,0,0"
 ID=calendar WIDTH=100% HEIGHT=100%>
 <PARAM NAME=movie VALUE="VA_MMUG.swf?date=<%=OriginvDate()%>"> 
 <PARAM NAME=quality VALUE=high> 
 <PARAM NAME=bgcolor VALUE=#00344A>
 <Param NAME=wmode VALUE=transparent> 
<EMBED src="originv.swf" quality=high bgcolor=#00344A  WIDTH=100% HEIGHT=100% TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash">
</EMBED>
</OBJECT>
</BODY>

