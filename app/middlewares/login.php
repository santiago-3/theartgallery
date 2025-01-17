<?php

include_once('app/globals.php');
$userAgent = strtolower($_SERVER['HTTP_USER_AGENT']);
if ($_COOKIE['admit'] != $env['ADMIT']) {
    header('location: /');
}
