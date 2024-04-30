<?php

require_once $_SERVER['DOCUMENT_ROOT'].'/functions.php';
class Database {
        /**
         * @var PDO
         */
        protected PDO $db;

        protected string $table;

        public int $mode = PDO::FETCH_ASSOC;

        public function __construct()
        {
                $this->db = new PDO(
                    "mysql:host=135.125.133.230;dbname=twitter",
                    "twitter",
                    "@twitter59"
                );
        }

        public function query($sql, $data = []): false|PDOStatement
        {
                $query = $this->db->prepare($sql);
                $query->execute($data);
                return $query;
        }

        public function insert($table, $data): false|PDOStatement
        {
                $keys = implode(',', array_keys($data));
                $values = implode(',', array_fill(0,
                    count($data), '?'));
                $sql = "INSERT INTO $table ($keys) VALUES ($values)";
                return $this->query($sql, array_values($data));
        }

        public function prepare($sql): false|PDOStatement
        {
                return $this->db->prepare($sql);
        }

        public function fetch($sql, $data = [], $mode = PDO::FETCH_ASSOC)
        {
                $query = $this->query($sql, $data);
                return $query->fetch($mode);
        }

        public function fetchAll($sql, $data = [], $mode = PDO::FETCH_ASSOC): false|array
        {
                $query = $this->query($sql, $data);
                return $query->fetchAll($mode);
        }

        public function fetchColumn($sql, $data = [])
        {
                $query = $this->query($sql, $data);
                return $query->fetchColumn();
        }

        public function lastInsertId(string $str = ''): false|string
        {
                return $this->db->lastInsertId($str);
        }

        public function quote($value): false|string
        {
                return $this->db->quote($value);
        }

        /**
         * @param mixed $id id of the references
         * @param string $table the table who we need to get the relation
         * @param mixed|null $modificateur the modificateur is the column to use to get the relation or a function to get the relation
         * @param bool $isFetchAll
         * @return array|null
         */
        public function getRelation(mixed $id, string $table, mixed $modificateur = null, bool $isFetchAll = false): array|null
        {
                // check if the table exists
                $sql = "SHOW TABLES LIKE :table";
                $query = $this->db->prepare($sql);
                $query->execute(['table' => $table]);
                $result = $query->fetch($this->mode);

                // if no result of query "$sql" we return an error because the table does not exist
                if (empty($result)) {
                        throw new Error("Table '$table' does not exist");
                }

                // Check if the modificator is a function
                if(is_callable($modificateur)) {
                        $relation = $modificateur($id, $table);
                // if is a string we will change the base relation on modificator string
                } elseif(is_string($modificateur)) {
                        $sql = "SELECT * FROM $table WHERE $modificateur = :id";
                        $query = $this->db->prepare($sql);
                        $query->execute(['id' => $id]);
                        // if the flag is true we will do a "oneToMany" relation else a "oneToOne" relation
                        $relation = $isFetchAll ? $query->fetchAll($this->mode) : $query->fetch($this->mode);
                } else {
                        // Base of the relation on users
                        $sql = "SELECT * FROM $table WHERE user_id = :id";
                        $query = $this->db->prepare($sql);
                        $query->execute(['id' => $id]);
                        $relation = $isFetchAll ? $query->fetchAll($this->mode) : $query->fetch($this->mode);
                }

                if($relation === false){
                        return null;
                }

                return $relation;
        }
}