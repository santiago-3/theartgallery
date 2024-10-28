<?php

include_once('../globals.php');

$response = [ 'success' => true, 'names' => [] ];
$namesQueryResult = pg_query($dbconn, 'select id, author_id, name from paintings');
if (!$namesQueryResult) {
    $response['success'] = false;
};

while($row = pg_fetch_row($namesQueryResult)) {
    $response['names'][] = (object) [
        "id"         => $row[0],
        "author_id"  => $row[1],
        "name"       => $row[2],
    ];
}

echo json_encode($response);
