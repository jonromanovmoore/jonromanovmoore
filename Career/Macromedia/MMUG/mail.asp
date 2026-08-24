<%@ Language ="VBScript"%>
<%
DIm TheMail
Set TheMail= Server.CreateObject("CDONTS.NewMail")
TheMail.From=Request.Form("email")
TheMail.To="jonathan@originv.com"
TheMail.Subject=Request.Form("subject")
TheMail.Body="From: " & Request.Form("name")& vbnewline &Request.Form("message")
TheMail.Send
Set TheMail=nothing
%>