<?php
include_once('../globals.php');

$invalidData = [];
$success     = false;

/* check for empty values */

if (!isset($_POST['id'])) {
    $invalidData['id'] = ValidationErrors::Empty;
}

if (!is_numeric($_POST['id'])) {
    $invalidData['id'] = ValidationErrors::InvalidDataType;
}

$id = (int) $_POST['id'];

if (empty($invalidData)) {
    
    $selectImageIdResult = pg_query_params(
        $dbconn,
        'select image_id from paintings where id = $1',
        [$id]
    );

    if($row = pg_fetch_row($selectImageIdResult)) {
        $imageId = $row[0];
        
        $selectFileNameResult = pg_query_params(
            $dbconn,
            'select name from images where id = $1',
            [$imageId]
        );

        $deletePaintingResult = pg_query_params(
            $dbconn,
            'delete from paintings where id = $1',
            [$id]
        );

        $deleteImageResult = pg_query_params(
            $dbconn,
            'delete from images where id = $1',
            [$imageId]
        );

        if($row = pg_fetch_row($selectFileNameResult)) {
            $fileName = $row[0];
            unlink($imagesUploadDir . $fileName);
        }

        $success = true;
    }

}

echo json_encode([
    'success'     => $success,
    'invalidData' => json_encode($invalidData),
]);
