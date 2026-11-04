<?php
require __DIR__.'/_common.php';
need();
if(empty($_FILES['file'])||$_FILES['file']['error']!==0)out(['ok'=>false,'erro'=>'arquivo'],400);
$f=$_FILES['file'];
if($f['size']>6*1024*1024)out(['ok'=>false,'erro'=>'arquivo grande'],400);
$i=@getimagesize($f['tmp_name']);
$map=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
$ext=$map[$i['mime']??'']??null;
if(!$ext)out(['ok'=>false,'erro'=>'tipo nao permitido'],400);
$dir=dirname(__DIR__).'/uploads';
if(!is_dir($dir))@mkdir($dir,0755,true);
$n=date('Ymd-His').'-'.bin2hex(random_bytes(4)).'.'.$ext;
if(!move_uploaded_file($f['tmp_name'],$dir.'/'.$n))out(['ok'=>false,'erro'=>'nao foi possivel salvar'],500);
out(['ok'=>true,'url'=>'../uploads/'.$n]);
