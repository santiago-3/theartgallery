<?php

    include_once('../globals.php');

    $id = isset($_GET['id']) ? $_GET['id'] : null;

    if (is_null($id)) {
        return json_encode(['success' => false, 'error' => 'id not found']);
    }
    
    $response = [ 'success' => true ];
    $query = 'select p.id, i.name, i.width, i.height, p.author_id, p.style_id, p.year, p.name, p.description
        from paintings p
        left join images i on i.id = p.image_id
        where p.id = $1
    ';

    $paintingsQueryResult = pg_query_params($dbconn, $query, [$id]);
    if (!$paintingsQueryResult) {
        $response['success'] = false;
        $response['error'] = 'no painting found for id ' . $id;
    };

    while($row = pg_fetch_row($paintingsQueryResult)) {

        $response['painting'] = (object) [
            "id"         => (int) $row[0],
            "file" => [
                "name"   => $row[1],
                "width"  => (int) $row[2],
                "height" => (int) $row[3],
            ],
            "author_id"   => (int) $row[4],
            "style_id"    => (int) $row[5],
            "year"        => (int) $row[6],
            "name"        => $row[7],
            "description" => $row[8],
        ];

    }

echo json_encode($response);
