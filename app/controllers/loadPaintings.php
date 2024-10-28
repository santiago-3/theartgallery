<?php

    include_once('../globals.php');
    
    $response = [ 'success' => true ];
    $query = 'select p.id, i.name, i.width, i.height, a.name, p.year, p.name
        from paintings p
        left join images i on i.id = p.image_id
        left join authors a on a.id = p.author_id
        order by p.year
    ';

    $paintingsQueryResult = pg_query($dbconn, $query);
    if (!$paintingsQueryResult) {
        $response['success'] = false;
    };

    while($row = pg_fetch_row($paintingsQueryResult)) {

        $response['paintings'][] = (object) [
            "id"         => $row[0],
            "file" => [
                "name"   => $row[1],
                "width"  => $row[2],
                "height" => $row[3],
            ],
            "author"      => $row[4],
            "year"        => $row[5],
            "name"        => $row[6],
        ];

    }

echo json_encode($response);
