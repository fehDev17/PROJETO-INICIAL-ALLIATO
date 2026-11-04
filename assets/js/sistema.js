(()=>{
if(document.body.dataset.page!=='admin')return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const CK='aliatto_clients_v1',G=window.AL_CONFIG||{};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const mshort=v=>v>=1e6?'R$ '+(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mi':v>=1e5?'R$ '+Math.round(v/1e3).toLocaleString('pt-BR')+' mil':money(v);
const toast=(m,t)=>(window.ALtoast||alert)(m,t);
const ic=n=>`<iconify-icon icon="lucide:${n}"></iconify-icon>`;
const cl=()=>{try{return JSON.parse(localStorage.getItem(CK))||[]}catch(e){return[]}},sv=l=>localStorage.setItem(CK,JSON.stringify(l));
const REG=['MEI','Simples Nacional','Lucro Presumido','Lucro Real','Pessoa Física'],ST=['Ativo','Em implantação','Inativo'];
const REQ=['Cartão CNPJ','Contrato social / Requerimento','Documento do responsável','Comprovante de endereço'],OTH=['Certificado digital','Procuração','Outros'];
const dig=s=>String(s||'').replace(/\D/g,''),mask=v=>{v=dig(v).slice(0,14);return v.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')};
const okCnpj=c=>{c=dig(c);if(c.length!==14||/^(\d)\1+$/.test(c))return false;const f=n=>{let s=0,p=n-7;for(let i=0;i<n;i++){s+=c[i]*p--;if(p<2)p=9}const r=s%11;return r<2?0:11-r};return f(12)==c[12]&&f(13)==c[13]};
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('aliatto_docs',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const fput=async(k,b)=>{const d=await idb();return new Promise(r=>{const t=d.transaction('f','readwrite');t.objectStore('f').put(b,k);t.oncomplete=r})};
const fget=async k=>{const d=await idb();return new Promise(r=>{const q=d.transaction('f').objectStore('f').get(k);q.onsuccess=()=>r(q.result)})};
const fdel=async k=>{const d=await idb();return new Promise(r=>{const t=d.transaction('f','readwrite');t.objectStore('f').delete(k);t.oncomplete=r})};
const kb=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
const dfmt=d=>d?new Date(d+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const docsOk=c=>REQ.filter(t=>(c.docs||[]).some(d=>d.tipo===t));

/* ---- Google ---- */
if(G.GOOGLE_CLIENT_ID){const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
 s.onload=()=>{google.accounts.id.initialize({client_id:G.GOOGLE_CLIENT_ID,callback:r=>window.ALGoogle&&window.ALGoogle(r.credential)});
  google.accounts.id.renderButton($('#gbtn'),{theme:'outline',size:'large',shape:'pill',text:'signin_with',width:320,locale:'pt-BR'})};document.head.appendChild(s)}
else $('#gbtn').innerHTML='<button type="button" class="al-gbtn" disabled>Entrar com Google</button><small class="d-block mt-1 text-secondary">Login Google disponível após configurar o Client ID (assets/js/config.js).</small>';

/* ---- estrutura ---- */
let view='dash',cur=null,isNew=false,draftFiles=[],term='',fst='';
const FLD=[['sec','Empresa'],['razao','Razão social *'],['fantasia','Nome fantasia'],['cnpj','CNPJ *'],['regime','Regime tributário','sel',REG],['cnae','CNAE principal'],['abertura','Data de abertura','date'],['status','Situação','sel',ST],
['sec','Contrato e certificado'],['honor','Honorário mensal (R$)','number'],['inicio','Início do contrato','date'],['certval','Vencimento do certificado digital','date'],
['sec','Responsável'],['resp','Nome do responsável'],['cpf','CPF do responsável'],['email','E-mail','email'],['tel','Telefone / WhatsApp'],
['sec','Endereço'],['cep','CEP'],['rua','Logradouro'],['num','Número'],['comp','Complemento'],['bairro','Bairro'],['cidade','Cidade'],['uf','UF'],['sec','Observações'],['obs','Observações internas','area']];
const nav=$('.sy-nav');
const show=v=>{view=v;$$('.sy-nav [data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));['dash','agenda','cli','docs','news'].forEach(k=>$('#v-'+k).hidden=k!==v);({dash,agenda,cli:list,docs:docsView})[v]?.();badges();scrollTo(0,0)};
nav&&nav.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)show(b.dataset.v)});
const hh=()=>{const h=$('.header');h&&document.documentElement.style.setProperty('--hh',h.offsetHeight+'px')};addEventListener('resize',hh);addEventListener('scroll',hh,{passive:true});
const init=()=>{document.body.classList.add('sy-on');hh();$('#mode').innerHTML=window.ALmode&&ALmode()==='server'?`${ic('cloud-check')}<span>Servidor conectado. Notícias publicadas na hora.</span>`:`${ic('hard-drive')}<span>Modo local. Dados salvos só neste navegador.</span>`;const n=sessionStorage.getItem('al_ok')||'';$('#who2').textContent=n;$('#av').textContent=(n[0]||'?').toUpperCase();show('dash');idle()};
window.addEventListener('al-open',init);if(!$('#app').hidden)init();
let tm;const idle=()=>{clearTimeout(tm);tm=setTimeout(()=>{sessionStorage.removeItem('al_ok');location.reload()},20*60*1000)};['click','keydown','mousemove'].forEach(e=>addEventListener(e,()=>{if(!$('#app').hidden)idle()}));

/* ---- dashboard ---- */
function dash(){const l=cl(),a=l.filter(c=>c.status==='Ativo'),now=new Date(),h=$('#v-dash');
 const rec=a.reduce((s,c)=>s+Number(c.honor||0),0),nd=l.reduce((s,c)=>s+(c.docs||[]).length,0),pend=l.filter(c=>docsOk(c).length<4);
 const cert=l.filter(c=>c.certval).map(c=>({c,d:Math.ceil((new Date(c.certval+'T12:00:00')-now)/864e5)})).filter(x=>x.d<=30).sort((x,y)=>x.d-y.d);
 const cnt=(arr,f)=>arr.reduce((m,x)=>(m[f(x)]=(m[f(x)]||0)+1,m),{});
 const reg=cnt(l,c=>c.regime||'Não informado'),st=cnt(l,c=>c.status||'Ativo');
 const ev=events().slice(0,5),top=a.filter(c=>Number(c.honor)>0).sort((x,y)=>y.honor-x.honor).slice(0,5),uf=cnt(l,c=>(c.uf||'—').toUpperCase()),mu=Math.max(1,...Object.values(uf),1);
 const max=Math.max(1,...Object.values(reg)),cols={'Ativo':'#22b573','Em implantação':'#FFB020','Inativo':'#9aa7b6'};
 let acc=0,conic=Object.entries(st).map(([k,v])=>{const s=acc/l.length*360;acc+=v;return`${cols[k]||'#0B8CF0'} ${s}deg ${acc/l.length*360}deg`}).join(',');
 const months=[...Array(6)].map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);return{k:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),n:d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}});
 months.forEach(m=>m.v=l.filter(c=>(c.created||'').startsWith(m.k)).length);const mm=Math.max(1,...months.map(m=>m.v));
 const kp=[['building-2','Empresas sob gestão',l.length,''],['circle-check','Clientes ativos',a.length,'g'],['wallet','Receita mensal prevista',mshort(rec),'n',money(rec)],['trending-up','Ticket médio',mshort(a.length?rec/a.length:0),'n',money(a.length?rec/a.length:0)],['files','Documentos anexados',nd,''],['triangle-alert','Cadastros com pendência',pend.length,'y'],['shield-alert','Certificados a vencer (30 dias)',cert.length,'y'],['newspaper','Notícias no ar',(window.ALnews?ALnews():[]).filter(x=>x.status!=='rascunho').length,'n']];
 h.innerHTML=`<div class="sy-h"><div><small>Visão geral</small><h1>Dashboard</h1></div><div class="ad-tools"><button class="al-btn" data-go="cli">${ic('plus')} Novo cliente</button><button class="al-btn sec" id="csv">${ic('table')}Planilha (CSV)</button><button class="al-btn sec" id="bkp">${ic('database-backup')}Backup</button><label class="al-btn sec" style="cursor:pointer">${ic('upload')}Restaurar<input id="rst" type="file" accept=".json" hidden></label></div></div>
 ${l.length?'':`<div class="ad-warn" style="background:#eaf4ff;border-color:#b9d9f7;color:#1f4a73"><span><b>Seu dashboard está vazio.</b> Cadastre o primeiro cliente e os números aparecem aqui automaticamente.</span><button data-go="cli" style="background:#0B8CF0;color:#fff">Cadastrar cliente</button></div>`}
 <div class="ad-kpi">${kp.map(k=>`<div class="ad-k ${k[3]}"><i>${ic(k[0])}</i><div><b title="${esc(k[4]||k[2])}">${k[2]}</b><span>${k[1]}</span></div></div>`).join('')}</div>
 <div class="sy-grid"><div class="al-panel"><h3>Por regime tributário</h3>${Object.entries(reg).map(([k,v])=>`<div class="sy-bar"><span>${esc(k)}</span><div><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join('')||'<p class="text-secondary">Sem dados.</p>'}</div>
 <div class="al-panel"><h3>Por situação</h3><div class="sy-donut"><div style="background:${l.length?`conic-gradient(${conic})`:'#e5ecf4'}"><span>${l.length}</span></div><ul>${Object.entries(st).map(([k,v])=>`<li><i style="background:${cols[k]||'#0B8CF0'}"></i>${esc(k)} <b>${v}</b></li>`).join('')}</ul></div></div>
 <div class="al-panel"><h3>Novos clientes (6 meses)</h3><div class="sy-cols">${months.map(m=>`<div><b>${m.v}</b><i style="height:${m.v/mm*100+4}%"></i><span>${m.n}</span></div>`).join('')}</div></div>
 <div class="al-panel"><h3>Pendências de documentos</h3>${pend.slice(0,5).map(c=>`<a class="sy-li" data-open="${c.id}"><b>${esc(c.fantasia||c.razao)}</b><span>faltam: ${REQ.filter(t=>!docsOk(c).includes(t)).join(', ')}</span></a>`).join('')||'<p class="text-secondary">Nenhuma pendência. Tudo em dia.</p>'}</div>
 <div class="al-panel"><h3>Certificados digitais</h3>${cert.slice(0,5).map(x=>`<a class="sy-li" data-open="${x.c.id}"><b>${esc(x.c.fantasia||x.c.razao)}</b><span>${x.d<0?'vencido há '+-x.d+' dia(s)':'vence em '+x.d+' dia(s)'}</span></a>`).join('')||'<p class="text-secondary">Nenhum certificado vencendo nos próximos 30 dias.</p>'}</div>
 <div class="al-panel"><h3>Próximos vencimentos</h3>${ev.map(e=>`<a class="sy-li" data-agenda="1"><b>${esc(e.t)}</b><span><em class="sy-d ${e.n<=3?'r':e.n<=10?'y':''}">${e.n===0?'hoje':e.n===1?'amanhã':'em '+e.n+' dias'}</em> ${fd(e.d)}</span></a>`).join('')}</div>
 <div class="al-panel"><h3>Maiores honorários</h3>${top.map(c=>`<a class="sy-li" data-open="${c.id}"><b>${esc(c.fantasia||c.razao)}</b><span>${money(c.honor)} por mês</span></a>`).join('')||'<p class="text-secondary">Informe o honorário mensal nos cadastros.</p>'}</div>
 <div class="al-panel"><h3>Clientes por estado</h3>${Object.entries(uf).map(([k,v])=>`<div class="sy-bar"><span>${esc(k)}</span><div><i style="width:${v/mu*100}%"></i></div><b>${v}</b></div>`).join('')||'<p class="text-secondary">Sem dados.</p>'}</div>
 <div class="al-panel"><h3>Últimos cadastros</h3>${l.slice().sort((x,y)=>(y.created||'').localeCompare(x.created||'')).slice(0,5).map(c=>`<a class="sy-li" data-open="${c.id}"><b>${esc(c.fantasia||c.razao)}</b><span>${esc(c.regime||'')} · ${mask(c.cnpj)}</span></a>`).join('')||'<p class="text-secondary">Nenhum cliente ainda.</p>'}</div></div>`;
 h.onclick=e=>{const g=e.target.closest('[data-go]'),o=e.target.closest('[data-open]');if(e.target.closest('[data-agenda]'))show('agenda');if(g){show('cli');if(!cl().length||g.dataset.go==='cli')edit(null)}if(o){show('cli');edit(cl().find(c=>c.id===o.dataset.open))}};
 $('#csv').onclick=()=>{const H=['Razão social','Nome fantasia','CNPJ','Regime','Situação','Honorário','Responsável','E-mail','Telefone','Cidade','UF'];const r=l.map(c=>[c.razao,c.fantasia,mask(c.cnpj),c.regime,c.status,c.honor,c.resp,c.email,c.tel,c.cidade,c.uf].map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';'));dl('\ufeff'+[H.join(';'),...r].join('\n'),'clientes-aliatto.csv','text/csv')};
 $('#bkp').onclick=()=>{dl(JSON.stringify(cl()),'backup-clientes-aliatto.json','application/json');toast('Backup baixado. Os arquivos anexados ficam apenas neste navegador.')};
 $('#rst').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!Array.isArray(d))throw 0;if(confirm('Restaurar '+d.length+' cliente(s)? Isso substitui os dados atuais.')){sv(d);dash();toast('Backup restaurado')}}catch(x){toast('Arquivo de backup inválido','err')}})}}
const dl=(t,n,m)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;a.click()};


/* ---- agenda fiscal, documentos e contadores ---- */
const fd=d=>d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.','');
function events(){const t0=new Date();t0.setHours(0,0,0,0);const y=t0.getFullYear(),m0=t0.getMonth(),ev=[];const add=(d,t,s)=>ev.push({d,t,s});
 for(let m=0;m<4;m++){add(new Date(y,m0+m,20),'DAS: Simples Nacional e MEI','Vencimento mensal');add(new Date(y,m0+m,20),'FGTS: recolhimento','Vencimento mensal');let u=new Date(y,m0+m+1,0);while([0,6].includes(u.getDay()))u.setDate(u.getDate()-1);add(u,'DCTFWeb: transmissão','Último dia útil do mês')}
 [y,y+1].forEach(a=>{add(new Date(a,10,30),'13º salário: 1ª parcela','Prazo legal');add(new Date(a,11,20),'13º salário: 2ª parcela','Prazo legal');add(new Date(a,4,31),'DASN-SIMEI: declaração anual do MEI','Prazo anual');add(new Date(a,2,31),'DEFIS: declaração do Simples Nacional','Prazo anual')});
 cl().forEach(c=>{if(c.certval)add(new Date(c.certval+'T12:00:00'),'Certificado digital: '+(c.fantasia||c.razao),'Vencimento do certificado')});
 return ev.map(e=>({...e,n:Math.round((e.d-t0)/864e5)})).filter(e=>e.n>=0&&e.n<=75).sort((a,b)=>a.d-b.d)}
function agenda(){const h=$('#v-agenda'),ev=events();h.innerHTML=`<div class="sy-h"><div><small>Próximos 75 dias</small><h1>Agenda fiscal</h1></div></div><div class="al-panel">${ev.map(e=>`<div class="sy-ev"><div class="sy-date"><b>${String(e.d.getDate()).padStart(2,'0')}</b><span>${e.d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div><div><b>${esc(e.t)}</b><small>${e.s}</small></div><em class="sy-d ${e.n<=3?'r':e.n<=10?'y':''}">${e.n===0?'hoje':e.n===1?'amanhã':'em '+e.n+' dias'}</em></div>`).join('')}<p class="text-secondary small mt-3 mb-0">Datas gerais de referência. Quando o dia cai em fim de semana ou feriado o prazo pode mudar; confirme no calendário oficial. Os vencimentos de certificado vêm dos cadastros dos clientes.</p></div>`}
function docsView(){const h=$('#v-docs'),all=cl().flatMap(c=>(c.docs||[]).map(d=>({...d,c})));let f='',q='';
 h.innerHTML=`<div class="sy-h"><div><small>Central de arquivos</small><h1>Documentos</h1></div></div><div class="ad-bar"><input id="dq" type="search" placeholder="Buscar por arquivo ou cliente"><select id="dtp" class="sy-sel"><option value="">Todos os tipos</option>${[...REQ,...OTH].map(t=>`<option>${t}</option>`).join('')}</select></div><div id="dlist" class="sy-docs"></div>`;
 const draw=()=>{const l=all.filter(d=>(!f||d.tipo===f)&&(d.nome+(d.c.razao||'')+(d.c.fantasia||'')).toLowerCase().includes(q));
  $('#dlist').innerHTML=l.map(d=>`<div class="sy-doc"><i>${ic('file-text')}</i><div><b>${esc(d.nome)}</b><small>${esc(d.c.fantasia||d.c.razao)} · ${esc(d.tipo)} · ${kb(d.size)} · ${dfmt(d.date)}</small></div><button class="ad-ico" data-i="${d.id}" data-n="${esc(d.nome)}" title="Baixar">${ic('download')}</button><button class="ad-ico" data-c="${d.c.id}" title="Abrir ficha do cliente">${ic('folder-open')}</button></div>`).join('')||'<div class="ad-empty">Nenhum documento encontrado. Anexe arquivos na ficha de cada cliente.</div>'};
 $('#dq').oninput=e=>{q=e.target.value.toLowerCase();draw()};$('#dtp').onchange=e=>{f=e.target.value;draw()};
 $('#dlist').onclick=async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.c){show('cli');edit(cl().find(c=>c.id===b.dataset.c))}else{const x=await fget(b.dataset.i);if(x){const a=document.createElement('a');a.href=URL.createObjectURL(x);a.download=b.dataset.n;a.click()}else toast('Arquivo não encontrado neste navegador','err')}};draw()}
function badges(){const l=cl();$('#bc').textContent=l.length||'';$('#bd').textContent=l.reduce((s,c)=>s+(c.docs||[]).length,0)||''}

/* ---- clientes ---- */
function list(){const h=$('#v-cli');h.innerHTML=`<div class="sy-h"><div><small>Cadastro</small><h1>Clientes</h1></div><button class="al-btn" id="nc">${ic('plus')} Novo cliente</button></div>
 <div class="ad-bar"><input id="cq" type="search" placeholder="Buscar por nome ou CNPJ" value="${esc(term)}"><select id="cs" class="sy-sel"><option value="">Todas as situações</option>${ST.map(s=>`<option ${fst===s?'selected':''}>${s}</option>`).join('')}</select></div><div id="cr" class="ad-list"></div>`;
 const draw=()=>{const l=cl().filter(c=>(!fst||c.status===fst)&&(((c.razao||'')+(c.fantasia||'')).toLowerCase().includes(term.toLowerCase())||(dig(term)&&dig(c.cnpj).includes(dig(term)))));
  $('#cr').innerHTML=l.map(c=>{const n=docsOk(c).length;return`<article class="ad-row sy-row"><div class="sy-ini">${esc((c.fantasia||c.razao||'?')[0])}</div><div><h3>${esc(c.razao)}</h3><small>${mask(c.cnpj)} · ${esc(c.cidade||'—')}${c.uf?'/'+esc(c.uf):''}</small></div><div><span class="sy-tag">${esc(c.regime||'—')}</span> <span class="sy-tag st-${(c.status||'').slice(0,3)}">${esc(c.status||'Ativo')}</span></div><div class="sy-prog" title="${n} de 4 documentos obrigatórios"><i style="width:${n*25}%"></i><small>${n}/4 docs</small></div><button class="ad-edit" data-id="${c.id}">${ic('folder-open')}Abrir ficha</button></article>`}).join('')||'<div class="ad-empty">Nenhum cliente encontrado. Clique em "Novo cliente" para cadastrar.</div>';
  $$('#cr .ad-edit').forEach(b=>b.onclick=()=>edit(cl().find(c=>c.id===b.dataset.id)))};
 $('#cq').oninput=e=>{term=e.target.value;draw()};$('#cs').onchange=e=>{fst=e.target.value;draw()};$('#nc').onclick=()=>edit(null);draw()}
function edit(c){isNew=!c;cur=c?JSON.parse(JSON.stringify(c)):{id:'c'+Date.now().toString(36),docs:[],status:'Ativo',regime:'Simples Nacional',created:new Date().toISOString().slice(0,10)};draftFiles=[];
 const h=$('#v-cli');let g='',open=false;FLD.forEach(f=>{if(f[0]==='sec'){g+=(open?'</div>':'')+`<h3 class="sy-sec">${f[1]}</h3><div class="g">`;open=true;return}
  const v=esc(cur[f[0]]??'');g+=`<div ${f[2]==='area'?'style="grid-column:1/-1"':''}><label for="c-${f[0]}">${f[1]}</label>`+(f[2]==='sel'?`<select id="c-${f[0]}">${f[3].map(o=>`<option ${cur[f[0]]===o?'selected':''}>${o}</option>`).join('')}</select>`:f[2]==='area'?`<textarea id="c-${f[0]}" rows="3" class="sy-ta">${v}</textarea>`:`<input id="c-${f[0]}" type="${f[2]||'text'}" value="${v}" ${f[0]==='cnpj'?'maxlength="18" inputmode="numeric"':''} ${f[2]==='number'?'step="0.01" min="0" inputmode="decimal"':''}>`)+'</div>'});
 h.innerHTML=`<form id="cf" class="al-form"><div class="sy-h"><div><small>${isNew?'Novo cadastro':'Ficha do cliente'}</small><h1>${isNew?'Novo cliente':esc(cur.razao)}</h1></div><button type="button" class="al-btn sec" id="cb">${ic('arrow-left')}Voltar</button></div>
 <div class="al-panel">${g}</div></div>
 <div class="al-panel mt-3"><h3 class="sy-sec">Documentos</h3><div class="sy-check" id="ck"></div><div class="sy-up"><select id="dt">${[...REQ,...OTH].map(t=>`<option>${t}</option>`).join('')}</select><label class="al-btn sec" style="cursor:pointer">${ic('paperclip')}Escolher arquivos<input id="df" type="file" multiple hidden></label></div><div id="dl" class="sy-docs"></div><p class="text-secondary small mb-0">Arquivos ficam salvos apenas neste navegador. Use PDF ou imagem.</p></div>
 <div class="ad-act"><button class="al-btn">${ic('save')} Salvar cliente</button>${isNew?'':`<button type="button" id="cd" class="al-btn sec" style="color:#e5484d">${ic('trash-2')}Excluir cliente</button>`}</div></form>`;
 const cn=$('#c-cnpj');cn.value=mask(cn.value);cn.oninput=()=>{cn.value=mask(cn.value);cn.classList.toggle('bad',dig(cn.value).length===14&&!okCnpj(cn.value))};
 cn.insertAdjacentHTML('afterend',`<button type="button" class="sy-look" id="lk">${ic('search')}Buscar dados do CNPJ</button>`);
 const set=(k,v)=>{const e=$('#c-'+k);if(e&&v&&!e.value)e.value=v};
 $('#lk').onclick=async()=>{if(!okCnpj(cn.value)){toast('CNPJ inválido','err');return}try{const r=await fetch('https://brasilapi.com.br/api/cnpj/v1/'+dig(cn.value));if(!r.ok)throw 0;const d=await r.json();set('razao',d.razao_social);set('fantasia',d.nome_fantasia);set('cnae',d.cnae_fiscal+' - '+d.cnae_fiscal_descricao);set('abertura',d.data_inicio_atividade);set('cep',d.cep);set('rua',d.logradouro);set('num',d.numero);set('comp',d.complemento);set('bairro',d.bairro);set('cidade',d.municipio);set('uf',d.uf);set('email',(d.email||'').toLowerCase());set('tel',d.ddd_telefone_1);toast('Dados preenchidos. Confira antes de salvar.')}catch(e){toast('Não foi possível consultar agora. Preencha manualmente.','err')}};
 $('#c-cep').onblur=async()=>{const c=dig($('#c-cep').value);if(c.length!==8)return;try{const d=await(await fetch('https://viacep.com.br/ws/'+c+'/json/')).json();if(!d.erro){set('rua',d.logradouro);set('bairro',d.bairro);set('cidade',d.localidade);set('uf',d.uf)}}catch(e){}};
 const docs=()=>{const ok=docsOk(cur);$('#ck').innerHTML=REQ.map(t=>`<span class="${ok.includes(t)?'ok':''}">${ic(ok.includes(t)?'circle-check':'circle')}${t}</span>`).join('');
  $('#dl').innerHTML=cur.docs.map(d=>`<div class="sy-doc"><i>${ic('file-text')}</i><div><b>${esc(d.nome)}</b><small>${esc(d.tipo)} · ${kb(d.size)} · ${dfmt(d.date)}</small></div><button type="button" data-a="get" data-i="${d.id}" class="ad-ico" title="Baixar">${ic('download')}</button><button type="button" data-a="del" data-i="${d.id}" class="ad-ico del" title="Remover">${ic('trash-2')}</button></div>`).join('')||'<p class="text-secondary">Nenhum documento anexado.</p>'};docs();
 $('#df').onchange=async e=>{for(const f of e.target.files){if(f.size>15*1048576){toast(f.name+' passa de 15 MB','err');continue}const id='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);await fput(id,f);cur.docs.push({id,tipo:$('#dt').value,nome:f.name,size:f.size,date:new Date().toISOString().slice(0,10)});draftFiles.push(id)}e.target.value='';docs();toast('Documento anexado. Salve o cliente para concluir.')};
 $('#dl').onclick=async e=>{const b=e.target.closest('button');if(!b)return;const d=cur.docs.find(x=>x.id===b.dataset.i);if(b.dataset.a==='get'){const f=await fget(d.id);if(f){const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=d.nome;a.click()}else toast('Arquivo não encontrado neste navegador','err')}else if(confirm('Remover este documento?')){await fdel(d.id);cur.docs=cur.docs.filter(x=>x!==d);docs()}};
 const back=()=>{cur=null;list()};$('#cb').onclick=async()=>{if(isNew)for(const k of draftFiles)await fdel(k);back()};
 if($('#cd'))$('#cd').onclick=async()=>{if(confirm('Excluir este cliente e todos os documentos dele?')){for(const d of cur.docs)await fdel(d.id);sv(cl().filter(x=>x.id!==cur.id));toast('Cliente excluído');back()}};
 $('#cf').onsubmit=e=>{e.preventDefault();FLD.forEach(f=>{if(f[0]!=='sec')cur[f[0]]=$('#c-'+f[0]).value.trim()});cur.cnpj=dig(cur.cnpj);
  if(!cur.razao){toast('Informe a razão social','err');return}if(!okCnpj(cur.cnpj)){toast('CNPJ inválido. Confira os números.','err');return}
  let l=cl();if(l.some(x=>x.id!==cur.id&&x.cnpj===cur.cnpj)){toast('Já existe um cliente com este CNPJ','err');return}
  l=isNew?[...l,cur]:l.map(x=>x.id===cur.id?cur:x);sv(l);toast('Cliente salvo');back()};
 scrollTo({top:0,behavior:'smooth'})}
})();
