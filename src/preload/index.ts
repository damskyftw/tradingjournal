import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer process
const api = {
  // System info
  getVersion: () => process.versions.electron,
  
  // Future IPC methods will be added here
  // Example structure for when we implement the data layer:
  // saveTrade: (trade: Trade) => ipcRenderer.invoke('trade:save', trade),
  // loadTrades: () => ipcRenderer.invoke('trade:list'),
  // etc.
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('api', api);

// Type definitions for the exposed API
export type ElectronAPI = typeof api;

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    api: ElectronAPI;
  }
}