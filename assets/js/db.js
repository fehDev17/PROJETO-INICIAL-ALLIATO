/* Camada de dados: Supabase (banco Postgres + armazenamento de arquivos + login) ou navegador (modo local). */
(()=>{
const C=window.AL_CONFIG||{},U=(C.SUPABASE_URL||'').replace(/\/+$/,''),K=C.SUPABASE_KEY||'',on=!!(U&&K),SK='al_sb';
const J=s=>{try{return JSON.parse(s)}catch(e){return null}};
const ses=()=>J(localStorage.getItem(SK)),setS=s=>s?localStorage.setItem(SK,JSON.stringify(s)):localStorage.removeItem(SK);
const jwt=t=>{try{return JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))))}catch(e){return{}}};
const mk=d=>({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Date.now()+(Number(d.expires_in)||3600)*1000-30000,email:String((d.user&&d.user.email)||jwt(d.access_token).email||'').toLowerCase()});
let rf=null;
const refresh=()=>rf||(rf=(async()=>{const s=ses();if(!s)return false;try{const r=await fetch(U+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});if(!r.ok)throw 0;setS(mk(await r.json()));return true}catch(e){setS(null);return false}finally{rf=null}})());
const rq=async(p,o={})=>{let s=ses();if(s&&s.expires_at<Date.now()){await refresh();s=ses()}const r=await fetch(U+p,{...o,headers:{apikey:K,Authorization:'Bearer '+((s&&s.access_token)||K),...(o.headers||{})}});if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,200));return r};
/* login */
const login=async(email,pass)=>{const r=await fetch(U+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email,password:pass})});if(!r.ok)throw new Error('login');setS(mk(await r.json()))};
const google=()=>{location.href=U+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(location.origin+location.pathname)};
const hash=()=>{if(!on||!/access_token=/.test(location.hash))return;const p=new URLSearchParams(location.hash.slice(1));if(p.get('access_token')){setS(mk({access_token:p.get('access_token'),refresh_token:p.get('refresh_token'),expires_in:p.get('expires_in')}));history.replaceState(null,'',location.pathname+location.search)}};
const logout=async()=>{try{await rq('/auth/v1/logout',{method:'POST'})}catch(e){}setS(null)};
const user=()=>{const s=ses();return s?s.email:null};
const isAdmin=async()=>{try{return(await(await rq('/rest/v1/admins?select=email')).json()).length>0}catch(e){return false}};
/* tabelas */
const get=async p=>(await rq('/rest/v1/'+p)).json();
const up=(t,rows)=>rows.length?rq('/rest/v1/'+t,{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)}):0;
const rm=(t,ids)=>ids.length?rq('/rest/v1/'+t+'?id=in.('+ids.map(encodeURIComponent).join(',')+')',{method:'DELETE'}):0;
const diff=(a,b)=>{const m=new Map(a.map(x=>[x.id,JSON.stringify(x)])),ids=new Set(b.map(x=>x.id));return{ch:b.filter(x=>m.get(x.id)!==JSON.stringify(x)),del:a.filter(x=>!ids.has(x.id)).map(x=>x.id)}};
const NF=['id','title','sub','cat','author','date','status','img','body'];
const news={list:all=>get('noticias?select='+NF.join(',')+(all?'':'&status=eq.publicada')+'&order=date.desc'),
 sync:async(a,b)=>{const d=diff(a,b);await up('noticias',d.ch.map(x=>Object.fromEntries(NF.map(k=>[k,x[k]??'']))));await rm('noticias',d.del)}};
const reg={list:async t=>on?(await get('registros?select=data&tipo=eq.'+t)).map(r=>r.data):(J(localStorage.getItem('al_r_'+t))||[]),
 sync:async(t,a,b)=>{if(!on){localStorage.setItem('al_r_'+t,JSON.stringify(b));return}const d=diff(a,b);await up('registros',d.ch.map(x=>({id:x.id,tipo:t,data:x,updated_at:new Date().toISOString()})));await rm('registros',d.del)}};
/* arquivos */
const idbo=()=>new Promise((ok,no)=>{const r=indexedDB.open('aliatto_docs',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const idbDo=async(m,fn)=>{const d=await idbo();return new Promise(res=>{const t=d.transaction('f',m),q=fn(t.objectStore('f'));t.oncomplete=()=>res(q&&q.result)})};
const file={put:async(id,f)=>{if(on)await rq('/storage/v1/object/documentos/'+id,{method:'POST',headers:{'x-upsert':'true','Content-Type':f.type||'application/octet-stream'},body:f});else await idbDo('readwrite',s=>s.put(f,id))},
 get:async id=>on?(await rq('/storage/v1/object/authenticated/documentos/'+id)).blob():idbDo('readonly',s=>s.get(id)),
 del:async id=>{if(on){try{await rq('/storage/v1/object/documentos',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[id]})})}catch(e){}}else await idbDo('readwrite',s=>s.delete(id))}};
const img=async blob=>{if(!on)return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob)});const p=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)+'.jpg';await rq('/storage/v1/object/capas/'+p,{method:'POST',headers:{'x-upsert':'true','Content-Type':'image/jpeg'},body:blob});return U+'/storage/v1/object/public/capas/'+p};
window.DB={on,news,reg,file,img,login,google,hash,logout,user,isAdmin};
})();
