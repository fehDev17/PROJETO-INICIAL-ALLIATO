<?php
require __DIR__.'/_common.php';
$in=json_decode(file_get_contents('php://input'),true)?:[];
$t=(string)($in['credential']??'');
if($t===''||empty($cfg['google_client_id']))out(['ok'=>false],400);
$r=@file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token='.urlencode($t));
$p=$r?json_decode($r,true):null;
$emails=array_map('strtolower',$cfg['allowed_emails']);
$ok=$p&&($p['aud']??'')===$cfg['google_client_id']&&($p['email_verified']??'')==='true'&&in_array(strtolower($p['email']??''),$emails,true)&&(int)($p['exp']??0)>time();
if(!$ok)out(['ok'=>false],401);
session_regenerate_id(true);
$_SESSION['al_user']=$p['given_name']??$cfg['user'];
out(['ok'=>true,'name'=>$_SESSION['al_user']]);
