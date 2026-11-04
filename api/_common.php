<?php
session_set_cookie_params(['httponly'=>true,'samesite'=>'Lax','secure'=>!empty($_SERVER['HTTPS'])]);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$cfg=require __DIR__.'/config.php';
function out($d,$c=200){http_response_code($c);echo json_encode($d,JSON_UNESCAPED_UNICODE);exit;}
function authed(){return !empty($_SESSION['al_user']);}
function need(){if(!authed())out(['ok'=>false,'erro'=>'nao autorizado'],401);}
