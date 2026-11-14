(()=>{
if(document.body.dataset.page!=='admin'||!window.SY)return;
const {esc,money,ic,toast,kb,dfmt,mask,dig,cl,fput,fget,fdel,modal,today,fail,show}=SY;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let TK=[],CE=[];
const svT=l=>{const o=TK;TK=l;return DB.reg.sync('tarefa',o,l).catch(e=>{TK=o;fail();throw e})};
const svC=l=>{const o=CE;CE=l;return DB.reg.sync('certificado',o,l).catch(e=>{CE=o;fail();throw e})};
SY.onInit(async()=>{[TK,CE]=await Promise.all([DB.reg.list('tarefa'),DB.reg.list('certificado')])});
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const dl=async(id,nome)=>{const f=await fget(id).catch(()=>null);if(f){const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=nome;a.click()}else toast('Arquivo não encontrado','err')};
/* anexos dentro de uma janela */
function attach(m,cur){cur.docs=cur.docs||[];const added=[],removed=[];
 const paint=()=>{m.querySelector('#mdl').innerHTML=cur.docs.map(d=>`<div class="sy-doc"><i>${ic('file-text')}</i><div><b>${esc(d.nome)}</b><small>${kb(d.size)} · ${dfmt(d.date)}</small></div><button type="button" class="ad-ico" data-g="${d.id}" title="Baixar">${ic('download')}</button><button type="button" class="ad-ico del" data-d="${d.id}" title="Remover">${ic('trash-2')}</button></div>`).join('')||'<p class="text-secondary small">Nenhum arquivo anexado.</p>'};paint();
 m.querySelector('#mf').onchange=async e=>{for(const f of e.target.files){if(f.size>15*1048576){toast(f.name+' passa de 15 MB','err');continue}const id=uid('d');try{await fput(id,f)}catch(x){toast('Falha ao enviar '+f.name,'err');continue}const d={id,nome:f.name,size:f.size,date:today()};cur.docs.push(d);added.push(d)}e.target.value='';paint()};
 m.querySelector('#mdl').onclick=async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.g){const d=cur.docs.find(x=>x.id===b.dataset.g);dl(d.id,d.nome)}else{const d=cur.docs.find(x=>x.id===b.dataset.d);cur.docs=cur.docs.filter(x=>x!==d);const i=added.indexOf(d);if(i>=0){added.splice(i,1);await fdel(d.id)}else removed.push(d);paint()}};
 return{commit:async()=>{for(const d of removed)await fdel(d.id);added.length=0},rollback:async()=>{for(const d of added)await fdel(d.id)}}}
const ATT=`<label>Anexos</label><div class="sy-up"><label class="al-btn sec" style="cursor:pointer">${ic('paperclip')}Anexar arquivos<input type="file" id="mf" multiple hidden></label></div><div id="mdl" class="sy-docs"></div>`;
const sel=(n,l,v)=>`<select name="${n}">${l.map(o=>`<option ${v===o?'selected':''}>${o}</option>`).join('')}</select>`;
const inp=(n,v,t='text',x='')=>`<input name="${n}" type="${t}" value="${esc(v??'')}" ${x}>`;
const val=(m,n)=>m.querySelector(`[name=${n}]`).value.trim();

/* ================= TAREFAS ================= */
const COLS=[['fazer','A Fazer','clock'],['andamento','Em Andamento','circle-play'],['concluido','Concluído','circle-check']];
const TCAT=['Controle','Gerencial','Reunião','Fiscal','Folha','Atendimento','Outro'],PRI=['Alta','Média','Baixa'];
let tq='',tc='',drag=null;
const ord=(a,b)=>(a.ord||0)-(b.ord||0);
function tarView(){const h=$('#v-tar');
 h.innerHTML=`<div class="sy-h"><div><small>Organização</small><h1>Minhas tarefas</h1></div><button class="al-btn" id="nt">${ic('plus')} Nova tarefa</button></div>
 <div id="tks" class="tk-sum"></div>
 <div class="ad-bar"><input id="tq" type="search" placeholder="Buscar tarefa" value="${esc(tq)}" aria-label="Buscar tarefa"><select id="tc" class="sy-sel"><option value="">Todas as categorias</option>${TCAT.map(c=>`<option ${tc===c?'selected':''}>${c}</option>`).join('')}</select></div>
 <div class="tk-board" id="tkb">${COLS.map(c=>`<div class="tk-col ${c[0]}" data-col="${c[0]}"><div class="tk-ch"><span>${ic(c[2])}${c[1]}</span><em id="n-${c[0]}">0</em><button class="ad-ico" data-new="${c[0]}" title="Adicionar em ${c[1]}">${ic('plus')}</button></div><div class="tk-list" id="l-${c[0]}"></div></div>`).join('')}</div>
 <p class="text-secondary small mt-3">Arraste os cartões entre as colunas para mudar o andamento. No celular, use as setas ‹ › do cartão.</p>`;
 const card=t=>{const ck=t.check||[],dn=ck.filter(x=>x.d).length,late=t.fim&&t.status!=='concluido'&&t.fim<today();
  return`<div class="tk-card" draggable="true" data-id="${t.id}"><div class="tk-tags"><span class="tk-t c${Math.max(0,TCAT.indexOf(t.cat))}">${esc(t.cat||'Outro')}</span><span class="tk-t p-${esc(t.prio)}">${esc(t.prio||'Média')}</span></div><b>${esc(t.titulo)}</b>${t.desc?`<p>${esc(t.desc)}</p>`:''}<div class="tk-m"><span class="${late?'late':''}">${ic('clock')}${t.ini?dfmt(t.ini):'—'}${t.fim?' → '+dfmt(t.fim):''}</span><span>${ic('square-check-big')}${dn}/${ck.length}</span><span>${ic('paperclip')}${(t.docs||[]).length}</span></div><div class="tk-mv"><button data-mv="-1" title="Mover para a esquerda" aria-label="Mover para a esquerda">‹</button><button data-mv="1" title="Mover para a direita" aria-label="Mover para a direita">›</button></div></div>`};
 const paint=()=>{const n=TK.length,by=s=>TK.filter(t=>t.status===s),pc=n?Math.round(by('concluido').length/n*100):0;
  $('#tks').innerHTML=`<div class="tk-s"><i class="b">${ic('list-checks')}</i><div><b>${n}</b><span>Total de tarefas</span><small>Todas as tarefas criadas</small></div></div><div class="tk-s"><i class="o">${ic('clock')}</i><div><b>${by('fazer').length}</b><span>A fazer</span><small>Aguardando execução</small></div></div><div class="tk-s"><i class="b">${ic('circle-play')}</i><div><b>${by('andamento').length}</b><span>Em andamento</span><small>Em execução</small></div></div><div class="tk-s"><i class="g">${ic('circle-check')}</i><div><b>${by('concluido').length}</b><span>Concluídas</span><small>Tarefas finalizadas</small></div></div><div class="tk-s tk-p"><span>Progresso geral</span><div><b>${pc}%</b> das tarefas concluídas</div><div class="tk-bar"><i style="width:${pc}%"></i></div></div>`;
  COLS.forEach(c=>{const l=by(c[0]).sort(ord).filter(t=>(!tc||t.cat===tc)&&(!tq||(t.titulo+' '+(t.desc||'')).toLowerCase().includes(tq.toLowerCase())));$('#n-'+c[0]).textContent=by(c[0]).length;$('#l-'+c[0]).innerHTML=l.map(card).join('')||'<div class="tk-empty">Arraste uma tarefa para cá</div>'})};
 paint();
 $('#nt').onclick=()=>tarForm(null,'fazer');$('#tq').oninput=e=>{tq=e.target.value;paint()};$('#tc').onchange=e=>{tc=e.target.value;paint()};
 const b=$('#tkb');
 const move=async(id,st,idx)=>{const t=TK.find(x=>x.id===id);if(!t)return;const col=TK.filter(x=>x.status===st&&x.id!==id).sort(ord);col.splice(Math.min(idx,col.length),0,{...t,status:st});const u=new Map(col.map((x,i)=>[x.id,{...x,ord:i}]));try{await svT(TK.map(x=>u.get(x.id)||x))}catch(e){}paint()};
 b.addEventListener('click',e=>{const mv=e.target.closest('[data-mv]'),nw=e.target.closest('[data-new]'),c=e.target.closest('.tk-card');
  if(nw)return tarForm(null,nw.dataset.new);
  if(mv){const t=TK.find(x=>x.id===c.dataset.id),i=COLS.findIndex(x=>x[0]===t.status)+Number(mv.dataset.mv);if(i>=0&&i<COLS.length)move(t.id,COLS[i][0],9999);return}
  if(c)tarForm(TK.find(x=>x.id===c.dataset.id))});
 b.addEventListener('dragstart',e=>{const c=e.target.closest('.tk-card');if(!c)return;drag=c.dataset.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',drag);setTimeout(()=>c.classList.add('drag'),0)});
 b.addEventListener('dragend',()=>{drag=null;$$('.tk-card.drag,.tk-col.over').forEach(x=>x.classList.remove('drag','over'))});
 b.addEventListener('dragover',e=>{const c=e.target.closest('.tk-col');if(!c||!drag)return;e.preventDefault();$$('.tk-col.over').forEach(x=>x!==c&&x.classList.remove('over'));c.classList.add('over')});
 b.addEventListener('drop',e=>{const c=e.target.closest('.tk-col');if(!c||!drag)return;e.preventDefault();const cards=[...c.querySelectorAll('.tk-card:not(.drag)')];let i=cards.findIndex(x=>{const r=x.getBoundingClientRect();return e.clientY<r.top+r.height/2});if(i<0)i=cards.length;const id=drag;drag=null;move(id,c.dataset.col,i)});
 window.__tkPaint=paint}
function tarForm(x,st){const t=x?JSON.parse(JSON.stringify(x)):{id:uid('t'),status:st||'fazer',cat:'Controle',prio:'Média',check:[],docs:[],ini:today()};t.check=t.check||[];let att;
 const m=modal(x?'Editar tarefa':'Nova tarefa',`<label>Título *</label>${inp('titulo',t.titulo,'text','required maxlength="120"')}<label>Descrição</label><textarea name="desc" rows="2" class="sy-ta">${esc(t.desc||'')}</textarea><div class="g"><div><label>Categoria</label>${sel('cat',TCAT,t.cat)}</div><div><label>Prioridade</label>${sel('prio',PRI,t.prio)}</div><div><label>Início</label>${inp('ini',t.ini,'date')}</div><div><label>Prazo</label>${inp('fim',t.fim,'date')}</div><div><label>Situação</label><select name="status">${COLS.map(c=>`<option value="${c[0]}" ${t.status===c[0]?'selected':''}>${c[1]}</option>`).join('')}</select></div><div><label>Cliente</label><select name="cid"><option value="">Nenhum</option>${cl().map(c=>`<option value="${c.id}" ${t.cid===c.id?'selected':''}>${esc(c.fantasia||c.razao)}</option>`).join('')}</select></div></div><label>Checklist</label><div id="ckl" class="tk-ck"></div><div class="sy-up"><input id="cki" placeholder="Novo item (Enter para adicionar)" style="flex:1;min-width:180px"><button type="button" class="al-btn sec" id="cka">${ic('plus')}Adicionar</button></div>${ATT}`,
 async mm=>{const o={...t};['titulo','desc','cat','prio','ini','fim','status','cid'].forEach(k=>o[k]=val(mm,k));if(!o.titulo){toast('Informe o título da tarefa','err');return false}o.check=t.check;
  if(!x||o.status!==x.status)o.ord=Math.max(-1,...TK.filter(y=>y.status===o.status&&y.id!==o.id).map(y=>y.ord||0))+1;
  try{await svT(x?TK.map(y=>y.id===o.id?o:y):[...TK,o])}catch(e){return false}await att.commit();toast('Tarefa salva');tarView()},async()=>{await att.rollback()});
 att=attach(m,t);
 const ck=()=>{m.querySelector('#ckl').innerHTML=t.check.map((c,i)=>`<label class="tk-ci"><input type="checkbox" data-i="${i}" ${c.d?'checked':''}><span${c.d?' style="text-decoration:line-through;opacity:.6"':''}>${esc(c.t)}</span><button type="button" class="ad-ico del" data-r="${i}" title="Remover">${ic('x')}</button></label>`).join('')};ck();
 const add=()=>{const i=m.querySelector('#cki'),v=i.value.trim();if(v){t.check.push({t:v,d:false});i.value='';ck()}};
 m.querySelector('#cka').onclick=add;m.querySelector('#cki').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();add()}};
 m.querySelector('#ckl').onclick=e=>{const r=e.target.closest('[data-r]');if(r){e.preventDefault();t.check.splice(Number(r.dataset.r),1);ck()}};
 m.querySelector('#ckl').onchange=e=>{const c=e.target.closest('[data-i]');if(c){t.check[Number(c.dataset.i)].d=c.checked;ck()}};
 if(x){const d=document.createElement('button');d.type='button';d.className='al-btn sec';d.style.cssText='margin-left:auto;color:#e5484d';d.innerHTML=ic('trash-2')+'Excluir';m.querySelector('.sy-mf').appendChild(d);
  d.onclick=async()=>{if(!confirm('Excluir esta tarefa?'))return;try{await svT(TK.filter(y=>y.id!==x.id))}catch(e){return}for(const f of x.docs||[])await fdel(f.id);m.remove();toast('Tarefa excluída');tarView()}}}
SY.view('tar',tarView);

/* ================= CERTIFICADOS ================= */
const CTIPO=['A1','A3'],CCAT=['e-CNPJ','e-CPF'],CLOC=['Arquivo (.pfx) no computador','Token USB','Cartão com leitora','Nuvem'],CSIT=['Ativo','Revogado','Substituído'];
const t0=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const dleft=c=>Math.floor((new Date(c.venc+'T12:00:00')-t0())/864e5);
const cstat=c=>{if(c.sit&&c.sit!=='Ativo')return c.sit;if(!c.venc)return 'Sem data';const n=dleft(c);return n<0?'Vencido':n<=((SY.param&&SY.param('certDias'))||30)?'A vencer':'Válido'};
const cls=s=>({'Válido':'st-Ati','A vencer':'st-warn','Vencido':'st-bad','Revogado':'st-bad','Substituído':''}[s]||'');
SY.certAlerts=()=>{const out=[],z=t0();CE.filter(c=>c.venc&&(!c.sit||c.sit==='Ativo')).forEach(c=>{const d=new Date(c.venc+'T12:00:00'),nm=(c.empresa||'Empresa')+' ('+(c.tipo||'')+')';out.push({nome:nm,date:d,d:Math.floor((d-z)/864e5),cert:c})});
 cl().forEach(c=>{if(c.certval&&!CE.some(x=>x.cid===c.id)){const d=new Date(c.certval+'T12:00:00');out.push({nome:c.fantasia||c.razao,date:d,d:Math.floor((d-z)/864e5)})}});return out};
let cq='',ctp='',cst='';
const cpfm=v=>dig(v).slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
function certView(){const h=$('#v-cert');
 h.innerHTML=`<div class="sy-h"><div><small>Controle de vencimentos</small><h1>Certificados digitais</h1></div><button class="al-btn" id="nc2">${ic('plus')} Novo certificado</button></div><div id="cks" class="ad-kpi"></div>
 <div class="ad-bar"><input id="cq" type="search" placeholder="Buscar por empresa, responsável ou nº de série" value="${esc(cq)}" aria-label="Buscar certificado"><select id="ctp" class="sy-sel"><option value="">Todos os tipos</option>${CTIPO.map(t=>`<option ${ctp===t?'selected':''}>${t}</option>`).join('')}</select><select id="cst" class="sy-sel"><option value="">Todos os status</option>${['Válido','A vencer','Vencido','Revogado','Substituído'].map(t=>`<option ${cst===t?'selected':''}>${t}</option>`).join('')}</select></div><div id="cl2" class="ad-list"></div>`;
 const paint=()=>{const sts=CE.map(cstat),n=s=>sts.filter(x=>x===s).length;
  $('#cks').innerHTML=[['shield-check','Total cadastrado',CE.length,'n'],['circle-check','Válidos',n('Válido'),'g'],['clock-alert','A vencer',n('A vencer'),'y'],['shield-x','Vencidos',n('Vencido'),'r']].map(k=>`<div class="ad-k ${k[3]}"><i>${ic(k[0])}</i><div><b>${k[2]}</b><span>${k[1]}</span></div></div>`).join('');
  const q=cq.toLowerCase().trim(),l=CE.filter(c=>(!ctp||c.tipo===ctp)&&(!cst||cstat(c)===cst)&&(!q||[c.empresa,c.resp,c.serie,c.email].join(' ').toLowerCase().includes(q))).sort((a,b)=>(a.venc||'9').localeCompare(b.venc||'9'));
  $('#cl2').innerHTML=l.map(c=>{const s=cstat(c),n=c.venc?dleft(c):null;return`<article class="ad-row ce-row"><div class="ce-t ${c.tipo}">${esc(c.tipo||'—')}</div><div><h3>${esc(c.empresa||'—')}</h3><small>${esc(c.cat||'')}${c.serie?' · série '+esc(c.serie):''}${c.emissora?' · '+esc(c.emissora):''}</small><small>${ic('user')} ${esc(c.resp||'Sem responsável')}${c.tel?' · '+esc(c.tel):''}${c.email?' · '+esc(c.email):''}</small></div><div><span class="sy-tag ${cls(s)}">${esc(s)}</span><small class="d-block mt-1">${c.venc?'vence em '+dfmt(c.venc)+(s==='Válido'||s==='A vencer'?' ('+n+' dia'+(n===1?'':'s')+')':''):'sem data'}</small></div><div class="sy-chips" style="margin:0">${(c.docs||[]).slice(0,2).map(d=>`<button type="button" class="sy-chip" data-dl="${d.id}" data-n="${esc(d.nome)}">${ic('paperclip')}${esc(d.nome)}</button>`).join('')}${(c.docs||[]).length>2?`<span class="sy-chip">+${c.docs.length-2}</span>`:''}</div><div class="ad-btns"><button class="ad-edit" data-ed="${c.id}">${ic('pencil')}Editar</button><button class="ad-ico del" data-rm="${c.id}" title="Excluir">${ic('trash-2')}</button></div></article>`}).join('')||`<div class="ad-empty">${CE.length?'Nenhum certificado encontrado nesse filtro.':'Nenhum certificado cadastrado. Clique em "Novo certificado" para começar o controle.'}</div>`};
 paint();
 $('#nc2').onclick=()=>certForm(null);$('#cq').oninput=e=>{cq=e.target.value;paint()};$('#ctp').onchange=e=>{ctp=e.target.value;paint()};$('#cst').onchange=e=>{cst=e.target.value;paint()};
 $('#cl2').onclick=async e=>{const d=e.target.closest('[data-dl]'),ed=e.target.closest('[data-ed]'),rm=e.target.closest('[data-rm]');if(d)dl(d.dataset.dl,d.dataset.n);if(ed)certForm(CE.find(c=>c.id===ed.dataset.ed));
  if(rm&&confirm('Excluir este certificado e os comprovantes anexados?')){const c=CE.find(x=>x.id===rm.dataset.rm);try{await svC(CE.filter(x=>x!==c))}catch(er){return}for(const f of c.docs||[])await fdel(f.id);toast('Certificado excluído');certView()}};
 window.__ceView=certView}
function certForm(x){const c=x?JSON.parse(JSON.stringify(x)):{id:uid('k'),tipo:'A1',cat:'e-CNPJ',sit:'Ativo',docs:[],emissao:today()};let att;
 const m=modal(x?'Editar certificado':'Novo certificado',`<div class="g"><div><label>Empresa (cliente cadastrado)</label><select name="cid"><option value="">Outra empresa (digitar)</option>${cl().map(k=>`<option value="${k.id}" ${c.cid===k.id?'selected':''}>${esc(k.fantasia||k.razao)}</option>`).join('')}</select></div><div><label>Nome da empresa *</label>${inp('empresa',c.empresa,'text','required')}</div>
 <div><label>Tipo</label>${sel('tipo',CTIPO,c.tipo)}</div><div><label>Modelo</label>${sel('cat',CCAT,c.cat)}</div><div><label>Autoridade certificadora</label>${inp('emissora',c.emissora)}</div><div><label>Nº de série</label>${inp('serie',c.serie)}</div>
 <div><label>Data de emissão</label>${inp('emissao',c.emissao,'date')}</div><div><label>Vencimento *</label>${inp('venc',c.venc,'date','required')}</div><div><label>Onde está guardado</label>${sel('local',CLOC,c.local)}</div><div><label>Situação</label>${sel('sit',CSIT,c.sit)}</div></div>
 <h4 class="sy-sec" style="font-size:15px">Responsável</h4><div class="g"><div><label>Nome</label>${inp('resp',c.resp)}</div><div><label>CPF</label>${inp('cpf',c.cpf?cpfm(c.cpf):'','text','inputmode="numeric" maxlength="14"')}</div><div><label>E-mail</label>${inp('email',c.email,'email')}</div><div><label>Telefone / WhatsApp</label>${inp('tel',c.tel)}</div></div>
 <label>Observações</label><textarea name="obs" rows="2" class="sy-ta">${esc(c.obs||'')}</textarea><p class="text-secondary small mb-0 mt-2">Por segurança, não registre aqui a senha ou o PIN do certificado. Anexe só comprovantes (recibo, nota de compra, protocolo).</p>${ATT}`,
 async mm=>{const o={...c};['cid','empresa','tipo','cat','emissora','serie','emissao','venc','local','sit','resp','email','tel','obs'].forEach(k=>o[k]=val(mm,k));o.cpf=dig(val(mm,'cpf'));
  if(!o.empresa||!o.venc){toast('Informe a empresa e a data de vencimento','err');return false}
  try{await svC(x?CE.map(y=>y.id===o.id?o:y):[...CE,o])}catch(e){return false}await att.commit();toast('Certificado salvo');certView()},async()=>{await att.rollback()});
 att=attach(m,c);
 const sc=m.querySelector('[name=cid]');sc.onchange=()=>{const k=cl().find(z=>z.id===sc.value);if(!k)return;const f=(n,v)=>{const e=m.querySelector(`[name=${n}]`);if(v&&(!e.value||e.dataset.auto))e.value=v,e.dataset.auto='1'};f('empresa',k.fantasia||k.razao);f('resp',k.resp);f('cpf',k.cpf?cpfm(k.cpf):'');f('email',k.email);f('tel',k.tel)};
 m.querySelector('[name=cpf]').oninput=e=>e.target.value=cpfm(e.target.value);
 if(c.cid&&!x)sc.onchange()}
SY.view('cert',certView);

/* ================= CONEXÃO COM O BANCO ================= */
function cfgView(){const h=$('#v-cfg'),C=window.AL_CONFIG||{};
 h.innerHTML=`<div class="sy-h"><div><small>Sistema</small><h1>Banco de dados</h1></div></div>
 <div class="sy-ban ${DB.on?'ok':'bad'}">${ic(DB.on?'circle-check':'triangle-alert')}<div><b>${DB.on?'Banco de dados conectado':'Banco de dados não conectado'}</b><span>${DB.on?'Notícias, clientes, tarefas e certificados são salvos na nuvem. Quem salva uma notícia já a publica no site.':'Os dados ficam só neste navegador. Conecte o banco para publicar automaticamente.'}</span></div></div>
 <div class="al-panel mt-3"><div class="d-flex gap-2 flex-wrap"><button type="button" class="al-btn sec" id="cs">${ic('copy')}Copiar o SQL do banco</button><button type="button" class="al-btn" id="ct">${ic('plug-zap')}Testar conexão</button></div><p id="cr" class="mt-3 mb-0" role="status"></p></div>`;
 const say=(t,ok)=>{const e=$('#cr');e.textContent=t;e.style.color=ok?'#157347':'#c0392b'};
 $('#cs').onclick=async()=>{try{let t='';for(const f of ['banco-de-dados.sql','banco-de-dados-seguranca.sql']){const r=await fetch('../'+f);if(r.ok)t+=await r.text()+'\n\n'}if(!/create table/i.test(t))throw 0;try{await navigator.clipboard.writeText(t);say('SQL copiado. Cole no SQL Editor do Supabase.',1)}catch(e){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'}));a.download='banco-de-dados.sql';a.click();say('Baixei o arquivo banco-de-dados.sql. Abra e cole no SQL Editor.',1)}}catch(e){say('Não encontrei o arquivo banco-de-dados.sql no site. Abra-o na pasta do projeto e copie o conteúdo.')}};
 $('#ct').onclick=async()=>{const u=(C.SUPABASE_URL||'').replace(/\/+$/,''),k=C.SUPABASE_KEY||'';if(!u||!k)return say('Banco não configurado: o arquivo assets/js/config.js está vazio.');say('Testando...',1);
  try{const r=await fetch(u+'/rest/v1/noticias?select=id&limit=1',{headers:{apikey:k}});if(r.ok)say('Conexão OK e tabelas encontradas.',1);else if(r.status===404||r.status===400)say('Conectou, mas as tabelas não existem. Rode o SQL do banco.');else say('Chave ou URL inválida (erro '+r.status+').')}catch(e){say('Não foi possível conectar. Confira sua internet.')}}}
SY.view('cfg',cfgView);
document.addEventListener('click',e=>{if(e.target.closest('#gocfg'))show('cfg')});
Object.assign(SY,{attach,ATT,sel,inp,val,uid,dl,data:{tar:()=>TK,cert:()=>CE}});
})();
