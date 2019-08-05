var fs = require('fs');
var mustache = require('consolidate').mustache;
var config = require('../../../config');

function basicBenefitDisplays(b) {
    if (b.labelFunction) {
        return b.labelFunction(b);
    }

    if (b.type === 'bool') {
        return b.label;
    }

    return `${b.label} pour un montant de ${b.montant} € / ${b.isMontantAnnuel ? 'an' : 'mois'}`;
}

function render(followup) {
    return followup.situation.compute()
        .then(function (benefits) {
            return {
                followup: followup,
                benefitTexts: benefits.droitsEligibles.map(basicBenefitDisplays),
                returnURL: `${config.baseURL}${followup.returnPath}`,
            };
        }).then(function(data) {
            var textTemplate = fs.readFileSync('app/views/emails/initial.txt', 'utf8');
            return mustache.render(textTemplate, data)
                .then(text => {
                    return {
                        text: text,
                        subject: `[${data.followup.situation._id}] Récapitulatif de votre simulation sur Mes-Aides.gouv.fr`,
                    };
                });
        });
}

exports.render = render;
