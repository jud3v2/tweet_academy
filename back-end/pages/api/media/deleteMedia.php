<?php

require_once $_SERVER['DOCUMENT_ROOT'].'/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/Model/Media.php';
class deleteMedia extends Media
{
        public function __construct()
        {
                parent::__construct();
        }

        public function index(string|int $id): void
        {
                $data = $this->getByID($id);
                if ($data) {
                        if($this->delete($id)) {
                                (new Response())->sendJson([
                                        'status' => 'success',
                                        'message' => 'Media deleted'
                                ]);
                        } else {
                                (new Response())->sendJson([
                                        'status' => 'error',
                                        'message' => 'Media not deleted'
                                ]);
                        }
                } else {
                        (new Response())->sendJson([
                                'status' => 'error',
                                'message' => 'Media not found'
                        ], 404);
                }
        }
}

$media = new deleteMedia();

if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $media->index($_GET['id']);
} else {
        (new Response())->sendJson([
                'status' => 'error',
                'message' => 'Method not allowed'
        ], 405);
}