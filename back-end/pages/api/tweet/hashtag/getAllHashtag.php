<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Hashtag.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class getAllHashtag extends Hashtag
{

        public function __construct()
        {
                parent::__construct();
        }

        public function index(array $data): Response
        {
                if (isset($data['hashtag']) && is_string($data['hashtag']) && !str_starts_with($data['hashtag'], '#')) {
                        (new Response())->sendJSON([
                            'error' => 'Hashtag must start with #',
                            'message' => 'Hashtag must start with #'
                        ], 400);
                }

                if (!empty($data['hashtag']) && $h = $this->findAllHashTagWithName($data['hashtag'])) {
                        (new Response())->sendJSON([
                            "count" => count($h),
                            'hashtags' => $h
                        ]);
                } else {
                        (new Response())->sendJSON([
                            "count" => count($this->getHashtags($_GET['limit'] ?? null)),
                            'hashtags' => $this->getHashtags($_GET['limit'] ?? null)
                        ]);
                }

                (new Response())->sendJSON([
                    'error' => 'SERVER ERROR',
                ], 500);
        }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $getAllHashTag = new getAllHashtag();
        $getAllHashTag->index($_GET);
} else {
        (new Response())->sendJSON([
            'error' => 'Invalid request method'
        ], 400);
}