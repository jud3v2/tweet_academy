<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Message.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class createMessage
{
    private Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function index(): void
    {
        $requestData = $_POST;
        $verify = (new User())->getUserById($requestData['sender_id']);
        $this->message->validateData($requestData, "create");
        if (!$verify) {
            (new Response())->sendJSON(["message" => "User not found."], 404);
        }
        $message = $this->message->create($requestData);
        if ($message) {
            (new Response())->sendJSON(["message" => "Message created."], 200);
        } else {
            (new Response())->sendJSON(["message" => "Message not created."], 404);
        }
    }
}

$_POST = (new Request($_GET, $_POST))->getPost();
(new createMessage(new Message()))->index();
