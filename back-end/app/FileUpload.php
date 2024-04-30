<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/CDN.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Media.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/UserPreferences.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';
class FileUpload
{
        /**
         * @var array|string[]
         */
        const array AUTHORIZED_TYPE = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
        ];
        const string DESTINATION = '/public/images/';

        /**
         * @param array $data
         * @return void
         */
        static public function store(array $data): void
        {
                self::validateData($data);
                $datum = [];
                // if the data is not valid, we send a header so here we check if the header was sent
                // if yes the data is not valid and we return a response
                // else we will try to store the file.
                if(! headers_sent()) {
                        foreach ($data['file'] as $file) {
                                $relativePath = self::DESTINATION . $file['name'];
                                $media = new Media();
                                $name = basename($relativePath);
                                if(isset($data['post']['tweet_id'])) {
                                        // check if the tweet exist

                                        $tweet = (new Tweet())->getTweet($data['post']['tweet_id']);

                                        if(!$tweet) {
                                                (new Response())->sendJSON([
                                                    'error' => 'Tweet not found',
                                                ], 404);
                                        }

                                        $media->create([
                                            'tweet_id' => $data['post']['tweet_id'],
                                            'path' => "https://yoker.b-cdn.net/$name",
                                        ]);
                                        // update tweet media column

                                        move_uploaded_file($file['tmp_name'], $_SERVER['DOCUMENT_ROOT'] .  $relativePath);
                                        (new CDN($relativePath))->store();
                                        (new Tweet())->updateMedia($tweet['id'], "https://yoker.b-cdn.net/$name");
                                        return;
                                } else {
                                        // check if users exist
                                        $user = (new User())->getUserByID($data['post']['user_id']);
                                        if(! $user) {
                                                (new Response())->sendJSON([
                                                    'error' => 'User not found',
                                                ], 404);
                                        }

                                        // check if user have already a profile picture
                                        $userMedia = $media->getByUserId($data['post']['user_id']);

                                        if($userMedia) {
                                                // if yes we delete the old one
                                                $media->delete($userMedia['id']);
                                                goto a;
                                        } else {
                                                a:
                                                $media->create([
                                                    'user_id' => $data['post']['user_id'],
                                                    'path' => "https://yoker.b-cdn.net/$name",
                                                ]);
                                                move_uploaded_file($file['tmp_name'], $_SERVER['DOCUMENT_ROOT'] .  $relativePath);
                                                (new CDN($relativePath))->store();
                                                (new UserPreferences())->updatePreferences($user['username'], ['profile_picture' => "https://yoker.b-cdn.net/$name"]);
                                                return;
                                        }
                                }
                        }
                }
        }


        /**
         * Validate file, the file will not exceed 1mb and file type need to be 'png/jpg or gif'
         * We also need to verify the user or tweet id.
         * @param array $data
         * @return void
         */
        static private function validateData(array $data): void
        {
                // need to validate file type size name and any other things that can be verified
                foreach ($data['file'] as $file) {
                        if ($file['size'] > 1000000) {
                                 (new Response())->sendJSON([
                                        'error' => 'File size is too large',
                                ], 400);
                        }

                        if (!in_array($file['type'], self::AUTHORIZED_TYPE)) {
                                (new Response())->sendJSON([
                                    'error' => 'File type is not supported',
                                ], 400);
                        }
                }

                if(isset($data['post']['user_id']) && !is_numeric($data['post']['user_id'])) {
                        (new Response())->sendJSON([
                                'error' => 'Tweet id is not valid',
                        ], 400);
                }

                if(isset($data['post']['tweet_id']) && !is_numeric($data['post']['tweet_id'])) {
                        (new Response())->sendJSON([
                                'error' => 'Tweet id is not valid',
                        ], 400);
                }

                if(!isset($data['post']['tweet_id']) && !isset($data['post']['user_id'])) {
                        (new Response())->sendJSON([
                                'error' => 'Tweet id or user id is required',
                        ], 400);
                }
        }
}