export default function isConnected() {
        return !!JSON.parse(localStorage.getItem('twitter_user')).id;
}