/* BLESSAINT Business · Studio Evolution Tech
   Mesmo padrão da Gestão do Studio: o programa fica público (blessaint.com.br/business),
   os dados ficam num arquivo JSON dentro de um repositório PRIVADO do GitHub,
   e a chave do GitHub fica no cofre (cofre.json) criptografada com a senha. Iguais em todos os aparelhos.
   Para mudar onde ficam os dados, troque DATA_REPO e DATA_FILE abaixo. */
(()=>{
'use strict';
const OWNER='arnoldsuheth',REPO='Blessaint',COFRE_PATH='business/cofre.json',DATA_REPO='studio-evolution-gestao-dados',DATA_FILE='blessaint-business.json';
const DATA_API=`/repos/${OWNER}/${DATA_REPO}/contents/${DATA_FILE}`;
const LS={sess:'bb_sessao_v1',cache:'bb_cache_v1',cofre:'bb_cofre_v1'};
const ITER=250000,SIZES=['P','M','G','GG'],DAY=864e5;
const $=s=>document.querySelector(s),app=$('#app'),dlg=$('#dlg');
const te=new TextEncoder(),td=new TextDecoder();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64=u=>{u=new Uint8Array(u);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}},del(k){try{localStorage.removeItem(k)}catch{}}};
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const money=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const toCents=v=>Math.round(Number(String(v).replace(/\./g,'').replace(',','.'))*100)||0;
const fromCents=c=>c?(c/100).toFixed(2).replace('.',','):'';
const dataBR=s=>s?new Date(s+'T12:00:00').toLocaleDateString('pt-BR'):'';
const mesKey=s=>s.slice(0,7);
const mesNome=k=>new Date(k+'-15T12:00:00').toLocaleDateString('pt-BR',{month:'short'}).replace('.','');

/* ---------- cripto ---------- */
async function deriveKey(pw,salt,iter){const base=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:iter,hash:'SHA-256'},base,{name:'AES-GCM',length:256},true,['encrypt','decrypt'])}
async function enc(k,obj){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,te.encode(JSON.stringify(obj)));return {iv:b64(iv),ct:b64(ct)}}
async function dec(k,box){return JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(box.iv)},k,unb64(box.ct))))}
const exportKey=async k=>b64(await crypto.subtle.exportKey('raw',k));
const importKey=s=>crypto.subtle.importKey('raw',unb64(s),{name:'AES-GCM'},true,['encrypt','decrypt']);

/* ---------- GitHub ---------- */
let SESS=null,KEY=null,COFRE=null;
async function gh(path,opts={},token){const t=token||SESS?.token;const r=await fetch('https://api.github.com'+path,{...opts,cache:'no-store',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+t,...(opts.body?{'Content-Type':'application/json'}:{})}});if(!r.ok){const e=Error('GitHub '+r.status);e.status=r.status;throw e}return r.status===204?null:r.json()}
async function fetchCofre(){
 try{const r=await fetch('cofre.json?t='+Date.now(),{cache:'no-store'});if(r.ok){const j=await r.json();ls.set(LS.cofre,j);return j}
  const r2=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${COFRE_PATH}`,{headers:{Accept:'application/vnd.github.raw+json'},cache:'no-store'});
  if(r2.ok){const j=await r2.json();ls.set(LS.cofre,j);return j}
  if(r.status===404&&r2.status===404)return null;return ls.get(LS.cofre)}
 catch{return ls.get(LS.cofre)||'offline'}}
async function putCofre(cofre,token){let sha;try{sha=(await gh(`/repos/${OWNER}/${REPO}/contents/${COFRE_PATH}`,{},token)).sha}catch(e){if(e.status!==404)throw e}
 await gh(`/repos/${OWNER}/${REPO}/contents/${COFRE_PATH}`,{method:'PUT',body:JSON.stringify({message:'Cofre do BLESSAINT Business (criptografado)',content:b64(te.encode(JSON.stringify(cofre,null,1))),sha})},token);ls.set(LS.cofre,cofre)}

/* ---------- dados ---------- */
const KINDS=['products','sales','budgets','entries'];
const SEED=[['Oversized Freedom Creme','freedom-creme'],['Oversized Freedom Lilás','freedom-lilas'],['Oversized Freedom Preta','freedom-preta'],['Oversized Multiplicação','multiplicacao-preta'],['Oversized Você Não É Todo Mundo','voce-nao-e-todo-mundo-creme'],['Oversized Another in the Fire','another-in-the-fire-preta'],['Oversized Nuvens Creme','nuvens-creme'],['Oversized Logo Lilás','boxlogo-lilas'],['Oversized Logo Branca','boxlogo-preta'],['Oversized Logo Branca Minimalista','logo-peito-preta']];
function emptyState(){const now=Date.now();return {v:1,updatedAt:now,deleted:{},products:SEED.map(([n,img],i)=>({id:'p'+(i+1),name:n,collection:'DROP DIVINE',sku:'BLS-'+String(i+1).padStart(3,'0'),price:10990,cost:0,image:'../img/'+img+'-frente.jpg',stock:{P:0,M:0,G:0,GG:0},min:2,updatedAt:now})),sales:[],budgets:[],entries:[]}}
let S=null;
function merge(a,b){ // junta dois estados: vence a versão mais nova de cada item; exclusões valem
 if(!a)return b;if(!b)return a;const deleted={...a.deleted,...b.deleted};for(const k in b.deleted)deleted[k]=Math.max(a.deleted?.[k]||0,b.deleted[k]);
 const out={v:1,updatedAt:Math.max(a.updatedAt||0,b.updatedAt||0),deleted};
 for(const kind of KINDS){const m=new Map();for(const x of [...(a[kind]||[]),...(b[kind]||[])]){const cur=m.get(x.id);if(!cur||(x.updatedAt||0)>(cur.updatedAt||0))m.set(x.id,x)}
  out[kind]=[...m.values()].filter(x=>!(deleted[x.id]&&deleted[x.id]>=(x.updatedAt||0)))}
 return out}
async function cacheLocal(){if(KEY)ls.set(LS.cache,await enc(KEY,S))}
let syncState='ok',pushT=null,pushing=false,again=false;
function setSync(s){syncState=s;const el=$('#sync');if(el){el.className='sync '+(s==='ok'?'':s==='busy'?'busy':'off');el.innerHTML='<i></i>'+(s==='ok'?'Salvo na nuvem':s==='busy'?'Salvando…':'Sem internet: salvo no aparelho')}}
async function pull(){ // devolve {state,sha}; arquivo ainda não criado = {state:null,sha:''}
 try{const j=await gh(DATA_API+'?t='+Date.now());const raw=td.decode(unb64(j.content.replace(/\n/g,'')));return {state:JSON.parse(raw),sha:j.sha}}
 catch(e){if(e.status===404)return {state:null,sha:''};throw e}}
async function push(){if(pushing){again=true;return}pushing=true;setSync('busy');
 try{for(let i=0;i<3;i++){const r=await pull();S=merge(S,r.state);await cacheLocal();
   try{await gh(DATA_API,{method:'PUT',body:JSON.stringify({message:'Atualiza dados do BLESSAINT Business',content:b64(te.encode(JSON.stringify(S,null,1))),...(r.sha?{sha:r.sha}:{})})});setSync('ok');render();return}
   catch(e){if(e.status!==409&&e.status!==422)throw e}}
  throw Error('conflito')}
 catch(e){setSync('off');if(e.status===401||e.status===403)toast('A chave do GitHub venceu ou foi removida. Vá em Ajustes → Trocar chave.')}
 finally{pushing=false;if(again){again=false;push()}}}
function persist(){S.updatedAt=Date.now();cacheLocal();setSync('busy');clearTimeout(pushT);pushT=setTimeout(push,1200)}
function upsert(kind,obj){obj.updatedAt=Date.now();const i=S[kind].findIndex(x=>x.id===obj.id);if(i>=0)S[kind][i]=obj;else S[kind].push(obj);persist()}
function remove(kind,id){S[kind]=S[kind].filter(x=>x.id!==id);S.deleted[id]=Date.now();persist()}

/* ---------- utilidades de tela ---------- */
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.add('hidden'),3200)}
const ico={home:'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',box:'<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"/>',doc:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',money:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'};
const svg=(n,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico[n]}</svg>`;
const LOGO='../img/logo-blessaint-branco.png';
function bindPw(root){root.querySelectorAll('[data-pw]').forEach(b=>b.onclick=()=>{const i=root.querySelector('#'+b.dataset.pw);i.type=i.type==='password'?'text':'password'})}
const pwField=(id,label,auto)=>`<label class="field">${label}<span class="pw"><input id="${id}" type="password" autocomplete="${auto}" required><button type="button" data-pw="${id}" aria-label="Mostrar senha">${svg('eye',18)}</button></span></label>`;

/* ---------- cadeado ---------- */
function telaLogin(){
 app.innerHTML=`<div class="lock"><form class="lock-box" id="f">
  <img class="lock-logo" src="${LOGO}" alt="BLESSAINT"><h1>BUSINESS</h1>
  <p class="sub">Digite sua senha para abrir.</p>
  ${pwField('pw','Senha','current-password')}
  <label class="check"><input type="checkbox" id="lembrar" checked> Lembrar neste aparelho</label>
  <div class="err" id="err" role="alert"></div>
  <button class="btn main full" id="go">Entrar</button></form></div>`;
 bindPw(app);
 $('#f').onsubmit=async e=>{e.preventDefault();const b=$('#go');b.disabled=true;b.textContent='Abrindo…';$('#err').textContent='';
  try{const k=await deriveKey($('#pw').value,unb64(COFRE.salt),COFRE.iter||ITER);const sec=await dec(k,COFRE.box);KEY=k;SESS={token:sec.token};
   if($('#lembrar').checked)ls.set(LS.sess,{token:SESS.token,key:await exportKey(KEY)});await entrar()}
  catch{b.disabled=false;b.textContent='Entrar';$('#err').textContent='Senha incorreta. Tente de novo.'}}}
function telaSetup(){
 const url='https://github.com/settings/personal-access-tokens/new';
 app.innerHTML=`<div class="lock"><form class="lock-box" id="f" style="max-width:520px">
  <img class="lock-logo" src="${LOGO}" alt="BLESSAINT"><h1>BUSINESS</h1>
  <h2>Primeiro acesso</h2><p class="sub">É uma vez só. Depois, em qualquer aparelho, você entra só com a senha.</p>
  <section class="card" style="display:grid;gap:12px"><b>1. Crie a senha</b>${pwField('s1','Senha (mínimo 6 caracteres)','new-password')}${pwField('s2','Repita a senha','new-password')}</section>
  <section class="card" style="display:grid;gap:12px"><b>2. Cole a chave de salvamento do GitHub</b>
   <ol class="steps"><li>Abra <a href="${url}" target="_blank" rel="noopener">github.com → Fine-grained token</a>.</li><li>Nome: <code>blessaint-business</code>. Validade: 1 ano.</li><li>Repository access: <b>Only select repositories</b> → <code>${REPO}</code> e <code>${DATA_REPO}</code>.</li><li>Permissions → Repository: <b>Contents: Read and write</b>.</li><li>Toque em Generate token, copie e cole aqui.</li></ol>
   <label class="field">Chave<input id="tok" type="password" autocomplete="off" placeholder="github_pat_…" required></label>
   <p class="note">A chave fica guardada criptografada com a sua senha. Sem a senha, ninguém usa.</p></section>
  <div class="err" id="err" role="alert"></div>
  <button class="btn main full" id="go">Criar cadeado e entrar</button></form></div>`;
 bindPw(app);
 $('#f').onsubmit=async e=>{e.preventDefault();const a=$('#s1').value,b2=$('#s2').value,tok=$('#tok').value.trim(),er=$('#err'),b=$('#go');er.textContent='';
  if(a.length<6)return er.textContent='A senha precisa de pelo menos 6 caracteres.';
  if(a!==b2)return er.textContent='As senhas não são iguais.';
  if(!/^(github_pat_|ghp_)/.test(tok))return er.textContent='Isso não parece uma chave do GitHub (começa com github_pat_).';
  b.disabled=true;
  try{b.textContent='Conferindo a chave…';const u=await gh('/user',{},tok);for(const rp of [REPO,DATA_REPO]){const r=await gh(`/repos/${OWNER}/${rp}`,{},tok);if(!r.permissions?.push)throw Object.assign(Error(),{status:403})}
   b.textContent='Criando o cofre…';const salt=crypto.getRandomValues(new Uint8Array(16));const k=await deriveKey(a,salt,ITER);
   const cofre={v:1,salt:b64(salt),iter:ITER,user:u.login,box:await enc(k,{token:tok})};
   COFRE=cofre;KEY=k;SESS={token:tok};
   b.textContent='Preparando os dados…';const r0=await pull();S=r0.state||emptyState();if(!r0.state)await gh(DATA_API,{method:'PUT',body:JSON.stringify({message:'Inicia dados do BLESSAINT Business',content:b64(te.encode(JSON.stringify(S,null,1)))})},tok);
   b.textContent='Guardando no GitHub…';await putCofre(cofre,tok);
   ls.set(LS.sess,{token:tok,key:await exportKey(k)});await entrar(false);toast('Cadeado criado. O GitHub leva cerca de 1 minuto para publicar.')}
  catch(x){b.disabled=false;b.textContent='Criar cadeado e entrar';er.textContent=x.status===401?'Chave inválida. Gere de novo e cole.':(x.status===403||x.status===404)?`Chave sem permissão. Confira: repositórios ${REPO} e ${DATA_REPO}, com Contents em leitura e escrita.`:'Não consegui falar com o GitHub. Verifique a internet.'}}}

async function entrar(fazerPull=true){
 const c=ls.get(LS.cache);let local=null;if(c&&KEY){try{local=await dec(KEY,c)}catch{}}
 S=merge(S,local);
 if(fazerPull){setSync('busy');try{const r=await pull();S=merge(S,r.state||emptyState());setSync('ok')}catch(e){setSync('off');if(e.status===401||e.status===403)toast('A chave do GitHub venceu. Vá em Ajustes → Trocar chave.')}}
 if(!S){app.innerHTML='<div class="lock"><div class="lock-box"><h2>Sem conexão</h2><p class="sub">Não consegui carregar os dados e não há cópia neste aparelho. Conecte à internet e tente de novo.</p><button class="btn main full" onclick="location.reload()">Tentar de novo</button></div></div>';return}
 await cacheLocal();shell();render()}
function sair(){ls.del(LS.sess);ls.del(LS.cache);location.reload()}

/* ---------- casca e abas ---------- */
const TABS=[['inicio','Início','home'],['estoque','Estoque','box'],['vendas','Vendas','cart'],['orcamentos','Orçamentos','doc'],['financas','Finanças','money'],['ajustes','Ajustes','gear']];
let tab=(location.hash.slice(1)||'inicio');if(!TABS.some(t=>t[0]===tab))tab='inicio';
let filtro={estoque:'',vendas:'mes',orc:'Aberto',fin:''};
function shell(){app.innerHTML=`<header class="top"><img src="${LOGO}" alt="BLESSAINT"><b>BUSINESS</b><span class="sync" id="sync"></span></header><main id="main"></main><nav class="tabs" aria-label="Seções">${TABS.map(([id,l,i])=>`<button data-tab="${id}">${svg(i)}<span>${l}</span></button>`).join('')}</nav>`;
 app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;history.replaceState(null,'','#'+tab);render();scrollTo(0,0)});setSync(syncState)}
function render(){const m=$('#main');if(!m||!S)return;app.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
 m.innerHTML=({inicio:vInicio,estoque:vEstoque,vendas:vVendas,orcamentos:vOrc,financas:vFin,ajustes:vAjustes}[tab])();bindMain(m)}
const totalStock=p=>SIZES.reduce((a,s)=>a+(p.stock?.[s]||0),0);
const prod=id=>S.products.find(p=>p.id===id);
const saleTotal=s=>s.items.reduce((a,i)=>a+i.qty*i.price,0)-(s.discount||0);
function mesResumo(k){const vendas=S.sales.filter(s=>mesKey(s.date)===k);const rec=vendas.filter(s=>s.status==='Pago').reduce((a,s)=>a+saleTotal(s),0);
 const ent=S.entries.filter(e=>mesKey(e.date)===k);const extras=ent.filter(e=>e.type==='Entrada'&&e.paid).reduce((a,e)=>a+e.value,0);const saidas=ent.filter(e=>e.type==='Saída'&&e.paid).reduce((a,e)=>a+e.value,0);
 const pecas=vendas.reduce((a,s)=>a+s.items.reduce((b,i)=>b+i.qty,0),0);return {vendas,rec,extras,saidas,pecas,saldo:rec+extras-saidas}}

/* ---------- Início ---------- */
function vInicio(){const k=mesKey(today()),r=mesResumo(k);
 const baixos=S.products.filter(p=>SIZES.some(s=>(p.stock[s]||0)<=(p.min??2)));
 const aReceber=S.sales.filter(s=>s.status==='Pendente').reduce((a,s)=>a+saleTotal(s),0);
 const contas=S.entries.filter(e=>e.type==='Saída'&&!e.paid).sort((a,b)=>a.date.localeCompare(b.date));
 const abertos=S.budgets.filter(b=>b.status==='Aberto');
 const meses=[...Array(6)].map((_,i)=>{const d=new Date();d.setDate(15);d.setMonth(d.getMonth()-5+i);return d.toISOString().slice(0,7)});
 const vals=meses.map(m=>mesResumo(m).rec);const max=Math.max(...vals,1);
 return `<h1 class="page">Olá, BLESSAINT</h1><p class="lead">Resumo de ${new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}.</p>
 <div class="grid4"><div class="kpi"><small>Vendido no mês</small><strong>${money(r.rec)}</strong><span>${r.pecas} peça(s) · ${r.vendas.length} venda(s)</span></div>
 <div class="kpi"><small>A receber</small><strong>${money(aReceber)}</strong><span>vendas pendentes</span></div>
 <div class="kpi"><small>Saldo do mês</small><strong>${money(r.saldo)}</strong><span>vendas + entradas − saídas</span></div>
 <div class="kpi"><small>Peças em estoque</small><strong>${S.products.reduce((a,p)=>a+totalStock(p),0)}</strong><span>${S.products.length} modelo(s)</span></div></div>
 <div class="row" style="margin-top:14px"><button class="btn main" data-act="nova-venda">${svg('plus',18)} Nova venda</button><button class="btn" data-act="entrada-estoque">${svg('box',18)} Entrada de estoque</button></div>
 <div class="sec"><h3>Vendas pagas · últimos 6 meses</h3><div class="card"><div class="chart">${meses.map((m,i)=>`<div class="${i===5?'cur':''}"><small>${vals[i]?money(vals[i]).replace(',00',''):''}</small><i style="height:${Math.max(2,vals[i]/max*90)}%"></i><small>${mesNome(m)}</small></div>`).join('')}</div></div></div>
 <div class="sec"><h3>Estoque baixo</h3>${baixos.length?`<div class="list">${baixos.slice(0,6).map(itemProduto).join('')}</div>`:'<div class="empty">Nenhuma peça abaixo do mínimo.</div>'}</div>
 <div class="sec"><h3>Contas a pagar</h3>${contas.length?`<div class="list">${contas.slice(0,5).map(itemEntrada).join('')}</div>`:'<div class="empty">Nenhuma conta pendente.</div>'}</div>
 <div class="sec"><h3>Orçamentos em aberto</h3>${abertos.length?`<div class="list">${abertos.slice(0,5).map(itemOrc).join('')}</div>`:'<div class="empty">Nenhum orçamento em aberto.</div>'}</div>`}

/* ---------- Estoque ---------- */
function itemProduto(p){const t=totalStock(p),baixo=SIZES.some(s=>(p.stock[s]||0)<=(p.min??2));
 return `<button class="item" data-edit-prod="${p.id}"><img src="${esc(p.image||LOGO)}" alt="" loading="lazy" onerror="this.src='${LOGO}'"><span class="grow"><b>${esc(p.name)}</b><small>${esc(p.sku||'')}${p.collection?' · '+esc(p.collection):''}</small><span class="sizes">${SIZES.map(s=>`<span class="${(p.stock[s]||0)===0?'z':''}">${s} ${p.stock[s]||0}</span>`).join('')}</span></span><span class="end"><b>${money(p.price)}</b><span class="tag ${t===0?'bad':baixo?'warn':'ok'}">${t} un.</span></span></button>`}
function vEstoque(){const q=filtro.estoque.toLowerCase();const list=S.products.filter(p=>!q||(p.name+' '+p.sku+' '+(p.collection||'')).toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 const valor=S.products.reduce((a,p)=>a+totalStock(p)*p.price,0);
 return `<h1 class="page">Estoque</h1><p class="lead">Toque numa peça para editar quantidades, preço ou excluir. ${S.products.reduce((a,p)=>a+totalStock(p),0)} peça(s) · ${money(valor)} em preço de venda.</p>
 <div class="row" style="margin-bottom:12px"><button class="btn main" data-act="novo-prod">${svg('plus',18)} Nova peça</button><button class="btn" data-act="entrada-estoque">Entrada de estoque</button></div>
 <input class="search" type="search" placeholder="Buscar peça…" value="${esc(filtro.estoque)}" data-filtro="estoque">
 ${list.length?`<div class="list">${list.map(itemProduto).join('')}</div>`:'<div class="empty">Nenhuma peça encontrada.</div>'}`}
function formProd(p){const n=!p;p=p||{id:uid(),name:'',collection:'',sku:'',price:0,cost:0,image:'',stock:{P:0,M:0,G:0,GG:0},min:2};
 openDlg(n?'Nova peça':'Editar peça',`<label class="field">Nome<input name="name" value="${esc(p.name)}" required maxlength="120"></label>
  <div class="grid2"><label class="field">Coleção<input name="collection" value="${esc(p.collection||'')}" maxlength="60"></label><label class="field">Código<input name="sku" value="${esc(p.sku||'')}" maxlength="30"></label></div>
  <div class="grid2"><label class="field">Preço de venda (R$)<input name="price" inputmode="decimal" value="${fromCents(p.price)}" required></label><label class="field">Custo (R$)<input name="cost" inputmode="decimal" value="${fromCents(p.cost)}"></label></div>
  <div class="field">Quantidade por tamanho<div class="sizegrid">${SIZES.map(s=>`<label>${s}<input name="st_${s}" type="number" min="0" max="9999" inputmode="numeric" value="${p.stock[s]||0}"></label>`).join('')}</div></div>
  <div class="grid2"><label class="field">Avisar quando ficar com até<input name="min" type="number" min="0" max="999" value="${p.min??2}"></label><label class="field">Foto (link)<input name="image" value="${esc(p.image||'')}" placeholder="../img/…"></label></div>`,
  async f=>{const name=f.name.value.trim();if(!name)return 'Informe o nome.';const price=toCents(f.price.value);if(price<=0)return 'Informe o preço de venda.';
   upsert('products',{...p,name,collection:f.collection.value.trim(),sku:f.sku.value.trim(),price,cost:toCents(f.cost.value),image:f.image.value.trim(),min:Math.max(0,+f.min.value||0),stock:Object.fromEntries(SIZES.map(s=>[s,Math.max(0,parseInt(f['st_'+s].value)||0)]))});toast(n?'Peça cadastrada.':'Peça atualizada.')},
  n?null:()=>{if(S.sales.some(s=>s.items.some(i=>i.productId===p.id))&&!confirm('Esta peça aparece em vendas antigas. As vendas continuam, só a peça sai do estoque. Excluir?'))return false;if(!confirm('Excluir "'+p.name+'"? Isso não pode ser desfeito.'))return false;remove('products',p.id);toast('Peça excluída.');return true})}
function formEntrada(){openDlg('Entrada de estoque',`<p class="note">Chegou mercadoria? Escolha a peça e some as quantidades. Se quiser, lance o custo como saída nas Finanças.</p>
  <label class="field">Peça<select name="pid">${S.products.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
  <div class="field">Quantidade que chegou<div class="sizegrid">${SIZES.map(s=>`<label>${s}<input name="q_${s}" type="number" min="0" max="9999" inputmode="numeric" value="0"></label>`).join('')}</div></div>
  <div class="grid2"><label class="field">Custo total (R$, opcional)<input name="custo" inputmode="decimal"></label><label class="field">Data<input name="date" type="date" value="${today()}"></label></div>`,
  async f=>{const p=prod(f.pid.value);if(!p)return 'Escolha a peça.';const add=Object.fromEntries(SIZES.map(s=>[s,Math.max(0,parseInt(f['q_'+s].value)||0)]));const tot=SIZES.reduce((a,s)=>a+add[s],0);if(!tot)return 'Informe pelo menos 1 peça.';
   upsert('products',{...p,stock:Object.fromEntries(SIZES.map(s=>[s,(p.stock[s]||0)+add[s]]))});
   const c=toCents(f.custo.value);if(c>0)upsert('entries',{id:uid(),date:f.date.value||today(),desc:'Compra de estoque: '+p.name+' ('+tot+' un.)',type:'Saída',category:'Estoque',value:c,paid:true});
   toast('Estoque atualizado: +'+tot+' peça(s).')})}

/* ---------- Vendas ---------- */
function itemVenda(s){const n=s.items.reduce((a,i)=>a+i.qty,0);return `<button class="item" data-edit-venda="${s.id}"><span class="grow"><b>${esc(s.client||'Cliente não informado')}</b><small>${dataBR(s.date)} · ${n} peça(s) · ${esc(s.channel)} · ${esc(s.payment)}</small><small>${esc(s.items.map(i=>(prod(i.productId)?.name||'Peça excluída').replace('Oversized ','')+' '+i.size+(i.qty>1?' ×'+i.qty:'')).join(', '))}</small></span><span class="end"><b>${money(saleTotal(s))}</b><span class="tag ${s.status==='Pago'?'ok':'warn'}">${s.status}</span></span></button>`}
function vVendas(){const k=mesKey(today());const list=S.sales.filter(s=>filtro.vendas==='mes'?mesKey(s.date)===k:filtro.vendas==='pend'?s.status==='Pendente':true).sort((a,b)=>b.date.localeCompare(a.date)||(b.updatedAt-a.updatedAt));
 return `<h1 class="page">Vendas</h1><p class="lead">Cada venda dá baixa no estoque. Excluir uma venda devolve as peças ao estoque.</p>
 <div class="row" style="margin-bottom:12px"><button class="btn main" data-act="nova-venda">${svg('plus',18)} Nova venda</button></div>
 <div class="seg">${[['mes','Este mês'],['pend','A receber'],['todas','Todas']].map(([v,l])=>`<button data-seg-vendas="${v}" class="${filtro.vendas===v?'on':''}">${l}</button>`).join('')}</div>
 ${list.length?`<div class="list">${list.map(itemVenda).join('')}</div>`:'<div class="empty">Nenhuma venda aqui ainda.</div>'}`}
function formVenda(s){const n=!s;s=s?JSON.parse(JSON.stringify(s)):{id:uid(),date:today(),client:'',channel:'Instagram',payment:'Pix',status:'Pago',discount:0,items:[],notes:''};
 if(!s.items.length&&S.products.length)s.items.push({productId:S.products[0].id,size:'M',qty:1,price:S.products[0].price});
 const original=n?null:JSON.parse(JSON.stringify(s));
 const opts=sel=>S.products.slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.name.replace('Oversized ',''))}</option>`).join('');
 const lineHTML=(it,i)=>`<div class="line" data-line="${i}"><select name="l_p">${opts(it.productId)}</select><select name="l_s">${SIZES.map(z=>`<option ${z===it.size?'selected':''}>${z}</option>`).join('')}</select><input name="l_q" type="number" min="1" max="99" value="${it.qty}" inputmode="numeric" aria-label="Quantidade"><button type="button" data-rm-line aria-label="Remover peça">${svg('x',18)}</button></div>`;
 openDlg(n?'Nova venda':'Editar venda',`<div class="grid2"><label class="field">Data<input name="date" type="date" value="${s.date}" required></label><label class="field">Cliente<input name="client" value="${esc(s.client)}" maxlength="80" placeholder="Nome ou @"></label></div>
  <div class="field">Peças · tamanho · quantidade<div class="lines" id="lines">${s.items.map(lineHTML).join('')}</div><button type="button" class="btn small" id="addline" style="justify-self:start;margin-top:6px">${svg('plus',16)} Adicionar peça</button></div>
  <div class="grid2"><label class="field">Canal<select name="channel">${['Instagram','WhatsApp','Site','Loja / evento','Outro'].map(c=>`<option ${c===s.channel?'selected':''}>${c}</option>`).join('')}</select></label><label class="field">Pagamento<select name="payment">${['Pix','Cartão','Dinheiro','Link de pagamento','Outro'].map(c=>`<option ${c===s.payment?'selected':''}>${c}</option>`).join('')}</select></label></div>
  <div class="grid2"><label class="field">Situação<select name="status">${['Pago','Pendente'].map(c=>`<option ${c===s.status?'selected':''}>${c}</option>`).join('')}</select></label><label class="field">Desconto (R$)<input name="discount" inputmode="decimal" value="${fromCents(s.discount)}"></label></div>
  <label class="field">Observação<input name="notes" value="${esc(s.notes||'')}" maxlength="200"></label>
  <div class="total"><span>Total</span><span id="tot"></span></div>`,
  async f=>{const items=[...f.querySelectorAll('[data-line]')].map(l=>{const p=prod(l.querySelector('[name=l_p]').value);return {productId:p?.id,size:l.querySelector('[name=l_s]').value,qty:Math.max(1,parseInt(l.querySelector('[name=l_q]').value)||1),price:(original?.items.find(o=>o.productId===p?.id)?.price)??p?.price??0}}).filter(i=>i.productId);
   if(!items.length)return 'Adicione pelo menos 1 peça.';
   // estoque: devolve o que a venda antiga tirou e tira o da nova
   const stock=Object.fromEntries(S.products.map(p=>[p.id,{...p.stock}]));
   original?.items.forEach(i=>{if(stock[i.productId])stock[i.productId][i.size]+=i.qty});
   for(const i of items){const st=stock[i.productId];st[i.size]=(st[i.size]||0)-i.qty;if(st[i.size]<0){const p=prod(i.productId);if(!confirm(p.name+' tamanho '+i.size+' vai ficar negativo no estoque. Salvar mesmo assim?'))return 'Ajuste as quantidades.';st[i.size]=0}}
   S.products.forEach(p=>{if(JSON.stringify(p.stock)!==JSON.stringify(stock[p.id]))upsert('products',{...p,stock:stock[p.id]})});
   upsert('sales',{...s,date:f.date.value||today(),client:f.client.value.trim(),channel:f.channel.value,payment:f.payment.value,status:f.status.value,discount:toCents(f.discount.value),notes:f.notes.value.trim(),items});toast(n?'Venda registrada e estoque atualizado.':'Venda atualizada.')},
  n?null:()=>{if(!confirm('Excluir esta venda? As peças voltam para o estoque.'))return false;original.items.forEach(i=>{const p=prod(i.productId);if(p)upsert('products',{...p,stock:{...p.stock,[i.size]:(p.stock[i.size]||0)+i.qty}})});remove('sales',s.id);toast('Venda excluída e peças devolvidas.');return true},
  form=>{const tot=()=>{const sum=[...form.querySelectorAll('[data-line]')].reduce((a,l)=>{const p=prod(l.querySelector('[name=l_p]').value);return a+(p?p.price*(parseInt(l.querySelector('[name=l_q]').value)||0):0)},0)-toCents(form.discount.value);form.querySelector('#tot').textContent=money(Math.max(0,sum))};
   const wire=()=>{form.querySelectorAll('[data-rm-line]').forEach(b=>b.onclick=()=>{b.closest('[data-line]').remove();tot()})};
   form.querySelector('#addline').onclick=()=>{const p=S.products[0];if(!p)return;form.querySelector('#lines').insertAdjacentHTML('beforeend',lineHTML({productId:p.id,size:'M',qty:1},Date.now()));wire();tot()};
   form.addEventListener('input',tot);form.addEventListener('change',tot);wire();tot()})}

/* ---------- Orçamentos ---------- */
function itemOrc(b){const venc=b.status==='Aberto'&&b.validUntil&&b.validUntil<today();return `<button class="item" data-edit-orc="${b.id}"><span class="grow"><b>${esc(b.title)}</b><small>${esc(b.kind)} · ${esc(b.party||'sem nome')} · ${dataBR(b.date)}</small>${b.validUntil?`<small>${venc?'Venceu':'Válido até'} ${dataBR(b.validUntil)}</small>`:''}</span><span class="end"><b>${money(b.value)}</b><span class="tag ${b.status==='Aprovado'?'ok':b.status==='Recusado'||venc?'bad':'warn'}">${venc?'Vencido':b.status}</span></span></button>`}
function vOrc(){const list=S.budgets.filter(b=>filtro.orc==='Todos'||b.status===filtro.orc).sort((a,b)=>b.date.localeCompare(a.date));
 return `<h1 class="page">Orçamentos</h1><p class="lead">Orçamentos que você pediu (fornecedores, estampas, produção) e que enviou (atacado, parcerias).</p>
 <div class="row" style="margin-bottom:12px"><button class="btn main" data-act="novo-orc">${svg('plus',18)} Novo orçamento</button></div>
 <div class="seg">${['Aberto','Aprovado','Recusado','Todos'].map(v=>`<button data-seg-orc="${v}" class="${filtro.orc===v?'on':''}">${v==='Aberto'?'Em aberto':v==='Todos'?'Todos':v+'s'}</button>`).join('')}</div>
 ${list.length?`<div class="list">${list.map(itemOrc).join('')}</div>`:'<div class="empty">Nenhum orçamento aqui.</div>'}`}
function formOrc(b){const n=!b;b=b||{id:uid(),date:today(),title:'',kind:'Recebido de fornecedor',party:'',value:0,status:'Aberto',validUntil:'',details:''};
 openDlg(n?'Novo orçamento':'Editar orçamento',`<label class="field">O que é<input name="title" value="${esc(b.title)}" required maxlength="120" placeholder="Ex.: 50 camisetas oversized, estampa silk"></label>
  <div class="grid2"><label class="field">Tipo<select name="kind">${['Recebido de fornecedor','Enviado para cliente'].map(c=>`<option ${c===b.kind?'selected':''}>${c}</option>`).join('')}</select></label><label class="field">Fornecedor / cliente<input name="party" value="${esc(b.party)}" maxlength="80"></label></div>
  <div class="grid2"><label class="field">Valor total (R$)<input name="value" inputmode="decimal" value="${fromCents(b.value)}" required></label><label class="field">Situação<select name="status">${['Aberto','Aprovado','Recusado'].map(c=>`<option ${c===b.status?'selected':''}>${c}</option>`).join('')}</select></label></div>
  <div class="grid2"><label class="field">Data<input name="date" type="date" value="${b.date}"></label><label class="field">Válido até<input name="validUntil" type="date" value="${b.validUntil||''}"></label></div>
  <label class="field">Detalhes (itens, prazos, condições)<textarea name="details" maxlength="3000">${esc(b.details||'')}</textarea></label>
  ${n?'':`<label class="check"><input type="checkbox" name="lancar"> Lançar nas Finanças como ${b.kind.startsWith('Recebido')?'conta a pagar':'valor a receber'} (ao aprovar)</label>`}`,
  async f=>{const title=f.title.value.trim();if(!title)return 'Informe o que é o orçamento.';const value=toCents(f.value.value);if(value<=0)return 'Informe o valor.';
   const nb={...b,title,kind:f.kind.value,party:f.party.value.trim(),value,status:f.status.value,date:f.date.value||today(),validUntil:f.validUntil.value,details:f.details.value.trim()};upsert('budgets',nb);
   if(f.lancar?.checked&&nb.status==='Aprovado')upsert('entries',{id:uid(),date:today(),desc:'Orçamento: '+title+(nb.party?' · '+nb.party:''),type:nb.kind.startsWith('Recebido')?'Saída':'Entrada',category:'Orçamento',value,paid:false});
   toast(n?'Orçamento salvo.':'Orçamento atualizado.')},
  n?null:()=>{if(!confirm('Excluir o orçamento "'+b.title+'"?'))return false;remove('budgets',b.id);toast('Orçamento excluído.');return true})}

/* ---------- Finanças ---------- */
function itemEntrada(e){const late=!e.paid&&e.date<today();return `<button class="item" data-edit-ent="${e.id}"><span class="grow"><b>${esc(e.desc)}</b><small>${dataBR(e.date)} · ${esc(e.category||'Geral')}</small></span><span class="end"><b style="color:${e.type==='Entrada'?'var(--ok)':'var(--text)'}">${e.type==='Entrada'?'+':'−'} ${money(e.value)}</b><span class="tag ${e.paid?'ok':late?'bad':'warn'}">${e.paid?(e.type==='Entrada'?'Recebido':'Pago'):late?'Atrasado':'Pendente'}</span></span></button>`}
function vFin(){const k=filtro.fin||mesKey(today()),r=mesResumo(k);const list=S.entries.filter(e=>mesKey(e.date)===k||(!e.paid&&mesKey(e.date)<k)).sort((a,b)=>a.date.localeCompare(b.date));
 const opts=[...new Set([mesKey(today()),...S.entries.map(e=>mesKey(e.date)),...S.sales.map(s=>mesKey(s.date))])].sort().reverse();
 return `<h1 class="page">Finanças</h1><p class="lead">As vendas pagas entram sozinhas. Aqui você lança o resto: compras, fretes, anúncios, taxas e outras entradas.</p>
 <div class="row" style="margin-bottom:12px"><button class="btn main" data-act="nova-saida">${svg('plus',18)} Saída</button><button class="btn" data-act="nova-entrada">${svg('plus',18)} Entrada</button><select data-filtro="fin" style="width:auto;margin-left:auto" aria-label="Mês">${opts.map(o=>`<option value="${o}" ${o===k?'selected':''}>${new Date(o+'-15T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</option>`).join('')}</select></div>
 <div class="grid4"><div class="kpi"><small>Vendas pagas</small><strong>${money(r.rec)}</strong></div><div class="kpi"><small>Outras entradas</small><strong>${money(r.extras)}</strong></div><div class="kpi"><small>Saídas pagas</small><strong>${money(r.saidas)}</strong></div><div class="kpi"><small>Saldo</small><strong style="color:${r.saldo<0?'var(--bad)':'var(--ok)'}">${money(r.saldo)}</strong></div></div>
 <div class="sec"><h3>Lançamentos do mês e pendentes</h3>${list.length?`<div class="list">${list.map(itemEntrada).join('')}</div>`:'<div class="empty">Nenhum lançamento neste mês.</div>'}</div>`}
function formEntradaFin(e,type){const n=!e;e=e||{id:uid(),date:today(),desc:'',type,category:type==='Saída'?'Estoque':'Outros',value:0,paid:true};
 const cats=e.type==='Saída'?['Estoque','Estampa / produção','Frete','Anúncios','Embalagem','Taxas','Outros']:['Atacado','Parceria','Aporte','Outros'];
 openDlg((n?'Nova ':'Editar ')+e.type.toLowerCase(),`<label class="field">Descrição<input name="desc" value="${esc(e.desc)}" required maxlength="140"></label>
  <div class="grid2"><label class="field">Valor (R$)<input name="value" inputmode="decimal" value="${fromCents(e.value)}" required></label><label class="field">Data<input name="date" type="date" value="${e.date}"></label></div>
  <div class="grid2"><label class="field">Categoria<select name="category">${cats.map(c=>`<option ${c===e.category?'selected':''}>${c}</option>`).join('')}</select></label><label class="field">Situação<select name="paid"><option value="1" ${e.paid?'selected':''}>${e.type==='Saída'?'Pago':'Recebido'}</option><option value="0" ${e.paid?'':'selected'}>Pendente</option></select></label></div>`,
  async f=>{const desc=f.desc.value.trim();if(!desc)return 'Informe a descrição.';const value=toCents(f.value.value);if(value<=0)return 'Informe o valor.';upsert('entries',{...e,desc,value,date:f.date.value||today(),category:f.category.value,paid:f.paid.value==='1'});toast('Lançamento salvo.')},
  n?null:()=>{if(!confirm('Excluir este lançamento?'))return false;remove('entries',e.id);toast('Lançamento excluído.');return true})}

/* ---------- Ajustes ---------- */
function vAjustes(){return `<h1 class="page">Ajustes</h1><p class="lead">Conta conectada: <b>${esc(COFRE?.user||'')}</b>. Os dados ficam num repositório privado do GitHub e aparecem iguais em todos os aparelhos.</p>
 <div class="list">
 <div class="card" style="display:grid;gap:10px"><b>Instalar no iPhone</b><p class="note">No Safari, toque em Compartilhar → "Adicionar à Tela de Início". Vira um ícone de app.</p></div>
 <div class="card" style="display:grid;gap:10px"><b>Cópia dos dados</b><p class="note">Baixe uma cópia (arquivo .json) uma vez por mês para guardar no Drive.</p><button class="btn" data-act="export">Baixar cópia</button></div>
 <form class="card" id="fsenha" style="display:grid;gap:10px"><b>Trocar senha</b>${pwField('ns1','Nova senha','new-password')}${pwField('ns2','Repita a nova senha','new-password')}<button class="btn">Trocar senha</button></form>
 <form class="card" id="ftok" style="display:grid;gap:10px"><b>Trocar chave do GitHub</b><p class="note">Use quando a chave vencer (validade de 1 ano). Mesmas permissões do primeiro acesso: repositórios Blessaint e studio-evolution-gestao-dados, Contents em leitura e escrita.</p><input id="ntok" type="password" placeholder="github_pat_…" autocomplete="off"><button class="btn">Salvar nova chave</button></form>
 <button class="btn danger" data-act="sair">Sair deste aparelho</button>
 <p class="note">Esqueceu a senha? Os dados não se perdem: ficam no GitHub. É só criar um cadeado novo com o Studio.</p>
 <p class="note">Feito pelo Studio Evolution Tech.</p></div>`}

/* ---------- ligações ---------- */
function bindMain(m){
 m.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.act;
  if(a==='nova-venda'){if(!S.products.length)return toast('Cadastre uma peça primeiro.');formVenda()}
  else if(a==='entrada-estoque'){if(!S.products.length)return toast('Cadastre uma peça primeiro.');formEntrada()}
  else if(a==='novo-prod')formProd();else if(a==='novo-orc')formOrc();
  else if(a==='nova-saida')formEntradaFin(null,'Saída');else if(a==='nova-entrada')formEntradaFin(null,'Entrada');
  else if(a==='export'){const bl=new Blob([JSON.stringify({app:'BLESSAINT Business',exportedAt:new Date().toISOString(),dados:S},null,2)],{type:'application/json'});const l=document.createElement('a');l.href=URL.createObjectURL(bl);l.download='blessaint-business-'+today()+'.json';l.click();URL.revokeObjectURL(l.href);toast('Cópia baixada.')}
  else if(a==='sair'){if(confirm('Sair deste aparelho? Para voltar, use a senha.'))sair()}});
 m.querySelectorAll('[data-edit-prod]').forEach(b=>b.onclick=()=>formProd(prod(b.dataset.editProd)));
 m.querySelectorAll('[data-edit-venda]').forEach(b=>b.onclick=()=>formVenda(S.sales.find(x=>x.id===b.dataset.editVenda)));
 m.querySelectorAll('[data-edit-orc]').forEach(b=>b.onclick=()=>formOrc(S.budgets.find(x=>x.id===b.dataset.editOrc)));
 m.querySelectorAll('[data-edit-ent]').forEach(b=>b.onclick=()=>formEntradaFin(S.entries.find(x=>x.id===b.dataset.editEnt)));
 m.querySelectorAll('[data-seg-vendas]').forEach(b=>b.onclick=()=>{filtro.vendas=b.dataset.segVendas;render()});
 m.querySelectorAll('[data-seg-orc]').forEach(b=>b.onclick=()=>{filtro.orc=b.dataset.segOrc;render()});
 const fe=m.querySelector('[data-filtro=estoque]');if(fe)fe.oninput=()=>{filtro.estoque=fe.value;const pos=fe.selectionStart;render();const n=$('[data-filtro=estoque]');n.focus();n.setSelectionRange(pos,pos)};
 const ff=m.querySelector('[data-filtro=fin]');if(ff)ff.onchange=()=>{filtro.fin=ff.value;render()};
 bindPw(m);
 const fs=m.querySelector('#fsenha');if(fs)fs.onsubmit=async e=>{e.preventDefault();const a=$('#ns1').value,b=$('#ns2').value;if(a.length<6)return toast('A senha precisa de pelo menos 6 caracteres.');if(a!==b)return toast('As senhas não são iguais.');
  try{toast('Trocando a senha…');const salt=crypto.getRandomValues(new Uint8Array(16));const k=await deriveKey(a,salt,ITER);const cofre={v:1,salt:b64(salt),iter:ITER,user:COFRE.user,box:await enc(k,{token:SESS.token})};
   await putCofre(cofre);KEY=k;COFRE=cofre;await cacheLocal();if(ls.get(LS.sess))ls.set(LS.sess,{token:SESS.token,key:await exportKey(k)});fs.reset();toast('Senha trocada. Use a nova senha nos outros aparelhos.')}catch{toast('Não consegui trocar a senha. Verifique a internet.')}};
 const ft=m.querySelector('#ftok');if(ft)ft.onsubmit=async e=>{e.preventDefault();const t=$('#ntok').value.trim();if(!/^(github_pat_|ghp_)/.test(t))return toast('Isso não parece uma chave do GitHub.');
  try{await gh(DATA_API,{},t);const cofre={...COFRE,box:await enc(KEY,{token:t})};await putCofre(cofre,t);SESS.token=t;COFRE=cofre;if(ls.get(LS.sess))ls.set(LS.sess,{token:t,key:await exportKey(KEY)});ft.reset();toast('Chave atualizada.')}catch{toast('Chave sem permissão. Confira os dois repositórios com Contents.')}};
}
function openDlg(title,body,onSave,onDelete,onOpen){
 dlg.innerHTML=`<form method="dialog" id="df"><div class="mh"><h2>${esc(title)}</h2><button type="button" class="btn small" data-close aria-label="Fechar">${svg('x',18)}</button></div><div class="mb">${body}<div class="err" id="derr" role="alert"></div></div><div class="mf">${onDelete?`<button type="button" class="btn danger" data-del>${svg('trash',16)} Excluir</button>`:''}<div class="right"><button type="button" class="btn" data-close>Cancelar</button><button class="btn main" type="submit">Salvar</button></div></div></form>`;
 const f=dlg.querySelector('#df');dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dlg.close());
 f.onsubmit=async e=>{e.preventDefault();const err=await onSave(f);if(err){dlg.querySelector('#derr').textContent=err;return}dlg.close();render()};
 const d=dlg.querySelector('[data-del]');if(d)d.onclick=()=>{if(onDelete()){dlg.close();render()}};
 if(onOpen)onOpen(f);dlg.showModal()}
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
addEventListener('online',()=>{if(SESS&&syncState==='off')push()});
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&SESS&&KEY&&!pushing){try{const r=await pull();S=merge(S,r.state);await cacheLocal();setSync('ok');if(!dlg.open)render()}catch{}}});

/* ---------- início ---------- */
(async function boot(){
 if(!crypto.subtle){app.innerHTML='<div class="lock"><div class="lock-box"><h2>Abra pelo endereço seguro</h2><p class="sub">Use https://www.blessaint.com.br/business/</p></div></div>';return}
 app.innerHTML='<div class="lock"><div class="lock-box"><img class="lock-logo" src="'+LOGO+'" alt="BLESSAINT"><p class="sub">Carregando…</p></div></div>';
 const cofreP=fetchCofre();const sess=ls.get(LS.sess);
 if(sess?.key){try{KEY=await importKey(sess.key);SESS={token:sess.token};COFRE=ls.get(LS.cofre);await entrar();cofreP.then(c=>{if(c&&c!=='offline')COFRE=c});return}catch{ls.del(LS.sess)}}
 COFRE=await cofreP;
 if(COFRE==='offline'){app.innerHTML='<div class="lock"><div class="lock-box"><h2>Sem internet</h2><p class="sub">Conecte o aparelho e tente de novo.</p><button class="btn main full" onclick="location.reload()">Tentar de novo</button></div></div>';return}
 if(!COFRE)telaSetup();else telaLogin()})();
})();
