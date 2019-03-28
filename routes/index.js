const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Twitter auth' });
});


const config = require('config');
const cfg = config.get('cfg');
const request = require('request');
const OAuth   = require('oauth-1.0a');
const crypto = require('crypto');
const querystring = require('querystring');
let temp_user = {};
// Initializeconst
oauth = OAuth({
  consumer: {
    key: cfg.apikey,
    secret: cfg.secretkey
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

router.get('/oauth_token', function(req, res, next) {
  const request_data = {
    url: 'https://api.twitter.com/oauth/request_token',
    method: 'POST'
  };

  try {
    request({
      url: request_data.url,
      method: request_data.method,
      form: oauth.authorize(request_data)
    }, function(error, response, body) {
      if (cfg.debug) {
        console.log('\n\n[access_token]');
        console.log(error);
        console.log(body);
      }

      if (error || !body) {
        res.json({
          success: false,
          error: error
        });
      } else {
        const data = querystring.parse(body);

        // Process your data here
        res.json({
          success: true,
          oauth_token: data.oauth_token
        });
      }
    });
  } catch (e) {
    res.json({
      success: false,
      oauth_token: 'ERROR'
    });
  }
});

// Note: The token is optional for some requests
router.get('/callback', function(req, res, next) {
  const request_data_oauth = {
    url: 'https://api.twitter.com/oauth/access_token',
    method: 'POST'
  };

  if (cfg.debug) {
    console.log('\n\n[callback]');
    console.log(req.query);
  }

  try {
    request({
      url: request_data_oauth.url,
      method: request_data_oauth.method,
      form: Object.assign({}, oauth.authorize(request_data_oauth, {
        key: req.query.oauth_token
      }), {oauth_verifier: req.query.oauth_verifier})
    }, function(error, response, body) {
      if (cfg.debug) {
        console.log('\n\n[callback]');
        console.log(error);
        console.log(body);
      }

      if (error || !body) {
        res.json({
          success: false,
          error: error
        });
      } else {
        const data = querystring.parse(body);
        temp_user = data;

        // Process your data here
        res.render('callback', data);
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      success: false,
      oauth_token: 'ERROR'
    });
  }
});

router.post('/oauth_token', function(req, res, next) {
  if (cfg.debug) {
    console.log('\n\n[oauth_token]');
    console.log(temp_user);
  }

  res.json(Object.assign({}, {success: true}, temp_user));
});

router.post('/access_token', function(req, res, next) {
  if (cfg.debug) {
    console.log('\n\n[access_token]');
    console.log(temp_user);
  }

  res.json(Object.assign({}, {success: true}, temp_user));
});

router.get('/profile', function(req, res, next) {
  const request_data_profile = {
    url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
    method: 'GET'
  };
  const token = {
    key: temp_user.oauth_token,
    secret: temp_user.oauth_token_secret
  };

  if (cfg.debug) {
    console.log('\n\n[profile] data');
    console.log(token);
    console.log(oauth.authorize(request_data_profile, token));
  }

  try {
    request({
      url: request_data_profile.url,
      method: request_data_profile.method,
      headers: oauth.toHeader(oauth.authorize(request_data_profile, token))
    }, function(error, response, body) {
      if (cfg.debug) {
        console.log('\n\n[profile]');
        console.log(error);
        console.log(body);
      }

      if (error || !body) {
        res.json({
          success: false,
          error: error
        });
      } else {
        const data = querystring.parse(body);

        // Process your data here
        res.json({
          success: true,
          data: data
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.json({
      success: false,
      error: e
    });
  }
});

// Main page
router.get('/twitter', function(req, res, next) {
  res.render('twitter');
});

// Webhook
router.get('/webhook/twitter', function(req, res, next) {
  res.json('OK');
});

module.exports = router;
