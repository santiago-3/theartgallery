<?php

enum ValidationErrors
{
    case Empty;
    case InvalidDataType;
    case TooShort;
    case TooLow;
    case TooHigh;

    public function toString()
    {
        return match($this) {
            ValidationErrors::Empty           => 'empty',
            ValidationErrors::InvalidDataType => 'invalid data type',
            ValidationErrors::TooShort        => 'too short',
            ValidationErrors::TooLow          => 'too low',
            ValidationErrors::TooHigh         => 'too high'
        };
    }
}

function getAuthorById(Array $authors, $id): object {
    foreach ($authors as $author) {
        if ($author->id == $id) {
            return $author;
        }
    }
    throw new Exception('function getAuthorById requires parameter id to be present as the id property in some of the elements of the array authors');
}

const THUMBNAIL_WIDTH           = 100;
const MAX_IMAGE_WIDTH           = 2362;
const MAX_PAINTINGS_ARRANGED    = 250;
const TOTAL_PAINTINGS_REQUESTED = 25;

define('IMAGES_THUMBNAILS_DIR', $_SERVER['DOCUMENT_ROOT'] . "/public/thumbnails/");
define('IMAGES_UPLOAD_DIR', $_SERVER['DOCUMENT_ROOT'] . "/public/images/");

session_start();
