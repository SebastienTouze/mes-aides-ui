<template>
  <div class="container">
    <div class="frame-foyer">
      <h1>{{ pageTitle }}</h1>
      <legend>
        Sélectionnez les types de ressources perçues <strong>depuis {{ debutAnneeGlissante }}</strong>,
        vous pourrez ensuite saisir les montants.
      </legend>
      <form>
        <label v-for="ressourceType in ressourceTypes">
          <input type="checkbox" v-model="selectedRessourceTypes[ressourceType.id]"/>
          {{ ressourceType.label }}
        </label>
      </form>
    </div>
    <div class="text-right">
      <button class="button large" v-on:click="next">Valider</button>
    </div>
  </div>
</template>

<script>
import ressources from '@/constants/ressources'
import Situation from '@/lib/Situation'

export default {
  name: 'RessourceTypes',
  data () {
    return {
      pageTitle: "Vos ressources personnelles uniquement",
      debutAnneeGlissante: "octobre 2018",
      ressourceTypes: ressources.ressourceTypes,
      selectedRessourceTypes: {},
    }
  },
  methods: {
    updateIndividuRessources: function(individu, selectedRessourceTypes) {
        Object.keys(selectedRessourceTypes).forEach(function(ressourceTypeId) {
            if (selectedRessourceTypes[ressourceTypeId]) {
                individu[ressourceTypeId] = individu[ressourceTypeId] || {};
            } else {
                this.$RessourceService.unsetForCurrentYear($scope.situation.dateDeValeur, individu, typeMap[ressourceTypeId]);
                delete selectedRessourceTypes[ressourceTypeId];
            }
        })
    },
    next: function() {
      var situation = this.$SituationService.restoreLocal()
      console.log(situation)
      var individu = Situation.getDemandeur(situation)
      console.log(individu)
      this.updateIndividuRessources(individu, this.selectedRessourceTypes)
      console.log(individu)
      this.$SituationService.saveLocal()
      this.$router.push('/foyer/resultat')
    }
  }  
}
</script>