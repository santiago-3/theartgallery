<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Sie art galerie</title>
        <link rel="stylesheet" type="text/css" href="/public/styles.css" />
        <link rel="icon" type="image/x-icon" href="/public/favicon.ico">
        <?php foreach ($scripts as $script) { ?>
            <script src="/public/scripts/<?=$script?>.js"></script>
        <?php } ?>
    </head>
    <body>
        <?php include($view.'.html'); ?>
    </body>
</html>
