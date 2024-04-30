<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/FileUpload.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class create
{
        public function index(array $data): void
        {
                FileUpload::store($data);
        }
}

if($_SERVER['REQUEST_METHOD']  == 'POST') {
        $_POST = (new  Request($_GET, $_POST))->getPost();
        $create = new create();

        $data = [
                'get' => $_GET,
                'post' => $_POST,
                'file' => $_FILES
        ];

        $create->index($data);
}