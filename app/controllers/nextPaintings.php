<?php

include_once('../globals.php');

class NextPaintingController {

    private $dbconn = null;

    public function __construct($dbconn) {
        $this->dbconn = $dbconn;
    }

    public function index() {

        $previousPaintings = [];
        $painting          = null;
        $filters           = [];

        $ids = isset($_POST['ids']) ?? $_POST['ids'];

        $allPaintingIds = $this->getAllPaintingIds($filters);

        session_start();

        if (isset($_SESSION['previousPaintings'])) {
            $previousPaintings = $_SESSION['previousPaintings'];
        }

        $nextPaintingsIds = array_diff($allPaintingIds, $previousPaintings);

        $paintings = $this->getPaintings($nextPaintingsIds);

        return $paintings;

    }

    private function getAllPaintingIds($filters) {
        $ids          = [];
        $queryClauses = [];
        $filters      = [];
        $params       = [];

        $queryClauses[] = 'select id';
        $queryClauses[] = 'from paintings';

        if (isset($filters['author'])) {
            $authorId  = $filters['author'];
            $filters[] = 'author_id = ?';
            $params    = $authorId;
        }

        if (isset($filters['style'])) {
            $styleId   = $filters['style'];
            $filters[] = 'style_id = ?';
            $params    = $styleId;
        }

        if (! empty($filters)) {
            $filtersClauses[] = 'where ' . implode(' and ', $filters);
        }

        $query = implode(' ', $queryClauses);
        $idsQueryResult = pg_query_params($this->dbconn, $query, $params);

        while($row = pg_fetch_row($idsQueryResult)) {
            $ids[] = $row[0];
        }

        return $ids;
    }

    private function getPaintings($ids) {

        $paintings = [];
        $params    = $ids;

        $paramsPositions = [];

        foreach($ids as $index => $id) {
            $paramsPositions[] = '$' . ($index+1);
        }

        $fields = [
            'p.id',
            'a.name as author',
            's.name as style',
            'p.name',
            'p.year',
            'p.description',
            'i.name as imageName',
            'i.width as imageWidth',
            'i.height as imageHeight',
        ];

        $queryClauses[] = 'select ' . implode(', ', $fields);
        $queryClauses[] = 'from paintings p';

        $joins = [];

        $joins[] = 'authors a on a.id = p.author_id';
        $joins[] = 'styles s on s.id = p.style_id';
        $joins[] = 'images i on i.id = p.image_id';

        $queryClauses[] = 'left join ' . implode(' left join ', $joins);
        $queryClauses[] = 'where p.id in (' . implode(',', $paramsPositions) . ')';
        $queryClauses[] = 'limit 10';

        $query = implode(' ', $queryClauses);
        // echo $query; exit;
        $paintingsQueryResult = pg_query_params($this->dbconn, $query, $params);

        while($row = pg_fetch_row($paintingsQueryResult)) {
            $paintings[] = (object) [
                "id"          => $row[0],
                "author"      => $row[1],
                "name"        => $row[3],
                "year"        => $row[4],
                "style"       => $row[2],
                "description" => $row[5],
                "image" => [
                    "name"   => $row[6],
                    "width"  => $row[7],
                    "height" => $row[8],
                ],
            ];
        }

        return $paintings;

    }

}

$nextPaintingController = new NextPaintingController($dbconn);
$nextPaintings = $nextPaintingController->index();
if (is_array($nextPaintings) && count($nextPaintings) > 0) {
    echo json_encode([
        'success' => true,
        'paintings' => $nextPaintings
    ]);
}
else {
    echo json_encode([
        'success' => false,
    ]);
}
