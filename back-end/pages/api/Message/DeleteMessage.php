<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Message.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class DeleteMessage
{
    private Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function index()
    {
        $requestData = $_POST;
        $verify = (new User())->getUserById($requestData['sender_id']);
        if (!$verify) {
            (new Response())->sendJSON(["message" => "User not found."], 404);
        }
        $message = $this->message->getOneMessage($requestData['id']);
        if ($message) {
            $delete = $this->message->delete($requestData['id']);
            (new Response())->sendJSON(["message" => "Message deleted."], 200);
        } else {
            (new Response())->sendJSON(["message" => "Message not found."], 404);
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
(new DeleteMessage(new Message()))->index();