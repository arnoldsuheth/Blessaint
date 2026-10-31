/* BLESSAINT Business · abertura e efeitos (31/10/2026, padrão da Gestão Evolution)
   Abertura: a tela inteira se enche de pontos dourados, que se juntam (de fora para dentro)
   e formam a logo; a logo acende, a frase aparece e tudo se desfaz para o app. Um toque pula.
   Efeitos dentro do app: logo de partículas no Início (foge do mouse/dedo), nome decodificando,
   números contando e brilho na logo do topo. */
(function(){
 var quieto=false;try{quieto=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
 var LOGO='../img/logo-business-v3.png';
 function carregaLogo(cb){var im=new Image();im.onload=function(){cb(im)};im.onerror=function(){cb(null)};im.src=LOGO}
 // pontos da logo (amostra da imagem) dentro de uma caixa de largura W
 function pontos(im,larg,passo){var c=document.createElement('canvas');var h=Math.round(larg*im.height/im.width);c.width=larg;c.height=h;var x=c.getContext('2d');x.drawImage(im,0,0,larg,h);
  var d=x.getImageData(0,0,larg,h).data,out=[];for(var y=0;y<h;y+=passo)for(var i=0;i<larg;i+=passo){var k=(y*larg+i)*4;if(d[k+3]>120){var r=d[k],g=d[k+1],b=d[k+2];out.push({x:i,y:y,c:(r>200&&g>190&&b>170)?'#f3ead7':'#d4ac5e'})}}
  return {pts:out,w:larg,h:h}}
 function frase(){var h=new Date().getHours();return h>=5&&h<12?'Bom dia. Que Deus abençoe o seu trabalho.':h>=12&&h<18?'Boa tarde. Que Deus abençoe o seu trabalho.':'Boa noite. Que Deus abençoe o seu descanso.'}
 var css=`
#bb-abre{position:fixed;inset:0;z-index:2147483000;background:radial-gradient(ellipse at 50% 45%,#1d1608,#050403 70%);cursor:pointer;transition:opacity .8s ease,transform .8s cubic-bezier(.7,0,.3,1),filter .8s}
#bb-abre canvas{position:absolute;inset:0;width:100%;height:100%}
#bb-abre .marca{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(78vw,560px);opacity:0;pointer-events:none}
#bb-abre .marca img{width:100%;height:auto;display:block}
#bb-abre.acende .marca{animation:bbAcende .9s ease-out forwards}
#bb-abre .anel{position:absolute;left:50%;top:46%;width:min(70vmin,560px);height:min(70vmin,560px);margin:calc(min(70vmin,560px)/-2);border-radius:50%;border:1.5px solid #e3c47f;opacity:0;pointer-events:none}
#bb-abre.acende .anel{animation:bbOnda 1.4s ease-out both}
#bb-abre .frase{position:absolute;left:0;right:0;top:calc(46% + min(26vw,190px));text-align:center;padding:0 24px;font:500 clamp(13px,2vw,16px)/1.5 Montserrat,system-ui,sans-serif;letter-spacing:.06em;color:#e9dcc0;opacity:0}
#bb-abre.acende .frase{animation:bbSurge .8s ease .6s forwards}
#bb-abre .pular{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:calc(18px + env(safe-area-inset-bottom));font:600 10px/1 Montserrat,system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.45)}
#bb-abre.sai{opacity:0;transform:scale(1.12);filter:blur(6px);pointer-events:none}
@keyframes bbAcende{0%{opacity:0;filter:brightness(3) drop-shadow(0 0 40px #fff)}100%{opacity:1;filter:drop-shadow(0 0 22px rgba(227,196,127,.45))}}
@keyframes bbOnda{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.5)}}
@keyframes bbSurge{to{opacity:.9}}
`;
 function abertura(){
  if(document.getElementById('bb-abre'))return;
  var st=document.createElement('style');st.id='bb-abre-css';st.textContent=css;document.head.appendChild(st);
  var el=document.createElement('div');el.id='bb-abre';el.setAttribute('role','presentation');
  el.innerHTML='<canvas></canvas><span class="anel"></span><div class="marca"><img src="'+LOGO+'" alt="BLESSAINT Business"></div><p class="frase">'+frase()+'</p><span class="pular">toque para pular</span>';
  document.body.appendChild(el);
  var acabou=false,ts=[],raf=0;
  function fim(){if(acabou)return;acabou=true;ts.forEach(clearTimeout);cancelAnimationFrame(raf);el.classList.add('sai');setTimeout(function(){try{dispatchEvent(new Event('bb-replay'))}catch(e){}},200);setTimeout(function(){el.remove();st.remove()},850)}
  el.addEventListener('click',fim);
  if(quieto){el.classList.add('acende');ts.push(setTimeout(fim,1600));return}
  carregaLogo(function(im){if(acabou)return;
   var cv=el.querySelector('canvas'),ctx=cv.getContext('2d');var W=innerWidth,H=innerHeight,dpr=Math.min(2,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
   var larg=Math.min(W*.78,560),alvo=im?pontos(im,Math.round(larg),Math.max(3,Math.round(larg/150))):{pts:[],w:0,h:0};
   var ox=(W-alvo.w)/2,oy=H*.46-alvo.h/2;
   var passo=W<700?12:15,cores=['#5a4419','#8a6a2f','#c9a45c','#e3c47f','#f3ead7'],ps=[];
   for(var y=passo/2;y<H;y+=passo)for(var x=passo/2;x<W;x+=passo){var dist=Math.hypot(x-W/2,y-H/2)/Math.hypot(W/2,H/2);ps.push({sx:x,sy:y,tx:x,ty:y,c:cores[(Math.random()*5)|0],tc:'',fica:false,dl:dist})}
   ps.sort(function(){return Math.random()-.5});
   alvo.pts.forEach(function(a,i){var p=ps[i%ps.length];p.tx=ox+a.x;p.ty=oy+a.y;p.tc=a.c;p.fica=true});
   var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};var t0=performance.now(),acendeu=false;
   function f(now){var t=(now-t0)/1000;ctx.clearRect(0,0,W,H);
    for(var i=0;i<ps.length;i++){var p=ps[i];var a=Math.min(1,Math.max(0,(t-p.dl*.6)/.3));var x=p.sx,y=p.sy,c=p.c,r=2.1,al=a*(.45+.55*Math.pow(Math.sin(t*5+p.sx*.04+p.sy*.03),2));
     var ti=Math.min(1,Math.max(0,(t-1.0-(1-p.dl)*.5)/1.15));
     if(ti>0){var e=ease(ti);if(p.fica){x=p.sx+(p.tx-p.sx)*e;y=p.sy+(p.ty-p.sy)*e;c=ti>.6?p.tc:p.c;r=2.1;al=.95}else{x=p.sx+(W/2-p.sx)*e*.85;y=p.sy+(H*.46-p.sy)*e*.85;al=a*(1-e)}}
     if(al<.02)continue;ctx.globalAlpha=al;ctx.fillStyle=c;ctx.fillRect(x-r/2,y-r/2,r,r)}
    ctx.globalAlpha=1;
    if(t>2.55&&!acendeu){acendeu=true;el.classList.add('acende')}
    if(t>2.55){cv.style.opacity=String(Math.max(0,1-(t-2.55)/.6))}
    if(t<3.4)raf=requestAnimationFrame(f)}
   raf=requestAnimationFrame(f);
   ts.push(setTimeout(fim,5200));
  });
 }
 /* ---------- efeitos dentro do app ---------- */
 // logo de partículas no Início
 window.bbLogoParticulas=function(box){if(!box||box.dataset.ok)return;box.dataset.ok='1';
  var cv=document.createElement('canvas');box.appendChild(cv);var ctx=cv.getContext('2d');
  if(quieto){var im0=new Image();im0.src=LOGO;im0.className='bb-logo-estatica';box.appendChild(im0);return}
  carregaLogo(function(im){if(!im)return;var ps=[],W=0,H=0,dpr=Math.min(2,devicePixelRatio||1);
   function montar(){var r=box.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    var larg=Math.round(Math.min(W*.86,520)),a=pontos(im,larg,Math.max(2,Math.round(larg/160)));var ox=(W-a.w)/2,oy=(H-a.h)/2;ps=a.pts.map(function(q){var ang=Math.random()*6.283,R=Math.max(W,H)*(.5+Math.random()*.7);return {x:W/2+Math.cos(ang)*R,y:H/2+Math.sin(ang)*R,tx:ox+q.x,ty:oy+q.y,vx:0,vy:0,c:q.c,d:Math.random()*500}})}
   montar();var mx=-999,my=-999,t0=performance.now(),raf=0,vis=true;
   box.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
   box.addEventListener('pointerleave',function(){mx=my=-999});
   var ro=new ResizeObserver(function(){montar();t0=performance.now()-1500});ro.observe(box);
   var io=new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!raf)raf=requestAnimationFrame(f)});io.observe(box);
   addEventListener('bb-replay',function(){montar();t0=performance.now()});
   function f(now){raf=0;if(!box.isConnected){ro.disconnect();io.disconnect();return}if(!vis)return;var t=now-t0;ctx.clearRect(0,0,W,H);
    for(var i=0;i<ps.length;i++){var p=ps[i];if(t<p.d)continue;var dx=p.tx-p.x,dy=p.ty-p.y;p.vx+=dx*.05;p.vy+=dy*.05;
     var ex=p.x-mx,ey=p.y-my,dd=ex*ex+ey*ey;if(dd<3600){var k=(3600-dd)/3600*2.6,di=Math.sqrt(dd)||1;p.vx+=ex/di*k;p.vy+=ey/di*k}
     p.vx*=.8;p.vy*=.8;p.x+=p.vx;p.y+=p.vy;ctx.globalAlpha=.78+.22*Math.sin(now/380+p.tx*.2);ctx.fillStyle=p.c;ctx.fillRect(p.x-1,p.y-1,2,2)}
    ctx.globalAlpha=1;raf=requestAnimationFrame(f)}
   raf=requestAnimationFrame(f)})};
 // texto que decodifica
 window.bbScramble=function(el){if(!el||quieto)return;var txt=el.dataset.txt||el.textContent;el.dataset.txt=txt;var ch='▮▯◆◇01#%&*+<>/';var ini=0,raf;
  function p(now){if(!ini)ini=now;var fix=Math.floor((now-ini)/850*txt.length);el.textContent=txt.split('').map(function(c,i){return c===' '||i<fix?c:ch[(Math.random()*ch.length)|0]}).join('');if(fix<txt.length)raf=requestAnimationFrame(p);else el.textContent=txt}
  raf=requestAnimationFrame(p)};
 // números que contam
 window.bbContar=function(root){if(quieto)return;(root||document).querySelectorAll('[data-conta]').forEach(function(el){if(el.dataset.contou)return;el.dataset.contou='1';var fim=+el.dataset.conta,fmt=el.dataset.fmt,ini=performance.now(),dur=1100;
  function fm(v){return fmt==='brl'?v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):fmt==='pct'?Math.round(v)+'%':String(Math.round(v))}
  function p(now){var k=Math.min(1,(now-ini)/dur);var e=1-Math.pow(1-k,3);el.textContent=fm(fim*e);if(k<1)requestAnimationFrame(p)}requestAnimationFrame(p)})};
 if(document.body)abertura();else document.addEventListener('DOMContentLoaded',abertura);
})();
