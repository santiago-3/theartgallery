<?php

$userAgent = strtolower($_SERVER['HTTP_USER_AGENT']);
if (strpos($userAgent, 'linux') === false) { header('location: /'); }
if (strpos($userAgent, 'firefox') === false) { header('location: /'); }
if ($_SERVER['REMOTE_ADDR'] != '172.22.0.1') { header('location: /'); }
