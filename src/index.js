'use strict';

import AmexClient from './client'

const client = new AmexClient('YOUR_USERNAME_HERE','YOUR_PASSWORD_HERE');

exports.handler = (event, context, callback) => {
    client.getAccounts().then((result) => {
     callback(null, {
         amex: Number(result.replace(/[^0-9.,]+/, '').replace('"', ''))
        })
    })
}
