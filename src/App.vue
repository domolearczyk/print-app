<template>
  <div>
    <div id="main">
      <section class="tabs">
        <menu role="tablist" aria-label="Sample Tabs">
          <button role="tab" :aria-selected="activeTab === 'settings'" aria-controls="settings" @click="activeTab = 'settings'">Einstellungen</button>
          <button role="tab" :aria-selected="activeTab === 'printers'" aria-controls="printers" @click="activeTab = 'printers'">Drucker</button>
          <button role="tab" :aria-selected="activeTab === 'paths'" aria-controls="paths" @click="activeTab = 'paths'">Pfade</button>
          <button role="tab" :aria-selected="activeTab === 'logs'" aria-controls="logs" @click="activeTab = 'logs'">Log</button>
        </menu>
        <article role="tabpanel" id="printers" :class="{ 'd-none': activeTab !== 'printers' }">
          <div class="row mt-3">
            <div class="col-6">
              <div>A4 Drucker</div>
              <small>Lieferscheine, Zollpapiere, Picklisten</small>
            </div>
            <div class="col-6">
              <select class="w-100" v-model="settings.printers.a4">
                <option v-for="(printer, index) in printerList" :key="index" :value="printer.displayName">{{ printer.displayName }}</option>
              </select>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-6">
              <div>Label-Drucker 10x15cm</div>
              <small>Paketlabel</small>
            </div>
            <div class="col-6">
              <select class="w-100" v-model="settings.printers.labelBig">
                <option v-for="(printer, index) in printerList" :key="index" :value="printer.displayName">{{ printer.displayName }}</option>
              </select>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-6">
              <div>Label-Drucker 5x10cm</div>
              <small>Brieflabel (Mailoptimizer)</small>
            </div>
            <div class="col-6">
              <select class="w-100" v-model="settings.printers.labelSmall">
                <option v-for="(printer, index) in printerList" :key="index" :value="printer.displayName">{{ printer.displayName }}</option>
              </select>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-6">
              <div>Barcode-Drucker</div>
              <small>Barcodes, Regal-Label</small>
            </div>
            <div class="col-6">
              <select class="w-100" v-model="settings.printers.barcodes">
                <option v-for="(printer, index) in printerList" :key="index" :value="printer.displayName">{{ printer.displayName }}</option>
              </select>
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-12">
              <button @click="saveSettings">Speichern</button>
            </div>
          </div>
        </article>
        <article role="tabpanel" :class="{ 'd-none': activeTab !== 'paths' }">
          <div class="row mt-3">
            <div class="col-6">
              <div>Download Pfad</div>
              <small>Pfad, in dem heruntergeladene Dateien gespeichert werden</small>
            </div>
            <div class="col-6">
              <input @click="selectDownloadPath" class="w-100" type="text" v-model="settings.paths.download">
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-6">
              <div>Mailoptimizer Pfad</div>
              <small>Im Netzwerk freigegebener Ordner, auf die Kundennummer endend</small>
            </div>
            <div class="col-6">
              <input :disabled="settings.mailoptimizer" @click="selectMoPath" class="w-100" type="text" v-model="settings.paths.mo">
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-12">
              <button @click="saveSettings">Speichern</button>
            </div>
          </div>
        </article>
        <article role="tabpanel" :class="{ 'd-none': activeTab !== 'settings' }">
          <div class="row mt-3">
            <div class="col-6">
              Token
            </div>
            <div class="col-6">
              <input type="text" class="w-100" v-model="settings.token">
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-6">
              Ably-Schlüssel
            </div>
            <div class="col-6">
              <input type="text" class="w-100" v-model="settings.ablyKey">
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-6">
              Mailoptimizer
            </div>
            <div class="col-6">
              <input type="checkbox" id="mailoptimizer-checkbox" @change="toggleMailoptimizer" v-model="settings.mailoptimizer" :value="true">
              <label for="mailoptimizer-checkbox">Aktiv</label>
            </div>
          </div>
<!--          <div class="row mt-3">-->
<!--            <div class="col-6">-->
<!--              <div>Polling-Intervall</div>-->
<!--              <small>Bei langsamen/alten PC's empfiehlt sich ein höherer Polling-Interval</small>-->
<!--            </div>-->
<!--            <div class="col-6">-->
<!--              <select class="w-100" v-model="settings.interval">-->
<!--                <option :value="1000">1 Sekunde</option>-->
<!--                <option :value="3000">3 Sekunden</option>-->
<!--                <option :value="5000">5 Sekunden</option>-->
<!--                <option :value="10000">10 Sekunden</option>-->
<!--              </select>-->
<!--            </div>-->
<!--          </div>-->
          <div class="row mt-3">
            <div class="col-6">
              Update
            </div>
            <div class="col-6">
              <button @click="checkForUpdate">Auf Update prüfen</button>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-6">
              Version
            </div>
            <div class="col-6">
              {{ version }}
            </div>
          </div>
          <div class="row mt-4">
            <div class="col-12">
              <button @click="saveSettings">Speichern</button>
            </div>
          </div>
        </article>
        <article role="tabpanel" :class="{ 'd-none': activeTab !== 'logs' }">
          <div class="mt-3 field-row-stacked">
            <div>Log</div>
            <textarea v-model="log" class="border" id="logs" rows="25"></textarea>
          </div>
        </article>
      </section>
    </div>
    <div class="block" v-if="blocked">
      <img src="./assets/images/loading-blocks.gif">
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
// import Ably from 'ably'

export default {
  data() {
    return {
      log: '',
      version: '0.0.1',
      activeTab: 'settings',
      blocked: false,
      settings: {
        token: '',
        ablyKey: '',
        mailoptimizer: false,
        printers: {
          a4: null,
          labelBig: null,
          labelSmall: null,
          barcodes: null
        },
        paths: {
          mo: '',
          download: ''
        },
        interval: 1000
      },
      printerList: [],
      ablyConnected: false
    }
  },
  methods: {
    toggleMailoptimizer() {
      if(this.settings.mailoptimizer === true) {
        window.ipc.send('check-mo-activation')
      }
    },
    selectMoPath() {
      window.ipc.send('select-mo-path')
    },
    selectDownloadPath() {
      window.ipc.send('select-download-path')
    },
    checkForUpdate() {
      this.appendToLog('Prüfe auf verfügbare Updates')
      window.ipc.send('check-for-update')
    },
    saveSettings() {
      window.ipc.send('save-settings', JSON.stringify(this.settings))
      alert('Einstellungen gespeichert')
    },
    appendToLog(message) {
      this.log += new Date().toLocaleString()+': '+message + "\n"
    }
  },
  mounted() {
    window.ipc.send('get-version')
    window.ipc.send('get-printer-list')
    window.ipc.send('load-settings')

    // this.ably = new Ably.Realtime(this.settings.ablyKey)

    window.ipc.on('get-version', (version) => {
      this.version = version
    })

    window.ipc.on('load-settings', (settings) => {
      this.settings = JSON.parse(settings)
    })

    window.ipc.on('save-settings', () => {
      window.ipc.send('wms-polling')
    })

    window.ipc.on('select-mo-path', (path) => {
      this.settings.paths.mo = path
    })

    window.ipc.on('select-download-path', (path) => {
      this.settings.paths.download = path
    })

    window.ipc.on('get-printer-list', (printers) => {
      this.printerList = printers
    })

    window.ipc.on('check-for-update', (update) => {
      this.appendToLog(update ? 'Update verfügbar' : 'Kein Update verfügbar')
    })

    window.ipc.on('append-to-log', (log) => {
      this.appendToLog(log)
    })

    window.ipc.on('update-downloaded', () => {
      if(confirm('Es ist ein neues Update verfügbar. Jetzt App neu starten?')) {
        window.ipc.send('restart-app')
      }
    })

    window.ipc.on('mo-activation-checked', (response) => {
      if(response === false) {
        alert('Mailoptimizer konnte nicht aktiviert werden. Bitte Pfade und Drucker überprüfen')
      }
      this.settings.mailoptimizer = response
    })

    setInterval(() => {
      if(this.settings.mailoptimizer) {
        window.ipc.send('mailoptimizer-polling')
      }
    }, 3000)

    window.ipc.send('wms-polling')
  }
}
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css';
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css';
@import 'https://unpkg.com/xp.css';
/*@import 'https://wms.acut-services.de/css/app.css';*/
@import './assets/css/style.css';
</style>
