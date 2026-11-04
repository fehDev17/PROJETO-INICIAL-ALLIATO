<?php
require __DIR__.'/_common.php';
$f=__DIR__.'/data/noticias.php';
function rd($f){if(!is_file($f))return [];$t=file_get_contents($f);$t=substr($t,strpos($t,"\n")+1);$j=json_decode($t,true);return is_array($j)?$j:[];}
if($_SERVER['REQUEST_METHOD']==='POST'){
  need();
  $in=json_decode(file_get_contents('php://input'),true);
  if(!is_array($in))out(['ok'=>false,'erro'=>'dados invalidos'],400);
  $clean=[];
  foreach($in as $n){
    if(!is_array($n)||empty($n['id'])||empty($n['title']))continue;
    $clean[]=['id'=>preg_replace('/[^a-zA-Z0-9\-]/','',(string)$n['id']),'title'=>(string)$n['title'],'sub'=>(string)($n['sub']??''),'cat'=>(string)($n['cat']??''),'author'=>(string)($n['author']??''),'date'=>substr((string)($n['date']??date('Y-m-d')),0,10),'status'=>(($n['status']??'')==='rascunho')?'rascunho':'publicada','img'=>(string)($n['img']??''),'body'=>(string)($n['body']??'')];
  }
  $ok=@file_put_contents($f,"<?php http_response_code(403);exit;?>\n".json_encode($clean,JSON_UNESCAPED_UNICODE),LOCK_EX);
  if($ok===false)out(['ok'=>false,'erro'=>'sem permissao de escrita em api/data'],500);
  out(['ok'=>true,'total'=>count($clean)]);
}
$l=rd($f);
if(!(authed()&&isset($_GET['all'])))$l=array_values(array_filter($l,function($n){return ($n['status']??'')!=='rascunho';}));
out($l);
