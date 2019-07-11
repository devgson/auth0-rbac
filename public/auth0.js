let _auth0Client = null;
let _idToken = null;
let _profile = null;
let _accessToken = null;

class Auth0Client {
  constructor() {
    _auth0Client = new auth0.WebAuth({
      domain: "gson007.auth0.com",
      audience: "https://api.manager.com/customer",
      clientID: "3K1tdQ9sHKgKgxb4i7wf2Wb2M9v4LmPp",
      redirectUri: "http://localhost:3001/",
      responseType: "token id_token",
      scope: "openid profile"
    });
  }

  getIdToken() {
    return _idToken;
  }

  getAccessToken() {
    return _accessToken;
  }

  getProfile() {
    return _profile;
  }

  handleCallback() {
    return new Promise((resolve, reject) => {
      _auth0Client.parseHash(async (err, authResult) => {
        window.location.hash = "";
        if (err) return reject(err);

        if (!authResult || !authResult.idToken) {
          // not an authentication request
          return resolve(false);
        }
        _accessToken = authResult.accessToken;
        _idToken = authResult.idToken;
        _profile = authResult.idTokenPayload;

        return resolve(true);
      });
    });
  }

  signIn() {
    _auth0Client.authorize();
  }
}

const auth0Client = new Auth0Client();
