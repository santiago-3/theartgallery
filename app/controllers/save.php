<?php
include_once('../globals.php');

$expectedKeys = ['author_id', 'style_id', 'name', 'year', 'description'];

$invalidData  = [];
$success      = true;
$imageId      = null;

/* check for expected keys */

foreach ($expectedKeys as $expectedKey) {
    if (! array_key_exists($expectedKey, $_POST)) {
        throw new Exception("operation not valid");
    }
}

/* check for empty values */

foreach ($expectedKeys as $expectedKey) {
    if (empty($_POST[$expectedKey])) {
        $invalidData[$expectedKey] = ValidationErrors::Empty;
    }
}

/* checks for valid data */

if (! is_numeric($_POST['style_id'])) {
    $invalidData['style_id'] = ValidationErrors::InvalidDataType;
}

if (! is_numeric($_POST['author_id'])) {
    $invalidData['author_id'] = ValidationErrors::InvalidDataType;
}

if (gettype($_POST['name']) != 'string'  ) {
    $invalidData['name'] = ValidationErrors::InvalidDataType;
}

if (! is_numeric($_POST['year'])) {
    $invalidData['year'] = ValidationErrors::InvalidDataType;
}

if ((int) $_POST['year'] < 1000) {
    $invalidData['year'] = ValidationErrors::TooLow;
}

if ((int) $_POST['year'] > 3000) {
    $invalidData['year'] = ValidationErrors::TooHigh;
}

if (gettype($_POST['description']) != 'string'  ) {
    $invalidData['description'] = ValidationErrors::InvalidDataType;
}

/* save */

$paintingValues = [];
foreach ($expectedKeys as $expectedKey) {
    $paintingValues[$expectedKey] = $_POST[$expectedKey];
}

/* check for file */

if (empty($_FILES) || ! array_key_exists('file', $_FILES) || $_FILES['file']['size'] <= 0) {
    if (! isset($_POST['id'])) {
        $invalidData['file'] = ValidationErrors::Empty;
        $success = false;
    }
}
else {
    if ($_FILES['file']['size'] <= 0) {
        $invalidData['file'] = ValidationErrors::Empty;
    }

    if (!empty($invalidData)) {
        $success = false;
    }

    $fileNameParts = explode('.',$_FILES['file']['name']);
    $fileExtension = $fileNameParts[count($fileNameParts)-1];
    $fileName      = $paintingValues['author_id'] . "-" . str_replace(' ','-',trim($paintingValues['name'])) . '.' . $fileExtension;

    $imageResizer = new ImageResizer($_FILES['file']['tmp_name']);
    $imageData    = getimagesize($_FILES['file']['tmp_name']);
    $imageWidth   = $imageData[0];

    ini_set("memory_limit", "300M");
    $imageResizer->resizeImage($imagesThumbnailsDir . $fileName, THUMBNAIL_WIDTH);
    if ($imageWidth > MAX_IMAGE_WIDTH) {
        $imageResizer->resizeImage($imagesUploadDir . $fileName, MAX_IMAGE_WIDTH);
    }
    else if (! move_uploaded_file($_FILES['file']['tmp_name'], $imagesUploadDir . $fileName)) {
        $success = false;
    }

    $imageData   = getimagesize($imagesUploadDir . $fileName);
    $imageData = [
        'name'   => $fileName,
        'width'  => $imageData[0],
        'height' => $imageData[1],
        'type'   => $imageData['mime'],
    ];
    
    if ($success) {
        $insertImageResult = pg_query_params(
            $dbconn,
            'insert into images (name, width, height, type) values ($1, $2, $3, $4) returning id',
            array_values($imageData)
        );

        $row = pg_fetch_row($insertImageResult);
        if (isset($row[0])) {
            $imageId = $row[0];
            $paintingValues['image_id'] = $imageId;
        }
    }
}


if (isset($_POST['id'])) {

    if ($imageId) {
        $updateQuery = 'update paintings set author_id=$1, style_id=$2, name=$3, year=$4, description=$5, image_id=$6 where id = $7';
    }
    else {
        $updateQuery = 'update paintings set author_id=$1, style_id=$2, name=$3, year=$4, description=$5 where id = $6';
    }

    if (! is_numeric($_POST['id'])) {
        $invalidData['id'] = ValidationErrors::InvalidDataType;
        $success = false;
    }
    else {
        $paintingValues['id'] = $_POST['id'];
    }

    if ($success) {
        $updateResult = pg_query_params(
            $dbconn,
            $updateQuery,
            array_values($paintingValues)
        );
    }

    echo json_encode([
        'success' => $success,
        'paintingValues' => $paintingValues,
        'invalidData' => $invalidData,
    ]);

}
else {

    if ($success) {
        $insertResult = pg_query_params(
            $dbconn,
            'insert into paintings (author_id, style_id, name, year, description, image_id) values ($1, $2, $3, $4, $5, $6) returning id',
            array_values($paintingValues)
        );

        $row = pg_fetch_row($insertResult);
        if (isset($row[0])) {
            $paintingId = $row[0];
            $paintingValues['id'] = $paintingId;
        }
    }

    echo json_encode([
        'success' => $success,
        'paintingData' => $paintingValues,
        'invalidData' => $invalidData,
        'imageData' => $imageData
    ]);
}
