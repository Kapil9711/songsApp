export const endpoints = {
  api: {
    login: "/users/login",
    register: "/users/register",
    verfiyOtp: "/users/verify-otp",
    resendOtp: "/users/resend-otp",
    homePage: "/song/home-page",
    favorite: "/favorite",
    friend: "/friend",
    friends: {
      requests: "/friends/requests",
      receivedRequests: "/friends/requests/received",
      sentRequests: "/friends/requests/sent",
      friends: "/friends",
    },
    users: {
      list: "/users",
    },
  },
  jioApi: {
    songs: "/api/search/songs",
    albums: "/api/search/albums",
    playlist: "/api/search/playlists",
    albumsSongs: "/api/albums",
    playlistSongs: "/api/playlists",
  },
};
