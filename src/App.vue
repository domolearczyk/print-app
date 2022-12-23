<template>
  <div>
    <div class="row">
      <div class="col-6">
        hier ist die neue version
      </div>
      <div class="col-6">
        <button @click="getPrinters">Zeige Drucker</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      printerList: []
    }
  },
  methods: {
    getPrinters() {
      window.ipc.send('get-printer-list')
    }
  },
  mounted() {
    window.ipc.on('get-printer-list', (printers) => {
      console.log(printers)
      this.printerList = printers
    })
  }
}
</script>

<style>
@import 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css';
@import 'https://unpkg.com/xp.css';
@import 'https://wms.acut-services.de/css/app.css';

body {
  margin:0;
  padding:20px;
}
</style>
