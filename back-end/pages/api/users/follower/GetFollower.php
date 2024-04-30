<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Follower.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/session.php';
(new session());
class Getfollower {
    private Follower $follower;

    public function __construct()
    {
        $this->follower = new Follower();
    }

    public function index(): void
{
    $user_id = $_GET['user_id'] ?? null;
    if ($this->validateData(['user_id' => $user_id])) {
            $followers = $this->follower->getFollowersWithFollowingStatus($user_id, $_GET['check_user_id'] ?? null);
        if ($followers) {
            (new Response())->sendJSON([
                "followers" => $followers,
            ], 200);
        } else {
            (new Response())->sendJSON([
                "message" => "No followers found."
            ], 404);
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

        if (empty($user_id)) {
            $error['user_id'] = 'User id is required';
        }

        if ((new User())->getUserById($user_id) === false) {
            $error['user_id'] = 'User id is invalid or unknown.';
        }

        if (!empty($error)) {
            (new Response())->sendJSON([
                "error" => $error
            ], 400);
            return false;
        } else {
            return $data;
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
$follow = new Getfollower();
$follow->index();
