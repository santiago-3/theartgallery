<?php

include_once('constants.php');

$env = parse_ini_file('../.env');
$dbconn = pg_connect("host={$env['HOST']} port={$env['PORT']} dbname={$env['DBNAME']} user={$env['USER']} password={$env['PASSWORD']}");
