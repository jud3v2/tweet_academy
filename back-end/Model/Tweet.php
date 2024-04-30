<?php

require_once 'Database.php';

class Tweet extends Database
{

        protected string $table = 'tweet';

        public function __construct()
        {
                parent::__construct();
        }

        public function createTweet(array $data): false|array|PDOStatement
        {
                if ($this->validateData($data, "create")) {
                        $tweet = $this->prepare("INSERT INTO tweet (user_id, message) VALUES (:u, :t);");
                        if ($tweet->execute([':u' => $data['user_id'], ':t' => $data['message']])) {
                                return [
                                    'tweet' => $this->getTweet($this->db->lastInsertId("tweet")),
                                    'hashtag' => $this->tweetContainsHashtag($data['message']),
                                    'length' => strlen($data['message']),
                                ];
                        } else {
                                return false;
                        }
                } else {
                        return false;
                }
        }

        public function updateTweet(mixed $id, array $data): bool
        {
                if (is_string($id) || is_int($id)) {
                        // check if the tweet exists and if user can update it
                        $tweet = $this->getTweet($id);
                        if ($tweet && $tweet['user_id'] === $data['user_id']) {
                                if ($this->validateData($data, "update")) {
                                        $tweet = $this->prepare("UPDATE tweet SET message = :m WHERE id = :id");
                                        return $tweet->execute([':m' => $data['message'], ':id' => $id]);
                                }
                        }
                }

                return false;
        }

        public function getTweet(mixed $id): null|array
        {
                if (is_string($id) || is_int($id)) {
                        $result = $this->fetch("SELECT tweet.*, users.username, users.firstname, users.lastname, users_preferences.profile_picture, 
  COUNT(retweets.id) AS retweet_count,
  COUNT(tweet_comment.id) AS comment_count
FROM tweet
LEFT JOIN users ON tweet.user_id = users.id
LEFT JOIN users_preferences ON users.id = users_preferences.user_id
LEFT JOIN retweets ON tweet.id = retweets.tweet_id
LEFT JOIN tweet_comment ON tweet.id = tweet_comment.tweet_id
WHERE tweet.id = :id
GROUP BY tweet.id, users.username, users.firstname, users.lastname, users_preferences.profile_picture, tweet.created_at
ORDER BY tweet.created_at DESC", [':id' => $id]);
                                return $result;
                }

                return null;
        }

        public function tweetDelete(mixed $id, mixed $userId): array|false
        {
                if (is_string($id) || is_int($id)) {

                        $tweet = $this->getTweet($id);
                        if ($tweet && intval($tweet['user_id']) === intval($userId)) {
                                $query = "UPDATE tweet SET tweet.isDeleted = 1 WHERE tweet.id = :id";
                                $stmt = $this->db->prepare($query);
                                $stmt->execute([':id' => $id]);
                                return $this->getTweet($id);
                        }
                        return false;
                }
                return false;
        }

        public function getAllTweets(): false|array
        {
                return $this->fetchAll("SELECT tweet.*, users.username, users.firstname, users.lastname, users_preferences.profile_picture, 
  COUNT(retweets.id) AS retweet_count,
  COUNT(tweet_comment.id) AS comment_count
FROM tweet
LEFT JOIN users ON tweet.user_id = users.id
LEFT JOIN users_preferences ON users.id = users_preferences.user_id
LEFT JOIN retweets ON tweet.id = retweets.tweet_id
LEFT JOIN tweet_comment ON tweet.id = tweet_comment.tweet_id
WHERE tweet.isDeleted != 1
GROUP BY tweet.id, users.username, users.firstname, users.lastname, users_preferences.profile_picture, tweet.created_at
ORDER BY tweet.created_at DESC");
        }

        public function getTweets($id): array
        {
                if (is_string($id) || is_int($id)) {
                        return $this->fetchAll("SELECT * FROM tweet WHERE user_id = :id", [':id' => $id]);
                }
                return [];
        }

        public function getTweetsByUser(mixed $id): array
        {
                if (is_string($id) || is_int($id)) {
                        return $this->fetchAll("SELECT
  tweet.*,
  users.username,
  users_preferences.profile_picture,
  COUNT(retweets.id) AS retweet_count,
  COUNT(tweet_comment.id) AS comment_count
FROM tweet
LEFT JOIN users ON tweet.user_id = users.id
LEFT JOIN users_preferences ON users.id = users_preferences.user_id
LEFT JOIN retweets ON tweet.id = retweets.tweet_id
LEFT JOIN tweet_comment ON tweet.id = tweet_comment.tweet_id
WHERE tweet.user_id = :id AND tweet.isDeleted = 0
GROUP BY tweet.id, tweet.created_at, users_preferences.profile_picture
ORDER BY tweet.created_at DESC", [':id' => $id]);
                }

                return [];
        }

        public function validateData(array $data, string $action): bool
        {
                extract($data);

                if ($action === 'create') {
                        if (empty($user_id) || empty($message)) {
                                return false;
                        }
                }

                if ($action === 'update') {
                        if (empty($tweet) || empty($message) || empty($user_id)) {
                                return false;
                        }
                }

                if ($action === 'delete') {
                        if (empty($id)) {
                                return false;
                        }
                }

                return true;
        }

        /**
         * @param string $tweet
         * @return array
         */
        public function tweetContainsHashtag(string $tweet): array
        {
                // parse the tweet and check if it contains a hashtag
                // if yes extract every hastag and return them in an array
                // if no return an empty array

                $hashtags = [];

                if (str_contains($tweet, '#')) {
                        $words = explode(' ', $tweet);
                        foreach ($words as $word) {
                                if (str_starts_with($word, '#')) {
                                        $hashtags[] = $word;
                                }
                        }
                }

                return $hashtags;
        }

        public function tweetsWithUser(array &$tweets, string|int $id = null): void
        {
                // if $id is not null we will get the user by id
                // This will fix performance issue on database
                if ($id) {
                        $user = (new User())->getUserByID($id);
                        $user = User::userWithoutPassword($user);
                        foreach ($tweets as $key => $tweet) {
                                $tweets[$key]['user'] = $user;
                        }

                        return;
                }

                // need to be refactored to more efficient code
                // because if we have 1000 tweets we will make 1000 requests to the database
                // to get users data
                foreach ($tweets as $key => $tweet) {
                        $user = (new User())->getUserByID($tweet['user_id']);
                        $user = User::userWithoutPassword($user);
                        $tweets[$key]['user'] = $user;
                }
        }

        public function tweetsWithUserPreferences(array &$tweets, string|int $id = null): void
        {
                // if $id is not null we will get the user by id
                // This will fix performance issue on database
                if ($id) {
                        $preferences = (new User())->getRelation($id, "users_preferences");
                        foreach ($tweets as $key => $tweet) {
                                $tweets[$key]['preferences'] = $preferences;
                        }

                        return;
                }

                foreach ($tweets as $key => $tweet) {
                        $preferences = (new User())->getRelation($tweet['user_id'], "users_preferences");
                        $tweets[$key]['preferences'] = $preferences;
                }
        }

        public function updateMedia(mixed $id, string $media): bool
        {
                if($this->query("UPDATE tweet SET media = :m WHERE id = :id", [':m' => $media, ':id' => $id])) {
                        return true;
                }

                return false;
        }

        public function tweetsWithThread(array &$tweets): void
        {

        }
}