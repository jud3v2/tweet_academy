<?php
require_once 'Database.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Password.php';

class User extends Database
{
        private string $dateFormat;
        protected Password $password;

        protected string $table = 'users';

        public function __construct()
        {
                parent::__construct();
                $this->dateFormat = "d-m-Y";
                $this->password = new Password('');
        }

        public function login($username, $password): false|array
        {
                $sql = "SELECT * FROM users WHERE username = :username";
                $query = $this->db->prepare($sql);
                $query->execute(['username' => $username]);
                $user = $query->fetch();

                if ($user && $this->password->verify($password, $user['password_hash'])) {
                        return User::userWithoutPassword($user);
                }
                return false;
        }

        public function register($username, $email, $password, $firstname, $lastname, $birthdate, $genre): false|array
        {
                $this->password->setPassword($password);
                $sql = "INSERT INTO users 
            (username, email, password_hash, firstname, lastname, birthdate, genre) 
            VALUES (:username, :email, :password, :firstname, :lastname, :birthdate, :genre)";

                $query = $this->db->prepare($sql);

                if ($query->execute([
                    ':email' => $email,
                    ':password' => $this->password->getPassword(),
                    ':firstname' => $firstname,
                    ':lastname' => $lastname,
                    ':birthdate' => $birthdate,
                    ':genre' => $genre,
                    ':username' => $username
                ])) {
                        $selectSql = "SELECT * FROM users WHERE email = :email";
                        $selectQuery = $this->db->prepare($selectSql);
                        $selectQuery->execute([':email' => $email]);
                        $user = $selectQuery->fetch($this->mode);

                        // insert user preferences
                        $sql = "INSERT INTO users_preferences (user_id, theme) VALUES (:user_id, 0)";
                        $query = $this->db->prepare($sql);
                        $query->execute(['user_id' => $user['id']]);

                        return User::userWithoutPassword($user);
                } else {
                        return false;
                }
        }

        public function update($data): bool
        {

                $username = $data['username'];
                $email = $data['email'];
                $firstname = $data['firstname'];
                $lastname = $data['lastname'];
                $genre = $data['genre'];
                $birthdate = $data['birthdate'];
                $preferences = $data['preferences'];
                $sql = "UPDATE users
                        SET username = :username,
                            email = :email,
                            firstname = :firstname,
                            lastname = :lastname,
                            genre = :genre,
                            birthdate = :birthdate
                        WHERE username = :username";

                $query = $this->db->prepare($sql);
                if($query->execute([
                    'email' => $email,
                    'firstname' => $firstname,
                    'lastname' => $lastname,
                    'birthdate' => $birthdate,
                    'genre' => $genre,
                    'username' => $username,
                ])) { // user is updated here
                        $query = $this->query("UPDATE users_preferences SET theme = :theme, 
     bio =:bio, 
     website = :website, 
     localisation = :localisation 
 WHERE id = :id", [
                            'theme' => $preferences['theme'],
                            'id' => $preferences['id'],
                            'bio' => $preferences['bio'],
                            'localisation' => $preferences['localisation'],
                            'website' => $preferences['website']
                        ]);
                        return true;
                } else {
                        return false;
                }
        }

        public function getUserByID($id): mixed
        {
                $sql = "SELECT * FROM users WHERE id = :id";
                $query = $this->db->prepare($sql);
                $query->execute(['id' => $id]);
                return $query->fetch($this->mode);
        }

        public function getUserByEmail($email): mixed
        {
                $sql = "SELECT * FROM users WHERE email = :email";
                $query = $this->db->prepare($sql);
                $query->execute(['email' => $email]);
                return $query->fetch($this->mode);
        }

        public function getUserByUsername($username): mixed
        {
                $sql = "SELECT * FROM users WHERE username = :username";
                $query = $this->db->prepare($sql);
                $query->execute(['username' => $username]);
                return $query->fetch($this->mode);
        }

        /**
         * @param string $username Username of the user to get
         * @param array $relations Array of relations to add to the user information
         * @return false|array
         */
        public function getByUsernameAndWithRelations(string $username, array $relations): false|array
        {

                // Check if user exist
                $user = $this->getUserByUsername($username);

                if ($user === false) {
                        return false;
                }

                $user = User::userWithoutPassword($user);

                // this is a test if modificator can be a function instead of a string
                $modificator = function($id, $table) {
                        $sql = "SELECT * FROM $table WHERE following_id = :id";
                        $query = $this->db->prepare($sql);
                        $query->execute(['id' => $id]);
                        return $query->fetchAll($this->mode);
                };

                $tweetModificator = function($id, $table) {
                        $sql = "SELECT * FROM $table WHERE user_id = :id ORDER BY created_at DESC LIMIT 15";
                        $query = $this->db->prepare($sql);
                        $query->execute(['id' => $id]);
                        return $query->fetchAll($this->mode);
                };

                foreach ($relations as $relation) {
                        match($relation) {
                                'preferences' => $user['preferences'] = $this->getRelation($user['id'], 'users_preferences'),
                                'tweets' => $user['tweets'] = $this->getRelation($user['id'], 'tweet', $tweetModificator),
                                'rtweets' => $user['rtweets'] = $this->getRelation($user['id'], 'retweets', isFetchAll: true),
                                'follower' => $user['follower'] = $this->getRelation($user['id'], 'followers', $modificator),
                                'following' => $user['following'] = $this->getRelation($user['id'], 'followers',  'follower_id', isFetchAll: true),
                                'tweets_comments' => $user['comments'] = $this->getRelation($user['id'], 'tweet_comment', isFetchAll: true),
                                'media' => $user['media'] = $this->getRelation($user['id'], 'media', isFetchAll: true),
                                'message' => $user['messages'] = $this->getRelation($user['id'], 'users_messages', "recipient_id", isFetchAll: true),
                                default => null
                        };
                }

                return $this->userWithoutPasswordPOO($user);
        }

        public function getUsers(string $username = null, mixed $limit = null): array
        {
                if($limit) {
                        $sql = "SELECT users.id, users.username, users.lastname, users.firstname, users.created_at, users_preferences.profile_picture FROM users 
                         INNER JOIN users_preferences ON users.id = users_preferences.user_id
                         GROUP BY users.id, users.created_at, users_preferences.profile_picture ORDER BY users.created_at DESC LIMIT :limit";
                        // bind param to int
                        $stmt = $this->db->prepare($sql);
                        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                        $stmt->execute();
                        return $stmt->fetchAll($this->mode);
                } elseif($username) {
                        $sql = "SELECT users.*, users_preferences.profile_picture FROM users INNER JOIN users_preferences ON users.id = users_preferences.user_id WHERE username LIKE  :username LIMIT 5";
                        $query = $this->db->prepare($sql);
                        $query->execute(['username' => "%$username%"]);
                } else {
                        $sql = "SELECT * FROM users";
                        $query = $this->db->prepare($sql);
                        $query->execute();
                }
                return $query->fetchAll($this->mode);
        }

        public function passwordReset($email, $password): bool
        {
                $sql = "UPDATE users 
                        SET password_hash = :password
                        WHERE email = :email";
                $query = $this->db->prepare($sql);
                return $query->execute([
                    'email' => $email,
                    'password' => password_hash($password, PASSWORD_BCRYPT)
                ]);
        }

        public function delete($username): bool
        {
                $user = $this->getUserByUsername($username);

                if ($user['isDeleted'] === 1) {
                        $isDeleted = 0;
                } else {
                        $isDeleted = 1;
                }

                $sql = "UPDATE users 
                        SET isDeleted = :value
                        WHERE username = :username";
                $query = $this->db->prepare($sql);
                return $query->execute(['username' => $username, 'value' => $isDeleted]);
        }

        private function getBirthdate($age): string
        {
                $currentDate = new DateTimeImmutable();

// Calculate birth year
                $birthYear = $currentDate->format('Y') - $age;

// Format birth year to date
                $birthDate = new DateTimeImmutable("$birthYear-01-01"); // Default to Jan 1st
                return $birthDate->format($this->dateFormat);
        }

        static public function userWithoutPassword(array $user): array
        {
                unset($user['password_hash']);
                unset($user['password']);
                return $user;
        }

        public function userWithoutPasswordPOO(array $user): array
        {
                return User::userWithoutPassword($user);
        }
}