<?php
require __DIR__.'/_common.php';
if(isset($_GET['logout'])){session_destroy();out(['ok'=>true]);}
if($_SERVER['REQUEST_METHOD']==='GET'){out(['ok'=>authed(),'name'=>$_SESSION['al_user']??null]);}
$in=json_decode(file_get_contents('php://input'),true)?:[];
usleep(500000);
$okUser=hash_equals(strtolower($cfg['user']),strtolower(trim((string)($in['user']??''))));
$okPass=hash_equals($cfg['pass_hash'],hash('sha256',$cfg['salt'].(string)($in['pass']??'')));
if(!($okUser&&$okPass))out(['ok'=>false],401);
session_regenerate_id(true);
$_SESSION['al_user']=$cfg['user'];
out(['ok'=>true,'name'=>$cfg['user']]);
