(()=>{
const K='aliatto_news_v1',BK='aliatto_saved',CATS=['Tributos','Simples Nacional','MEI','Folha de Pagamento','Empresas','Mercado'];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
let REMOTE=false,DATA=null;
const probe=async()=>{if(!DB.on)return;DB.hash();try{DATA=await DB.news.list(false);REMOTE=true}catch(e){}};
const all=()=>{if(REMOTE)return DATA.map(x=>({...x}));try{const l=JSON.parse(localStorage.getItem(K));if(Array.isArray(l))return l}catch(e){}return(window.AL_SEED||[]).map(x=>({...x}))};
const save=l=>{if(REMOTE){const old=DATA;DATA=l;DB.news.sync(old,l).then(()=>window.ALtoast&&ALtoast('Publicado no site para todos os visitantes')).catch(()=>{DATA=old;window.ALtoast&&ALtoast('Falha ao salvar no banco de dados. Tente de novo.','err')})}else localStorage.setItem(K,JSON.stringify(l))};window.ALnews=()=>all();window.ALmode=()=>REMOTE?'server':'local';
const live=()=>all().filter(n=>n.status!=='rascunho').sort((a,b)=>b.date.localeCompare(a.date));
const fmt=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug=t=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
const cover=n=>{if(n.img)return n.img;const h=[...n.title].reduce((a,c)=>a+c.charCodeAt(0),0);let b='';for(let i=0;i<8;i++){const v=40+(h*(i+3)%150);b+=`<rect x="${40+i*90}" y="${330-v}" width="54" height="${v}" fill="#fff" opacity=".${2+i%3}"/>`}return'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0A1F3D"/><stop offset="1" stop-color="#0B8CF0"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/>${b}<path d="M0 330C150 280 250 360 400 250S650 200 800 120" stroke="#fff" stroke-width="5" fill="none"/></svg>`)};
const url=n=>'materia.html?id='+encodeURIComponent(n.id);
const card=(n,c='')=>`<a class="al-card ${c}" href="${url(n)}" data-aos="fade-up"><div class="al-img"><img src="${esc(cover(n))}" alt="" loading="lazy"></div><div class="al-meta"><span class="al-cat">${esc(n.cat)}</span><h3>${esc(n.title)}</h3><p>${esc(n.sub)}</p><small>${fmt(n.date)}</small></div></a>`;
const lead=n=>`<a class="al-lead" href="${url(n)}"><img src="${esc(cover(n))}" alt=""><div class="al-meta"><span class="al-cat">${esc(n.cat)}</span><h2>${esc(n.title)}</h2><p>${esc(n.sub)}</p></div></a>`;
const row=n=>`<a class="al-row" href="${url(n)}"><span class="al-cat">${esc(n.cat)}</span><h4>${esc(n.title)}</h4><small>${fmt(n.date)}</small></a>`;
const run=()=>{
const hh=()=>{const h=$('.header');h&&document.documentElement.style.setProperty('--hh',h.offsetHeight+'px')};hh();addEventListener('resize',hh);addEventListener('scroll',hh,{passive:true});
const page=document.body.dataset.page;

const weather=()=>{if(!$('#wx'))document.body.insertAdjacentHTML('beforeend','<div class="al-wxw" id="wxw"><button class="al-wx" id="wx" aria-expanded="false" aria-controls="wxp"><iconify-icon icon="lucide:cloud-sun"></iconify-icon><span>Clima</span></button><div class="al-wxp" id="wxp" hidden></div></div>');const b=$('#wx'),p=$('#wxp');if(!b)return;
 const I=[[0,'sun','Céu limpo'],[2,'cloud-sun','Parcialmente nublado'],[3,'cloud','Nublado'],[48,'cloud-fog','Neblina'],[57,'cloud-drizzle','Garoa'],[67,'cloud-rain','Chuva'],[77,'snowflake','Neve'],[82,'cloud-rain','Pancadas de chuva'],[86,'snowflake','Neve'],[99,'cloud-lightning','Tempestade']];
 const wc=c=>I.find(x=>c<=x[0])||I[9];let loc={lat:-15.78,lon:-47.93,n:'Brasília, DF'};try{loc=JSON.parse(localStorage.getItem('al_wx'))||loc}catch(e){}
 const dia=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'short'}).replace('.','');
 const load=async()=>{try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4`);const j=await r.json(),c=j.current,d=j.daily,w=wc(c.weather_code);
  b.innerHTML=`<iconify-icon icon="lucide:${w[1]}"></iconify-icon><b>${Math.round(c.temperature_2m)}°C</b><span>${esc(loc.n)}</span><iconify-icon icon="lucide:chevron-down"></iconify-icon>`;
  p.innerHTML=`<div class="wx-now"><iconify-icon icon="lucide:${w[1]}"></iconify-icon><div><b>${Math.round(c.temperature_2m)}°C</b><span>${w[2]} · ${esc(loc.n)}</span></div></div><div class="wx-meta"><span>Sensação ${Math.round(c.apparent_temperature)}°</span><span>Umidade ${c.relative_humidity_2m}%</span><span>Vento ${Math.round(c.wind_speed_10m)} km/h</span></div><div class="wx-days">${d.time.map((t,i)=>`<div><small>${i?dia(t):'Hoje'}</small><iconify-icon icon="lucide:${wc(d.weather_code[i])[1]}"></iconify-icon><b>${Math.round(d.temperature_2m_max[i])}°</b><span>${Math.round(d.temperature_2m_min[i])}°</span><em>${d.precipitation_probability_max?d.precipitation_probability_max[i]:0}%</em></div>`).join('')}</div><button id="wxl" class="wx-loc"><iconify-icon icon="lucide:map-pin"></iconify-icon>Usar minha localização</button><small class="wx-src">Dados: Open-Meteo</small>`;
  $('#wxl').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(g=>{loc={lat:g.coords.latitude,lon:g.coords.longitude,n:'Sua localização'};localStorage.setItem('al_wx',JSON.stringify(loc));load()},()=>{$('#wxl').textContent='Não foi possível obter a localização'}):0}catch(e){b.innerHTML='<iconify-icon icon="lucide:cloud-off"></iconify-icon><span>Clima indisponível</span>'}};
 b.onclick=()=>{const o=p.hidden;p.hidden=!o;b.setAttribute('aria-expanded',String(o))};document.addEventListener('click',e=>{if(!e.target.closest('.al-wxw'))p.hidden=true});load()};
if(page==='home'){weather();const l=live();$('#home-news').innerHTML=`<div class="al-top">${lead(l[0])}<div class="al-stack">${l.slice(1,4).map(row).join('')}</div></div>`}

if(page==='portal'){
 let cat='Todas',q='',n=6;const l=live(),g=$('#grid'),m=$('#more');
 $('#chips').innerHTML=['Todas',...CATS].map(c=>`<button class="al-chip${c==='Todas'?' on':''}">${c}</button>`).join('');
 const draw=()=>{const f=l.filter(x=>(cat==='Todas'||x.cat===cat)&&(x.title+x.sub).toLowerCase().includes(q));
  $('#top').innerHTML=f.length&&cat==='Todas'&&!q?`${lead(f[0])}<div class="al-stack">${f.slice(1,4).map(row).join('')}</div>`:'';
  const rest=cat==='Todas'&&!q?f.slice(4):f;g.innerHTML=rest.slice(0,n).map(x=>card(x)).join('')||'<p class="al-empty">Nenhuma matéria encontrada. Tente outra busca ou categoria.</p>';
  m.style.display=rest.length>n?'':'none';$('#side').innerHTML=l.slice(0,5).map((x,i)=>`<a class="al-rank" href="${url(x)}"><b>${i+1}</b><span>${esc(x.title)}</span></a>`).join('');window.AOS&&AOS.refresh()};
 $('#chips').onclick=e=>{if(!e.target.matches('button'))return;cat=e.target.textContent;n=6;$$('.al-chip').forEach(b=>b.classList.toggle('on',b===e.target));draw()};
 $('#q').oninput=e=>{q=e.target.value.toLowerCase();n=6;draw()};m.onclick=()=>{n+=6;draw()};draw()}

if(page==='article'){
 const id=new URLSearchParams(location.search).get('id'),a=all().find(x=>x.id===id),box=$('#art');
const archive=()=>{const sv=JSON.parse(localStorage.getItem(BK)||'[]'),only=new URLSearchParams(location.search).get('salvas')==='1';let l=live();const tot=l.length;if(only)l=l.filter(x=>sv.includes(x.id));box.style.maxWidth='none';
 box.innerHTML=`<span class="al-cat">Arquivo</span><h1>${only?'Matérias salvas':'Todas as matérias'}</h1><p class="al-sub">${only?'Suas leituras guardadas neste navegador.':'Todo o conteúdo publicado pela ALIATTO, do mais recente ao mais antigo.'}</p><div class="al-chips" style="margin:18px 0"><a class="al-chip${only?'':' on'}" href="materia.html">Todas (${tot})</a><a class="al-chip${only?' on':''}" href="materia.html?salvas=1">Salvas (${sv.length})</a></div><div class="al-grid">${l.map(x=>card(x)).join('')||'<p class="al-empty">Você ainda não salvou nenhuma matéria. Abra uma matéria e clique em Salvar.</p>'}</div>`;$('#rel').parentElement.hidden=true;document.title='Matérias | ALIATTO'};

 if(!id){archive()}else if(!a){box.innerHTML='<h1>Matéria não encontrada</h1><p><a href="noticias.html">Voltar para Novidades</a></p>'}else{
  document.title=a.title+' | ALIATTO';const u=encodeURIComponent(location.href),t=encodeURIComponent(a.title);
  const saved=()=>(JSON.parse(localStorage.getItem(BK)||'[]')).includes(a.id);
  const sh=[['whatsapp','https://wa.me/?text='+t+'%20'+u],['facebook','https://www.facebook.com/sharer/sharer.php?u='+u],['x','https://twitter.com/intent/tweet?text='+t+'&url='+u],['linkedin','https://www.linkedin.com/sharing/share-offsite/?url='+u],['telegram','https://t.me/share/url?url='+u+'&text='+t]];
  box.innerHTML=`<span class="al-cat">${esc(a.cat)}</span><h1>${esc(a.title)}</h1><p class="al-sub">${esc(a.sub)}</p>
  <div class="al-by"><div><a href="about-us.html">${esc(a.author)}</a><small>${fmt(a.date)}</small></div><div class="al-share"><button id="sv" class="al-save">${saved()?'Salvo':'Salvar'}</button>${sh.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener" aria-label="${s[0]}"><iconify-icon icon="${s[0]==='x'?'ri:twitter-x-fill':'ri:'+s[0]+'-fill'}"></iconify-icon></a>`).join('')}<button id="cp" aria-label="Copiar link"><iconify-icon icon="lucide:link"></iconify-icon></button></div></div>
  <img class="al-hero" src="${esc(cover(a))}" alt=""><div class="al-body"><aside class="al-cta"><small>Fale com a ALIATTO</small><b>Seu contador online, sem burocracia.</b><a href="contact.html">Pedir atendimento</a></aside>${a.body}</div>`;
  $('#sv').onclick=e=>{let s=JSON.parse(localStorage.getItem(BK)||'[]');s=s.includes(a.id)?s.filter(x=>x!==a.id):[...s,a.id];localStorage.setItem(BK,JSON.stringify(s));e.target.textContent=saved()?'Salvo':'Salvar'};
  $('#cp').onclick=()=>navigator.clipboard.writeText(location.href).then(()=>{$('#cp').classList.add('ok')});
  const rel=live().filter(x=>x.id!==a.id).sort((x,y)=>(y.cat===a.cat)-(x.cat===a.cat)).slice(0,3);$('#rel').innerHTML=rel.map(x=>card(x)).join('');
  const bar=$('#bar');addEventListener('scroll',()=>{const d=document.documentElement;bar.style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight)*100)+'%'})}}

if(page==='projects'){const P=[['d','badge-check','Contabilidade 100% online','Escrituração, impostos e obrigações acessórias resolvidos sem papel e sem filas.',100],['d','building','Abertura e regularização de empresas','CNPJ aberto, alterado ou regularizado do início ao fim.',100],['d','users','Folha de pagamento e eSocial','Cálculo, encargos e entregas em dia para sua equipe.',100],['a','layout-dashboard','Portal do cliente','Área para acompanhar obrigações, guias e enviar documentos com segurança.',65],['a','bell-ring','Alertas de vencimento','Avisos automáticos de impostos, certificado digital e prazos importantes.',45],['a','chart-no-axes-combined','Painel financeiro mensal','Indicadores simples de faturamento, impostos e resultado.',30],['b','smartphone','Aplicativo ALIATTO','Atendimento e documentos na palma da mão.',10],['b','file-signature','Assinatura digital de contratos','Contratos e documentos assinados online.',10],['b','calculator','Simulador tributário','Compare regimes e descubra quanto pagar de imposto.',5]],L={d:'Disponível',a:'Em andamento',b:'Em breve'};let f='t';
 $('#pj-tabs').innerHTML=[['t','Todos'],['d','Disponíveis'],['a','Em andamento'],['b','Em breve']].map(x=>`<button class="al-chip${x[0]==='t'?' on':''}" data-f="${x[0]}">${x[1]}</button>`).join('');
 const draw=()=>{$('#pj').innerHTML=P.filter(p=>f==='t'||p[0]===f).map((p,i)=>`<div class="pj-card" data-aos="fade-up" data-aos-delay="${i%3*80}"><span class="pj-st ${p[0]}">${L[p[0]]}</span><i><iconify-icon icon="lucide:${p[1]}"></iconify-icon></i><h3>${p[2]}</h3><p>${p[3]}</p><div class="pj-bar"><b data-w="${p[4]}"></b></div></div>`).join('');setTimeout(()=>$$('.pj-bar b').forEach(b=>b.style.width=b.dataset.w+'%'),60);window.AOS&&AOS.refresh()};
 $('#pj-tabs').onclick=e=>{if(!e.target.dataset.f)return;f=e.target.dataset.f;$$('#pj-tabs button').forEach(b=>b.classList.toggle('on',b===e.target));draw()};draw()}
if(page==='admin'){weather();
 const USERS={fernando:'12345678'},gate=$('#gate'),app=$('#app');let cur=null,flt='todas',term='';
 const toast=(m,t='')=>{const e=document.createElement('div');e.className='ad-toast '+t;e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.classList.add('in'),20);setTimeout(()=>{e.classList.remove('in');setTimeout(()=>e.remove(),400)},2800)};
 const dirty=v=>{if(REMOTE){$('#dirty').hidden=true;return}if(v!==undefined)localStorage.setItem('al_dirty',v?'1':'');$('#dirty').hidden=!localStorage.getItem('al_dirty')};
 const remoteUI=()=>{if(!REMOTE)return;['#exp','#reset'].forEach(s=>$(s).hidden=true);const s=$$('.ad-st')[2];if(s)s.innerHTML='<em>3</em><div><b>Pronto</b><span>Ao salvar, a matéria já aparece no site para todos.</span></div>'};
 const open=u=>{gate.hidden=true;app.hidden=false;$('#who').textContent=u;dirty();remoteUI();list();window.dispatchEvent(new Event('al-open'))};window.ALOpen=open;window.ALtoast=toast;
 const loadAll=async()=>{DATA=await DB.news.list(true)};
 const enter=async(fromLogin)=>{if(!await DB.isAdmin()){await DB.logout();sessionStorage.removeItem('al_ok');if(fromLogin)$('#err').textContent='Este usuário não tem permissão de acesso.';return}
  try{await loadAll();REMOTE=true}catch(e){$('#err').textContent='Não foi possível carregar os dados.';return}
  const n=(DB.user()||'').split('@')[0],nm=n?n[0].toUpperCase()+n.slice(1):'Usuário';sessionStorage.setItem('al_ok',nm);open(nm)};
 $('#login').onsubmit=async e=>{e.preventDefault();const u=$('#us').value.trim(),p=$('#pw').value;
  if(DB.on){const em=u.includes('@')?u:((window.AL_CONFIG||{}).LOGIN_EMAILS||{})[u.toLowerCase()];if(!em){$('#err').textContent='Usuário não cadastrado.';return}
   try{await DB.login(em,p)}catch(x){$('#err').textContent='Usuário ou senha incorretos.';return}await enter(true);return}
  if(USERS[u.toLowerCase()]===p){sessionStorage.setItem('al_ok',u);open(u)}else $('#err').textContent='Usuário ou senha incorretos.'};
 if(DB.on){if(DB.user())enter(false)}else if(sessionStorage.getItem('al_ok'))open(sessionStorage.getItem('al_ok'));
 $('#out').onclick=async()=>{if(DB.on)await DB.logout();sessionStorage.removeItem('al_ok');location.reload()};
 $('#f-cat').innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
 const ic=n=>`<iconify-icon icon="lucide:${n}"></iconify-icon>`;
 function list(){const l=all().sort((a,b)=>b.date.localeCompare(a.date));const pub=l.filter(x=>x.status!=='rascunho').length;
  $('#kpi').innerHTML=`<div class="ad-k n"><i>${ic('newspaper')}</i><div><b>${l.length}</b><span>matérias</span></div></div><div class="ad-k g"><i>${ic('circle-check')}</i><div><b>${pub}</b><span>no ar</span></div></div><div class="ad-k y"><i>${ic('pencil-line')}</i><div><b>${l.length-pub}</b><span>rascunhos</span></div></div><div class="ad-k"><i>${ic('tags')}</i><div><b>${new Set(l.map(x=>x.cat)).size}</b><span>categorias</span></div></div>`;
  const f=l.filter(x=>(flt==='todas'||(flt==='rascunho')===(x.status==='rascunho'))&&x.title.toLowerCase().includes(term));
  $('#rows').innerHTML=f.map((x,i)=>{const p=x.status!=='rascunho';return`<article class="ad-row" style="animation-delay:${i*40}ms"><img src="${esc(cover(x))}" alt=""><div><h3>${esc(x.title)}</h3><small>${esc(x.cat)} · ${fmt(x.date)}</small></div><label class="ad-sw" title="Colocar no ar ou voltar para rascunho"><input type="checkbox" data-a="tg" data-i="${esc(x.id)}" ${p?'checked':''}><i></i><span>${p?'No ar':'Rascunho'}</span></label><div class="ad-btns"><button class="ad-edit" data-a="ed" data-i="${esc(x.id)}">${ic('pencil')}Editar</button><a class="ad-ico" href="${url(x)}" target="_blank" title="Ver no site">${ic('eye')}</a><button class="ad-ico del" data-a="rm" data-i="${esc(x.id)}" title="Excluir">${ic('trash-2')}</button></div></article>`}).join('')||'<div class="ad-empty">Nenhuma matéria encontrada. Clique em "Nova matéria" para começar.</div>'}
 $('#q2').oninput=e=>{term=e.target.value.toLowerCase();list()};
 $('#tabs').onclick=e=>{if(!e.target.dataset.f)return;flt=e.target.dataset.f;$$('#tabs button').forEach(b=>b.classList.toggle('on',b===e.target));list()};
 $('#rows').onchange=e=>{const b=e.target;if(b.dataset.a!=='tg')return;const l=all(),x=l.find(y=>y.id===b.dataset.i);x.status=b.checked?'publicada':'rascunho';save(l);dirty(true);toast(b.checked?'Matéria no ar':'Matéria voltou para rascunho');list()};
 $('#rows').onclick=e=>{const b=e.target.closest('button');if(!b||b.dataset.a==='tg')return;const l=all(),x=l.find(y=>y.id===b.dataset.i);
  if(b.dataset.a==='ed')edit(x);if(b.dataset.a==='rm'&&confirm('Excluir esta matéria? Essa ação não pode ser desfeita.')){save(l.filter(y=>y!==x));dirty(true);toast('Matéria excluída');list()}};
 const F=['title','sub','cat','author','date','status','img'];
 const pv=()=>{const o={title:$('#f-title').value||'Título da matéria',sub:$('#f-sub').value||'Linha fina da matéria',cat:$('#f-cat').value,img:$('#f-img').value,date:$('#f-date').value||new Date().toISOString().slice(0,10),id:'x'};
  $('#pvbox').innerHTML=`<div class="al-img"><img src="${esc(cover(o))}" alt=""></div><div class="al-meta"><span class="al-cat">${esc(o.cat)}</span><h3>${esc(o.title)}</h3><p>${esc(o.sub)}</p><small>${fmt(o.date)}</small></div>`;const n=$('#f-title').value.length;$('#c-t').textContent=n+' caracteres';$('#c-t').classList.toggle('bad',n>90)};
 F.forEach(k=>$('#f-'+k).addEventListener('input',pv));$('#f-cat').addEventListener('change',pv);
 function edit(x){cur=x;$('#form').hidden=false;$('#lst').hidden=true;document.querySelector('.ad-top').hidden=true;$('#dirty').hidden=true;$('#ftitle').textContent=x?'Editar matéria':'Nova matéria';F.forEach(k=>$('#f-'+k).value=x?x[k]??'':'');
  if(!x){$('#f-author').value='Equipe ALIATTO';$('#f-date').value=new Date().toISOString().slice(0,10);$('#f-status').value='publicada'}
  $('#ed').innerHTML=x?x.body:'';pv();scrollTo({top:0,behavior:'smooth'})}
 const back=()=>{$('#form').hidden=true;$('#lst').hidden=false;document.querySelector('.ad-top').hidden=false;dirty();list()};
 $('#new').onclick=()=>edit(null);$('#cancel').onclick=back;
 $$('.tb button').forEach(b=>b.onclick=()=>{const c=b.dataset.c;$('#ed').focus();c==='h2'?document.execCommand('formatBlock',false,'h2'):c==='a'?document.execCommand('createLink',false,prompt('Endereço do link (https://...)')||'#'):document.execCommand(c)});
 $('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,1100/im.width),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(async bl=>{try{$('#f-img').value=await DB.img(bl);if(REMOTE)toast('Imagem enviada ao banco de dados')}catch(x){toast('Falha no envio da imagem','err');return}pv()},'image/jpeg',.82)};im.src=r.result};r.readAsDataURL(f)};
 $('#form').onsubmit=e=>{e.preventDefault();let l=all();const o={};F.forEach(k=>o[k]=$('#f-'+k).value.trim());o.body=$('#ed').innerHTML;
  if(!o.title||!$('#ed').textContent.trim()){toast('Preencha o título e o conteúdo da matéria','err');return}
  if(cur){Object.assign(cur,o)}else{o.id=slug(o.title)||'materia-'+Date.now();if(l.some(x=>x.id===o.id))o.id+='-'+Date.now().toString(36);l.push(o)}
  try{save(l)}catch(err){toast('Imagem muito grande. Use uma menor ou informe o caminho do arquivo.','err');return}
  dirty(true);toast('Matéria salva');back()};
 const exp=()=>{const b=new Blob(['window.AL_SEED='+JSON.stringify(all(),null,1)+';'],{type:'text/javascript'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='noticias-seed.js';a.click();dirty(false);toast('Arquivo baixado. Substitua assets/js/noticias-seed.js no site.')};
 $('#exp').onclick=exp;$('#exp2').onclick=exp;
 $('#reset').onclick=()=>{if(confirm('Descartar alterações deste navegador e voltar ao conteúdo publicado no site?')){localStorage.removeItem(K);dirty(false);toast('Alterações descartadas');list()}};
}
const w=document.createElement('a');w.className='al-wa';w.href='https://wa.me/5561993140268?text='+encodeURIComponent('Olá! Vim pelo site da ALIATTO e gostaria de atendimento.');w.target='_blank';w.rel='noopener';w.setAttribute('aria-label','Atendimento pelo WhatsApp');w.innerHTML='<span>Fale com a gente</span><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';document.body.appendChild(w);
if(page==='contact'){$('#cform').onsubmit=e=>{e.preventDefault();const v=id=>$('#'+id).value.trim();const t=`Olá, ALIATTO! Meu nome é ${v('c-nome')}.\nAssunto: ${v('c-ass')}\nE-mail: ${v('c-mail')}\nTelefone: ${v('c-tel')}\n\n${v('c-msg')}`;window.open('https://wa.me/5561993140268?text='+encodeURIComponent(t),'_blank')}}
if(window.AOS)AOS.init({once:true,duration:700});
};
probe().then(run);
})();
