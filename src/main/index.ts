import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { setupIpcHandlers } from './ipc/handlers';

const isDev = process.env.NODE_ENV === 'development';

class MainWindow {
  private window: BrowserWindow | null = null;

  constructor() {
    this.createWindow();
  }

  private createWindow(): void {
    this.window = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/index.js'),
      },
      titleBarStyle: 'default',
      show: false,
    });

    // Load the app
    if (isDev) {
      this.window.loadURL('http://localhost:5173');
      this.window.webContents.openDevTools();
    } else {
      this.window.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.window.once('ready-to-show', () => {
      this.window?.show();
    });

    // Handle external links
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Handle window closed
    this.window.on('closed', () => {
      this.window = null;
    });
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public close(): void {
    this.window?.close();
  }
}

let mainWindow: MainWindow | null = null;

// App event handlers
app.whenReady().then(() => {
  // Setup IPC handlers for secure communication
  setupIpcHandlers();
  
  mainWindow = new MainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = new MainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent navigation to external websites
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && !parsedUrl.protocol.startsWith('file:')) {
      navigationEvent.preventDefault();
    }
  });
});

export { mainWindow };