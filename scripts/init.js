// ----------------------------------------------
// JavaScript: Odczytanie URL
// ----------------------------------------------
var qs = location.search.substring(1);
var nv = qs.split('&');
var url = new Object();
for(i = 0; i < nv.length; i++)
{
	eq = nv[i].indexOf('=');
	url[nv[i].substring(0,eq).toLowerCase()] = unescape(nv[i].substring(eq + 1));
}

// ----------------------------------------------
// zadecyduj co ma zostać załadowane
// ----------------------------------------------
function init_page()
{
	if (!url.hardlink)
	{
		if (url.page == 'start') load_xml('text/slajd1_p1.xml');
		else if (url.page == 'continue') continue_lesson();
		else if (url.page == 'sources') load_xml('text/sources.xml');
		else if (url.page == 'about') load_xml('text/about.xml');
		else load_xml('text/main.xml');
	}
	else
	{
		load_xml(url.hardlink);
	}
} 