<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Message.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class getMessage
{
        private Message $message;

        public function __construct(Message $message)
        {
                $this->message = $message;
        }

        public function index(): void
        {
                $requestData = $_GET;
                $sender = (new User())->getUserById($requestData['sender_id']);
                if (!$sender) {
                        (new Response())->sendJSON(["message" => "Sender User not found."], 404);
                }

                $recipient = (new User())->getUserById($requestData['recipient_id']);
                if (!$recipient) {
                        (new Response())->sendJSON(["message" => "Recipient User not found."], 404);
                }
                $message = $this->message->messageboxes($requestData['sender_id'], $requestData['recipient_id']);
                if ($message) {
                        (new Response())->sendJSON($message, 200);
                } else {
                        (new Response())->sendJSON(["message" => "Message not found."], 404);
                }
        }
}

$_POST = (new Request($_GET, $_POST))->getPost();
(new getMessage(new Message()))->index();