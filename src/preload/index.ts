import { contextBridge, ipcRenderer } from 'electron'
import type { Trade, TradeSummary, ApiResponse } from '../shared/types'

// Define the API that will be exposed to the renderer process
const api = {
  // System info
  app: {
    getVersion: () => process.versions.electron,
    getInfo: (): Promise<ApiResponse<{
      version: string
      platform: string
      dataDirectory: string
    }>> => ipcRenderer.invoke('app:getInfo'),
  },

  // File system operations
  file: {
    ensureDataDirectory: (): Promise<ApiResponse<void>> => 
      ipcRenderer.invoke('file:ensureDataDirectory'),
  },

  // Trade operations
  trade: {
    save: (trade: Trade): Promise<ApiResponse<string>> => 
      ipcRenderer.invoke('trade:save', trade),
    
    load: (id: string): Promise<ApiResponse<Trade>> => 
      ipcRenderer.invoke('trade:load', id),
    
    list: (): Promise<ApiResponse<TradeSummary[]>> => 
      ipcRenderer.invoke('trade:list'),
    
    delete: (id: string): Promise<ApiResponse<string>> => 
      ipcRenderer.invoke('trade:delete', id),
  },
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('api', api)

// Type definitions for the exposed API
export type ElectronAPI = typeof api

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    api: ElectronAPI
  }
}