<?php
class ImageResizer
{
    private $source;
    public function __construct($sourceImagePath)
    {
        $this->source = $sourceImagePath;
    }
    public function resizeImage($destImagePath, $destWidth=100)
    {
        $sourceImage = imagecreatefromjpeg($this->source);
        $orgWidth    = imagesx($sourceImage);
        $orgHeight   = imagesy($sourceImage);
        $destHeight  = floor($orgHeight * ($destWidth / $orgWidth));
        $destImage   = imagecreatetruecolor($destWidth, $destHeight);
        imagecopyresampled($destImage, $sourceImage, 0, 0, 0, 0, $destWidth, $destHeight, $orgWidth, $orgHeight);
        imagejpeg($destImage, $destImagePath);
        imagedestroy($sourceImage);
        imagedestroy($destImage);

        return true;
    }
}
