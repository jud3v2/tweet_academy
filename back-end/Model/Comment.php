<?php
require_once 'Database.php';
class Comment extends Database
{
    protected string $table = 'comments';
    protected ?int $id = null;
    public function __construct()
    {
        parent::__construct();
    }
    public function createComment(array $data): false|array|PDOStatement
    {
        if ($this->validateData($data, "create")) {
            $comment = $this->prepare("INSERT INTO tweet_comment (user_id, tweet_id, message) VALUES (:u, :t, :c);");
            if ($comment->execute([':u' => $data['user_id'], ':t' => $data['tweet_id'], ':c' => $data['comment']])) {
                return [
                    'comments' => $this->getComment($this->db->lastInsertId("comments")),
                ];
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    public function getComment(mixed $id): null|array
    {
        if (is_string($id) || is_int($id)) {
            $result = $this->fetch("SELECT * FROM tweet_comment WHERE id = :id", [':id' => $id]);
            if ($result && $result['isDeleted'] == 0) {
                return $result;
            }
        }
        return null;
    }
    public function getCommentByUserIdAndTweetId($user_id, $tweet_id)
    {
        $result = $this->fetch("SELECT * FROM tweet_comment WHERE user_id = :u AND tweet_id = :t", [':u' => $user_id, ':t' => $tweet_id]);
        if ($result) {
            return $result;
        }
        return null;
    }
    public function getId(): ?int {
        return $this->id;
    }
    public function commentDelete(int $commentId,int $user_Id): bool
    {
        if ($user_Id && $commentId) {
            $check = $this->fetch("SELECT * FROM tweet_comment WHERE id = :id AND user_id = :user_id", [':id' => $commentId , ':user_id' => $user_Id]);
            if (!$check) {
                return false;
            }
            $comment = $this->prepare("DELETE FROM tweet_comment WHERE id = :id AND user_id = :user_id");
            return $comment->execute([':id' => $commentId , ':user_id' => $user_Id]);
        }
        return false;
    }
    public function getCommentsByTweetId(int $tweetId): array
    {
        $result = $this->fetchAll("SELECT tweet_comment.*, users_preferences.profile_picture, users.username FROM tweet_comment INNER JOIN users_preferences on users_preferences.user_id = tweet_comment.user_id INNER JOIN users on tweet_comment.user_id = users.id WHERE tweet_id = :t AND tweet_comment.isDeleted != 1 ORDER BY tweet_comment.created_at DESC", [':t' => $tweetId]);
        if ($result) {
            return $result;
        }
        return [];
    }
    public function getCommentsByUserId(int $userId): array
    {
        $result = $this->fetchAll("SELECT * FROM tweet_comment WHERE user_id = :u", [':u' => $userId]);
        if ($result) {
            return $result;
        }
        return [];
    }
    public function UpdateComment($commentId, $userId, $newComment)
    {
        if ($commentId && $userId && $newComment) {
            $check = $this->fetch("SELECT * FROM tweet_comment WHERE id = :id AND user_id = :user_id", [':id' => $commentId , ':user_id' => $userId]);
            if (!$check) {
                return false;
            }
            $stmt = $this->prepare("UPDATE tweet_comment SET message = :c WHERE id = :id AND user_id = :user_id");
            return $stmt->execute([':id' => $commentId , ':user_id' => $userId, ':c' => $newComment]);
        }
        return false;
    }
    public function CountCommentsByTweetId(int $tweetId): int
    {
        $result = $this->fetch("SELECT COUNT(*) FROM tweet_comment WHERE tweet_id = :t", [':t' => $tweetId]);
        if ($result) {
            return (int) $result['COUNT(*)'];
        }
        return false;
    }
    public function validateData($data, $action)
    {
        if ($action == "create") {
            if (isset($data['user_id']) && isset($data['tweet_id']) && isset($data['comment'])) {
                return true;
            }
        }
        if ($action == "update") {
            if (isset($data['comment'])) {
                return true;
            }
        }
        if ($action == "delete") {
            if (isset($data['comment_id'])) {
                return true;
            }
        }
        return false;
    }
}