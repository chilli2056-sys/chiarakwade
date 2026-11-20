// Arbeiten: [Titel, Jahr, Seitenverhältnis (Breite/Höhe), Titelbild aus images/ (optional), Details (optional), Kategorie (Webdesign, Branding oder Illustration)]
// Details: {text:"Beschreibung", images:["a.jpg","b.jpg","c.jpg"], extra:{label:"Ausstellung", images:["x.jpg","y.jpg"]}}  (extra = zweiter Bereich mit Text links und zweitem großen Foto)
// Beispiel: ["Mein Projekt","2026",1.25,"projekt-1.jpg"]
var works=[
 ["Was vom Hafen bleibt","2026",1.67,"was-vom-hafen-bleibt.png",{
   text:"Webdesign, Masterarbeit. wasvomhafenbleibt.de ist ein kollektives Erinnerungsarchiv: Fotos, Hafenreste, Arbeitsorte und Zusammenkünfte werden auf einer Karte des Hafens gesammelt und lassen sich nach Kategorien wie Zoll oder Gleissysteme entdecken.",
   images:["was-vom-hafen-bleibt.png","was-vom-hafen-bleibt-mockup.png"],
   extra:{label:"Ausstellung",
     text:"Die Masterausstellung „Was vom Hafen bleibt“ war am 10. Juli 2026 zur Vernissage um 19 Uhr und am 11. und 12. Juli jeweils von 15 bis 18 Uhr in der Zollkantine Bremen am Hansator zu sehen. An den Wänden hingen große Drucke, dazu Zitate aus den Erinnerungen der Menschen und das Plakat zum digitalen Erinnerungsarchiv. Im Mittelpunkt stand die Frage, wie wir Orte im städtischen Wandel erinnern.",
     images:["hafen-ausstellung-1.jpg","hafen-ausstellung-2.jpg","hafen-ausstellung-3.jpg","hafen-ausstellung-4.jpg","hafen-ausstellung-5.jpg"]}},"Webdesign"],
 ["Projekt eins","2026",1.25],["Projekt zwei","2026",0.8],["Projekt drei","2025",1],["Projekt vier","2025",1.5],
 ["Projekt fünf","2025",0.75],["Projekt sechs","2024",1.2],["Projekt sieben","2024",1],["Projekt acht","2024",0.85],
 ["Projekt neun","2023",1.4],["Projekt zehn","2023",0.8],["Projekt elf","2023",1.1],["Projekt zwölf","2022",1]
];
for(var i=13;i<=24;i++) works.push(["Projekt "+i,String(2022-Math.floor((i-13)/4)),[1,1.25,.8,1.4,.75,1.1][i%6]]);
// Bilder und Videos: Dateien mit .mp4, .webm, .mov oder .m4v werden als Video abgespielt (stumm, Endlosschleife, wie ein GIF)
function isVid(f){return /\.(mp4|webm|mov|m4v)$/i.test(f||"")}
function mediaTag(src,cls,play,style){
  var c=cls?' class="'+cls+'"':"", st=style?' style="'+style+'"':"";
  return isVid(src)?'<video'+c+st+' src="images/'+src+'" muted loop playsinline preload="metadata"'+(play?' autoplay':'')+'></video>'
                   :'<img'+c+st+' src="images/'+src+'" alt="">';
}
// Invertier-Kreis (wie beim Überfahren der Leisten): Weiß wird Orange, Schwarz (Schrift) wird Blau. Dafür drei übereinanderliegende Kreise mit
// Überblendmodi: difference (Blau-Kanal umkehren), multiply (Skalieren), plus-lighter (Grundwert addieren). Ergebnis je Kanal: Blau + (Orange-Blau) * Helligkeit.
function mkInv(d,extra){
  var els=["inv1","inv2","inv3"].map(function(c){var e=document.createElement("div"); e.className="inv "+c+(extra?" "+extra:""); e.style.setProperty("--d",d+"px"); e.setAttribute("aria-hidden","true"); document.body.appendChild(e); return e});
  return {
    setD:function(v){els.forEach(function(e){e.style.setProperty("--d",v+"px")})},
    style:{set translate(v){els.forEach(function(e){e.style.translate=v})}},
    classList:{remove:function(){els.forEach(function(e){e.classList.remove("on")})}, toggle:function(c,on){els.forEach(function(e){e.classList.toggle("on",!!on)})}, add:function(){els.forEach(function(e){e.classList.add("on")})}}
  };
}
// Trifft die Maus wirklich die Schrift von Name oder Untertitel (nicht den leeren Platz darüber/darunter)? Zählt nur zwischen Oberkante der Großbuchstaben
// und Unterkante der Unterlängen, gemessen von der Grundlinie des jeweiligen Worts.
function glyphHit(target,x,y){
  var ch=target&&target.closest&&target.closest(".ch"); if(!ch) return false;
  var host=ch.closest(".name,.role"); if(!host) return false;
  var w=ch.closest(".w"), probe=(w||host).querySelector(".bl"); if(!probe) return false;
  var base=probe.getBoundingClientRect().top, fs=parseFloat(getComputedStyle(host).fontSize)||16;
  return y>=base-fs*.78&&y<=base+fs*.24;
}
var CATS=["Webdesign","Branding","Illustration"];
works.forEach(function(w,k){ if(!w[5]) w[5]=CATS[k%3]; });
var scrolling=false, scrollEndT=0, GROW=1.14, grid=document.getElementById("grid"), mainEl=document.querySelector("main"), worksEl=document.getElementById("arbeiten"), lastT=0, lastI=-1, tileEls=[];
works.forEach(function(w,i){
  var f=document.createElement("figure"); f.className="work"; f.dataset.cat=w[5];
  var media=w[3]?mediaTag(w[3],"img",true,"aspect-ratio:"+w[2]):'<div class="img" style="aspect-ratio:'+w[2]+'"></div>';
  var ht=(w[3]&&!isVid(w[3]))?'<span class="ht" aria-hidden="true"><img src="images/'+w[3]+'" alt=""></span>':'<span class="ht ph" aria-hidden="true"></span>';
  f.innerHTML='<a href="#arbeiten">'+media+ht+'</a>'+
    '<figcaption>'+w[0]+'<span>'+w[1]+'</span></figcaption>';
  f.querySelector("a").addEventListener("click",function(e){
    e.preventDefault();
    var now=Date.now(), dbl=(lastI===i&&now-lastT<350); lastT=now; lastI=i;
    if(dbl){ if(cur_i!==i) openWork(i); setWide(true); }   // Doppelklick: Foto groß auf alle 4 Spalten
    else cur_i===i?closeWork():openWork(i);
  });
  f._ar=w[2];
  // Breite in Rasterspalten: Querformat breit, Hochformat schmal, dazwischen abwechselnd (ändere hier, wenn du es anders willst)
  f._span=w[2]>=1.5?(i%2?2:3):w[2]>=1.15?2:w[2]>=.9?(i%2?1:2):(i%2?2:1);
  // Maus drauf: Kachel wächst um 14 % (Faktor GROW ändern), beim Verlassen schrumpft sie zurück
  f.addEventListener("pointerenter",function(e){
    if(e.pointerType!=="mouse"||reduce||scrolling) return;   // beim Scrollen wachsen die Kacheln nicht (sonst ruckelt es)
    clearTimeout(f._gt);
    var l=parseFloat(f.style.left), tp=parseFloat(f.style.top), w=parseFloat(f.style.width), h=f.querySelector(".img").offsetHeight;
    if(isNaN(l)||f._base) return;
    f._base={l:l,t:tp,w:w}; f.classList.add("grow");
    f.style.left=(l-w*(GROW-1)/2)+"px"; f.style.top=(tp-h*(GROW-1)/2)+"px"; f.style.width=(w*GROW)+"px";
  });
  f.addEventListener("pointerleave",function(){
    var b=f._base; if(!b) return; f._base=null;
    f.style.left=b.l+"px"; f.style.top=b.t+"px"; f.style.width=b.w+"px";
    f._gt=setTimeout(function(){f.classList.remove("grow")},520);
  });
  tileEls.push(f);
  grid.appendChild(f);
});

// Cursor-Label: "scroll me" auf der Startseite, "tap me" über Links und Arbeiten
var cur=document.getElementById("cursor"), hero=document.getElementById("start");
var inHero=true, x=0, y=0, cx=0, cy=0, px=0, py=0, last=null;
function update(){
  if(!last){cur.classList.remove("on");return}
  // Auf dem großen Foto (Maus) übernimmt der runde Foto-Cursor, das Text-Label bleibt aus
  if(last.closest&&last.closest("#detail,#about")&&matchMedia("(hover:hover)").matches){cur.classList.remove("on"); return}   // im offenen Projekt übernimmt der runde Kreis
  var inBar=last.closest&&last.closest(".bar:not(.side)");
  var link=last.closest&&last.closest("a,button");
  var empty=/^(HTML|BODY|MAIN|SECTION|DIV|HEADER|FOOTER|ASIDE|NAV)$/.test(last.tagName)&&!last.classList.contains("img")&&!last.closest(".work");
  if(glyphHit(last,px,py)&&matchMedia("(hover:hover)").matches){cur.classList.remove("on"); return}   // auf dem Namen übernimmt die About-Blase
  else if(link){cur.textContent="tap me"}
  else if(inHero&&!inBar){cur.textContent="scroll me"}
  else if(inBar){cur.textContent="scroll me"}
  else{cur.classList.remove("on");return}
  cur.classList.toggle("blue",!empty);   // auf freier Fläche Textfarbe (invertiert: orange), über Inhalten blau
  cur.classList.add("on");
}
// Position: Maus = rechts unten vom Zeiger, Finger = über dem Finger (damit er das Label nicht verdeckt)
function setPos(a,b,touch){px=a; py=b; x=touch?a-30:a+14; y=touch?b-52:b+14}
window.addEventListener("pointermove",function(e){setPos(e.clientX,e.clientY,e.pointerType==="touch"); last=e.target; update()});
document.addEventListener("pointerleave",function(){last=null;update()});
var curRaf=0;
mainEl.addEventListener("scroll",function(){   // höchstens einmal pro Bild neu berechnen (sonst ruckelt das Scrollen)
  if(curRaf) return;
  curRaf=requestAnimationFrame(function(){curRaf=0; if(last){last=document.elementFromPoint(px,py)||last;update()}});
},{passive:true});
// Handy: das Label folgt dem Finger, auch während des Scrollens (dann kommen nur noch Touch-Ereignisse an)
function touchPos(e){
  var t=e.touches[0]; if(!t) return;
  setPos(t.clientX,t.clientY,true);
  if(e.type==="touchstart"&&!cur.classList.contains("on")){cx=x; cy=y}
  last=document.elementFromPoint(t.clientX,t.clientY)||e.target; update();
}
window.addEventListener("touchstart",touchPos,{passive:true});
window.addEventListener("touchmove",touchPos,{passive:true});
function touchEnd(){last=null; update()}
window.addEventListener("touchend",touchEnd,{passive:true});
window.addEventListener("touchcancel",touchEnd,{passive:true});
var heroSeen=[false,false];   // Startseite vorne und die Kopie am Ende (Karussell)
var heroIO=new IntersectionObserver(function(en){
  en.forEach(function(e){heroSeen[e.target===hero?0:1]=e.intersectionRatio>0.5});
  inHero=heroSeen[0]||heroSeen[1]; update();
},{threshold:[0,.5,1]});
heroIO.observe(hero);
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
(function loop(){
  cx+=(x-cx)*(reduce?1:.18); cy+=(y-cy)*(reduce?1:.18);
  cur.style.transform="translate("+cx+"px,"+cy+"px)";
  requestAnimationFrame(loop);
})();

// Leisten: über Hover oder Tippen wird alles blau
document.querySelectorAll(".bar:not(.side)").forEach(function(b){
  b.addEventListener("pointerenter",function(){document.body.classList.add("blue")});
  b.addEventListener("pointerleave",function(){document.body.classList.remove("blue")});
  b.addEventListener("pointercancel",function(){document.body.classList.remove("blue")});
});

// Horizontales Scrollen: Mausrad und Trackpad laufen weich nach rechts (Ziel + sanftes Nachziehen)
var scrollTgt=0, scrollAnim=false;
function scrollMainTo(x){
  scrollTgt=Math.max(0,Math.min(mainEl.scrollWidth-mainEl.clientWidth,x));
  if(reduce){mainEl.scrollLeft=scrollTgt; return}
  if(!scrollAnim){scrollAnim=true; scrollPos=mainEl.scrollLeft; scrollStep()}
}
// Karussell: hinter den Arbeiten steht eine Kopie der Startseite. Sobald sie ganz im Bild ist, springt die Seite unbemerkt zur echten Startseite.
// Von der Startseite nach links springt sie umgekehrt ans Ende.
function wrapRight(){
  if(typeof hero2==="undefined") return;
  var L=hero2.offsetLeft; if(L>0&&mainEl.scrollLeft>=L-1){mainEl.scrollLeft-=L; scrollTgt=Math.max(0,scrollTgt-L)}
}
function wrapLeft(){
  if(typeof hero2==="undefined"||mainEl.scrollLeft>1||scrollAnim) return;
  var L=hero2.offsetLeft; mainEl.scrollLeft=L; scrollTgt=L;
}
var scrollPos=0;   // eigene Kommazahl-Position: der Browser rundet scrollLeft auf ganze Pixel, das würde das Ausklingen ruckeln lassen
function scrollStep(){
  wrapRight(); if(Math.abs(mainEl.scrollLeft-Math.round(scrollPos))>2) scrollPos=mainEl.scrollLeft;   // von außen verschoben (Sprung im Karussell)
  var d=scrollTgt-scrollPos;
  if(Math.abs(d)<.4){scrollPos=scrollTgt; mainEl.scrollLeft=scrollPos; scrollAnim=false; return}
  scrollPos+=d*.18;
  mainEl.scrollLeft=scrollPos;
  requestAnimationFrame(scrollStep);
}
mainEl.addEventListener("scroll",function(){
  wrapRight(); if(!scrollAnim) scrollTgt=mainEl.scrollLeft;
  if(!scrolling){   // Scrollen beginnt: gewachsene Kacheln sofort zurück, ohne Animation
    scrolling=true;
    tileEls.forEach(function(t){
      var b=t._base; if(!b) return; t._base=null; clearTimeout(t._gt); t.classList.remove("grow");
      t.style.left=b.l+"px"; t.style.top=b.t+"px"; t.style.width=b.w+"px";
    });
  }
  clearTimeout(scrollEndT); scrollEndT=setTimeout(function(){scrolling=false},160);
},{passive:true});
// Pfeiltasten, Pos1 und Ende scrollen ebenfalls seitwärts, solange kein Fenster offen ist
document.addEventListener("keydown",function(e){
  if(cur_i>=0||(typeof about!=="undefined"&&about&&!about.hidden)) return;
  var cw=parseFloat(worksEl.style.getPropertyValue("--colw"))||120, cx0=scrollAnim?scrollTgt:mainEl.scrollLeft;
  if(e.key==="ArrowRight") scrollMainTo(cx0+cw*2);
  else if(e.key==="ArrowLeft"){wrapLeft(); scrollMainTo((scrollAnim?scrollTgt:mainEl.scrollLeft)-cw*2)}
  else if(e.key==="Home") scrollMainTo(0);
  else if(e.key==="End") scrollMainTo(hero2.offsetLeft-mainEl.clientWidth);
});
// Links "Chiara Kwade" (Start) und "Arbeiten" im Header
document.querySelectorAll('a[href="#start"],a[href="#arbeiten"]').forEach(function(a){
  if(a.closest(".work")) return;
  a.addEventListener("click",function(e){e.preventDefault();
    var far=mainEl.scrollLeft>hero2.offsetLeft/2;   // weit hinten: vorwärts zur Startseiten-Kopie, dann springt es nach vorn
    scrollMainTo(a.getAttribute("href")==="#start"?(far?hero2.offsetLeft:0):worksEl.offsetLeft)});
});

// Zoom per Strg+Mausrad, Trackpad-Pinch oder Zwei-Finger-Geste. Spalten im Hintergrund bleiben (Desktop 4, Handy 2), nur die Projektgröße ändert sich.
// Die Zahl ist, wie viele Projekte nebeneinander stehen: weniger = näher ran, mehr = weiter raus.
var idx0=0, mq=matchMedia("(max-width:760px)"), levels=[1,2,4,8,12], idx=2;
// Drei Bahnen (die Höhe in Dritteln): jede Kachel hängt mit der Oberkante an einer waagerechten Linie. Kacheln sind 1, 2 oder 3 Rasterspalten breit
// (Hoch- und Querformat gemischt) und kommen immer in die Bahn, die am weitesten links noch frei ist.
// Reine Rechenfunktion (ohne DOM): items = [{ar,span}], o = {colW,pad,capH,tops:[y0,y1,y2],laneH,startCol}. Liefert Positionen und endCol.
function placeTiles(items,o){
  var colW=o.colW, pad=o.pad, capH=o.capH, start=(o.startCol||0)*colW, ends=o.tops.map(function(){return start}), out=[], maxEnd=start;
  items.forEach(function(it){
    var span=Math.max(1,it.span||1), lane=0, k, maxW=Math.max(20,span*colW-2*pad), maxH=Math.max(40,(o.laneH?o.laneH[0]:40)-capH);
    for(k=1;k<ends.length;k++) if(ends[k]<ends[lane]-.5) lane=k;
    maxH=Math.max(40,(o.laneH[lane]||40)-capH);
    var w=maxW, h=w/it.ar;
    if(h>maxH){h=maxH; w=h*it.ar; if(w>maxW){w=maxW; h=w/it.ar}}   // zu hohe Kachel: so groß, dass sie in die Bahn passt
    out.push({x:ends[lane]+pad, y:o.tops[lane], w:w, h:h});
    ends[lane]+=span*colW; maxEnd=Math.max(maxEnd,ends[lane]);
  });
  return {pos:out, endCol:Math.ceil((maxEnd-.5)/colW)};
}
var yearEls={};
function placeAll(){
  var n=levels[idx], baseW=window.innerWidth, colW=baseW/n;
  var dense=colW<95;
  grid.classList.toggle("dense",dense);
  grid.style.setProperty("--n",n);
  worksEl.style.setProperty("--colw",colW+"px");
  var hasChips=false;   // keine Chips mehr: die Kategorien stehen als Leiste unter dem Header
  var Hm=mainEl.clientHeight, off=8, topMin=hasChips?52:off;   // Kacheln hängen 8 px unter der Linie; auf dem Handy bleibt oben Platz für die Chips
  // Beim Rauszoomen kommen Linien dazu: Normalansicht = Drittel (3 Bahnen), eine Stufe weiter raus 6, dann 9 ... Die Drittel-Linien bleiben immer.
  var L=3*(1+Math.max(0,idx-idx0)), tops=[], laneH=[], lk;
  for(lk=0;lk<L;lk++){ tops.push(lk?Hm*lk/L+off:topMin); laneH.push(Hm/L-(lk?off:topMin)-8) }
  var lc="var(--line)";   // waagerechte Linien als Verlauf
  mainEl.style.backgroundImage="linear-gradient(to bottom,"+(function(){
    var parts=[];
    for(var q=1;q<L;q++){var pc2=(100*q/L).toFixed(3); parts.push("transparent calc("+pc2+"% - 1px)",lc+" calc("+pc2+"% - 1px) "+pc2+"%","transparent "+pc2+"%")}
    return parts.join(",")})()+")";
  var o={colW:colW,pad:dense?4:8,capH:dense?24:30,tops:tops,laneH:laneH};
  var groups=[];
  if(!timeline){
    groups.push({tiles:tileEls.filter(function(t){return !t.classList.contains("out")})});
  }else{
    var years={};
    works.forEach(function(w,k){var t=tileEls[k]; if(!t.classList.contains("out")) (years[w[1]]=years[w[1]]||[]).push(t)});
    Object.keys(years).sort(function(a,b){return b-a}).forEach(function(y){groups.push({year:y,tiles:years[y]})});
  }
  var col=0;
  groups.forEach(function(g){
    var go=Object.assign({},o,{startCol:col});
    if(g.year){   // Jahreszahl oben über der ersten Spalte, die oberste Bahn beginnt darunter
      go.tops=tops.slice(); go.tops[0]=topMin+40; go.laneH=laneH.slice(); go.laneH[0]=laneH[0]-40;
      var lab=yearEls[g.year]; if(lab){lab.style.left=(col*colW+o.pad)+"px"; lab.style.top=topMin+"px"}
    }
    var r=placeTiles(g.tiles.map(function(t){return {ar:t._ar,span:Math.min(t._span,n)}}),go);
    g.tiles.forEach(function(t,k){
      var p=r.pos[k]; t._base=null; clearTimeout(t._gt); t.classList.remove("grow"); t.style.left=p.x+"px"; t.style.top=p.y+"px"; t.style.width=p.w+"px";
    });
    col=Math.max(r.endCol,col+(g.year?1:0));
  });
  grid.style.width=(Math.max(col,n)*colW)+"px";
  worksEl.style.width=(Math.max(col,n)*colW)+"px";
}
function applyZoom(){placeAll()}
function initZoom(){
  levels=mq.matches?[2,4,6,12]:[2,4,8,16,24];   // Zahl = Rasterspalten nebeneinander (doppelt so fein wie vorher)
  idx=levels.indexOf(mq.matches?4:8); idx0=idx;
  applyZoom();
}
function step(d){var k=Math.max(0,Math.min(levels.length-1,idx+d)); if(k!==idx){idx=k;flip(applyZoom)}}
// Maus/Trackpad: Strg (Mac: Cmd/Pinch) + Mausrad. Rein = weniger Projekte nebeneinander
var wacc=0, wlast=0;
window.addEventListener("wheel",function(e){
  if(!e.ctrlKey){
    // normales Mausrad / Trackpad: nach rechts bzw. links scrollen (Fenster rechts scrollen weiter senkrecht)
    if(e.target.closest&&e.target.closest(".detail")) return;
    e.preventDefault();
    var d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
    if(e.deltaMode===1) d*=32; else if(e.deltaMode===2) d*=mainEl.clientWidth;
    if(d<0) wrapLeft();
    if(e.deltaMode===0&&Math.abs(d)<40&&!scrollAnim){mainEl.scrollLeft+=d; scrollTgt=mainEl.scrollLeft; return}   // Trackpad: kommt schon fein und mit eigenem Schwung, direkt übernehmen
    scrollMainTo((scrollAnim?scrollTgt:mainEl.scrollLeft)+d);
    return;
  }
  e.preventDefault();
  wacc+=e.deltaY;
  var now=Date.now();
  if(Math.abs(wacc)>=30&&now-wlast>220){step(wacc>0?1:-1); wacc=0; wlast=now}
},{passive:false});
// Finger: mit zwei Fingern auseinander- bzw. zusammenziehen
var pd=0;
function tdist(t){return Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY)}
document.addEventListener("touchstart",function(e){pd=(e.touches.length===2&&e.target.closest("main"))?tdist(e.touches):0},{passive:true});
document.addEventListener("touchmove",function(e){
  if(e.touches.length!==2||!pd) return;
  e.preventDefault();
  var d=tdist(e.touches), r=d/pd;
  if(r>1.3){step(-1); pd=d} else if(r<0.77){step(1); pd=d}
},{passive:false});
document.addEventListener("touchend",function(){pd=0});
document.addEventListener("gesturestart",function(e){e.preventDefault()});
mq.addEventListener("change",function(){closeWork();initZoom()});
window.addEventListener("resize",function(){if(typeof placeAll==="function"&&typeof timeline!=="undefined") placeAll()});
// (initZoom läuft weiter unten, sobald timeline definiert ist)

// Projekt-Fenster mit Diashow, Text und Vorschaubildern
var detail=document.getElementById("detail"), dTitle=document.getElementById("dTitle"), dYear=document.getElementById("dYear"),
    dImg=document.getElementById("dImg"), dCount=document.getElementById("dCount"), dText=document.getElementById("dText"),
    dThumbs=document.getElementById("dThumbs");
var cur_i=-1, slide=0, imgs=[];
// Vorschaubilder behalten ihr echtes Format: Seitenverhältnis des Bildes (oder Videos) als --ar am Knopf, die Galerie ordnet sich danach (siehe style.css)
function thumbAR(b){
  var m=b.querySelector("img,video"); if(!m) return;
  function set(){var w=m.naturalWidth||m.videoWidth, h=m.naturalHeight||m.videoHeight; if(w&&h) b.style.setProperty("--ar",(w/h).toFixed(4))}
  if(m.tagName==="VIDEO"){if(m.readyState>=1) set(); else m.addEventListener("loadedmetadata",set,{once:true})}
  else{if(m.complete&&m.naturalWidth) set(); else m.addEventListener("load",set,{once:true})}
}
var dSec=document.getElementById("dSec"), dSecLabel=document.getElementById("dSecLabel"), dSecText=document.getElementById("dSecText"), dSecThumbs=document.getElementById("dSecThumbs"), dSecMain=document.getElementById("dSecMain"),
    dSecImg=document.getElementById("dSecImg"), dSecCount=document.getElementById("dSecCount"), slide2=0, imgs2=[];
function show2(n){
  slide2=(n+imgs2.length)%imgs2.length;
  dSecImg.innerHTML=mediaTag(imgs2[slide2],"",true);
  var im=dSecImg.firstChild, vid=im.tagName==="VIDEO";   // richtiges Seitenverhältnis übernehmen
  function setAr(){var w=vid?im.videoWidth:im.naturalWidth, h=vid?im.videoHeight:im.naturalHeight; if(w) dSecMain.style.setProperty("--ar",(w/h).toFixed(4))}
  if(vid) im.addEventListener("loadedmetadata",setAr); else if(im.complete) setAr(); else im.addEventListener("load",setAr);
  dSecCount.textContent=imgs2.length>1?(slide2+1)+" / "+imgs2.length:"";
  Array.prototype.forEach.call(dSecThumbs.children,function(b,k){b.classList.toggle("on",k===slide2)});
}

// Fenster auf-/zuklappen mit Animation. Auf dem Handy klappt das Fenster unter der Kachel in der Höhe auf.
var PROPS=["height","padding-top","padding-bottom","border-top-width","border-bottom-width","margin-bottom"];
function isInline(el){return mq.matches&&!el.classList.contains("about")&&getComputedStyle(el).position==="static"}
function clearInline(el){PROPS.forEach(function(p){el.style.removeProperty(p)}); el.style.overflow=""; el.style.transition=""}
function panelIn(el){
  clearTimeout(el._t);
  var wasOpen=!el.hidden&&!el.classList.contains("closing");
  el.classList.remove("closing");
  if(wasOpen) return;                       // schon offen: nur der Inhalt wechselt
  el.hidden=false;
  if(isInline(el)&&!reduce){
    var cs=getComputedStyle(el), end={height:el.offsetHeight+"px"};
    PROPS.slice(1).forEach(function(p){end[p]=cs.getPropertyValue(p)});
    PROPS.forEach(function(p){el.style.setProperty(p,"0px")}); el.style.overflow="hidden"; void el.offsetHeight;
    el.style.transition=PROPS.map(function(p){return p+" .55s cubic-bezier(.16,1,.3,1)"}).join(",");
    PROPS.forEach(function(p){el.style.setProperty(p,end[p])});
    el._t=setTimeout(function(){clearInline(el)},600);
  }
  void el.offsetHeight;
  el.classList.add("in");
}
function panelOut(el,done){
  clearTimeout(el._t);
  if(el.hidden){if(done) done(); return}
  el.classList.add("closing");
  var inl=isInline(el)&&!reduce;
  if(inl){
    var cs=getComputedStyle(el), cur={height:el.offsetHeight+"px"};
    PROPS.slice(1).forEach(function(p){cur[p]=cs.getPropertyValue(p)});
    PROPS.forEach(function(p){el.style.setProperty(p,cur[p])}); el.style.overflow="hidden"; void el.offsetHeight;
    el.style.transition=PROPS.map(function(p){return p+" .4s cubic-bezier(.4,0,.2,1)"}).join(",");
    PROPS.forEach(function(p){el.style.setProperty(p,"0px")});
  }
  el.classList.remove("in");
  el._t=setTimeout(function(){
    el.hidden=true; el.classList.remove("closing"); clearInline(el); if(done) done();
  },inl?420:380);
}
// Fenster (Projekt und About) schieben sich von unten hoch und beginnen auf der oberen Linie (1/3): Die oberste Zeile bleibt frei und scrollbar.
// Die Oberkante setzt main.js als --sheet-top (nur Desktop; auf dem Handy bleibt das Fenster wie bisher fast bildschirmfüllend).
function setSheetTop(){var r=mainEl.getBoundingClientRect(); document.documentElement.style.setProperty("--sheet-top",(r.top+mainEl.clientHeight/3).toFixed(1)+"px")}
window.addEventListener("resize",setSheetTop);
setSheetTop();
// Im offenen Projekt zum vorigen/nächsten Projekt (in der Reihenfolge der gerade sichtbaren Kacheln)
function stepWork(dir){
  var vis=[]; tileEls.forEach(function(t,k){if(!t.classList.contains("out")) vis.push(k)});
  if(vis.length<2||cur_i<0) return;
  var p=vis.indexOf(cur_i); if(p<0) p=0;
  var ni=vis[(p+dir+vis.length)%vis.length];
  openWork(ni);
  var tr=tileEls[ni].getBoundingClientRect(), ml=mainEl.getBoundingClientRect().left;   // Kachel bei Bedarf ins Bild scrollen
  if(tr.left<ml||tr.right>window.innerWidth) scrollMainTo((scrollAnim?scrollTgt:mainEl.scrollLeft)+tr.left-ml-40);
}
// Überschrift: Wo sie über einem Bild liegt, ist sie orange, sonst blau (auch zur Hälfte). Dafür liegt eine orange Kopie genau über der blauen
// und wird mit clip-path auf die Fläche der Bilder zugeschnitten.
var hdHost=document.getElementById("dTitle").parentNode, hdO=document.createElement("div"); hdO.className="hd-o"; hdO.setAttribute("aria-hidden","true"); hdHost.appendChild(hdO);
function headOver(){
  if(detail.hidden) return;
  var t=document.getElementById("dTitle"), y=document.getElementById("dYear");
  if(hdO._k!==t.textContent+"|"+y.textContent){
    hdO._k=t.textContent+"|"+y.textContent; hdO.innerHTML="";
    [t,y].forEach(function(n){var c=n.cloneNode(true); c.removeAttribute("id"); hdO.appendChild(c)});
  }
  var H=hdHost.getBoundingClientRect(), d="";
  detail.querySelectorAll(".d-main img,.d-main video,.d-sec-main img,.d-sec-main video,.d-thumbs img,.d-thumbs video").forEach(function(m){
    var q=m.getBoundingClientRect(); if(q.width<=0||q.height<=0) return;
    var x1=Math.max(q.left,H.left)-H.left, y1=Math.max(q.top,H.top)-H.top, x2=Math.min(q.right,H.right)-H.left, y2=Math.min(q.bottom,H.bottom)-H.top;
    if(x2>x1&&y2>y1) d+="M"+x1.toFixed(1)+" "+y1.toFixed(1)+"H"+x2.toFixed(1)+"V"+y2.toFixed(1)+"H"+x1.toFixed(1)+"Z";
  });
  hdO.style.clipPath=d?'path("'+d+'")':"inset(0 100% 0 0)";
}
detail.addEventListener("scroll",headOver,{passive:true});
window.addEventListener("resize",headOver);
function show(n){
  slide=(n+imgs.length)%imgs.length;
  dImg.innerHTML=imgs[slide]?mediaTag(imgs[slide],"",true):"";
  dCount.textContent=(slide+1)+" / "+imgs.length;
  thumbAR(document.querySelector("#detail .d-main")); setTimeout(headOver,60);   // das große Bild behält sein echtes Format (Desktop)
  Array.prototype.forEach.call(dThumbs.children,function(b,k){b.classList.toggle("on",k===slide)});
}
function openWork(i){
  var w=works[i], d=w[4]||{};
  closeAbout(); cur_i=i; setWide(false);
  imgs=d.images||(w[3]?[w[3]]:[null,null,null,null]);
  document.querySelector(".d-main").classList.toggle("multi",imgs.length>1);
  var ex=d.extra;   // zweiter Bereich: Text links, zweites großes Foto rechts
  if(ex&&ex.images&&ex.images.length){
    dSec.hidden=false; dSecLabel.textContent=ex.label||""; dSecText.textContent=ex.text||""; imgs2=ex.images;
    dSecMain.classList.toggle("multi",imgs2.length>1);
    dSecThumbs.innerHTML=""; dSecThumbs.hidden=imgs2.length<2;   // Vorschaubilder untereinander, wie bei den oberen Fotos
    imgs2.forEach(function(src,k){
      var b=document.createElement("button"); b.type="button"; b.setAttribute("aria-label","Bild "+(k+1));
      b.innerHTML=mediaTag(src); thumbAR(b); b.addEventListener("click",function(){show2(k)}); dSecThumbs.appendChild(b);
    });
    show2(0);
  }else dSec.hidden=true;
  dTitle.textContent=w[0]; dYear.textContent=w[1];
  dText.textContent=d.text||"Hier steht die Beschreibung des Projekts: Aufgabe, Vorgehen und Ergebnis. Ersetze diesen Text in js/main.js.";
  dThumbs.innerHTML="";
  imgs.forEach(function(src,k){
    var b=document.createElement("button"); b.type="button"; b.setAttribute("aria-label","Bild "+(k+1));
    if(src){b.innerHTML=mediaTag(src); thumbAR(b)}
    b.addEventListener("click",function(){show(k)});
    dThumbs.appendChild(b);
  });
  // Desktop: alle Bilder (auch die des zweiten Bereichs) untereinander in der linken Fläche, jedes in seinem echten Format
  var dStack=document.getElementById("dStack"); dStack.innerHTML="";
  imgs.concat(ex&&ex.images?ex.images:[]).forEach(function(src){
    var f=document.createElement("div"); f.className="d-st"; if(src) f.innerHTML=mediaTag(src,"",true); dStack.appendChild(f);
  });
  var tiles=tileEls;
  if(detail.parentNode!==document.body) document.body.appendChild(detail);
  panelIn(detail); detail.scrollTop=0;
  setSheetTop(); setTimeout(headOver,800);
  document.body.classList.add("open");
  Array.prototype.forEach.call(tiles,function(t,k){t.classList.toggle("active",k===i)});
  show(0);
}
function closeWork(){
  if(typeof lf!=="undefined") lf.classList.remove("on");if(typeof ic!=="undefined") ic.classList.remove("on","edge","lens");
  panelOut(detail,function(){ if(cur_i<0) document.body.appendChild(detail); });
  document.body.classList.remove("open");
  tileEls.forEach(function(t){t.classList.remove("active")});
  cur_i=-1; setWide(false);
}
document.getElementById("dClose").addEventListener("click",closeWork);
document.getElementById("pPrev").addEventListener("click",function(){stepWork(-1)});
document.getElementById("pNext").addEventListener("click",function(){stepWork(1)});
// Laptop: Klick am Rand des Projektfensters (dort zeigt der Punkt einen Pfeil) = Projekt weiter. Läuft vor dem Foto-Blättern.
window.addEventListener("click",function(e){
  if(cur_i<0||detail.hidden||detail.classList.contains("wide")||!matchMedia("(hover:hover)").matches) return;
  if(!detail.contains(e.target)||e.target.closest("button,a")) return;
  var L=detail.getBoundingClientRect(), pz=e.clientX<L.left+64?-1:(e.clientX>L.right-64?1:0);
  if(!pz) return;
  e.stopImmediatePropagation(); e.preventDefault(); stepWork(pz);
},true);
document.getElementById("dPrev").addEventListener("click",function(){show(slide-1)});
document.getElementById("dNext").addEventListener("click",function(){show(slide+1)});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&!about.hidden){closeAbout();return}
  if(cur_i<0) return;
  if(e.key==="Escape") detail.classList.contains("wide")?setWide(false):closeWork();
  if(e.key==="ArrowLeft") show(slide-1);
  if(e.key==="ArrowRight") show(slide+1);
});

// Doppelklick (oder Doppeltippen) aufs große Foto: auf alle 4 Spalten vergrößern, nochmal = zurück
function setWide(on){
  detail.classList.toggle("wide",on); document.body.classList.toggle("wide",on);
  setTimeout(function(){if(typeof applyZoom==="function") applyZoom(); if(typeof fitName==="function") fitName()},400);
}
// Runder Foto-Cursor (Maus): in der Mitte ein Kreis, am linken/rechten Bildrand ein blauer Kreis mit orangenem Pfeil
var ic=document.createElement("div"), icZone=0, dMain=document.querySelector(".d-main");
ic.className="imgcursor"; ic.setAttribute("aria-hidden","true"); ic.innerHTML='<span class="arr"></span>'; document.body.appendChild(ic);
var icArr=ic.firstChild;
// Füllung der Lupe: eigenes Element, das Weiß weiß lässt und dunkle Schrift blau färbt (der Rand bleibt dadurch sichtbar)
var lf=mkInv(44);   // im offenen Projekt: Schrift im Kreis wird blau, der Kreis selbst orange
window.addEventListener("pointermove",function(e){
  if(e.pointerType==="touch") return;   // Touch regelt der Abschnitt darunter
  if(typeof light!=="undefined"&&!light.hidden) return;   // im Vollbild steuert das Vollbild den Pfeil im Punkt
  var dw=e.target.closest&&e.target.closest("#detail,#about"), inDet=dw&&!dw.hidden&&matchMedia("(hover:hover)").matches;   // Projektfenster und About
  if(!inDet){ic.classList.remove("on","edge","lens"); lf.classList.remove("on"); icZone=0; return}
  // Im offenen Projekt hängt der Kreis immer an der Maus. Auf dem Foto: kleiner Kreis mit Pfeil am Rand.
  // Sonst: größerer Kreis, in dem alle Schrift blau wird.
  var dm=e.target.closest(".d-main"), onPhoto=dm&&!e.target.closest("button"), onThumb=e.target.closest(".d-thumbs");
  ic.style.translate=e.clientX+"px "+e.clientY+"px";   // nicht transform: sonst würde das Vergrößern (scale) die Position mitskalieren
  if(onPhoto){
    var r=dm.getBoundingClientRect(), f=(e.clientX-r.left)/r.width;
    icZone=dm.classList.contains("multi")?(f<0.18?-1:(f>0.82?1:0)):0;
    if(icZone) icArr.textContent=icZone<0?"\u2190":"\u2192";
  }else icZone=0;
  // Am äußersten linken/rechten Rand des Projektfensters: Pfeil im Punkt = vorheriges/nächstes Projekt
  if(dw.id==="detail"&&!dw.classList.contains("wide")&&!e.target.closest("button,a")){
    var L=dw.getBoundingClientRect(), pz=e.clientX<L.left+64?-1:(e.clientX>L.right-64?1:0);
    if(pz){icZone=pz; icArr.textContent=pz<0?"\u2190":"\u2192"}
  }
  ic.classList.add("on"); ic.classList.toggle("edge",icZone!==0);
  var lensOn=true;   // auch auf Fotos und Vorschaubildern: invertierter Kreis ic.classList.toggle("lens",lensOn);
  lf.style.translate=e.clientX+"px "+e.clientY+"px"; lf.classList.toggle("on",lensOn);
});
document.addEventListener("pointerleave",function(){if(typeof light!=="undefined"&&!light.hidden) return; ic.classList.remove("on","edge","lens"); lf.classList.remove("on"); icZone=0});
// Handy: keine Pfeile auf dem Foto. Drückt man auf den linken/rechten Rand, erscheint der Kreis mit Pfeil über dem Finger,
// und ein Tipp dort blättert ein Bild weiter (Tipp in der Mitte: Bild groß, Wischen blättert wie bisher).
var tap={x:0,y:0,zone:0,moved:false}, noClick=0;
function hideTapCircle(){ic.classList.remove("on","edge")}
// Tatsächlich sichtbarer Bildbereich: im Vollbild liegt das Foto mit Rand um sich herum (contain), die Randfelder gelten nur auf dem Foto
function photoRect(){
  var r=dMain.getBoundingClientRect(), im=dImg.querySelector("img");
  if(!im||!im.naturalWidth||!detail.classList.contains("wide")) return r;
  var s=Math.min(r.width/im.naturalWidth,r.height/im.naturalHeight), w=im.naturalWidth*s, h=im.naturalHeight*s;
  return {left:r.left+(r.width-w)/2, top:r.top+(r.height-h)/2, width:w, height:h};
}
document.getElementById("dX").addEventListener("click",function(e){e.stopPropagation(); setWide(false)});
dMain.addEventListener("touchstart",function(e){
  if(e.target.closest("button")){tap.zone=0; return}
  var t=e.touches[0], r=photoRect(), f=(t.clientX-r.left)/r.width;
  var inside=t.clientX>=r.left&&t.clientX<=r.left+r.width&&t.clientY>=r.top&&t.clientY<=r.top+r.height;
  tap.x=t.clientX; tap.y=t.clientY; tap.moved=false;
  tap.zone=(inside&&e.touches.length===1&&dMain.classList.contains("multi"))?(f<0.22?-1:(f>0.78?1:0)):0;
  if(tap.zone){
    icArr.textContent=tap.zone<0?"\u2190":"\u2192";
    ic.style.translate=t.clientX+"px "+(t.clientY-56)+"px";   // über dem Finger, damit er den Kreis nicht verdeckt
    ic.classList.add("on","edge");
  }
},{passive:true});
dMain.addEventListener("touchmove",function(e){
  var t=e.touches[0];
  if(Math.abs(t.clientX-tap.x)>10||Math.abs(t.clientY-tap.y)>10){tap.moved=true; hideTapCircle()}
},{passive:true});
dMain.addEventListener("touchend",function(){
  if(tap.zone&&!tap.moved){show(slide+tap.zone); noClick=Date.now()}
  tap.zone=0; setTimeout(hideTapCircle,160);
},{passive:true});
dMain.addEventListener("touchcancel",function(){tap.zone=0; hideTapCircle()},{passive:true});
// Vollbild-Ansicht (Desktop): Doppelklick auf ein Foto zeigt es bildschirmfüllend und komplett (nichts abgeschnitten).
// Weiterblättern durch alle Fotos des Projekts: Klick auf das linke/rechte Drittel (dort zeigt der Punkt einen Pfeil) oder Pfeiltasten.
// Schließen: ×, Klick daneben oder Esc. Das × hat die übliche Farbgebung (blau mit oranger Schrift, im blauen Modus umgekehrt).
var light=document.createElement("div"); light.className="light"; light.hidden=true;
light.innerHTML='<button class="light-x" type="button" aria-label="Schließen">×</button><div class="light-in"></div><div class="light-n"></div>';
document.body.appendChild(light);
var lightIn=light.querySelector(".light-in"), lightN=light.querySelector(".light-n"), lightList=[], lightI=0;
function srcOf(el){var m=el&&(el.matches&&el.matches("img,video")?el:el.querySelector("img,video")); return m?(m.getAttribute("src")||"").replace(/^images\//,""):""}
function lightShow(i){
  if(!lightList.length) return;
  lightI=(i+lightList.length)%lightList.length;
  lightIn.innerHTML=mediaTag(lightList[lightI],"",true);
  var v=lightIn.querySelector("video"); if(v){v.controls=true; v.play&&v.play()}
  lightN.textContent=lightList.length>1?(lightI+1)+" / "+lightList.length:"";
}
function openLight(src){
  if(!src) return;
  lightList=(imgs||[]).concat(dSec.hidden?[]:(imgs2||[])).filter(Boolean);
  var k=lightList.indexOf(src); if(k<0){lightList=[src]; k=0}
  lightShow(k); light.hidden=false; void light.offsetHeight; light.classList.add("in");
}
function closeLight(){
  if(light.hidden) return;
  light.classList.remove("in"); ic.classList.remove("on","edge"); lz=0; setTimeout(function(){light.hidden=true; lightIn.innerHTML=""},260);
}
var lz=0;
function lightZone(x){var w=window.innerWidth; return lightList.length>1?(x<w*0.22?-1:(x>w*0.78?1:0)):0}
light.addEventListener("pointermove",function(e){
  if(e.pointerType==="touch") return;
  lz=e.target.closest(".light-x")?0:lightZone(e.clientX);
  ic.style.translate=e.clientX+"px "+e.clientY+"px";
  if(lz){icArr.textContent=lz<0?"\u2190":"\u2192"; ic.classList.add("on","edge")} else ic.classList.remove("on","edge");
});
light.addEventListener("pointerleave",function(){ic.classList.remove("on","edge"); lz=0});
light.addEventListener("click",function(e){
  if(e.target.closest(".light-x")){closeLight(); return}
  var z=lightZone(e.clientX); if(z){lightShow(lightI+z); return}
  if(!e.target.closest(".light-in img,.light-in video")) closeLight();
});
window.addEventListener("keydown",function(e){
  if(light.hidden) return;
  if(e.key==="Escape"){e.stopImmediatePropagation(); closeLight()}
  else if(e.key==="ArrowLeft"){e.stopImmediatePropagation(); lightShow(lightI-1)}
  else if(e.key==="ArrowRight"){e.stopImmediatePropagation(); lightShow(lightI+1)}
},true);
detail.addEventListener("dblclick",function(e){   // kleine Bilder in der Mitte
  if(mq.matches) return;
  var b=e.target.closest(".d-thumbs button"); if(b) openLight(srcOf(b));
});
var lastP=0;
dImg.addEventListener("click",function(){
  if(Date.now()-noClick<600) return;   // dieser Tipp war schon ein Blättern am Rand
  if(mq.matches){setWide(!detail.classList.contains("wide")); return}   // Handy: ein Tipp = nur das Bild groß, nochmal = zurück
  if(icZone&&matchMedia("(hover:hover)").matches){show(slide+icZone); return}   // Bildrand: ein Bild weiter blättern (kein Doppelklick-Warten, ändert nie die Spalten)
  var now=Date.now();
  if(now-lastP<350){openLight(srcOf(dImg)); lastP=0} else lastP=now;   // Doppelklick = Vollbild
});

// About: öffnet die rechten zwei Spalten
var about=document.getElementById("about"), aboutBtn=document.getElementById("aboutBtn");
function openAbout(){
  setSheetTop();
  if(cur_i>=0) closeWork();
  if(mq.matches){   // Handy: der Block aus Name und Untertitel rutscht nach ganz oben, darunter erscheint der About-Text
    var pr=document.createElement("div"); pr.style.cssText="position:fixed;top:var(--top);left:0;width:1px;height:1px;visibility:hidden";
    document.body.appendChild(pr); var topY=pr.getBoundingClientRect().top+10; pr.remove();
    var cur=document.body.classList.contains("about-m")?parseFloat(document.documentElement.style.getPropertyValue("--abs"))||0:0;
    var nT=nameEl.getBoundingClientRect().top+cur, rB=(roleEl?roleEl.getBoundingClientRect().bottom:nameEl.getBoundingClientRect().bottom)+cur;
    var D=Math.max(0,nT-topY);
    document.documentElement.style.setProperty("--abs",D.toFixed(1)+"px");
    document.documentElement.style.setProperty("--about-top",(rB-D+16).toFixed(1)+"px");
    document.body.classList.add("about-m");
  }else{   // Desktop: Das About-Fenster deckt die beiden unteren Zeilen ab, der Block aus Name und Untertitel rutscht in die oberste Zeile
    var cur2=document.body.classList.contains("about-m")?parseFloat(document.documentElement.style.getPropertyValue("--abs"))||0:0;
    var mr=mainEl.getBoundingClientRect(), nT2=nameEl.getBoundingClientRect().top+cur2;
    var D2=Math.max(0,Math.min(mainEl.clientHeight/3,nT2-(mr.top+12)));   // höchstens eine Zeile hoch, nie aus dem Bild
    document.documentElement.style.setProperty("--abs",D2.toFixed(1)+"px");
    document.body.classList.add("about-m");
  }
  panelIn(about); about.scrollTop=0;
  document.body.classList.add("open"); aboutBtn.setAttribute("aria-expanded","true");
}
function closeAbout(){
  if(about.hidden||about.classList.contains("closing")) return;
  panelOut(about); document.body.classList.remove("open"); document.body.classList.remove("about-m"); aboutBtn.setAttribute("aria-expanded","false");
}
aboutBtn.addEventListener("click",function(){(about.hidden||about.classList.contains("closing"))?openAbout():closeAbout()});
document.getElementById("aClose").addEventListener("click",closeAbout);

// Kategorien: mehrere wählbar (blau mit weißer Schrift), die Projekte werden danach gefiltert.
// "Nach Jahr": Zeitstrahl, neueste Jahre oben, älteste unten, Jahreszahl mittig an einer unsichtbaren Linie.
var catSel=[], timeline=false, catBtns=document.querySelectorAll(".cat[data-cat]"), chips=document.getElementById("chips"),
    sideTab=document.getElementById("sideTab"), yearBtn=document.getElementById("sortYear");
function renderChips(){
  chips.innerHTML="";
  function mk(label,fn){
    var b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=label+" ×";
    b.setAttribute("aria-label",label+" entfernen"); b.addEventListener("click",fn); chips.appendChild(b);
  }
  catSel.forEach(function(c){
    var b=document.querySelector('.cat[data-cat="'+c+'"]');
    mk(b?b.textContent.trim():c,function(){toggleCat(c)});
  });
  if(timeline) mk("Nach Jahr",toggleYear);
  document.documentElement.classList.toggle("haschips",catSel.length>0||timeline);
}
function layout(){
  if(grid.contains(detail)) document.body.appendChild(detail);
  grid.classList.toggle("timeline",timeline);
  Array.prototype.forEach.call(grid.querySelectorAll(".yearlabel"),function(l){l.remove()});
  yearEls={};
  if(timeline){
    works.forEach(function(w,k){
      if(tileEls[k].classList.contains("out")||yearEls[w[1]]) return;
      var lab=document.createElement("div"); lab.className="yearlabel"; lab.textContent=w[1]; grid.appendChild(lab); yearEls[w[1]]=lab;
    });
  }
  applyZoom();
}
// Kacheln ordnen sich animiert um (FLIP): alte Position messen, Layout ändern, von der alten Position gleiten lassen
function flip(change){
  if(reduce){change(); return}
  var first=new Map();
  tileEls.forEach(function(t){ if(t.offsetParent!==null) first.set(t,t.getBoundingClientRect()) });
  change();
  var k=0;
  tileEls.forEach(function(t){
    if(t.offsetParent===null) return;
    var r=t.getBoundingClientRect(), f=first.get(t), delay=Math.min(k++*32,520);
    if(!f){
      t.animate([{opacity:0,transform:"translateY(26px) scale(.96)"},{opacity:1,transform:"none"}],
        {duration:1000,delay:delay,easing:"cubic-bezier(.16,1,.3,1)",fill:"backwards"});
      return;
    }
    var dx=f.left-r.left, dy=f.top-r.top, s=r.width?f.width/r.width:1;
    if(Math.abs(dx)<1&&Math.abs(dy)<1&&Math.abs(s-1)<.01) return;
    t.animate([{transformOrigin:"0 0",transform:"translate("+dx+"px,"+dy+"px) scale("+s+")"},{transformOrigin:"0 0",transform:"none"}],
      {duration:1200,delay:delay,easing:"cubic-bezier(.16,1,.3,1)"});
  });
}
var catRun=0;
function applyCats(){
  Array.prototype.forEach.call(catBtns,function(x){
    var on=catSel.indexOf(x.dataset.cat)>-1; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on);
  });
  renderChips();
  var run=++catRun;
  var want=tileEls.map(function(t){return catSel.length>0&&catSel.indexOf(t.dataset.cat)<0});
  var leaving=tileEls.filter(function(t,k){return want[k]&&t.offsetParent!==null});
  function go(){
    if(run!==catRun) return;
    flip(function(){
      tileEls.forEach(function(t,k){t.classList.toggle("out",want[k])});
      if(cur_i>=0&&tileEls[cur_i].classList.contains("out")) closeWork();
      layout();
    });
  }
  if(leaving.length&&!reduce){
    var n=0;
    leaving.forEach(function(t){
      var a=t.animate([{opacity:1,transform:"none"},{opacity:0,transform:"scale(.94)"}],{duration:450,easing:"ease-in",fill:"forwards"});
      a.onfinish=function(){a.cancel(); if(++n===leaving.length) go()};
    });
  }else go();
}
function toUnten(){scrollMainTo(worksEl.offsetLeft)}   // zum Anfang der Arbeiten (heißt noch so aus der Zeit des senkrechten Scrollens)
function toggleCat(c){
  var k=catSel.indexOf(c); if(k>-1) catSel.splice(k,1); else catSel.push(c);
  applyCats(); toUnten();
}
function toggleYear(){
  timeline=!timeline; yearBtn.classList.toggle("on",timeline); yearBtn.setAttribute("aria-pressed",timeline);
  renderChips(); flip(layout); toUnten();
}
function closeCats(){document.body.classList.remove("catopen"); sideTab.setAttribute("aria-expanded","false")}
Array.prototype.forEach.call(catBtns,function(b){
  b.addEventListener("click",function(){toggleCat(b.dataset.cat); closeCats()});
});
yearBtn.addEventListener("click",function(){toggleYear(); closeCats()});
// Handy: Tippen auf die schmale Spalte öffnet sie, Tippen daneben schließt sie wieder
sideTab.addEventListener("click",function(e){
  e.stopPropagation(); document.body.classList.add("catopen"); sideTab.setAttribute("aria-expanded","true");
});
document.addEventListener("click",function(e){
  if(document.body.classList.contains("catopen")&&!e.target.closest(".cat")) closeCats();
});
mq.addEventListener("change",closeCats);
// Maus: die Kategorien-Leiste klappt von selbst auf, sobald man draufkommt, und wieder zu, wenn man sie verlässt
var sideEl=document.querySelector(".side"), sideT=0;
sideEl.addEventListener("pointerenter",function(e){
  if(e.pointerType!=="mouse"||mq.matches) return;
  clearTimeout(sideT); document.body.classList.add("catopen"); sideTab.setAttribute("aria-expanded","true");
});
sideEl.addEventListener("pointerleave",function(e){
  if(e.pointerType!=="mouse"||mq.matches) return;
  clearTimeout(sideT); sideT=setTimeout(closeCats,180);
});

// Variable Schrift für den Namen: die Dicke ändert sich mit der Fenstergröße,
// die Schriftgröße füllt immer die Breite (Handy: zwei Zeilen untereinander)
var heroEl=document.getElementById("start"), nameEl=document.getElementById("name"), fitRaf=0;
// Fußlinie-Messpunkt: ein unsichtbares Element auf der Grundlinie der Schrift, damit sich Name und Untertitel an den Linien ausrichten lassen
function addProbe(parent){var b=document.createElement("span"); b.className="bl"; b.setAttribute("aria-hidden","true"); parent.appendChild(b)}
// Unterzeile: ebenfalls Buchstabe für Buchstabe (für den blauen Hover)
var roleEl=document.querySelector(".role");
if(roleEl){
  var rt=roleEl.textContent; roleEl.setAttribute("aria-label",rt); roleEl.textContent="";
  var rw=document.createElement("span"); rw.className="w"; rw.setAttribute("aria-hidden","true");   // Maske (Schlitz) und Schicht, die hochfährt
  var rwi=document.createElement("span"); rwi.className="wi"; rw.appendChild(rwi); roleEl.appendChild(rw);
  rt.split("").forEach(function(ch){
    var s=document.createElement("span"); s.className="ch"; s.textContent=ch; rwi.appendChild(s);
  });
  addProbe(rwi);
}
// jeden Buchstaben des Namens einzeln ansprechbar machen (für den Hover)
nameEl.setAttribute("aria-label",nameEl.textContent.replace(/\s+/g," ").trim());
Array.prototype.forEach.call(nameEl.querySelectorAll(".w"),function(wd){
  var t=wd.textContent; wd.textContent=""; wd.setAttribute("aria-hidden","true");
  var wi=document.createElement("span"); wi.className="wi"; wd.appendChild(wi);   // wi = Schicht, die durch den Schlitz hochfährt
  t.split("").forEach(function(ch){
    var s=document.createElement("span"); s.className="ch";
    if(ch==="i"){   // i in zwei Lagen: Punkt und Stamm (i ohne Punkt), damit der Punkt allein hüpfen kann
      s.classList.add("i");
      s.innerHTML='<span class="dot">i</span><span class="stem" aria-hidden="true">\u0131</span>';
    }else s.textContent=ch;
    wi.appendChild(s);
  });
  addProbe(wi);
});
// Karussell: Kopie der Startseite am Ende der Arbeiten (ohne IDs, nur zum Anschauen)
var hero2=heroEl.cloneNode(true);
hero2.removeAttribute("id"); hero2.setAttribute("aria-hidden","true");
Array.prototype.forEach.call(hero2.querySelectorAll("[id]"),function(n){n.removeAttribute("id")});
hero2.querySelector(".name").classList.add("done"); (hero2.querySelector(".role")||document.body).classList.add("done");
mainEl.appendChild(hero2); heroIO.observe(hero2);
function syncHero2(){   // Größe und Schriftdicke wie beim Original
  var n2=hero2.querySelector(".name"), r2=hero2.querySelector(".role");
  n2.style.cssText=nameEl.style.cssText; if(r2&&roleEl) r2.style.cssText=roleEl.style.cssText;
  var w1=nameEl.querySelectorAll(".w"), w2=n2.querySelectorAll(".w");   // die Ausrichtung an den Linien übernehmen
  n2.classList.toggle("stk",nameEl.classList.contains("stk"));
  Array.prototype.forEach.call(w1,function(w,k){if(w2[k]){w2[k].style.translate=w.style.translate; w2[k].style.setProperty("--wbl",w.style.getPropertyValue("--wbl"))}});
  var rw1=roleEl&&roleEl.querySelector(".w"), rw2=r2&&r2.querySelector(".w"); if(rw1&&rw2) rw2.style.translate=rw1.style.translate;
}
function clamp01(x){return Math.max(0,Math.min(1,x))}
function fitName(){
  var w=window.innerWidth, hh=window.innerHeight;
  var tw=clamp01((w-360)/(1800-360)), th=clamp01((hh-420)/(1100-420));
  nameEl.style.setProperty("--wt",tw.toFixed(3));   // 0 = schmales Fenster (fett), 1 = breites Fenster (dünn)
  // Header und Kategorien: gleiche Schrift, Dicke gedämpft (500 bis 700), damit kleine Texte lesbar bleiben
  var rs=document.documentElement.style;
  rs.setProperty("--ui-wght",(700-200*th).toFixed(0));          // Dicke 500 bis 700
  nameEl.style.fontSize="100px";
  var cs=getComputedStyle(heroEl), avail=heroEl.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  var size=0.85*100*avail/nameEl.offsetWidth;   // Name füllt 85 % der Breite (1 = ganze Breite)
  nameEl.style.fontSize=size+"px";
  var maxH=hh*0.5;                                              // nicht höher als die halbe Fensterhöhe
  if(nameEl.offsetHeight>maxH) nameEl.style.fontSize=(size*maxH/nameEl.offsetHeight)+"px";
  // Untertitel: immer in einer Zeile, höchstens so breit wie der Name (auch wenn der Name auf dem Handy zweizeilig
  // übereinander steht). Die Schrift wird dafür kleiner, auf großen Fenstern bleibt sie bei 18 px.
  if(roleEl){
    var nw=nameEl.offsetWidth;
    roleEl.style.setProperty("--wt",tw.toFixed(3));
    roleEl.style.whiteSpace="nowrap"; roleEl.style.width="max-content"; roleEl.style.maxWidth="none";
    roleEl.style.fontSize="100px";
    var rw100=roleEl.offsetWidth;
    var cap=400;   // keine feste Obergrenze mehr: der Untertitel ist so breit wie der Name
    var rwf=mq.matches?0.85:0.55;   // Untertitel so breit wie dieser Anteil des Namens: mehr Kontrast, der Name steht trotzdem nicht zu sehr im Fokus
    roleEl.style.fontSize=Math.max(9,Math.min(cap,100*nw*rwf/rw100))+"px";
    roleEl.style.marginTop=(-0.07*parseFloat(nameEl.style.fontSize))+"px";
  }
  alignToLines();
  syncHero2();
}
// Die Linien teilen die Höhe in Drittel. Der Name sitzt mit seiner Grundlinie auf der oberen Linie
// (Handy: "Chiara" auf der oberen, "Kwade" auf der unteren), der Untertitel auf der unteren Linie.
var capCtx_=null, alignBusy=false;
function alignToLines(){
  var words=nameEl.querySelectorAll(".w"), rw=roleEl&&roleEl.querySelector(".w");
  nameEl.classList.add("measure"); if(roleEl) roleEl.classList.add("measure");   // Einfahr-Animation beim Messen kurz ausblenden
  Array.prototype.forEach.call(words,function(w){w.style.translate=""}); if(rw) rw.style.translate="";
  var hr=heroEl.getBoundingClientRect(), H=heroEl.clientHeight, stacked=words.length&&getComputedStyle(words[0]).display==="block";
  function base(el){var b=el.querySelector(".bl"); return b?b.getBoundingClientRect().top-hr.top:null}
  // Desktop: Der Untertitel sitzt auf der unteren Linie (2/3), der Name direkt darüber, also zwischen den beiden Linien.
  // Handy: die Wörter des Namens sitzen auf den Linien 1/3 und 2/3.
  var rfs=roleEl?parseFloat(roleEl.style.fontSize||16):0, nfs=parseFloat(nameEl.style.fontSize||100);
  // Versalhöhen werden gemessen (Zeichen "H" in der echten Schrift), damit die Abstände bei jeder Fenstergröße passen
  var capCtx=capCtx_||(capCtx_=document.createElement("canvas").getContext("2d"));
  // sichtbare Ober- und Unterlängen des echten Textes (Tinte, nicht Zeilenhöhe), damit der Block optisch genau mittig sitzt
  function ink(el,px,txt){try{var cs2=getComputedStyle(el); capCtx.font=cs2.fontWeight+" "+px+"px "+cs2.fontFamily; var m=capCtx.measureText(txt);
    if(m.actualBoundingBoxAscent>px*0.4) return {a:m.actualBoundingBoxAscent, d:Math.max(0,m.actualBoundingBoxDescent)}}catch(e){} return {a:px*0.72, d:px*0.2}}
  var nI=ink(nameEl,nfs,nameEl.textContent.replace(/\s+/g," ").trim()), rI=roleEl?ink(roleEl,rfs,roleEl.textContent.trim()):{a:0,d:0};
  var nameCap=nI.a, roleCap=rI.a, roleDesc=rI.d, nameDesc=nI.d;
  var gapVis=Math.max(rfs*0.3,nfs*0.05), lineGap=nfs*0.07;   // sichtbarer Abstand Name zu Untertitel bzw. zwischen den Namenszeilen (Handy)
  // Handy (Wörter übereinander): die letzte Zeile ("Kwade") sitzt genau wie auf dem Desktop knapp über dem Untertitel,
  // die Zeilen darüber folgen im natürlichen Zeilenabstand, der ganze Name bleibt also zwischen den Linien.
  var bs=Array.prototype.map.call(words,base), lastB=bs[bs.length-1], firstB=bs[0];
  // Name + Untertitel bilden zusammen einen Block, der mittig zwischen den beiden Linien sitzt (Mitte = H/2)
  var nl=stacked?words.length:1;   // Zeilen des Namens: Desktop eine (beide Wörter nebeneinander), Handy zwei
  var step=nameCap+nameDesc+lineGap, nameSpan=(nl-1)*step+nameCap+nameDesc;
  var blockH=roleEl?nameSpan+gapVis+roleCap+roleDesc:nameSpan;
  // Passt der Block nicht zwischen die beiden Linien (z. B. auf dem Handy mit zwei Namenszeilen), wird alles passend verkleinert
  if(blockH>H/3*0.86&&!alignBusy){
    var f=H/3*0.86/blockH; alignBusy=true;
    nameEl.style.fontSize=(nfs*f).toFixed(2)+"px"; if(roleEl) roleEl.style.fontSize=(rfs*f).toFixed(2)+"px";
    nameEl.classList.remove("measure"); if(roleEl) roleEl.classList.remove("measure");
    alignToLines(); alignBusy=false; return;
  }
  var firstBase=H/2-blockH/2+nameCap, roleBase=firstBase+(nl-1)*step+nameDesc+gapVis+roleCap;
  Array.prototype.forEach.call(words,function(w,k){
    if(bs[k]===null||lastB===null) return;
    w.style.translate="0 "+(firstBase+(stacked?k*step:0)-bs[k]).toFixed(1)+"px";
  });
  if(rw){var br=base(rw); if(br!==null){
    var tg=roleBase;   // Untertitel unten im mittig sitzenden Block
    rw.style.translate="0 "+(tg-br).toFixed(1)+"px"}}
  // Ursprung der Verkleinerung: die Grundlinie, damit der Name beim Schmalerwerden auf seiner Linie sitzen bleibt
  nameEl.classList.toggle("stk",!!stacked);
  var nr=nameEl.getBoundingClientRect(), b0=words.length&&words[0].querySelector(".bl");
  if(b0) nameEl.style.setProperty("--bl",(b0.getBoundingClientRect().top-nr.top).toFixed(1)+"px");
  Array.prototype.forEach.call(words,function(w){var bp=w.querySelector(".bl"), wr=w.getBoundingClientRect(); if(bp) w.style.setProperty("--wbl",(bp.getBoundingClientRect().top-wr.top).toFixed(1)+"px")});
  nameEl.style.setProperty("--push",(roleEl?(roleCap+roleDesc+gapVis)/2:0).toFixed(1)+"px");   // so weit sitzt der Name zu Beginn tiefer; der Untertitel drückt ihn dann hoch
  nameEl.classList.remove("measure"); if(roleEl) roleEl.classList.remove("measure");
}
// Start-Effekt: beide Zeilen des Namens fahren gleichzeitig von unten durch einen Schlitz hoch
if(!reduce){nameEl.classList.add("pre"); if(roleEl) roleEl.classList.add("pre");}   // Name und Untertitel zunächst unter dem Schlitz
// Danach: der Punkt des i bounced zweimal. 1. Sprung etwas höher, er landet anders herum geneigt,
// 2. Sprung niedriger, er landet wieder in der ursprünglichen Lage.
function bounceDot(){
  var dot=nameEl.querySelector(".ch.i .dot");
  if(!dot||reduce||!dot.animate) return;
  var fs=parseFloat(getComputedStyle(nameEl).fontSize), N=14, T=0, tilt=16, fr=[];
  function add(t,y,r){fr.push({t:t,y:y,r:r})}
  function arc(dur,h,r0,r1){
    for(var k=1;k<=N;k++){var u=k/N, e=u*u*(3-2*u); add(T+dur*u,-4*h*u*(1-u),r0+(r1-r0)*e)}
    T+=dur;
  }
  add(0,0,0);
  arc(440,fs*0.42,0,tilt); add(T+60,0,tilt); T+=60;     // 1. Sprung (höher), Landung geneigt
  arc(340,fs*0.28,tilt,0);                               // 2. Sprung (niedriger), Landung wieder gerade
  dot.animate(fr.map(function(f){return {transform:"translateY("+f.y+"px) rotate("+f.r+"deg)",offset:f.t/T}}),{duration:T,easing:"linear"});
}
function startRise(){requestAnimationFrame(function(){requestAnimationFrame(function(){
  nameEl.classList.add("go");
  var first=nameEl.querySelector(".wi");
  if(first) first.addEventListener("transitionend",function(){nameEl.classList.add("done"); if(!roleEl) setTimeout(bounceDot,250)},{once:true});
  if(roleEl){   // Untertitel folgt kurz danach
    roleEl.classList.add("go");
    setTimeout(function(){   // Während der Untertitel hochfährt, wird der Name schmaler und weniger hoch (beide bleiben einzeilig)
      nameEl.classList.add("shrink"); var n2=hero2.querySelector(".name"); if(n2) n2.classList.add("shrink");
    },700);
    var rf=roleEl.querySelector(".wi");
    if(rf) rf.addEventListener("transitionend",function(){roleEl.classList.add("done"); setTimeout(bounceDot,250); setTimeout(function(){ballApi.drop()},1500)},{once:true});
  }
})})}
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(startRise); else startRise();
function queueFit(){cancelAnimationFrame(fitRaf); fitRaf=requestAnimationFrame(fitName)}
window.addEventListener("resize",queueFit);
if(document.fonts){document.fonts.ready.then(fitName); document.fonts.addEventListener("loadingdone",fitName)}
fitName();

// Handy: im Foto nach links/rechts wischen blättert durch die Bilder (auch im Großbild).
// Dabei kommt ein blauer Punkt weich hinter dem Finger her.
var swX=0, dot=document.createElement("div"), dotRun=false, dotT=0, dX=0, dY=0, tX=0, tY=0;
dot.className="swipe-dot"; dot.setAttribute("aria-hidden","true"); document.body.appendChild(dot);
function dotLoop(){
  dX+=(tX-dX)*.18; dY+=(tY-dY)*.18;
  dot.style.translate=dX+"px "+dY+"px";
  if(dotRun) requestAnimationFrame(dotLoop);
}
function dotStart(t){
  clearTimeout(dotT); tX=dX=t.clientX; tY=dY=t.clientY;
  dot.classList.add("on"); if(!dotRun){dotRun=true; dotLoop()}
}
function dotEnd(){
  dot.classList.remove("on");
  dotT=setTimeout(function(){dotRun=false},400);
}
dImg.addEventListener("touchstart",function(e){
  swX=e.touches[0].clientX; if(mq.matches) dotStart(e.touches[0]);
},{passive:true});
dImg.addEventListener("touchmove",function(e){tX=e.touches[0].clientX; tY=e.touches[0].clientY},{passive:true});
dImg.addEventListener("touchend",function(e){
  var dx=e.changedTouches[0].clientX-swX;
  if(Math.abs(dx)>50) show(slide+(dx<0?1:-1));
  dotEnd();
},{passive:true});
dImg.addEventListener("touchcancel",dotEnd,{passive:true});

// Startseite: nur der Name. Header, Footer und Kategorien erscheinen, sobald man anfängt, nach rechts zu scrollen.
function updateIntro(){document.body.classList.toggle("intro",mainEl.scrollLeft<=8)}
mainEl.addEventListener("scroll",updateIntro,{passive:true});
updateIntro();
initZoom();   // erst jetzt: alles, was die Kachelplatzierung braucht, ist definiert
layout();

// Zweites großes Foto (Bereich "Ausstellung"): Maus = Klick am Bildrand, Handy = Wischen oder Tippen auf den Rand
var lastP2=0;
dSecImg.addEventListener("click",function(){
  if(Date.now()-noClick<600) return;
  if(icZone&&matchMedia("(hover:hover)").matches){show2(slide2+icZone); return}   // Bildrand: blättern
  if(mq.matches) return;                                                           // Handy: kein Großbild für dieses Foto
  var now=Date.now();
  if(now-lastP2<350){openLight(srcOf(dSecImg)); lastP2=0} else lastP2=now;   // Doppelklick = Vollbild
});
(function(){
  var s={x:0,y:0,zone:0,moved:false};
  dSecMain.addEventListener("touchstart",function(e){
    var t=e.touches[0], r=dSecMain.getBoundingClientRect(), f=(t.clientX-r.left)/r.width;
    s.x=t.clientX; s.y=t.clientY; s.moved=false;
    s.zone=(e.touches.length===1&&imgs2.length>1)?(f<0.22?-1:(f>0.78?1:0)):0;
    if(s.zone){icArr.textContent=s.zone<0?"\u2190":"\u2192"; ic.style.translate=t.clientX+"px "+(t.clientY-56)+"px"; ic.classList.add("on","edge")}
  },{passive:true});
  dSecMain.addEventListener("touchmove",function(e){
    var t=e.touches[0];
    if(Math.abs(t.clientX-s.x)>10||Math.abs(t.clientY-s.y)>10){s.moved=true; hideTapCircle()}
  },{passive:true});
  dSecMain.addEventListener("touchend",function(e){
    var dx=e.changedTouches[0].clientX-s.x;
    if(s.zone&&!s.moved){show2(slide2+s.zone); noClick=Date.now()}
    else if(imgs2.length>1&&Math.abs(dx)>50&&Math.abs(e.changedTouches[0].clientY-s.y)<60) show2(slide2+(dx<0?1:-1));
    s.zone=0; setTimeout(hideTapCircle,160);
  },{passive:true});
  dSecMain.addEventListener("touchcancel",function(){s.zone=0; hideTapCircle()},{passive:true});
})();

// Klick auf den Namen öffnet About (nochmal klicken schließt es wieder)
document.addEventListener("click",function(e){
  if(!glyphHit(e.target,e.clientX,e.clientY)) return;
  (about.hidden||about.classList.contains("closing"))?openAbout():closeAbout();
});

// About-Blase: über dem Namen erscheint an der Maus eine Kreis-Blase mit "about" (Größe: width/height in style.css, .bubble)
var bubble=document.createElement("div"); bubble.className="bubble"; bubble.setAttribute("aria-hidden","true"); bubble.textContent="about"; document.body.appendChild(bubble); var bubInv=mkInv(60);   // Kreis dahinter: invertiert wie die anderen
window.addEventListener("pointermove",function(e){
  var hit=e.pointerType==="mouse"&&glyphHit(e.target,e.clientX,e.clientY)&&matchMedia("(hover:hover)").matches, on=hit&&about.hidden;
  document.body.classList.toggle("hidecur",!!hit);   // Mauszeiger nur ausblenden, wenn die Blase da ist oder sein könnte
  if(on){bubble.style.translate=e.clientX+"px "+e.clientY+"px"; bubInv.style.translate=e.clientX+"px "+e.clientY+"px"}
  bubble.classList.toggle("on",!!on); bubInv.classList.toggle("on",!!on);
});
document.addEventListener("pointerleave",function(){bubble.classList.remove("on"); bubInv.classList.remove("on")});
document.addEventListener("click",function(){bubble.classList.remove("on"); bubInv.classList.remove("on")});

// Antippbares (Links, Buttons, Kacheln): Kreis an der Maus, invertiert (Fläche orange, Schrift blau). Im offenen Projekt und auf dem Namen gelten andere Kreise.
var tapInv=mkInv(44);
function tapOff(){tapInv.classList.remove("on")}
window.addEventListener("pointermove",function(e){
  var t=e.target, on=e.pointerType==="mouse"&&t.closest&&t.closest("a,button")&&!t.closest("#detail,#about")&&!glyphHit(t,e.clientX,e.clientY)&&matchMedia("(hover:hover)").matches;
  if(on){tapInv.style.translate=e.clientX+"px "+e.clientY+"px"; tapInv.classList.add("on")}
  else tapOff();
});
document.addEventListener("pointerleave",tapOff);


// Die orange Kugel: Sobald Name und Untertitel da sind, fällt sie von oben herein und pendelt sich leicht über dem "e" von "Kwade" ein.
// Alles, was sie überdeckt, wird invertiert (orange/blau). Ein Klick auf die Kugel setzt sie in Bewegung:
// auf dem Handy rollt sie mit der Neigung des Telefons (iPhones fragen einmal nach Erlaubnis), am Rechner folgt sie federnd der Maus.
// Ein weiterer Klick auf die Kugel schickt sie zurück auf ihren Platz. Größe: Faktor 0.11 bei "R=" unten.
var ballApi=(function(){
  var desk=matchMedia("(hover:hover)").matches&&!matchMedia("(pointer:coarse)").matches;   // Laptop/Rechner mit Maus
  // Handy: Die blaue Outline bleibt am Ruheplatz wie ein Loch. Rollt man die Kugel zurück hinein, ruckeln die Buchstaben, alles wird orange/blau und die Kugel sitzt wieder fest.
var hole=document.createElement("div"); hole.className="ballhole"; hole.setAttribute("aria-hidden","true"); document.body.appendChild(hole);
var away=false, sinkPending=false, blueByBall=false;
function sinkEffect(){
  var letters=document.querySelectorAll(".name .ch,.role .ch");
  Array.prototype.forEach.call(letters,function(l){
    l.style.setProperty("--jx",((Math.random()-.5)*.14).toFixed(3)+"em"); l.style.setProperty("--jy",((Math.random()-.5)*.14).toFixed(3)+"em");
    l.style.setProperty("--jd",(Math.random()*.25).toFixed(2)+"s");
  });
  document.body.classList.add("shake");
  setTimeout(function(){document.body.classList.add("blue"); blueByBall=true},180);
  setTimeout(function(){document.body.classList.remove("shake")},1100);
}
var BALL_STOPS=0;   // Zwischenlandungen auf dem Weg zur Maus (0 = Kugel fliegt direkt vom "e" zur Maus; 2 bis 4 = hüpft über Buchstaben und Linien)
  var BALL_FOLLOW=190;   // wie schnell der Punkt der Maus folgt (höher = schneller)
  var hp=[], hi=0, hT0=0, hDur=500, hFx=0, hFy=0, hArc=80;
  var ball=mkInv(40,"ballel"), R=20, hits=0, nextHop=0, hopStart=-1, st="hidden", x=0,y=0,vx=0,vy=0, gx=0,gy=0, b0=null, mx=-1,my=-1, last=0, raf=0, tiltOn=false, capC=null;
  function rest(){   // Ruheplatz: rechts unten am "e", die Kugel liegt auf der Grundlinie des Namens
    var chs=nameEl.querySelectorAll(".ch"), e=chs[chs.length-1]; if(!e) return null;
    var w=e.closest(".w")||nameEl, pb=w.querySelector(".bl"), r=e.getBoundingClientRect(); if(!pb) return null;
    var fs=parseFloat(getComputedStyle(nameEl).fontSize)||100, xh=fs*0.5;
    try{capC=capC||document.createElement("canvas").getContext("2d"); var cs=getComputedStyle(nameEl); capC.font=cs.fontWeight+" "+fs+"px "+cs.fontFamily; var m=capC.measureText("x").actualBoundingBoxAscent; if(m>fs*0.25) xh=m}catch(err){}
    R=Math.max(14,Math.min(34,fs*0.11));
    if(desk&&(st==="free"||st==="hop")) R=22;   // als Mauspunkt immer so groß wie die anderen Punkte (44 px)
    return {x:r.right-R*0.15, y:pb.getBoundingClientRect().top-R*0.9};
  }
  function bounds(){var t=mainEl.getBoundingClientRect(); return {l:R, r:window.innerWidth-R, t:t.top+R, b:t.bottom-R}}
  function tilt(ev){
    if(ev.gamma==null||ev.beta==null) return; tiltOn=true;
    if(b0===null) b0=ev.beta>20?ev.beta:45;                       // Ausgangslage: so, wie das Handy beim Einschalten gehalten wird
    gx=Math.sin(Math.max(-60,Math.min(60,ev.gamma))*Math.PI/180);
    gy=Math.sin(Math.max(-60,Math.min(60,ev.beta-b0))*Math.PI/180);
  }
  window.addEventListener("pointermove",function(ev){mx=ev.clientX; my=ev.clientY},{passive:true});
  function startHops(){
    st="hop"; hopStart=-1; hp=[]; hi=0;
    var n=BALL_STOPS, chs=nameEl.querySelectorAll(".ch"), fs=parseFloat(getComputedStyle(nameEl).fontSize)||100, mt=mainEl.getBoundingClientRect(), Hm=mainEl.clientHeight;
    for(var k=0;k<n;k++){
      if(Math.random()<0.6&&chs.length){   // auf einen zufälligen Buchstaben des Namens
        var c=chs[Math.floor(Math.random()*chs.length)], w=c.closest(".w")||nameEl, pb=w.querySelector(".bl"), r=c.getBoundingClientRect();
        if(pb){hp.push({x:r.left+r.width/2, y:pb.getBoundingClientRect().top-fs*0.55-22}); continue}
      }
      var ly=mt.top+Hm*(Math.random()<.5?1:2)/3-22;   // oder auf eine der beiden Linien
      hp.push({x:window.innerWidth*(0.12+Math.random()*0.76), y:ly});
    }
    hp.push({mouse:true});
    hFx=x; hFy=y; hT0=0; hDur=n?520:700; hArc=n?60+Math.random()*50:110;
  }
  function draw(){ball.setD(R*2); ball.style.translate=x.toFixed(1)+"px "+y.toFixed(1)+"px"}
  function loop(t){
    var dt=Math.min(.04,(t-(last||t))/1000); last=t;
    var rp=rest();
    if(st==="drop"&&rp){
      // 1. Aufprall auf der oberen Linie (Drittel), danach fällt die Kugel weiter und kommt rechts unten am "e" zur Ruhe
      var mt=mainEl.getBoundingClientRect(), lineY=mt.top+mainEl.clientHeight/3-R, floor=(hits===0&&lineY<rp.y-R)?lineY:rp.y;
      vy+=3000*dt; y+=vy*dt;
      if(hits>0) x+=(rp.x-x)*Math.min(1,7*dt); else x=rp.x-R*4;
      if(y>=floor){y=floor; if(vy>150){vy=-vy*(hits===0?0.5:0.4); hits++} else {vy=0; st="rest"}}
    }else if(st==="rest"&&rp){
      // Solange niemand sie angeklickt hat, hüpft die Kugel ab und zu zweimal hoch und runter (Pause 3,5 bis 6 s), um auf sich aufmerksam zu machen
      var off=0;
      if(!reduce){
        if(!nextHop) nextHop=t+2500;
        if(hopStart<0&&t>=nextHop) hopStart=t;
        if(hopStart>=0){
          var u=(t-hopStart)/800;
          if(u>=1){hopStart=-1; nextHop=t+3500+Math.random()*2500}
          else if(u<.6){var v=u/.6; off=R*1.6*4*v*(1-v)}
          else{var v2=(u-.6)/.4; off=R*0.7*4*v2*(1-v2)}
        }
      }
      x=rp.x; y=rp.y-off;
      if(desk&&mx>=0){startHops()}   // Laptop: sobald die Maus sich bewegt, hüpft die Kugel zu ihr und folgt ihr dann
    }
    else if(st==="back"&&rp){
      vx+=((rp.x-x)*60-vx*14)*dt; vy+=((rp.y-y)*60-vy*14)*dt; x+=vx*dt; y+=vy*dt;
      if(Math.hypot(rp.x-x,rp.y-y)<1.5&&Math.hypot(vx,vy)<30){st="rest"; vx=vy=0; if(sinkPending){sinkPending=false; sinkEffect()}}
    }else if(st==="hop"){
      // Weg zur Maus in mehreren Sprüngen; Zwischenlandungen auf zufälligen Buchstaben oder auf den Linien
      var wp=hp[hi], tx=wp.mouse?mx:wp.x, ty=wp.mouse?my:wp.y, u=(t-hT0)/hDur;
      if(u>=1){
        x=tx; y=ty; hi++;
        if(hi>=hp.length){st="free"; vx=vy=0; document.body.classList.add("ballcur")}
        else{hFx=x; hFy=y; hT0=t+90+Math.random()*120; hDur=380+Math.random()*180; hArc=40+Math.random()*70}
      }else if(u>=0){x=hFx+(tx-hFx)*u; y=hFy+(ty-hFy)*u-hArc*4*u*(1-u)}
    }else if(st==="free"){
      var B=desk?{l:0,r:window.innerWidth,t:0,b:window.innerHeight}:bounds();
      if(tiltOn){vx+=gx*2600*dt; vy+=gy*2600*dt; vx*=1-1.1*dt; vy*=1-1.1*dt}   // Handy: rollt mit der Neigung, leichte Reibung
      else if(mx>=0){var kf=BALL_FOLLOW, df=2*Math.sqrt(kf)*0.9; vx+=((mx-x)*kf-vx*df)*dt; vy+=((my-y)*kf-vy*df)*dt}        // Rechner: folgt der Maus mit leichter Federung
      if(!desk&&tiltOn&&rp){   // Handy: zurück in die Outline gerollt = Kugel fällt ins Loch
        var dd=Math.hypot(x-rp.x,y-rp.y), vv=Math.hypot(vx,vy);
        if(dd>R*2.5) away=true;
        if(away&&dd<R*0.8&&vv<1100){away=false; sinkPending=true; st="back"; window.removeEventListener("deviceorientation",tilt); tiltOn=false}
      }
      var sp=Math.hypot(vx,vy), mxs=desk?6000:2000; if(sp>mxs){vx*=mxs/sp; vy*=mxs/sp}
      x+=vx*dt; y+=vy*dt;
      if(x<B.l){x=B.l; vx=Math.abs(vx)*.55} else if(x>B.r){x=B.r; vx=-Math.abs(vx)*.55}
      if(y<B.t){y=B.t; vy=Math.abs(vy)*.55} else if(y>B.b){y=B.b; vy=-Math.abs(vy)*.55}
    }
    if(desk&&st==="free"&&typeof ic!=="undefined") ic.style.translate=x.toFixed(1)+"px "+y.toFixed(1)+"px";   // der Pfeil am Bildrand erscheint direkt in der Kugel
    if(!desk&&rp){hole.style.setProperty("--d",(R*2)+"px"); hole.style.translate=rp.x.toFixed(1)+"px "+rp.y.toFixed(1)+"px"; hole.classList.toggle("on",st!=="hidden"&&st!=="drop")}
    draw(); raf=requestAnimationFrame(loop);
  }
  function drop(){
    if(st!=="hidden") return; var rp=rest(); if(!rp) return;
    R=R||20; x=rp.x-R*4; hits=0; ball.classList.add("on");
    if(reduce){y=rp.y; st="rest"} else {y=mainEl.getBoundingClientRect().top-R*2; vy=0; st="drop"}
    last=0; raf=requestAnimationFrame(loop);
  }
  // Klick auf die Kugel (vor allen anderen Klicks, auch vor dem "About" auf dem Namen)
  window.addEventListener("click",function(ev){
    if(desk||(st!=="rest"&&st!=="free")) return;   // am Laptop braucht es keinen Klick
    if(Math.hypot(ev.clientX-x,ev.clientY-y)>R+10) return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    hopStart=-1; nextHop=0;
    if(st==="free"){st="back"; window.removeEventListener("deviceorientation",tilt); tiltOn=false; return}
    var D=window.DeviceOrientationEvent, coarse=matchMedia("(pointer:coarse)").matches;
    function go(){st="free"; vx=vy=gx=gy=0; b0=null; away=false; if(blueByBall){document.body.classList.remove("blue"); blueByBall=false}; if(coarse) window.addEventListener("deviceorientation",tilt)}
    if(coarse&&D&&typeof D.requestPermission==="function"){D.requestPermission().then(function(r){go()}).catch(function(){go()})}   // iPhone: Erlaubnis nötig
    else go();
  },true);
  setTimeout(drop,reduce?800:6000);   // Sicherheitsnetz, falls die Einfahr-Animation nicht meldet, dass sie fertig ist
  return {drop:drop};
})();
