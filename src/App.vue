<template>
  <div>
    <div id="main">
      <section class="tabs">
        <menu role="tablist" aria-label="Sample Tabs">
          <button role="tab" :aria-selected="activeTab === 'spots'" aria-controls="spots" @click="activeTab = 'spots'">Station</button>
          <button role="tab" :aria-selected="activeTab === 'printers'" aria-controls="printers" @click="activeTab = 'printers'">Drucker</button>
          <button role="tab" :aria-selected="activeTab === 'paths'" aria-controls="paths" @click="activeTab = 'paths'">Pfade</button>
          <button role="tab" :aria-selected="activeTab === 'settings'" aria-controls="settings" @click="activeTab = 'settings'">Einstellungen</button>
          <button disabled role="tab" :aria-selected="activeTab === 'logs'" aria-controls="logs" @click="activeTab = 'logs'">Log</button>
        </menu>
        <article role="tabpanel" :class="{ 'd-none': activeTab !== 'spots' }">
          <div class="row mt-3">
            <div class="col-6">
              <div>Station</div>
            </div>
            <div class="col-6">
              <select class="w-100" v-model="spot">
                <option v-for="(spot, index) in spots" :key="index" :value="spot.id">{{ spot.id }}</option>
              </select>
            </div>
          </div>
        </article>
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
              <input @click="selectMoPath" class="w-100" type="text" v-model="settings.paths.mo">
            </div>
          </div>
        </article>
        <article role="tabpanel" :class="{ 'd-none': activeTab !== 'settings' }">
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
export default {
  data() {
    return {
      log: '',
      spot: null,
      version: '0.0.1',
      activeTab: 'spots',
      blocked: false,
      settings: {
        printers: {
          a4: null,
          labelBig: null,
          labelSmall: null
        },
        paths: {
          mo: null,
          download: null
        }
      },
      printerList: [],
      spots: [{
        id: 1
      }, {
        id: 2
      }]
    }
  },
  methods: {
    // getPrinters() {
    //   this.blocked = true
    //   axios.get('https://wms.acut-services.de').then(response => {
    //     console.log(response)
    //   })
    //       .finally(() => {
    //         this.blocked = false
    //       })
    // }
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
    appendToLog(message) {
      this.log += new Date().toLocaleString()+': '+message + "\n"
    }
  },
  mounted() {
    window.ipc.send('get-version')
    window.ipc.send('get-printer-list')

    window.ipc.on('get-version', (version) => {
      this.version = version
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

    setInterval(() => {
      if(this.spot !== null) {
        this.appendToLog('Suche nach neuen Labels')
      }
    }, 2000)
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
