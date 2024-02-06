import { Request, Response } from "express";

var express = require("express"); // Express web server framework
var request = require("request"); // "Request" library
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");

var client_id = "ddd80d3a769049b0b269748367174efc"; // Your client id
var client_secret = "051a31598c99472dba528f87104625c4"; // Your secret
var redirect_uri = "http://localhost/spotify/callback"; // Your redirect uri

const PORT = process.env.PORT || 4000;

const app = express();

var stateKey = "spotify_auth_state";

app.use(express.static(__dirname + "/public")).use(cookieParser());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
  const token = req.cookies.access_token;

  // Do something with the token...
  // For example, you could use it to make an authenticated request to the Spotify API

  res.send("acess token: " + token);
});

var generateRandomString = function (length: number) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get("/login", function (req: Request, res: Response) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var scope = "user-read-private user-read-email";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
        show_dialog: true,
      })
  );
});

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  // Add other properties as needed
}

app.get("/callback", function (req: Request, res: Response) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };
    // Make a POST request to exchange the code for tokens
    request.post(
      authOptions,
      function (
        error: Error | null,
        response: any,
        body: SpotifyTokenResponse
      ) {
        if (!error && response.statusCode === 200) {
          // Now you can access properties with type safety
          const access_token = body.access_token;
          const refresh_token = body.refresh_token;

          console.log(body);
          // Set the access token in a cookie
          res.cookie("access_token", access_token, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production", // Secure flag should be set in production
          });

          // Now you can use the access token to make API requests on behalf of the user

          // Redirect the user or perform any other necessary actions
          res.redirect("http://localhost:3000/success");
        } else {
          // Handle the error
          res.redirect(
            "/#" +
              querystring.stringify({
                error: "invalid_token",
              })
          );
        }
      }
    );
  }
});

app.get("/refresh_token", function (req: Request, res: Response) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(
    authOptions,
    function (error: Error | null, response: any, body: SpotifyTokenResponse) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          access_token: access_token,
        });
      }
    }
  );
});

const corsOptions = {
  origin: "http://localhost:3000", // This must match the client origin exactly
  credentials: true, // This allows cookies and credentials to be sent
  optionsSuccessStatus: 200,
};

// Then apply the CORS middleware with the options
app.use(cors(corsOptions));

app.get("/profile", async function (req: Request, res: Response) {
  const token = req.cookies.access_token;
  console.log("Token:", token);

  async function fetchProfile(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status}`);
    }

    const data = await result.json();

    return data;
  }

  try {
    const profileData = await fetchProfile(token);
    console.log(profileData);
    res.json(profileData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
