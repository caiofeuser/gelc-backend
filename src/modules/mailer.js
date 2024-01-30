const nodemailer = require('nodemailer');
const {email} = require('../config');

const transport = nodemailer.createTransport({
    service: email.SERVICE,
    auth: {
        user: email.USER,
        pass: email.PASS
    }
});

module.exports = transport;