<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Hashtag.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class deleteHashtag extends Hashtag
{

        public function __construct()
        {
                parent::__construct();
        }

        public function index(array $data): Response
        {
                // If one of the fields is empty (tweet_id || rtweet_id) and no name, we return an error
                if (empty($data['id'])) {
                        (new Response())->sendJSON([
                            'error' => 'id is required',
                            'message' => 'id is required'
                        ], 400);
                }

                if(!$this->getHashtagById($data['id'])) {
                        (new Response())->sendJSON([
                            'error' => 'Hashtag not found',
                            'message' => 'Hashtag not found'
                        ], 404);
                }

                (new Response())->sendJSON([
                    'deleted' => $this->deleteHashtag($data['id'])
                ]);
        }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $deleteHashtag = new deleteHashtag();
        $deleteHashtag->index($_GET);
} else {
        (new Response())->sendJSON([
            'error' => 'Invalid request method'
        ], 400);
}