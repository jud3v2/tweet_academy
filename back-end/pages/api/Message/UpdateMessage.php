<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Message.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class UpdateMessage
{
    public function __construct()
    {
        $this->message = new Message();
        $this->user = new User();

    }
    public function index()
    {
        $requestData = $_POST;
        $verify = $this->user->getUserById($requestData['sender_id']);
        $this->message->validateData($requestData, "update");
        if (!$verify) {
            (new Response())->sendJSON(["message" => "User not found."], 404);
        }
        $message = $this->message->update($requestData['id'], $requestData);
        if ($message) {
            (new Response())->sendJSON(["message" => "Message updated."], 200);
        } else {
            (new Response())->sendJSON(["message" => "Message not updated."], 404);
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
(new UpdateMessage())->index();