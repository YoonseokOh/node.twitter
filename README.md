# Setting
- git clone git@github.com:yoonseokoh/node.twitter
- npm install

# Set API keys from twitter
- URL : https://developer.twitter.com/en/apps
- Get API keys : App Detail > Keys and Token > Consumer API keys
- Make file ./config/production.json like below
```
{
  "cfg": {
    "apikey": "",
    "secretkey": ""
  }
}
``` 
- export NODE_ENV=production

# Run
- npm start
- open http://localhost:8006
