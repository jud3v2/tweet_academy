<?php

require_once $_SERVER['DOCUMENT_ROOT'].'/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/Model/Media.php';
class showMedia extends Media
{
        public function __construct()
        {
                parent::__construct();
                $this->table = 'media';
        }

        public function getMedia($id): void
        {
                $data = $this->getByID($id);
                if ($data) {
                        $fullpath = $_SERVER['DOCUMENT_ROOT'] . $data['path'];
                        if(file_exists($fullpath)) {
                                $mime = mime_content_type($fullpath);
                                header('Content-Type: '. $mime);
                                echo file_get_contents($fullpath);
                        } else {
                                goto a;
                        }
                } else {
                        a:
                        (new Response())->sendJson([
                                'status' => 'error',
                                'message' => 'Media not found'
                        ]);
                }
        }
}

$media = new showMedia();
$media->getMedia($_GET['id']);