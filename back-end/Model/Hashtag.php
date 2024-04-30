<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Database.php';

class Hashtag extends Database
{

        protected string $table = 'hashtag';

        public function __construct()
        {
                parent::__construct();
        }

        /**
         * @return false|array
         */
        public function getHashtags(mixed $limit = null): false|array
        {
                if ($limit) {
                        $sql = "SELECT * FROM hashtag GROUP BY hashtag.created_at, hashtag.id ORDER BY hashtag.created_at DESC LIMIT :limit";
                        $stmt = $this->db->prepare($sql);
                        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                        $stmt->execute();
                        return $stmt->fetchAll($this->mode);
                } else {
                        $sql = "SELECT * FROM hashtag";
                        $result = $this->db->query($sql);
                        return $result->fetchAll($this->mode);
                }
        }

        /**
         * @param int $id
         * @return false|array
         */
        public function getHashtagById(int $id): false|array
        {
                $sql = "SELECT * FROM hashtag WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                return $stmt->fetch($this->mode);
        }

        /**
         * @param string $name
         * @return false|array
         */
        public function getHashtagByName(string $name): false|array
        {
                $sql = "SELECT * FROM hashtag WHERE name = :name";
                $stmt = $this->db->prepare($sql);
                $stmt->bindParam(':name', $name);
                $stmt->execute();
                return $stmt->fetch($this->mode);
        }

        /**
         * @description Create a new hashtag by name and tweet_id or rtweet_id or both
         * @param array $data
         * @return array if no data we return an empty array
         */
        public function createHashtag(array $data): array
        {
                if ($h = $this->getHashtagByName($data['name'])) {
                        return [
                            'error' => 'Hashtag already exists',
                            'hashtag' => $h
                        ];
                }


                if (isset($data['tweet_id']) && isset($data['rtweet_id'])) {
                        $sql = "INSERT INTO hashtag (name, tweet_id, rtweet_id) VALUES (:name, :tweet_id, :rtweet_id)";
                        $stmt = $this->db->prepare($sql);
                        $stmt->bindParam(':name', $data['name']);
                        $stmt->bindParam(':tweet_id', $data['tweet_id']);
                        $stmt->bindParam(':rtweet_id', $data['rtweet_id']);
                } elseif (isset($data['tweet_id'])) {
                        $sql = "INSERT INTO hashtag (name, tweet_id) VALUES (:name, :tweet_id)";
                        $stmt = $this->db->prepare($sql);
                        $stmt->bindParam(':name', $data['name']);
                        $stmt->bindParam(':tweet_id', $data['tweet_id']);
                } else {
                        $sql = "INSERT INTO hashtag (name, tweet_id) VALUES (:name, :rtweet_id)";
                        $stmt = $this->db->prepare($sql);
                        $stmt->bindParam(':name', $data['name']);
                        $stmt->bindParam(':rtweet_id', $data['rtweet_id']);
                }

                if ($stmt->execute()) {
                        return $this->getHashtagById($this->db->lastInsertId('hashtag'));
                } else {
                        return [];
                }
        }

        /**
         * @param array $hashtags
         * @param string|int $id
         * @param bool $retweet
         * @return void
         */
        public function createHashtags(array $hashtags, string|int $id, bool $retweet = false): void
        {
                foreach ($hashtags as $hashtag) {
                        // Si le hashtag n'existe pas, on le crée
                        if (!$this->getHashtagByName($hashtag)) {
                                $this->createHashtag([
                                    'name' => $hashtag,
                                    $retweet ? 'rtweet_id' : 'tweet_id' => $id
                                ]);
                        }
                }
        }

        /**
         * @param int $id
         * @param string $name
         * @return bool
         */
        public function updateHashtag(int $id, string $name): bool
        {
                $sql = "UPDATE hashtag SET name = :name WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->bindParam(':id', $id);
                $stmt->bindParam(':name', $name);
                return $stmt->execute();
        }

        /**
         * @param int $id
         * @return bool
         */
        public function deleteHashtag(int $id): bool
        {
                $sql = "DELETE FROM hashtag WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->bindParam(':id', $id);
                return $stmt->execute();
        }

        /**
         * @param string $name
         * @return array
         */
        public function findAllHashTagWithName(string $name): array
        {
                return $this->query('SELECT * FROM hashtag WHERE name LIKE :name', [
                    'name' => "%$name%"
                ])->fetchAll($this->mode);
        }

        public function getAllTweetsFromHashtag(string $name): array
        {
                if ($name === "all") {
                        goto all;
                }

                // search hastag and join every tweet that references the hashtag
                $hashtags = $this->findAllHashTagWithName($name);

                if (count($hashtags) === 0) {
                        goto all;
                }

                $tweets = [];

                foreach ($hashtags as $hashtag) {
                        $tweet = $this->query('SELECT
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
                        WHERE tweet.id = :id AND tweet.isDeleted = 0
                        GROUP BY tweet.id, tweet.created_at, users_preferences.profile_picture
                        ORDER BY tweet.created_at DESC', [
                            'id' => $hashtag['tweet_id']
                        ])->fetch($this->mode);

                        if ($tweet) {
                                $tweets[] = $tweet;
                        }
                }

                if(count($tweets) === 0) {
                        goto tweets;
                }


                // return all tweets that references the hashtag
                $tweets = $this->query('SELECT
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
                WHERE tweet.message LIKE :name AND tweet.isDeleted = 0
                GROUP BY tweet.id, tweet.created_at, users_preferences.profile_picture
ORDER BY tweet.created_at DESC', [
                    'name' => "%$name%"
                ])->fetchAll($this->mode);

                if (count($tweets) === 0) {
                        // return all tweet if no tweet references the hashtag
                        all:
                        return $this->query('SELECT
                                  tweet.*,
                                  users.username,
                                  users_preferences.profile_picture,
                                  COUNT(retweets.id) AS retweet_count,
                                  COUNT(tweet_comment.id) AS comment_count
                                FROM tweet
                                LEFT JOIN users ON tweet.user_id = users.id
                                LEFT JOIN users_preferences ON users.id = users_preferences.user_id
                                LEFT JOIN retweets ON tweet.id = retweets.tweet_id
                                LEFT JOIN tweet_comment ON tweet.id = tweet_comment.tweet_id AND tweet.isDeleted = 0
                                GROUP BY tweet.id, tweet.created_at, users_preferences.profile_picture
                        ORDER BY tweet.created_at DESC')->fetchAll($this->mode);
                } else {
                        tweets:
                        return $tweets;
                }
        }
}