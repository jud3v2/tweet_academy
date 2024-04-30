<?php
include $_SERVER['DOCUMENT_ROOT'].'/security/middleware/authorized.php';
new authorized();

http_response_code(301);
header('Location: /pages/home.php');