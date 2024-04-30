<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Message.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class convbox
{
    private Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function index(): void
    {
        $requestData = $_GET;
        $verify = (new User())->getUserById($requestData['recipient_id']);
        if (!$verify) {
            (new Response())->sendJSON(["message" => "User not found."], 404);
        }
        $message = $this->message->getConvBox($requestData);
        if ($message) {
            (new Response())->sendJSON($message, 200);
        } else {
            (new Response())->sendJSON(["message" => "conv not found."], 404);
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
(new convbox(new Message()))->index();