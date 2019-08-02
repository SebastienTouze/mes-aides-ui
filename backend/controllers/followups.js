var fs = require('fs');
var mailjet = require('node-mailjet');
var mustache = require('consolidate').mustache;

var Followup = require('mongoose').model('Followup');
var config = require('../config');
var sender = mailjet.connect(config.mailjet.publicKey, config.mailjet.privateKey);
var situation = require('./situations');

exports.followup = function(req, res, next, id) {
    Followup.findById(id, function(err, followup) {
        if (err) return next(err);
        if (! followup || ! followup.situation) return res.redirect('/');
        req.followup = followup;

        situation.situation(req, res, next, followup.situation);
    });
};

exports.resultRedirect = function(req, res) {
    situation.attachAccessCookie(req, res);
    res.redirect(req.situation.returnPath);
};

function sendEmail(followup, email) {
    email = email || followup.email;
    var textTemplate = fs.readFileSync('app/views/emails/initial.txt', 'utf8');
    var data = {
        subject: '[' + followup.situation + '] Récapitulatif de votre simulation sur Mes-Aides.gouv.fr',
        droits: ['A', 'B', 'C'],
        returnURL: `${config.baseURL}${followup.returnPath}`,
    };
    return mustache.render(textTemplate, data)
        .then(text => {
            return sender.post('send', { version: 'v3.1' })
                .request({ Messages: [{
                    From: { Name: 'Équipe Mes Aides', Email: 'contact@mes-aides.gouv.fr'},
                    To: [{ Email: email}],
                    Subject: data.subject,
                    TextPart: text,
                }]})
                .then(() => {
                    followup.sentAt = new Date();
                    followup.email = undefined;

                    return followup.save();
                })
                .catch(err => {
                    console.error(err);
                    followup.email = email;
                    return followup.save();
                });
        });
}
exports.sendEmail = sendEmail;

exports.persistAndSendEmail = function(req, res) {
    if (! req.body.email || ! req.body.email.length) {
        return res.status(400).send({ result: 'KO' });
    }

    Followup.create({
        situation: req.situation._id
    }).then(followup => {
        return sendEmail(followup, req.body.email)
            .then(() => res.send({ result: 'OK' }));
    }).catch(error => {
        console.error('error', error);
        return res.status(400).send({ result: 'KO' });
    });
};
