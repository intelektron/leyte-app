var http_request = false;
var newwindow = '';
links = new Array();
ciekawostki = new Array();
akt_ciek = 0;
var tab='main';
var next='';
var prev='';
var isIE = navigator.appName.indexOf("Microsoft") != -1;

function bold(text) { return ('<b>' + text + '</b>'); }
function link(text) { return ('<br /><br /><b><a target="_blank" href="http://pl.wikipedia.org/wiki/'+text+'">więcej....</a></b>'); }

function ciekawostka()
{
	if (ciekawostki.length > 0)
	{
		powiedz(ciekawostki[akt_ciek]);
		akt_ciek++;
		if (akt_ciek >= ciekawostki.length) akt_ciek = 0;
	}
}

// ----------------------------------------------
// Przywołaj Japończyka
// ----------------------------------------------
function powiedz(text)
{
   document.marynarz.GotoFrame(50);
   document.marynarz.SetVariable('dymka_tekst', text);
   document.marynarz.Play();
   return false;
}

// ----------------------------------------------
// HTML: zmień widzialność obiektu
// ----------------------------------------------
function toggle_display(id, state)
{
   if ((id) && (id != ''))
	{
      e = document.getElementById(id);
      if (e) e.style.display = state;
	}
}

// ----------------------------------------------
// AJAX: załaduj tekst z url w dane miejsce
// ----------------------------------------------
function load_to_id(url, id, progress_id, post, trigger)
{
	var par = {"on_state1": load_to_id_state1,
              "on_state1_par": {"progress_id": progress_id, "trigger": trigger},
				  "on_success": load_to_id_success,
				  "on_success_par": {"progress_id": progress_id, "id": id, "trigger": trigger},
				  "on_failure": load_to_id_failure
				 };
	make_request(url, post, par);
	return false;
}

function load_to_id_state1(http, par)
{
   toggle_display(par.progress_id, 'block');
}

function load_to_id_success(txt, par, http_request)
{
	// zgaś progress bar
	toggle_display(par.progress_id, 'none');

	// wprowadź modyfikację
	if ((txt != '') && (par.id) && (par.id != ''))
	{
      elem = document.getElementById(par.id);
      if (elem) elem.innerHTML = txt;
	}
	
	txt = txt.replace(/"/g, '&quot;');
	//txt = txt.replace(/'/g, '\\\'');
	if (par.trigger) par.trigger(txt);
}

function load_to_id_failure(http_request, par)
{
	alert("Blad " + http_request.statusText);
}

// ----------------------------------------------
// AJAX: wykonaj zapytanie
// ----------------------------------------------
function make_request(url, post, params)
{
	// inicjalizacja
	http_request = false;
	if (window.XMLHttpRequest)
	{ // Mozilla, Safari,...
		http_request = new XMLHttpRequest();
		if (http_request.overrideMimeType)
		{
      	http_request.overrideMimeType('text/xml');
      }
	}
	else if (window.ActiveXObject)
	{ // IE
		try
		{
			http_request = new ActiveXObject("Msxml2.XMLHTTP");
      }
		catch (e)
		{
      	try
        	{
				http_request = new ActiveXObject("Microsoft.XMLHTTP");
			}
   		catch (e) {}
		}
	}

	if (!http_request) return false;

	// ustawienie parametrów i wysłanie danych
	http_request.onreadystatechange = function() { alert_contents(http_request, params); };

	if (post)
   {
		http_request.open('POST', url, true);
		http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http_request.setRequestHeader("Content-length", parameters.length);
		http_request.setRequestHeader("Connection", "close");
		http_request.send(parameters);
   }
	else
	{
    	http_request.open('GET', url, true);
    	http_request.send(null);
  	}
}

// ----------------------------------------------
// AJAX: zmień treść
// ----------------------------------------------
function alert_contents(http_request, params)
{
   if (http_request.readyState == 0)   // niezainicjowane
	{
	   if (params.on_state0)
	   	params.on_state0(http_request, params.on_state0_par);
	}
	
	else if (http_request.readyState == 1) // w trakcie pobierania
	{
	   if (params.on_state1)
			params.on_state1(http_request, params.on_state1_par);
	}
	
	else if (http_request.readyState == 2) // pobrano
	{
	   if (params.on_state2)
	   	params.on_state2(http_request, params.on_state2_par);
	}
	
	else if (http_request.readyState == 4) // gotowe
	{
  		if ((http_request.status == 200) || (http_request.status == 0))
		{
         if (params.on_success)
				params.on_success(http_request.responseText, params.on_success_par, http_request);
		}
    	else
      {
			if (params.on_failure)
				params.on_failure(http_request, params.on_failure_par);
      }
	}
}


// =========================================================================================

// ----------------------------------------------
// AJAX: załaduj tekst z url
// ----------------------------------------------
function load_xml(url)
{
	var par = {"on_state1": load_xml_state1,
				  "on_success": load_xml_success,
				  "on_success_par": {"url": url},
				  "on_failure": load_xml_failure
				 };
	make_request(url, false, par);
	return false;
}

function load_xml_state1(http, par)
{
   document.getElementById('loading').style.display = 'block';
}

function load_xml_success(txt, par, http_request)
{
	document.getElementById('loading').style.display = 'none';

	// parsuj XML
	var xmldoc = http_request.responseXML;
	var root = xmldoc.getElementsByTagName('strona').item(0);
	if (!root) 
	{
		alert('Błąd: pusta strona!');
		return;
	}

	// usun poprzednia zawartosc
	var place = document.getElementById('ajaxload');
	while (place.hasChildNodes()) place.removeChild(place.firstChild);
	ciekawostki = null;
	ciekawostki = new Array();
	akt_ciek = 0;
	document.getElementById('next').style.display = 'none';
	document.getElementById('prev').style.display = 'none';
	document.getElementById('licz').style.display = 'none';
	next = '';
	prev = '';
	var cnt = '';
	var act = '';
	var mute = false;
	
	// iteruj po elementach-dzieciach slajdu
	var bylo_codalej = false;
	
	
	for (var d=0; d<root.childNodes.length; d++)
	{
		var cn = root.childNodes.item(d);
		if (cn.nodeType == 1)
		{
			switch (cn.tagName)
			{
				case 'tytul':
					var tit = document.createElement('h1');
					tit.setAttribute("id", "main-title");
					tit.appendChild(document.createTextNode(cn.firstChild.nodeValue));
					place.appendChild(tit);
					break;
					
				case 'p':
      			var importedNode = document._importNode(cn, true);
      			place.appendChild(importedNode);
     				if (!document.importNode)
       				place.innerHTML = place.innerHTML;
					break;
					
				case 'codalej':
					if (bylo_codalej) break; // moze byc tylko jedna taka sekcja
					var cd = document.createElement('h2');
					cd.appendChild(document.createTextNode("Jak myślisz, co stało się dalej?"));
					place.appendChild(cd);
					var ul = document.createElement('ul');
					ul.className = 'codalej';
					for (var u=0; u<cn.childNodes.length; u++)
					{
						var it = cn.childNodes.item(u);
						if ((it.nodeType == 1) && (it.tagName == 'opcja'))
						{
							var li = document.createElement('li');
							var a = document.createElement('a');
							a.id = 'p' + u;
							a.setAttribute('href', '');
							a.className = 'hint';
							a.appendChild(document.createTextNode(it.firstChild.nodeValue));
							links[u] = it.getAttribute('link');
							a.onclick = function() {return load_xml(links[this.id.substring(1)]);}
							li.appendChild(a);
							ul.appendChild(li);
						}
					}
					place.appendChild(ul);
					bylo_codalej = true;
					break;
					
				case 'obrazek':
					// utworz glowny div
					var thm = document.createElement('div');
					thm.className = 'thumb';
					thm.style.width = cn.getAttribute('szerokosc');
	
					//Detect IE5.5+
					version=0
					if (navigator.appVersion.indexOf("MSIE")!=-1)
					{
						temp=navigator.appVersion.split("MSIE")
						version=parseFloat(temp[1])
					}
					if (version>=5.5)
					{
						var txt = '<a href="' + cn.getAttribute('duzy') + 
						'" title="' + cn.getAttribute('tytul') + 
						'" onclick="' + 'return GB_showImage(\'' + cn.getAttribute('tytul') + 
						'\',\'../../' + cn.getAttribute('duzy') + '\');' + '">';
						txt = txt + '<img src="'+cn.getAttribute('maly')+'" />';
						txt = txt + '</a>';
						txt = txt + '<span>' + cn.getAttribute('tytul') + '</span>';
						thm.innerHTML = txt;
						place.appendChild(thm);
					}
					else
					{
						// utworz link
						var a = document.createElement('a');
						//a.setAttribute('rel', 'gb_imageset[nice_pics]');
						a.setAttribute('href', cn.getAttribute('duzy'));
						a.setAttribute('title', cn.getAttribute('tytul'));
						a.setAttribute('onclick', 'return GB_showImage("'+cn.getAttribute('tytul')+'","../../'+cn.getAttribute('duzy')+'");');
						
						// utworz obrazek
						var img = document.createElement('img');
						img.setAttribute('alt', cn.getAttribute('tytul'));
						img.setAttribute('src', cn.getAttribute('maly'));
						
						// utworz opis					
						var span = document.createElement('span');
						span.className = 'thumb_podpis';
						span.appendChild(document.createTextNode(cn.getAttribute('tytul')));
						
						// przypisz wszystko
						a.appendChild(img);
						thm.appendChild(a);
						thm.appendChild(span);
						place.appendChild(thm);
					}
					
					break;
				
				case 'ciekawostka':
					ciekawostki.push(cn.firstChild.nodeValue);
					break;
					
				case 'flash':
					var div = document.createElement('div');
					div.innerHTML = '<div style="text-align: center; margin: 15px 0 15px 0;"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"'+
										 'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0"'+
										 'style="width: '+cn.getAttribute('szerokosc')+'px; height: '+cn.getAttribute('wysokosc')+'px; vertical-align: middle">'+
										 '<param name="allowScriptAccess" value="always" />'+
										 '<param name="movie" value="'+cn.getAttribute('link')+'" />'+
										 '<param name="quality" value="high" />'+
										 '<param name="bgcolor" value="#ffffff" />'+
										 '<embed src="'+cn.getAttribute('link')+'" quality="high" bgcolor="#FFFFFF" width="'+
										 cn.getAttribute('szerokosc')+'" height="'+cn.getAttribute('wysokosc')+'"'+
						 				 'name="fl" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"'+
						 				 'pluginspage="http://www.macromedia.com/go/getflashplayer" /></object></div>';
					place.appendChild(div);
					break;
				
				case 'zakladka':
					tab = cn.firstChild.nodeValue;
					break;
					
				case 'wycisz':
					mute = true;
					break;
					
				case 'pamietaj':
					create_cookie('cpage',par.url,7);  
					break;
					
				case 'nastepny':
					document.getElementById('next').style.display = 'inline';
					next = cn.firstChild.nodeValue;
					document.getElementById('next').onclick = function(){return load_xml(next);};
					break;
					
				case 'poprzedni':
					document.getElementById('prev').style.display = 'inline';
					prev = cn.firstChild.nodeValue;
					document.getElementById('prev').onclick = function(){return load_xml(prev);};
					break;
				
				case 'dalej':
					if (!bylo_codalej)
					{
						var dal = document.createElement('a');
						dal.className = 'forward';
						dal.href = '';
						dal.onclick = function(){return load_xml(next);};
						dal.appendChild(document.createTextNode("Dalej"));
						place.appendChild(dal);
					}
					break;
					
				case 'numer_slajdu':
					act = cn.firstChild.nodeValue;
					break;
					
				case 'liczba_slajdow':
					cnt = cn.firstChild.nodeValue;
					break;
			}
		}
	}
	
	// zarządzaj głośnością
	if (mute) pauzuj_mp3();
	else odtwarzaj_mp3();
	
	// ustaw licznik
	if ((act != '') && (cnt != ''))
	{
		document.getElementById('liczact').innerHTML = act;		
		document.getElementById('liczcnt').innerHTML = cnt;
		document.getElementById('licz').style.display = 'inline';
	}
	
	// ustaw zakladke
	change_tab(tab);
	document.getElementById('ldts').setAttribute('href', '?hardlink='+par.url);
	var subtitle = 'Bitwa morska o Leyte';
	var title = document.getElementById('main-title').innerHTML;
	if (title === subtitle) {
		document.title = title;
	} else {
		document.title = title + ' | ' + subtitle;
	}
	window.history.pushState(
		{ par: par.url },
		'Lekcja',
		'?hardlink='+par.url
	);
}

function load_xml_failure(http_request, par)
{
	alert("Blad " + http_request.statusText);
	document.getElementById('loading').style.display = 'none';
}

function change_tab(tab)
{
	var l = document.getElementById('navlist');
	for (var i=0; i<l.childNodes.length; i++)
	{
		var cc = l.childNodes.item(i);
		if (cc.nodeType == 1)
		{
			cc.firstChild.className = "";
		}
	}
	
	if (tab == 'start')
		document.getElementById('mstart').firstChild.className='current';
	else if (tab == 'kontynuuj')
		document.getElementById('mcontinue').firstChild.className='current';
	else if (tab == 'bibliografia')
		document.getElementById('msources').firstChild.className='current';
	else if (tab == 'olekcji')
		document.getElementById('mabout').firstChild.className='current';
	else
		document.getElementById('mmain').firstChild.className='current';
		
}

function continue_lesson()
{
	var saved = read_cookie('cpage');
	if (saved != null) return load_xml(saved);
	else return false;
}

function sprawdz_test()
{
	// reset
	var ts = document.getElementsByTagName('input')
	for (var d=0; d<ts.length; d++)
	{
		ts[d].nextSibling.style.backgroundColor = 'transparent';
	}
	
	// sprawdzamy
	var pp = 0;
	
	// pyt 1
	var w = document.getElementsByName('p1');
	if (w.item(0) && w.item(0).checked) w.item(0).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(1) && w.item(1).checked) w.item(1).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(2) && w.item(2).checked) {pp++; w.item(2).nextSibling.style.backgroundColor = '#92E46A'};
	
	// pyt 2
	var w = document.getElementsByName('p2');
	if (w.item(0) && w.item(0).checked) {pp++; w.item(0).nextSibling.style.backgroundColor = '#92E46A'};
	if (w.item(1) && w.item(1).checked) w.item(1).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(2) && w.item(2).checked) w.item(2).nextSibling.style.backgroundColor = '#FA8072';
	
	// pyt 3
	var w = document.getElementsByName('p3');
	if (w.item(0) && w.item(0).checked) w.item(0).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(1) && w.item(1).checked) {pp++; w.item(1).nextSibling.style.backgroundColor = '#92E46A'};
	if (w.item(2) && w.item(2).checked) w.item(2).nextSibling.style.backgroundColor = '#FA8072';
	
	// pyt 4
	var w = document.getElementsByName('p4');
	if (w.item(0) && w.item(0).checked) w.item(0).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(1) && w.item(1).checked) {pp++; w.item(1).nextSibling.style.backgroundColor = '#92E46A'};
	if (w.item(2) && w.item(2).checked) w.item(2).nextSibling.style.backgroundColor = '#FA8072';
	
	// pyt 5
	var w = document.getElementsByName('p5');
	if (w.item(0) && w.item(0).checked) w.item(0).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(1) && w.item(1).checked) w.item(1).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(2) && w.item(2).checked) {pp++; w.item(2).nextSibling.style.backgroundColor = '#92E46A'};
	
	// pyt 6
	var w = document.getElementsByName('p6');
	if (w.item(0) && w.item(0).checked) w.item(0).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(1) && w.item(1).checked) {pp++; w.item(1).nextSibling.style.backgroundColor = '#92E46A'};
	if (w.item(2) && w.item(2).checked) w.item(2).nextSibling.style.backgroundColor = '#FA8072';
	
	// pyt 7
	var w = document.getElementsByName('p7');
	if (w.item(0) && w.item(0).checked) {pp++; w.item(0).nextSibling.style.backgroundColor = '#92E46A'};
	if (w.item(1) && w.item(1).checked) w.item(1).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(2) && w.item(2).checked) w.item(2).nextSibling.style.backgroundColor = '#FA8072';
	
	// pyt 8
	var w = document.getElementsByName('p8');
	if (w.item(0) && w.item(0).checked) {pp++; w.item(0).nextSibling.style.backgroundColor = '#92E46A'};
	if (w.item(1) && w.item(1).checked) w.item(1).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(2) && w.item(2).checked) w.item(2).nextSibling.style.backgroundColor = '#FA8072';
	
	// pyt 9
	var w = document.getElementsByName('p9');
	if (w.item(0) && w.item(0).checked) w.item(0).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(1) && w.item(1).checked) w.item(1).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(2) && w.item(2).checked) {pp++; w.item(2).nextSibling.style.backgroundColor = '#92E46A'};
	
	// pyt 10
	var w = document.getElementsByName('p10');
	if (w.item(0) && w.item(0).checked) {pp++; w.item(0).nextSibling.style.backgroundColor = '#92E46A'};
	if (w.item(1) && w.item(1).checked) w.item(1).nextSibling.style.backgroundColor = '#FA8072';
	if (w.item(2) && w.item(2).checked) w.item(2).nextSibling.style.backgroundColor = '#FA8072';
	
	if (pp == 10)
		alert("Gratulacje, wszystkie odpowiedzi są poprawne!");
	else
		alert("Nie wszystkie odpowiedzi są poprawne :( Liczba błędnych odpowiedzi: " + (10-pp));
}

function getFlashMovie(movieName) 
{
	return (isIE) ? window[movieName] : document[movieName];
}

function pauzuj_mp3() 
{
	if (getFlashMovie('marynarz').pauzuj)
	getFlashMovie('marynarz').pauzuj();
}

function odtwarzaj_mp3() 
{

	if (getFlashMovie('marynarz').odtwarzaj)
	getFlashMovie('marynarz').odtwarzaj();
}