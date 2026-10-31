/* BLESSAINT Business · abertura (31/10/2026)
   Janela se abre para um céu ensolarado, uma pomba vem chegando até a tela,
   a tela fica preta e a logo branca aparece. ~8 s; um toque pula. */
(function(){
 var quieto=false;try{quieto=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
 var css=`
#bb-abre{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:#050403;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:opacity .9s ease}
#bb-abre.sai{opacity:0;pointer-events:none}
#bb-abre .ceu{position:absolute;inset:0;background:linear-gradient(180deg,#5aa8e6 0%,#8cc6f0 38%,#cfe6f5 62%,#fff4dc 82%,#ffe7b0 100%);transform:scale(1.15);animation:bbCeuZoom 7s ease-out .9s forwards}
#bb-abre .sol{position:absolute;left:62%;top:30%;width:34vmin;height:34vmin;margin:-17vmin;border-radius:50%;background:radial-gradient(circle,#fff 0 18%,#fff8d8 30%,rgba(255,236,170,.55) 48%,rgba(255,220,140,0) 70%);filter:blur(1px)}
#bb-abre .raios{position:absolute;left:62%;top:30%;width:170vmax;height:170vmax;margin:-85vmax;background:repeating-conic-gradient(from 0deg,rgba(255,250,225,.30) 0deg 4deg,rgba(255,250,225,0) 4deg 14deg);-webkit-mask:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 18%,transparent 52%);mask:radial-gradient(circle,#000 0,rgba(0,0,0,.55) 18%,transparent 52%);animation:bbGira 40s linear infinite}
#bb-abre .nuvem{position:absolute;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,.6) 55%,rgba(255,255,255,0));filter:blur(2px)}
#bb-abre .n1{width:60vmax;height:16vmax;left:-12%;top:58%;animation:bbNuvem 14s linear forwards}
#bb-abre .n2{width:44vmax;height:12vmax;left:48%;top:66%;animation:bbNuvem 18s linear forwards}
#bb-abre .n3{width:36vmax;height:10vmax;left:8%;top:18%;opacity:.8;animation:bbNuvem 22s linear forwards}
#bb-abre .n4{width:50vmax;height:13vmax;left:60%;top:8%;opacity:.7;animation:bbNuvem 16s linear forwards}
#bb-abre .flare{position:absolute;left:62%;top:30%;width:120vmax;height:120vmax;margin:-60vmax;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,244,210,.4) 18%,transparent 40%);opacity:0;animation:bbFlare 1.6s ease-out 1.15s both}
/* janela */
#bb-abre .janela{position:absolute;inset:0;perspective:1400px;pointer-events:none}
#bb-abre .folha{position:absolute;top:0;bottom:0;width:50%;background:
 linear-gradient(90deg,rgba(0,0,0,.35),transparent 12%,transparent 88%,rgba(0,0,0,.35)),
 repeating-linear-gradient(180deg,#2a1d12 0 2px,#33251a 2px 9px,#2b1e13 9px 14px),#2b1e13;
 box-shadow:inset 0 0 0 10px #1a120b,inset 0 0 0 12px #c9a45c,inset 0 0 60px rgba(0,0,0,.7);backface-visibility:hidden;transition:transform 1.5s cubic-bezier(.55,.05,.2,1)}
#bb-abre .folha:before{content:"";position:absolute;inset:14% 16%;border:2px solid rgba(201,164,92,.75);border-radius:999px 999px 6px 6px;box-shadow:inset 0 0 30px rgba(0,0,0,.6)}
#bb-abre .folha:after{content:"";position:absolute;top:50%;width:12px;height:56px;margin-top:-28px;border-radius:6px;background:linear-gradient(90deg,#8a6a2c,#f3d58f,#8a6a2c)}
#bb-abre .fe{left:0;transform-origin:0 50%}
#bb-abre .fe:after{right:22px}
#bb-abre .fd{right:0;transform-origin:100% 50%}
#bb-abre .fd:after{left:22px}
#bb-abre .fresta{position:absolute;left:50%;top:0;bottom:0;width:4px;margin-left:-2px;background:linear-gradient(180deg,transparent,#fff6d8 20%,#fff 50%,#fff6d8 80%,transparent);box-shadow:0 0 30px 8px rgba(255,236,180,.8);opacity:0;animation:bbFresta 1.1s ease-in .15s forwards}
#bb-abre.abriu .fe{transform:rotateY(-108deg)}
#bb-abre.abriu .fd{transform:rotateY(108deg)}
#bb-abre.abriu .fresta{animation:none;opacity:0;transition:opacity .3s}
/* pomba */
#bb-abre .voo{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
#bb-abre .pomba{position:absolute;left:50%;top:50%;width:220px;height:160px;margin:-80px -110px;opacity:0;filter:drop-shadow(0 6px 10px rgba(60,80,110,.25))}
#bb-abre.voando .pomba{animation:bbChega 2.9s cubic-bezier(.45,0,.75,.55) forwards}
#bb-abre .asa1{transform-origin:112px 72px;animation:bbBate .32s ease-in-out infinite alternate}
#bb-abre .asa2{transform-origin:118px 70px;animation:bbBate2 .32s ease-in-out infinite alternate}
/* tela preta + logo */
#bb-abre .preto{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px;border-radius:50%;background:#050403;transform:scale(0)}
#bb-abre.escuro .preto{transition:transform 1s cubic-bezier(.7,0,.3,1);transform:scale(400)}
#bb-abre .marca{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:18px;opacity:0;pointer-events:none}
#bb-abre.logo .marca{opacity:1}
#bb-abre .marca img{width:min(72vw,520px);height:auto;opacity:0;filter:drop-shadow(0 0 0 rgba(255,255,255,0))}
#bb-abre.logo .marca img{animation:bbLogo 1.6s cubic-bezier(.2,.8,.2,1) forwards}
#bb-abre .marca p{margin:0;font:italic 500 clamp(15px,2.4vw,20px)/1.4 'Bodoni Moda',Georgia,serif;color:#e9dcc0;letter-spacing:.5px;opacity:0;text-align:center;padding:0 24px}
#bb-abre.logo .marca p{animation:bbTexto 1s ease .9s forwards}
#bb-abre .pular{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:calc(18px + env(safe-area-inset-bottom));font:600 10px/1 Montserrat,system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.55);opacity:0;animation:bbTexto .6s ease 1.6s forwards;mix-blend-mode:difference}
@keyframes bbCeuZoom{to{transform:scale(1)}}
@keyframes bbGira{to{transform:rotate(360deg)}}
@keyframes bbNuvem{to{transform:translateX(14vw)}}
@keyframes bbFlare{0%{opacity:0;transform:scale(.4)}30%{opacity:1}100%{opacity:.25;transform:scale(1)}}
@keyframes bbFresta{to{opacity:1}}
@keyframes bbBate{from{transform:rotate(-38deg)}to{transform:rotate(26deg) scaleY(.85)}}
@keyframes bbBate2{from{transform:rotate(-30deg)}to{transform:rotate(22deg) scaleY(.8)}}
@keyframes bbChega{0%{opacity:0;transform:translate(26vw,-24vh) scale(.06) rotate(-6deg)}12%{opacity:1}55%{transform:translate(8vw,-6vh) scale(.6) rotate(4deg)}85%{filter:blur(0)}100%{opacity:1;transform:translate(0,4vh) scale(4.2) rotate(-4deg);filter:blur(3px) brightness(1.15)}}
@keyframes bbLogo{0%{opacity:0;transform:scale(.92);filter:blur(8px) drop-shadow(0 0 0 rgba(255,255,255,0))}60%{opacity:1;filter:blur(0) drop-shadow(0 0 28px rgba(255,255,255,.35))}100%{opacity:1;transform:none;filter:drop-shadow(0 0 14px rgba(255,255,255,.18))}}
@keyframes bbTexto{to{opacity:1}}
`;
 var pomba='<svg class="pomba" viewBox="0 0 220 160" aria-hidden="true"><defs><linearGradient id="bbp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe6ef"/></linearGradient><linearGradient id="bbp2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef3f8"/><stop offset="1" stop-color="#c9d3df"/></linearGradient></defs>'
  +'<path class="asa2" d="M118 70 C 128 34, 150 10, 186 6 C 172 22, 168 30, 170 38 C 160 40, 156 46, 158 52 C 146 54, 136 62, 130 74 Z" fill="url(#bbp2)"/>'
  +'<path d="M40 92 C 20 96, 8 106, 4 118 C 18 112, 30 112, 40 110 C 32 120, 30 128, 32 136 C 44 124, 56 114, 66 108 Z" fill="url(#bbp2)"/>'
  +'<path d="M60 96 C 70 78, 100 66, 132 66 C 150 66, 162 60, 170 52 C 178 46, 190 46, 196 54 L 210 58 L 196 62 C 192 74, 178 84, 160 92 C 136 104, 96 112, 66 108 C 58 106, 56 100, 60 96 Z" fill="url(#bbp)"/>'
  +'<circle cx="188" cy="54" r="1.8" fill="#3a4552"/>'
  +'<path class="asa1" d="M112 72 C 100 34, 76 8, 36 2 C 52 18, 58 28, 56 36 C 68 38, 74 46, 72 52 C 86 54, 98 62, 104 76 Z" fill="url(#bbp)"/>'
  +'<path d="M150 92 C 148 100, 144 104, 138 106 M140 94 C 140 100, 138 104, 132 108" stroke="#c8a08a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
 function frase(){var h=new Date().getHours();return h>=5&&h<12?'Bom dia. Que Deus abençoe o seu trabalho.':h>=12&&h<18?'Boa tarde. Que Deus abençoe o seu trabalho.':'Boa noite. Que Deus abençoe o seu descanso.'}
 function iniciar(){
  if(document.getElementById('bb-abre'))return;
  var st=document.createElement('style');st.id='bb-abre-css';st.textContent=css;document.head.appendChild(st);
  var el=document.createElement('div');el.id='bb-abre';el.setAttribute('role','presentation');
  el.innerHTML='<div class="ceu"></div><div class="raios"></div><div class="sol"></div><div class="nuvem n3"></div><div class="nuvem n4"></div><div class="nuvem n1"></div><div class="nuvem n2"></div><div class="flare"></div>'
   +'<div class="voo">'+pomba+'</div><div class="janela"><div class="folha fe"></div><div class="folha fd"></div><div class="fresta"></div></div>'
   +'<div class="preto"></div><div class="marca"><img src="../img/logo-business-v3.png" alt="BLESSAINT Business"><p>'+frase()+'</p></div><div class="pular">toque para pular</div>';
  document.body.appendChild(el);
  var ts=[],acabou=false;
  function em(ms,f){ts.push(setTimeout(f,ms))}
  function fim(){if(acabou)return;acabou=true;ts.forEach(clearTimeout);el.classList.add('sai');setTimeout(function(){el.remove();st.remove()},950)}
  el.addEventListener('click',fim);
  if(quieto){el.classList.add('abriu','escuro','logo');em(1800,fim);return}
  em(1150,function(){el.classList.add('abriu')});
  em(2300,function(){el.classList.add('voando')});
  em(4750,function(){el.classList.add('escuro')});
  em(5600,function(){el.classList.add('logo')});
  em(8300,fim);
 }
 if(document.body)iniciar();else document.addEventListener('DOMContentLoaded',iniciar);
})();
