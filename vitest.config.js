// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Arrêter dès qu'un test échoue
    bail: 1,

    // Exécution dans un seul thread (utile pour déboguer ou les environnements fragiles)
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },

    // Affiche des infos détaillées sur les tests échoués
    reporters: [
      'default', // terminal classique
      'verbose', // affiche tous les tests, même ceux qui passent
      ['json', { outputFile: 'test-report.json' }], // rapport JSON optionnel
      // ['html', { outputFile: 'vitest-report.html' }], // si tu veux un rapport visuel HTML
    ],

    // Optionnel : pour voir les logs console.log() même si les tests passent
    // très utile en mode débogage
    silent: false,
    passWithNoTests: false,
  },
})
