<?php

include_once('../globals.php');

class NextPaintingsController {

    private $dbconn = null;
    private $arrangedPaintingsIds = [];
    private $nextPaintingsIds = [];

    public function __construct($dbconn) {
        $this->dbconn = $dbconn;

        $number = isset($_GET['number']) ? $_GET['number'] : 0;

        if (! isset($_SESSION['arrangedPaintings'])) {
            $_SESSION['arrangedPaintings'] = $this->getAllPaintingIds([]);
        }

        $this->arrangedPaintingsIds = $_SESSION['arrangedPaintings'];
        $this->nextPaintingsIds = array_slice($this->arrangedPaintingsIds, $number, TOTAL_PAINTINGS_REQUESTED);
    }

    private function getAllPaintingIds($filters) {
        $ids          = [];
        $queryClauses = [];
        $filters      = [];
        $params       = [];

        $queryClauses[] = 'select id';
        $queryClauses[] = 'from paintings';
        $queryClauses[] = 'order by random()';

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

    public function getPaintings() {

        $paintings          = [];
        $unorderedPaintings = [];
        $paramsPositions    = [];

        foreach($this->nextPaintingsIds as $index => $id) {
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

        $query = implode(' ', $queryClauses);
        // echo $query; exit;
        $paintingsQueryResult = pg_query_params($this->dbconn, $query, $this->nextPaintingsIds);

        while($row = pg_fetch_row($paintingsQueryResult)) {
            $unorderedPaintings[$row[0]] = (object) [
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

        foreach($this->nextPaintingsIds as $id) {
            $paintings[] = $unorderedPaintings[$id];
        }

        return $paintings;

    }

    public function getPaintingsIndex() {

        $paintings          = [];
        $unorderedPaintings = [];
        $paramsPositions    = [];

        foreach($this->arrangedPaintingsIds as $index => $id) {
            $paramsPositions[] = '$' . ($index+1);
        }

        $fields = [
            'p.id',
            'a.name as author',
            'p.name',
            'p.year',
        ];

        $queryClauses[] = 'select ' . implode(', ', $fields);
        $queryClauses[] = 'from paintings p';
        $queryClauses[] = 'left join authors a on a.id = p.author_id';
        $queryClauses[] = 'where p.id in (' . implode(',', $paramsPositions) . ')';

        $query = implode(' ', $queryClauses);
        $paintingsQueryResult = pg_query_params($this->dbconn, $query, $this->arrangedPaintingsIds);

        while($row = pg_fetch_row($paintingsQueryResult)) {
            $unorderedPaintings[$row[0]] = (object) [
                "id"          => $row[0],
                "author"      => $row[1],
                "name"        => $row[2],
                "year"        => $row[3],
            ];
        }

        foreach($this->arrangedPaintingsIds as $id) {
            $paintings[] = $unorderedPaintings[$id];
        }

        return $paintings;
    }

}

$nextPaintingController = new NextPaintingsController($dbconn);
$nextPaintings = $nextPaintingController->getPaintings();
if (is_array($nextPaintings) && count($nextPaintings) > 0) {
    echo json_encode([
        'success' => true,
        'paintings' => $nextPaintings,
        'paintingsIndex' => $nextPaintingController->getPaintingsIndex(),
    ]);
}
else {
    echo json_encode([
        'success' => false,
    ]);
}
