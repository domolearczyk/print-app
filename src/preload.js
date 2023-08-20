const { contextBridge, ipcRenderer } = require('electron');

const validChannels = [
    'append-to-log',
    'get-printer-list',
    'get-version',
    'select-mo-path',
    'select-download-path',
    'check-for-update',
    'mailoptimizer-polling',
    'wms-start-polling',
    'wms-restart-polling',
    'wms-close-polling',
    'set-ably-connection',
    'save-settings',
    'load-settings',
    'restart-app',
    'update-downloaded',
    'check-mo-activation',
    'mo-activation-checked'
];

contextBridge.exposeInMainWorld(
    'ipc', {
        send: (channel, data) => {
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        on: (channel, func) => {
            if (validChannels.includes(channel)) {
                // Strip event as it includes `sender` and is a security risk
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
    },
);