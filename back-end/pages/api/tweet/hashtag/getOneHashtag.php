<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Hashtag.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class getOneHashtag extends Hashtag
{

        public function __construct()
        {
                parent::__construct();
        }

        public function index(array $data): Response
        {
                if (isset($data['username']) && is_string($data['username']) && !str_starts_with($data['username'], '#')) {
                        (new Response())->sendJSON([
                            'error' => 'Hashtag must start with #',
                            'message' => 'Hashtag must start with #'
                        ], 400);
                }

                if ($h = $this->getHashtagByName($data['username'])) {
                        (new Response())->sendJSON([
                            'hashtag' => $h
                        ]);
                } else {
                        (new Response())->sendJSON([
                            'message' => "Hashtag not found."
                        ], 404);
                }

                (new Response())->sendJSON([
                    'error' => 'SERVER ERROR',
                ], 500);
        }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $getOneHashTag = new getOneHashtag();
        $getOneHashTag->index($_GET);
} else {
        (new Response())->sendJSON([
            'error' => 'Invalid request method'
        ], 400);
}