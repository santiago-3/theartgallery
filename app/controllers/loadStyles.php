<?php

    include_once('../globals.php');
    
    $response = [ 'success' => true ];
    $stylesQueryResult = pg_query($dbconn, 'select id, name from styles');
    if (!$stylesQueryResult) {
        $response['success'] = false;
    };

    while($row = pg_fetch_row($stylesQueryResult)) {

        $response['styles'][] = (object) [
            "id"   => $row[0],
            "name" => $row[1],
        ];

    }

echo json_encode($response);
