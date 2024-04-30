<?php
require_once 'Database.php';

class ReTweet extends Database
{

    protected string $table = 'retweets';
    protected ?int $id = null;

    public function __construct()
    {
        parent::__construct();
    }

    public function createReTweet(array $data): false|array|PDOStatement
    {
        if ($this->validateData($data, "create")) {
            $retweet = $this->prepare("INSERT INTO retweets (user_id, tweet_id, references_tweet_id) VALUES (:u, :t, :t);");
            if ($retweet->execute([':u' => $data['user_id'], ':t' => $data['tweet_id']])) {
                return [
                    'retweets' => $this->getReTweet($this->db->lastInsertId("retweets")),
                ];
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public function getReTweet(mixed $id): null|array
    {
        if (is_string($id) || is_int($id)) {
            $result = $this->fetch("SELECT * FROM retweets WHERE id = :id", [':id' => $id]);
            if ($result && $result['isDeleted'] == 0) {
                return $result;
            }
        }

        return null;
    }
    public function getReTweetByUserIdAndTweetId($user_id, $tweet_id)
    {
        $result = $this->fetch("SELECT * FROM retweets WHERE user_id = :u AND tweet_id = :t", [':u' => $user_id, ':t' => $tweet_id]);
        if ($result) {
            return $result;
        }
        return null;
    }
    public function getId(): ?int {
        return $this->id;
    }
    public function retweetDelete(int $retweetId,int $user_Id): bool
    {
        if ($user_Id && $retweetId) {
            $retweet = $this->prepare("DELETE FROM retweets WHERE id = :id AND user_id = :user_id");
            return $retweet->execute([':id' => $retweetId , ':user_id' => $user_Id]);
        }
        return false;
    }

   public function getretweetByuserid($user_id): array|bool
   {
       $result = $this->fetchAll("SELECT retweets.id AS rtweet_id, tweet.id AS tweet_id, retweets.references_tweet_id, tweet.message, 
       tweet.user_id, users_preferences.profile_picture, users.username, tweet.created_at AS tweet_created_at, retweets.created_at AS retweet_created_at,
        retweets.user_id AS retweeted_by_user_id, tweet.media AS tweet_media, tweet.isDeleted AS tweet_isDeleted,
        COUNT(tweet_comment.id) as comment_count
FROM retweets 
INNER JOIN tweet ON retweets.tweet_id = tweet.id 
INNER JOIN users_preferences ON tweet.user_id = users_preferences.user_id 
INNER JOIN users ON tweet.user_id = users.id
LEFT JOIN tweet_comment ON tweet.id = tweet_comment.tweet_id
WHERE retweets.user_id = :u AND tweet.isDeleted = 0 GROUP BY tweet_comment.id, retweets.id, retweets.created_at, retweets.references_tweet_id, tweet.message, 
       tweet.user_id, users_preferences.profile_picture, users.username, tweet.created_at  ORDER BY retweets.created_at DESC;
", [':u' => $user_id]);
         if ($result) {
              return $result;
         }
            return false;
   }
   public function countRetweetById($tweet_id): int
    {
         $result = $this->fetch("SELECT COUNT(*) AS count FROM retweets WHERE tweet_id = :t", [':t' => $tweet_id]);
         if ($result) {
              return $result['count'];
         }
         return 0;
    }
    public function validateData(array $data, string $type): bool
    {
        if ($type === "create") {
            if (isset($data['user_id']) && isset($data['tweet_id'])) {
                return true;
            }
        }
        return false;
    }
}