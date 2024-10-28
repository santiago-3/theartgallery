<?php

    include_once('../globals.php');
    
    $response = [ 'success' => true ];
    $authorsQueryResult = pg_query($dbconn, 'select id, name from authors');
    if (!$authorsQueryResult) {
        $response['success'] = false;
    };

    while($row = pg_fetch_row($authorsQueryResult)) {

        $response['authors'][] = (object) [
            "id"   => $row[0],
            "name" => $row[1],
        ];

    }

echo json_encode($response);
