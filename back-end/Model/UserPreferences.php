<?php

require_once 'Database.php';

class UserPreferences extends Database
{
        protected string $table = 'users_preferences';
        
        public function __construct()
        {
                parent::__construct();
        }

        public function updatePreferences($username, array $preferences): bool
        {
                // Fetch user data
                $user = $this->query('SELECT id FROM users WHERE username = :username', ['username' => $username])->fetch($this->mode);

                if (!$user) {
                        return false;
                }

                if (isset($preferences['theme'])) {
                        $this->query('UPDATE users_preferences 
SET theme = :theme 
WHERE user_id = :user_id',
                            ['theme' => $preferences['theme'],
                                'user_id' => $user['id']]);
                }

                if (isset($preferences['bio'])) {
                        $this->query('UPDATE users_preferences 
SET bio = :bio 
WHERE user_id = :user_id',
                            ['bio' => $preferences['bio'],
                                'user_id' => $user['id']]);
                }

                if (isset($preferences['profile_picture'])) {
                        $this->query('UPDATE users_preferences 
SET profile_picture = :profile_picture 
WHERE user_id = :user_id',
                            ['profile_picture' => $preferences['profile_picture'],
                                'user_id' => $user['id']]);
                }

                if (isset($preferences['profile_banner'])) {
                        $this->query('UPDATE users_preferences 
SET profile_banner = :profile_banner 
WHERE user_id = :user_id',
                            ['profile_banner' => $preferences['profile_banner'],
                                'user_id' => $user['id']]);
                }

                if (isset($preferences['localisation'])) {
                        $this->query('UPDATE users_preferences 
SET localisation = :localisation 
WHERE user_id = :user_id',
                            ['localisation' => $preferences['localisation'],
                                'user_id' => $user['id']]);
                }

                if (isset($preferences['website'])) {
                        $this->query('UPDATE users_preferences
SET website = :website 
WHERE user_id = :user_id',
                            ['website' => $preferences['website'],
                                'user_id' => $user['id']]);
                }


                return true;
        }

        public function getPreferences($username): false|array
        {
                $user = $this->query('SELECT * FROM users WHERE username = :username', ['username' => $username])->fetch($this->mode);

                if (!$user) {
                        return false;
                }

                return $this->query('SELECT * FROM users_preferences WHERE user_id = :user_id', ['user_id' => $user['id']])->fetch($this->mode);
        }

        public function getPreferencesById(mixed $id): false|array
        {
                return $this->query('SELECT * FROM users_preferences WHERE user_id = :user_id', ['user_id' => $id])->fetch($this->mode);
        }
}