import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  calc: async (request: any) => {
    console.log('Preload: calc called', request)
    try {
      const result = await ipcRenderer.invoke('calc:run', request)
      console.log('Preload: calc result', result)
      return result
    } catch (error) {
      console.error('Preload: calc error', error)
      throw error
    }
  }
})

console.log('Preload script loaded successfully')