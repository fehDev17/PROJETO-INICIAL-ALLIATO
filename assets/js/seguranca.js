/* ALIATTO — camada de segurança do navegador. Carregar ANTES de aliatto.js */
(function(){
 /* 1) Sanitizador de HTML (lista de permissões): remove <script>, onclick=, javascript:, iframes, style etc. */
 var TAGS='P,BR,B,STRONG,I,EM,U,S,H1,H2,H3,H4,H5,H6,UL,OL,LI,A,BLOCKQUOTE,IMG,SPAN,DIV,HR,TABLE,THEAD,TBODY,TR,TH,TD,FIGURE,FIGCAPTION,SMALL,SUB,SUP,CODE,PRE'.split(',');
 var ATTR={A:['href','title','target','rel'],IMG:['src','alt','title','width','height'],'*':['class']};
 var okUrl=function(v,img){v=String(v||'').trim().replace(/[\u0000- ]/g,'');
  if(/^(https?:|mailto:|tel:|#|\/|\.\.?\/)/i.test(v))return true;
  if(img&&/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(v))return true;
  return !/^[a-z][a-z0-9+.-]*:/i.test(v)};
 function clean(node){
  Array.prototype.slice.call(node.childNodes).forEach(function(n){
   if(n.nodeType===3)return;
   if(n.nodeType!==1){node.removeChild(n);return}
   if(TAGS.indexOf(n.tagName)<0){
    if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|MATH|FORM|INPUT|BUTTON|TEXTAREA|SELECT|LINK|META|BASE)$/.test(n.tagName)){node.removeChild(n);return}
    clean(n);while(n.firstChild)node.insertBefore(n.firstChild,n);node.removeChild(n);return}
   Array.prototype.slice.call(n.attributes).forEach(function(a){
    var nm=a.name.toLowerCase(),allow=(ATTR[n.tagName]||[]).concat(ATTR['*']);
    if(allow.indexOf(nm)<0||(nm==='href'&&!okUrl(a.value))||(nm==='src'&&!okUrl(a.value,true)))n.removeAttribute(a.name)});
   if(n.tagName==='A'){if(n.getAttribute('target')==='_blank')n.setAttribute('rel','noopener noreferrer');else n.removeAttribute('target')}
   clean(n)})}
 window.ALsan=function(h){
  try{var d=new DOMParser().parseFromString('<body>'+String(h==null?'':h),'text/html');clean(d.body);return d.body.innerHTML}
  catch(e){var t=document.createElement('div');t.textContent=String(h==null?'':h);return t.innerHTML}};

 /* 2) Modo local (senha de teste) só funciona no seu computador, nunca num site publicado */
 var h=location.hostname,local=location.protocol==='file:'||h==='localhost'||h==='127.0.0.1'||h==='';
 window.AL_LOCAL_OK=local;
 var cfg=window.AL_CONFIG||{};
 if(!local&&!(cfg.SUPABASE_URL&&cfg.SUPABASE_KEY)){
  document.addEventListener('DOMContentLoaded',function(){
   var g=document.getElementById('gate');
   if(g&&document.body.dataset.page==='admin'){
    g.innerHTML='<div style="max-width:420px;margin:12vh auto;padding:24px;text-align:center;font-family:sans-serif"><h2>Área administrativa indisponível</h2><p>O banco de dados ainda não foi conectado. Por segurança, o acesso só é liberado com o banco configurado.</p></div>';
    var a=document.getElementById('app');if(a)a.remove()}})}

 /* 3) Saída automática após 30 min sem uso (só quando há sessão no banco) */
 var T=null,LIM=30*60*1000;
 function reset(){clearTimeout(T);T=setTimeout(function(){
  try{if(sessionStorage.getItem('al_sb')){sessionStorage.removeItem('al_sb');sessionStorage.removeItem('al_ok');
   if(document.body&&document.body.dataset.page==='admin')location.reload()}}catch(e){}},LIM)}
 ['click','keydown','mousemove','touchstart','scroll'].forEach(function(e){window.addEventListener(e,reset,{passive:true})});reset();
})();
