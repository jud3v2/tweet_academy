<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Follower.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';


class Follow
{
    private Follower $follower;

    public function __construct()
    {
        $this->follower = new Follower();
    }

    public function index(array $data): Response
    {
        extract($data);
        if ($this->validateData($data)) {
            $followStatus = $this->follower->follow($follower_id, $following_id);
            if ($followStatus === true) {
                (new Response())->sendJSON([
                    "message" => "L'utilisateur a bien été suivi."
                ], 200);
            } elseif ($followStatus === false) {
                (new Response())->sendJSON([
                    "message" => "L'utilisateur n'a pas été suivi."
                ], 400);
            } elseif ($followStatus === null) {
                (new Response())->sendJSON([
                    "message" => "L'utilisateur n'est plus suivi."
                ], 200);
            }
        } else {
            (new Response())->sendJSON([
                "message" => "Invalid data."
            ], 404);
        }
    }

    public function validateData(array $data): array|bool
    {
        extract($data);

        $error = [];

        if (empty($follower_id)) {
            $error['follower_id'] = 'Follower id is required';
        }

        if (empty($following_id)) {
            $error['following_id'] = 'Following id is required';
        }

        if  ((new User())->getUserById($follower_id) === false || (new User())->getUserById($following_id) === false) {
            $error['follower_id'] = 'One of id\'s is invalid or unknown.';
        }
        if ($follower_id === $following_id) {
            $error['following_id'] = 'You can\'t follow yourself.';
        }

        if (count($error) > 0) {
            (new Response())->sendJSON([
                "message" => "Invalid data.",
                "error" => $error
            ], 404);
        }

        return true;
    }
}

$_POST = (new Request($_GET, $_POST))->getPost();

$follower_id = intval($_POST['follower_id']);
$following_id = intval($_POST['following_id']);
(new Follow())->index([
    'follower_id' => $follower_id,
    'following_id' => $following_id,
]);