<?php
require_once 'User.php';

class Follower extends Database
{
        protected string $table = 'followers';

        public function __construct()
        {
                parent::__construct();
        }

        public function follow(int $follower_id, int $following_id): ?bool
        {
                $sql = "SELECT * FROM followers WHERE follower_id = :follower_id AND following_id = :following_id";
                $query = $this->db->prepare($sql);
                $query->execute([
                    'follower_id' => $follower_id,
                    'following_id' => $following_id,
                ]);
                $result = $query->fetch();

                if ($result) {
                        $sql = "DELETE FROM followers WHERE follower_id = :follower_id AND following_id = :following_id";
                        $query = $this->db->prepare($sql);
                        $success = $query->execute([
                            'follower_id' => $follower_id,
                            'following_id' => $following_id,
                        ]);
                        return $success ? null : false;
                } else {
                        $sql = "INSERT INTO followers (follower_id, following_id) VALUES (:follower_id, :following_id)";
                        $query = $this->db->prepare($sql);
                        return $query->execute([
                            'follower_id' => $follower_id,
                            'following_id' => $following_id,
                        ]);
                }
        }

        public function getFollowers(int $user_id): array|bool
        {
                $sql = "SELECT * FROM followers WHERE following_id = :user_id";
                $query = $this->db->prepare($sql);
                $query->execute([
                    'user_id' => $user_id,
                ]);
                $followers = $query->fetchAll();

                if ($followers) {
                        $followerList = [];
                        foreach ($followers as $follower) {
                                $followerList[] = (new User())->getUserById($follower['follower_id']);
                        }
                        return $followerList;
                } else {
                        return false;
                }
        }

        public function getFollowing(int $user_id): array|bool
        {
                $sql = "SELECT * FROM followers WHERE follower_id = :user_id";
                $query = $this->db->prepare($sql);
                $query->execute([
                    'user_id' => $user_id,
                ]);
                $following = $query->fetchAll();

                if ($following) {
                        $followingList = [];
                        foreach ($following as $follow) {
                                $followingList[] = (new User())->getUserById($follow['following_id']);
                        }
                        return $followingList;
                } else {
                        return false;
                }
        }

        public function countFollowers(int $user_id): int
        {
                $sql = "SELECT COUNT(*) FROM followers WHERE following_id = :user_id";
                $query = $this->db->prepare($sql);
                $query->execute([
                    'user_id' => $user_id,
                ]);
                return $query->fetchColumn();
        }

        public function countFollowing(int $user_id): int
        {
                $sql = "SELECT COUNT(*) FROM followers WHERE follower_id = :user_id";
                $query = $this->db->prepare($sql);
                $query->execute([
                    'user_id' => $user_id,
                ]);
                return $query->fetchColumn();
        }

        public function isFollowing(array &$followers, string|int $id): void
        {
                foreach ($followers as &$follower) {
                        $follower['is_following'] = $this->isUserFollowing($follower['id'], $id);
                }
        }

        public function getFollowingWithFollowerStatus(mixed $user_id, mixed $checkUserID): array
        {
                $sql = "SELECT f.*, u.*, up.profile_picture
            FROM followers AS f
            JOIN users AS u ON u.id = f.follower_id
            JOIN users_preferences as up ON u.id = up.user_id
            WHERE f.follower_id = :user_id";

                if ($checkUserID !== null) {
                        // Add a check for following status
                        $sql .= " AND EXISTS (
                    SELECT 1 FROM followers WHERE follower_id = :checkUserId AND following_id = :user_id
                )";
                        $query = $this->db->prepare($sql);
                        $query->execute([
                            'user_id' => $user_id,
                            'checkUserId' => $checkUserID, // Use $user_id if $checkUserId is null
                        ]);

                        return $query->fetchAll(PDO::FETCH_ASSOC);
                }


                $query = $this->db->prepare($sql);
                $query->execute([
                    'user_id' => $user_id,
                ]);

                return $query->fetchAll(PDO::FETCH_ASSOC);
        }

        public function getFollowersWithFollowingStatus(mixed $user_id, mixed $checkUserId = null): array
        {
                $sql = "SELECT f.*, u.*, up.profile_picture
            FROM followers AS f
            JOIN users AS u ON u.id = f.follower_id
            JOIN users_preferences as up ON u.id = up.user_id
            WHERE f.following_id = :user_id";

                if ($checkUserId !== null) {
                        // Add a check for following status
                        $sql .= " AND EXISTS (
                    SELECT 1 FROM followers WHERE follower_id = :checkUserId AND following_id = :user_id
                )";
                        $query = $this->db->prepare($sql);
                        $query->execute([
                            'user_id' => $user_id,
                            'checkUserId' => $checkUserId, // Use $user_id if $checkUserId is null
                        ]);

                        return $query->fetchAll(PDO::FETCH_ASSOC);
                }


                $query = $this->db->prepare($sql);
                $query->execute([
                    'user_id' => $user_id,
                ]);

                return $query->fetchAll(PDO::FETCH_ASSOC);
        }

        private function isUserFollowing(string|int $followerId, string|int $id): bool
        {
                $sql = "SELECT * FROM followers WHERE follower_id = :follower_id AND following_id = :following_id";
                $query = $this->db->prepare($sql);
                $query->execute([
                    'follower_id' => $id,
                    'following_id' => $followerId,
                ]);
                return (bool)$query->fetch();
        }
}