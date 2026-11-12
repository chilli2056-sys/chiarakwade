// Arbeiten: [Titel, Jahr, Seitenverhältnis (Breite/Höhe), Titelbild aus images/ (optional), Details (optional), Kategorie (Webdesign, Branding oder Illustration)]
// Details: {text:"Beschreibung", images:["a.jpg","b.jpg","c.jpg"]}
// Beispiel: ["Mein Projekt","2026",1.25,"projekt-1.jpg"]
var works=[
 ["Was vom Hafen bleibt","2026",1.67,"was-vom-hafen-bleibt.png",{
   text:"Webdesign, Masterarbeit. wasvomhafenbleibt.de ist ein kollektives Erinnerungsarchiv: Fotos, Hafenreste, Arbeitsorte und Zusammenkünfte werden auf einer Karte des Hafens gesammelt und lassen sich nach Kategorien wie Zoll oder Gleissysteme entdecken.",
   images:["was-vom-hafen-bleibt.png","was-vom-hafen-bleibt-mockup.png"]},"Webdesign"],
 ["Projekt eins","2026",1.25],["Projekt zwei","2026",0.8],["Projekt drei","2025",1],["Projekt vier","2025",1.5],
 ["Projekt fünf","2025",0.75],["Projekt sechs","2024",1.2],["Projekt sieben","2024",1],["Projekt acht","2024",0.85],
 ["Projekt neun","2023",1.4],["Projekt zehn","2023",0.8],["Projekt elf","2023",1.1],["Projekt zwölf","2022",1]
];
for(var i=13;i<=24;i++) works.push(["Projekt "+i,String(2022-Math.floor((i-13)/4)),[1,1.25,.8,1.4,.75,1.1][i%6]]);
var CATS=["Webdesign","Branding","Illustration"];
works.forEach(function(w,k){ if(!w[5]) w[5]=CATS[k%3]; });
var grid=document.getElementById("grid"), lastT=0, lastI=-1, tileEls=[];
works.forEach(function(w,i){
  var f=document.createElement("figure"); f.className="work"; f.dataset.cat=w[5];
  var media=w[3]?'<img class="img" src="images/'+w[3]+'" alt="'+w[0]+'" style="aspect-ratio:'+w[2]+'">'
    :'<div class="img" style="aspect-ratio:'+w[2]+'"></div>';
  var ht=w[3]?'<span class="ht" aria-hidden="true"><img src="images/'+w[3]+'" alt=""></span>':'<span class="ht ph" aria-hidden="true"></span>';
  f.innerHTML='<a href="#arbeiten">'+media+ht+'</a>'+
    '<figcaption>'+w[0]+'<span>'+w[1]+'</span></figcaption>';
  f.querySelector("a").addEventListener("click",function(e){
    e.preventDefault();
    var now=Date.now(), dbl=(lastI===i&&now-lastT<350); lastT=now; lastI=i;
    if(dbl){ if(cur_i!==i) openWork(i); setWide(true); }   // Doppelklick: Foto groß auf alle 4 Spalten
    else cur_i===i?closeWork():openWork(i);
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
  if(last.closest&&last.closest(".d-main")&&matchMedia("(hover:hover)").matches&&!last.closest("button")){cur.classList.remove("on"); return}
  var inBar=last.closest&&last.closest(".bar:not(.side)");
  var link=last.closest&&last.closest("a,button");
  var empty=/^(HTML|BODY|MAIN|SECTION|DIV|HEADER|FOOTER|ASIDE|NAV)$/.test(last.tagName)&&!last.classList.contains("img")&&!last.closest(".work");
  if(link){cur.textContent="tap me"}
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
window.addEventListener("scroll",function(){if(last){last=document.elementFromPoint(px,py)||last;update()}},{passive:true});
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
new IntersectionObserver(function(en){inHero=en[0].intersectionRatio>0.5;update()},{threshold:[0,.5,1]}).observe(hero);
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

// Zoom per Strg+Mausrad, Trackpad-Pinch oder Zwei-Finger-Geste. Spalten im Hintergrund bleiben (Desktop 4, Handy 2), nur die Projektgröße ändert sich.
// Die Zahl ist, wie viele Projekte nebeneinander stehen: weniger = näher ran, mehr = weiter raus.
var mq=matchMedia("(max-width:760px)"), levels=[1,2,4,8,12], idx=2;
function applyZoom(){
  var n=levels[idx];
  grid.style.setProperty("--n",n);
  grid.classList.toggle("dense",grid.clientWidth/n<170);
}
function initZoom(){
  levels=mq.matches?[1,2,4,6]:[1,2,4,8,12];
  idx=levels.indexOf(mq.matches?2:4);
  applyZoom();
}
function step(d){var k=Math.max(0,Math.min(levels.length-1,idx+d)); if(k!==idx){idx=k;flip(applyZoom)}}
// Maus/Trackpad: Strg (Mac: Cmd/Pinch) + Mausrad. Rein = weniger Projekte nebeneinander
var wacc=0, wlast=0;
window.addEventListener("wheel",function(e){
  if(!e.ctrlKey) return;
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
window.addEventListener("resize",applyZoom);
initZoom();

// Projekt-Fenster mit Diashow, Text und Vorschaubildern
var detail=document.getElementById("detail"), dTitle=document.getElementById("dTitle"), dYear=document.getElementById("dYear"),
    dImg=document.getElementById("dImg"), dCount=document.getElementById("dCount"), dText=document.getElementById("dText"),
    dThumbs=document.getElementById("dThumbs");
var cur_i=-1, slide=0, imgs=[];

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
function show(n){
  slide=(n+imgs.length)%imgs.length;
  dImg.innerHTML=imgs[slide]?'<img src="images/'+imgs[slide]+'" alt="">':"";
  dCount.textContent=(slide+1)+" / "+imgs.length;
  Array.prototype.forEach.call(dThumbs.children,function(b,k){b.classList.toggle("on",k===slide)});
}
function openWork(i){
  var w=works[i], d=w[4]||{};
  closeAbout(); cur_i=i; setWide(false);
  imgs=d.images||(w[3]?[w[3]]:[null,null,null,null]);
  document.querySelector(".d-main").classList.toggle("multi",imgs.length>1);
  dTitle.textContent=w[0]; dYear.textContent=w[1];
  dText.textContent=d.text||"Hier steht die Beschreibung des Projekts: Aufgabe, Vorgehen und Ergebnis. Ersetze diesen Text in js/main.js.";
  dThumbs.innerHTML="";
  imgs.forEach(function(src,k){
    var b=document.createElement("button"); b.type="button"; b.setAttribute("aria-label","Bild "+(k+1));
    if(src) b.innerHTML='<img src="images/'+src+'" alt="">';
    b.addEventListener("click",function(){show(k)});
    dThumbs.appendChild(b);
  });
  var tiles=tileEls;
  if(detail.parentNode!==document.body) document.body.appendChild(detail);
  panelIn(detail); detail.scrollTop=0;
  document.body.classList.add("open");
  Array.prototype.forEach.call(tiles,function(t,k){t.classList.toggle("active",k===i)});
  show(0);
}
function closeWork(){
  panelOut(detail,function(){ if(cur_i<0) document.body.appendChild(detail); });
  document.body.classList.remove("open");
  tileEls.forEach(function(t){t.classList.remove("active")});
  cur_i=-1; setWide(false);
}
document.getElementById("dClose").addEventListener("click",closeWork);
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
window.addEventListener("pointermove",function(e){
  if(e.pointerType==="touch") return;   // Touch regelt der Abschnitt darunter
  var over=e.target.closest&&e.target.closest(".d-main")&&!e.target.closest("button")&&matchMedia("(hover:hover)").matches;
  if(!over){ic.classList.remove("on","edge"); icZone=0; return}
  var r=dMain.getBoundingClientRect(), f=(e.clientX-r.left)/r.width;
  icZone=dMain.classList.contains("multi")?(f<0.18?-1:(f>0.82?1:0)):0;
  ic.style.translate=e.clientX+"px "+e.clientY+"px";   // nicht transform: sonst würde das Vergrößern (scale) die Position mitskalieren
  if(icZone) icArr.textContent=icZone<0?"\u2190":"\u2192";
  ic.classList.add("on"); ic.classList.toggle("edge",icZone!==0);
});
document.addEventListener("pointerleave",function(){ic.classList.remove("on","edge"); icZone=0});
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
var lastP=0;
dImg.addEventListener("click",function(){
  if(Date.now()-noClick<600) return;   // dieser Tipp war schon ein Blättern am Rand
  if(mq.matches){setWide(!detail.classList.contains("wide")); return}   // Handy: ein Tipp = nur das Bild groß, nochmal = zurück
  if(icZone&&matchMedia("(hover:hover)").matches){show(slide+icZone); return}   // Bildrand: ein Bild weiter blättern (kein Doppelklick-Warten, ändert nie die Spalten)
  var now=Date.now();
  if(now-lastP<350){setWide(!detail.classList.contains("wide")); lastP=0} else lastP=now;   // Mitte: Doppelklick = groß
});

// About: öffnet die rechten zwei Spalten
var about=document.getElementById("about"), aboutBtn=document.getElementById("aboutBtn");
function openAbout(){
  if(cur_i>=0) closeWork();
  panelIn(about); about.scrollTop=0;
  document.body.classList.add("open"); aboutBtn.setAttribute("aria-expanded","true");
}
function closeAbout(){
  if(about.hidden||about.classList.contains("closing")) return;
  panelOut(about); document.body.classList.remove("open"); aboutBtn.setAttribute("aria-expanded","false");
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
  grid.innerHTML="";
  if(!timeline){
    tileEls.forEach(function(t){grid.appendChild(t)});
  }else{
    var years={};
    works.forEach(function(w,k){
      var t=tileEls[k]; if(t.classList.contains("out")) return;
      (years[w[1]]=years[w[1]]||[]).push(t);
    });
    Object.keys(years).sort(function(a,b){return b-a}).forEach(function(y){
      var band=document.createElement("div"); band.className="band";
      years[y].forEach(function(t){band.appendChild(t)});
      var lab=document.createElement("div"); lab.className="yearlabel"; lab.textContent=y;
      grid.appendChild(band); grid.appendChild(lab);
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
    var r=t.getBoundingClientRect(), f=first.get(t), delay=Math.min(k++*14,220);
    if(!f){
      t.animate([{opacity:0,transform:"translateY(26px) scale(.96)"},{opacity:1,transform:"none"}],
        {duration:520,delay:delay,easing:"cubic-bezier(.16,1,.3,1)",fill:"backwards"});
      return;
    }
    var dx=f.left-r.left, dy=f.top-r.top, s=r.width?f.width/r.width:1;
    if(Math.abs(dx)<1&&Math.abs(dy)<1&&Math.abs(s-1)<.01) return;
    t.animate([{transformOrigin:"0 0",transform:"translate("+dx+"px,"+dy+"px) scale("+s+")"},{transformOrigin:"0 0",transform:"none"}],
      {duration:600,delay:delay,easing:"cubic-bezier(.16,1,.3,1)"});
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
      var a=t.animate([{opacity:1,transform:"none"},{opacity:0,transform:"scale(.94)"}],{duration:220,easing:"ease-in",fill:"forwards"});
      a.onfinish=function(){a.cancel(); if(++n===leaving.length) go()};
    });
  }else go();
}
function toUnten(){document.getElementById("arbeiten").scrollIntoView({behavior:"smooth"})}
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

// Variable Schrift für den Namen: die Dicke ändert sich mit der Fenstergröße,
// die Schriftgröße füllt immer die Breite (Handy: zwei Zeilen untereinander)
var heroEl=document.getElementById("start"), nameEl=document.getElementById("name"), fitRaf=0;
// Unterzeile: ebenfalls Buchstabe für Buchstabe (für den blauen Hover)
var roleEl=document.querySelector(".role");
if(roleEl){
  var rt=roleEl.textContent; roleEl.setAttribute("aria-label",rt); roleEl.textContent="";
  var rw=document.createElement("span"); rw.className="w"; rw.setAttribute("aria-hidden","true");   // Maske (Schlitz) und Schicht, die hochfährt
  var rwi=document.createElement("span"); rwi.className="wi"; rw.appendChild(rwi); roleEl.appendChild(rw);
  rt.split("").forEach(function(ch){
    var s=document.createElement("span"); s.className="ch"; s.textContent=ch; rwi.appendChild(s);
  });
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
});
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
  var size=0.85*100*avail/nameEl.offsetWidth;                   // Name füllt 85 % der Breite (1 = ganze Breite)
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
    var cap=Math.max(14,Math.min(18,w*0.013));
    roleEl.style.fontSize=Math.max(9,Math.min(cap,100*nw/rw100))+"px";
    roleEl.style.marginTop=(-0.07*parseFloat(nameEl.style.fontSize))+"px";
  }
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
    var rf=roleEl.querySelector(".wi");
    if(rf) rf.addEventListener("transitionend",function(){roleEl.classList.add("done"); setTimeout(bounceDot,250)},{once:true});
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

// Startseite: nur der Name. Header, Footer, Kategorien und Spaltenlinien erscheinen, sobald man anfängt zu scrollen.
function updateIntro(){document.body.classList.toggle("intro",window.scrollY<=8)}
window.addEventListener("scroll",updateIntro,{passive:true});
updateIntro();
