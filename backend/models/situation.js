var mongoose = require('mongoose');
var _ = require('lodash');
var ressources = require('../../app/js/constants/ressources');
var utils = require('../lib/utils');
var validator = require('validator');

var familleDef = {
    parisien: Boolean,
    proprietaire_proche_famille: Boolean,
    rsa_isolement_recent: Boolean,
};

var foyerFiscalDef = {
    rfr: Object,
};

var ressourcesDefs = _.concat(
    ressources.ressourceTypes,
    ressources.categoriesRnc,
    ressources.patrimoineTypes)
    .reduce(function(result, ressource) {
        result[ressource.id] = Object;
        return result;
    }, {});

var specificSituationValues = [
    'chomeur',
    'etudiant',
    'retraite',
    'handicap',
    'boursier',
    'inapte_travail',
    'autre'
];

var statutMaritalValues = [
    'marie',
    'pacse',
    'celibataire',
];

var individuDef = Object.assign({
    _id: false,
    id: String,
    aah_restriction_substantielle_durable_acces_emploi: Boolean,
    ass_precondition_remplie: Boolean,
    boursier: Boolean,
    date_arret_de_travail: Date,
    date_debut_chomage: Date,
    date_naissance: Date,
    duree_possession_titre_sejour: Number,
    echelon_bourse: Number,
    enfant_a_charge: Object,
    enfant_place: Boolean,
    enceinte: Boolean,
    firstName: String,
    garde_alternee: Boolean,
    gir: { type: String, default: 'non_defini' },
    habite_chez_parents: Boolean,
    hasRessources: Boolean,
    nationalite: { type: String },
    role: { type: String, enum: ['demandeur', 'conjoint', 'enfant'] },
    scolarite: { type: String, enum: ['inconnue', 'college', 'lycee'] },
    specificSituations: [{ type: String, enum: specificSituationValues }],
    statut_marital: { type: String, enum: statutMaritalValues },
    taux_incapacite: Number,
    tns_auto_entrepreneur_type_activite: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
    tns_autres_revenus_type_activite: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
    tns_micro_entreprise_type_activite: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
}, ressourcesDefs);

var statutOccupationLogementValues = [
    'primo_accedant',
    'proprietaire',
    'locataire_vide',
    'locataire_meuble',
    'loge_gratuitement',
    'locataire_foyer',
    'sans_domicile',
];

var menageDef = {
    charges_locatives: Number,
    code_postal: String,
    coloc: Boolean,
    depcom: String,
    logement_chambre: Boolean,
    loyer: Number,
    nom_commune: String,
    participation_frais: Boolean,
    statut_occupation_logement: { type: String, enum: statutOccupationLogementValues },
    aide_logement_date_pret_conventionne: String,
};

var situation = {
    createdAt: { type: Date, default: Date.now },
    dateDeValeur: Date,
    famille: familleDef,
    foyer_fiscal: foyerFiscalDef,
    individus: [individuDef],
    menage: menageDef,
    modifiedFrom: String,
    status: { type: String, default: 'new', enum: ['new', 'test', 'investigation'] },
    token: String,
    version: Number,
};

var SituationSchema = new mongoose.Schema(situation, { minimize: false });

SituationSchema.statics.cookiePrefix = 'situation_';
SituationSchema.virtual('cookieName').get(function() {
    return `${SituationSchema.statics.cookiePrefix}${this._id}`;
});
SituationSchema.virtual('returnPath').get(function() {
    return '/foyer/resultat?situationId=' + this._id;
});

SituationSchema.methods.isAccessible = function(keychain) {
    return ['demo', 'investigation', 'test'].includes(this.status) || (keychain && keychain[this.cookieName] === this.token);
};
SituationSchema.methods.compute = function(cb) {
    var computeAides = require('../lib/mes-aides').computeAides;
    var r = {"individus":{"demandeur":{"nationalite":{"2019-08":"FR","2019-07":"FR","2019-06":"FR","2019-05":"FR"},"echelon_bourse":{"2019-08":-1,"2019-07":-1,"2019-06":-1,"2019-05":-1},"enfant_a_charge":{"2019":false},"enfant_place":{"2019-08":false,"2019-07":false,"2019-06":false,"2019-05":false},"tns_autres_revenus_type_activite":{"2019-08":"bic","2019-07":"bic","2019-06":"bic","2019-05":"bic"},"tns_micro_entreprise_type_activite":{"2019-08":"bic","2019-07":"bic","2019-06":"bic","2019-05":"bic"},"tns_auto_entrepreneur_type_activite":{"2019-08":"bic","2019-07":"bic","2019-06":"bic","2019-05":"bic"},"date_naissance":{"2019-08":"1989-01-01","2019-07":"1989-01-01","2019-06":"1989-01-01","2019-05":"1989-01-01"},"statut_marital":{"2019-08":"celibataire","2019-07":"celibataire","2019-06":"celibataire","2019-05":"celibataire"},"gir":{"2019-08":"gir_6","2019-07":"gir_6","2019-06":"gir_6","2019-05":"gir_6"},"age":{"2019-08":30,"2019-07":30,"2019-06":30,"2019-05":30},"age_en_mois":{"2019-08":367,"2019-07":367,"2019-06":367,"2019-05":367},"date_arret_de_travail":{"2019-08":"2019-08-02","2019-07":"2019-08-02","2019-06":"2019-08-02","2019-05":"2019-08-02"},"date_debut_chomage":{"2019-08":"2019-08-02","2019-07":"2019-08-02","2019-06":"2019-08-02","2019-05":"2019-08-02"},"handicap":{"2019-08":false,"2019-07":false,"2019-06":false,"2019-05":false},"taux_incapacite":{"2019-08":false,"2019-07":false,"2019-06":false,"2019-05":false},"inapte_travail":{"2019-08":false,"2019-07":false,"2019-06":false,"2019-05":false},"brest_metropole_transport":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"rennes_metropole_transport":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"livret_epargne_populaire_taux":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":1.25},"garantie_jeunes":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"ass":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"caah":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"aah":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"asi":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"cotes_d_armor_fonds_solidarite_logement_energie_eligibilite":{"2019-08":false},"paris_pass_access":{"2019-08":false},"paris_pass_seniors":{"2019-08":false},"apa_eligibilite":{"2019-08":false}}},"familles":{"_":{"parisien":{"2019-08":false,"2019-07":false,"2019-06":false,"2019-05":false},"parents":["demandeur"],"enfants":[],"ppa":{"2018-08":0,"2018-09":0,"2018-10":0,"2018-11":0,"2018-12":0,"2019-01":0,"2019-02":0,"2019-03":0,"2019-04":0,"2019-05":0,"2019-06":0,"2019-07":0,"2019-08":0},"alfortville_noel_enfants":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_complement_sante":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_energie_familles":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_logement_plfm":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_logement_aspeh":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_logement":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_logement_psol":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_forfait_familles":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"paris_logement_familles":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"bourse_lycee":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"bourse_college":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"aide_logement":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"rsa":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":559.74},"paje_base":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"asf":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"cf":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"af":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"acs":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"aspa":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0},"logement_social_eligible":{"2019-08":true},"aide_logement_non_calculable":{"2019-08":"calculable"},"rsa_non_calculable":{"2019-08":"calculable"},"cmu_c":{"2019-08":true}}},"foyers_fiscaux":{"_":{"declarants":["demandeur"],"personnes_a_charge":[]}},"menages":{"_":{"logement_conventionne":{"2019-08":false},"aide_logement_date_pret_conventionne":{"2019-08":"2017-12-31","2019-07":"2017-12-31","2019-06":"2017-12-31","2019-05":"2017-12-31"},"loyer":{"2019-08":0,"2019-07":0,"2019-06":0,"2019-05":0},"depcom":{"2019-08":"55039","2019-07":"55039","2019-06":"55039","2019-05":"55039"},"statut_occupation_logement":{"2019-08":"sans_domicile","2019-07":"sans_domicile","2019-06":"sans_domicile","2019-05":"sans_domicile"},"personne_de_reference":["demandeur"],"enfants":[],"cheque_energie":{"2019-04":0,"2019-03":0,"2019-02":0,"2019-01":0,"2018-12":0,"2018-11":0,"2018-10":0,"2018-09":0,"2018-08":0,"2019-08":0}}}};
    var aides = computeAides(this, r, false);

    cb(null, aides);
    return;
    var openfisca = require('../lib/openfisca');
     openfisca.calculate(this, function(err, openfiscaResponse) {
        if (err) {
            cb(err);
        }
        console.log(JSON.stringify(openfiscaResponse));

        var aides = computeAides(this, openfiscaResponse, false);
        cb(null, aides);
    });
};

SituationSchema.pre('save', function(next) {
    if (!this.isNew) next();
    var situation = this;
    utils.generateToken()
        .then(function(token) {
            situation.token = token;
        })
        .then(next)
        .catch(next);
});

var FollowupSchema = new mongoose.Schema({
    situation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Situation'
    },
    email: {
        type: String,
        validate:{
            validator: validator.isEmail,
            message: '{VALUE} n\'est pas un email valide',
            isAsync: false
        }
    },
    createdAt: { type: Date, default: Date.now },
    sentAt: { type: Date },
    _id: { type: String },
}, { minimize: false, id: false });

FollowupSchema.pre('save', function(next) {
    if (!this.isNew) next();
    var followup = this;
    utils.generateToken()
        .then(function(token) {
            followup._id = token;
        })
        .then(next)
        .catch(next);
});
FollowupSchema.virtual('returnPath').get(function() {
    return '/api/followups/' + this._id;
});

mongoose.model('Situation', SituationSchema);
mongoose.model('LegacySituation', new mongoose.Schema({}, { strict: false }));
mongoose.model('Followup', FollowupSchema);
