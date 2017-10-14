# American Express bank balance
 
A simple tool that I've been hacking together and thought would be useful to publish. This tool utilises the UK app's API for American Express. Built because scraping is slow and unreliable.

## How to run
The client takes your username and password for your online account as arguments. Not great, but that's what the API needs. Fill them in at `index.js:9`.

### AWS lambda

If you've edited the root `index.js` file then it's just a matter of zipping up the folder (the contents, not the folder itself!) and uploading as your lamba. Right now it'll return an object of your available credit:

```
 {
     amex: 123.45
 }
```

Hook it up to an endpoint, a trigger, whatever. Go nuts! Probably wise to edit your lamba so it takes your username/password from the user instead of being saved on Amazon's server.

### Locally

The code can be ran locally fairly easily, you just need to remove the `exports.handler` (and `callback`) wrapper from `index.js` and run with `yarn start`.

## Extending
All the cool stuff lives in `./src/client.js`. If you edit it to log out the entire response there's actually lot of useful information about your account. Just change the xpath selector to return what you want. When you've changed what you need to, build the project again with `yarn build`, zip up the folders contents and upload to AWS.

