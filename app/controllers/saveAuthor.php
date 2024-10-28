<?php

include_once('../globals.php');

$expectedKeys = ['author_name', 'author_link'];

$invalidData  = [];
$authorValues = [];
$success      = true;

/* check for expected keys */

foreach ($expectedKeys as $expectedKey) {
    if (array_key_exists($expectedKey, $_POST)) {
        throw new Exception("operation not valid");
    }
}

/* check for empty values */

foreach ($expectedKeys as $expectedKey) {
    $invalidData[$expectedKey] = ValidationErrors::Empty;
}

/* checks for valid data */

foreach ($expectedKeys as $authorKey) {
    if (empty($_POST[$authorKey])) {
        $invalidData[$authorKey] = ValidationErrors::Empty;
    }

    if (strlen($_POST[$authorKey]) < 4) {
        $invalidData[$authorKey] = ValidationErrors::TooShort;
    }
}

/* save */

if (empty($invalidData)) {
    $authorValues = [
        'name' => $_POST['author_name'],
        'link' => $_POST['author_link'],
    ];

    $insertAuthorResult = pg_query_params(
        $dbconn,
        'insert into authors (name, link) values ($1, $2) returning id',
        array_values($authorValues)
    );

    $row = pg_fetch_row($insertAuthorResult);
    if (isset($row[0])) {
        $authorId = $row[0];
        $authorValues['id'] = $authorId;
    }
}

echo json_encode([
    'success' => $success,
    'paintingValues' => $authorValues,
    'invalidData' => $invalidData,
]);
