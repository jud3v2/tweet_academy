<?php
require_once 'Database.php';
 class Message extends Database
 {
     public function __construct()
     {
         parent::__construct();
     }

     public function create(array $data): bool
     {
         $query = $this->prepare('INSERT INTO users_messages (messages, sender_id, recipient_id) VALUES (?, ?, ?)');
         return $query->execute([$data['messages'], $data['sender_id'], $data['recipient_id']]);
     }
     public function getOneMessage($id): array|false
     {
         $query = $this->query('SELECT * FROM users_messages WHERE id = ?', array($id));
         return $query->fetch($this->mode);
     }

     public function update(mixed $id, array $data): bool
     {
         return $this->prepare("UPDATE users_messages SET messages = ? WHERE id = ?")->execute([$data['messages'], $id]);
     }

     public function delete($id): bool
     {
         return $this->prepare("DELETE FROM users_messages WHERE id = ?")->execute([$id]);
     }

     public function messageboxes($sender_id, $recipient_id): array|false
     {
         $query = $this->query('SELECT users_messages.*, sender_preferences.profile_picture AS sender_profile_picture, sender.username AS sender_username, recipient_preferences.profile_picture AS recipient_profile_picture, recipient.username AS recipient_username FROM users_messages INNER JOIN users_preferences AS sender_preferences ON users_messages.sender_id = sender_preferences.user_id INNER JOIN users AS sender ON users_messages.sender_id = sender.id INNER JOIN users_preferences AS recipient_preferences ON users_messages.recipient_id = recipient_preferences.user_id INNER JOIN users AS recipient ON users_messages.recipient_id = recipient.id WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY created_at', [$sender_id, $recipient_id, $recipient_id, $sender_id]);
         return $query->fetchAll($this->mode);
     }

     public function getConvBox($requestData) : array|false
     {
         $query = $this->query('
    SELECT 
        RankedMessages.id, 
        RankedMessages.sender_id, 
        sender_preferences.profile_picture AS sender_profile_picture, 
        recipient.firstname AS recipient_firstname, 
        recipient.lastname AS recipient_lastname, 
        sender.username AS sender_username, 
        RankedMessages.recipient_id, 
        recipient_preferences.profile_picture AS recipient_profile_picture, 
        recipient.username AS recipient_username, 
        RankedMessages.messages, 
        RankedMessages.created_at
    FROM (
        SELECT
            id,
            sender_id,
            recipient_id,
            messages,
            created_at,
            ROW_NUMBER() OVER (PARTITION BY LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id) ORDER BY created_at DESC) AS row_num
        FROM
            twitter.users_messages
    ) AS RankedMessages
    INNER JOIN users_preferences AS sender_preferences ON RankedMessages.sender_id = sender_preferences.user_id
    INNER JOIN users AS sender ON RankedMessages.sender_id = sender.id
    INNER JOIN users_preferences AS recipient_preferences ON RankedMessages.recipient_id = recipient_preferences.user_id
    INNER JOIN users AS recipient ON RankedMessages.recipient_id = recipient.id
    WHERE
        (RankedMessages.sender_id = ? OR RankedMessages.recipient_id = ?)
        AND
        row_num = 1
    ORDER BY RankedMessages.created_at DESC
', [$requestData['recipient_id'], $requestData['recipient_id']]);
         $results = $query->fetchAll($this->mode);
         return array_map(function ($result) use ($requestData) {
             if ($result['recipient_id'] == $requestData['recipient_id']) {
                 unset($result['recipient_profile_picture']);
                 unset($result['recipient_username']);
             }
             if ($result['sender_id'] == $requestData['recipient_id']) {
                 $result['sender_profile_picture'] = $result['recipient_profile_picture'];
                 unset($result['sender_profile_picture']);
             }
             return $result;
         }, $results);
     }
     public function validateData($data, $type): void
     {
            if ($type === "create") {
                if (!isset($data['messages']) || !isset($data['sender_id']) || !isset($data['recipient_id'])) {
                    (new Response())->sendJSON(["message" => "Invalid data."], 400);
                }
            }
            if ($type === "update") {
                if (!isset($data['messages']) || !isset($data['id']) || !isset($data['sender_id'])) {
                    (new Response())->sendJSON(["message" => "Invalid data."], 400);
                }
            }
     }
 }