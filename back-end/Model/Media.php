<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Database.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/FileUpload.php';

class Media extends Database
{
        protected string $table = 'media';
        public function __construct()
        {
                parent::__construct();
        }

        /**
         * Create a new media row in the database
         * @param array $data
         * @return void
         */
        public function create(array $data): void
        {
                $this->insert($this->table, $data);
        }

        /**
         * Create a new media row in the public/images directory
         * @param array $data
         * @return void
         */
        public function store(array $data): void
        {
                FileUpload::store($data);
        }

        /**
         * Show the media from the public/images directory
         * @param string|int $id
         * @return mixed
         */
        public function getByID(string|int $id): mixed
        {
                $sql = "SELECT * FROM $this->table WHERE id = ?";
                return $this->fetch($sql, [$id]);
        }

        /**
         * Show all media from the public/images directory related to a tweet or a users
         * @param array $data
         * @param bool $flag (false for user, true for tweet)
         * @return array|false
         */
        public function getAll(array $data, bool $flag = false): array|false
        {
                if($flag) {
                        return $this->fetchAll("SELECT * FROM $this->table WHERE tweet_id = ?", [$data['tweet_id']]);
                } else {
                        return $this->fetchAll("SELECT * FROM $this->table WHERE user_id = ?", [$data['user_id']]);
                }
        }

        /**
         * Delete the row in DB and the file in the public/images directory
         * @param string|int $id
         * @return bool
         */
        public function delete(string|int $id): bool
        {
                $data = $this->query("DELETE FROM $this->table WHERE id = ?", [$id])->fetch($this->mode);

                if($data) {
                        $fullpath = $_SERVER['DOCUMENT_ROOT'] . $data['path'];
                        if(file_exists($fullpath)) {
                                if (unlink($fullpath)) {
                                        return true;
                                }
                        }
                }

                return false;
        }

        public function getByUserId(mixed $user_id): mixed
        {
                return $this->fetch("SELECT * FROM $this->table WHERE user_id = ?", [$user_id]);
        }
}