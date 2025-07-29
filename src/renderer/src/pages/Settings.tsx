import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  HardDrive, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';

interface BackupMetadata {
  id: string;
  timestamp: string;
  size: number;
  fileCount: number;
  version: string;
}

interface BackupProgress {
  phase: 'scanning' | 'compressing' | 'finalizing' | 'complete';
  filesProcessed: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes: number;
  currentFile?: string;
  percentage: number;
}

export function Settings() {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupLocation, setBackupLocation] = useState('');
  const [backupsSize, setBackupsSize] = useState({ totalSize: 0, backupCount: 0 });

  useEffect(() => {
    loadBackups();
    loadSettings();
    loadBackupsSize();
  }, []);

  const loadBackups = async () => {
    try {
      const result = await window.api.listBackups();
      if (result.success && result.data) {
        setBackups(result.data);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const loadSettings = () => {
    // Load settings from localStorage or API
    const autoBackup = localStorage.getItem('autoBackupEnabled') === 'true';
    const location = localStorage.getItem('backupLocation') || '';
    setAutoBackupEnabled(autoBackup);
    setBackupLocation(location);
  };

  const loadBackupsSize = async () => {
    try {
      const result = await window.api.getBackupsSize();
      if (result.success && result.data) {
        setBackupsSize(result.data);
      }
    } catch (error) {
      console.error('Failed to load backups size:', error);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    setBackupProgress({
      phase: 'scanning',
      filesProcessed: 0,
      totalFiles: 0,
      bytesProcessed: 0,
      totalBytes: 0,
      percentage: 0
    });

    try {
      // Set up progress callback
      const progressCallback = (progress: BackupProgress) => {
        setBackupProgress(progress);
      };

      const result = await window.api.createBackup(progressCallback);
      
      if (result.success) {
        await loadBackups();
        await loadBackupsSize();
        setBackupProgress(null);
      } else {
        console.error('Backup failed:', result.error);
        // Show error toast
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('This will replace all current data with the backup. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    setBackupProgress({
      phase: 'scanning',
      filesProcessed: 0,
      totalFiles: 0,
      bytesProcessed: 0,
      totalBytes: 0,
      percentage: 0
    });

    try {
      const progressCallback = (progress: BackupProgress) => {
        setBackupProgress(progress);
      };

      const result = await window.api.restoreBackup(backupId, progressCallback);
      
      if (result.success) {
        setBackupProgress(null);
        // Show success message and possibly restart app
        alert('Backup restored successfully. Please restart the application.');
      } else {
        console.error('Restore failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await window.api.deleteBackup(backupId);
      if (result.success) {
        await loadBackups();
        await loadBackupsSize();
      } else {
        console.error('Delete failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
    }
  };

  const handleValidateBackup = async (backupId: string) => {
    try {
      const result = await window.api.validateBackup(backupId);
      if (result.success && result.data) {
        if (result.data.isValid) {
          alert('Backup is valid and can be restored.');
        } else {
          alert(`Backup validation failed:\n${result.data.errors.join('\n')}`);
        }
      }
    } catch (error) {
      console.error('Failed to validate backup:', error);
    }
  };

  const handleSelectBackupLocation = async () => {
    try {
      const result = await window.api.selectDirectory();
      if (result.success && result.data) {
        setBackupLocation(result.data.path);
        localStorage.setItem('backupLocation', result.data.path);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getProgressPhaseText = (phase: string): string => {
    switch (phase) {
      case 'scanning': return 'Scanning files...';
      case 'compressing': return 'Creating archive...';
      case 'finalizing': return 'Finalizing backup...';
      case 'complete': return 'Complete!';
      default: return 'Processing...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-slate-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage your trading journal preferences and data</p>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
          <CardDescription>
            Keep your trading data safe with automated backups and easy restore options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backup Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{backupsSize.backupCount}</div>
              <div className="text-sm text-slate-600">Total Backups</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{formatFileSize(backupsSize.totalSize)}</div>
              <div className="text-sm text-slate-600">Storage Used</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">
                {backups.length > 0 ? 'Latest' : 'None'}
              </div>
              <div className="text-sm text-slate-600">
                {backups.length > 0 ? formatDate(backups[0].timestamp) : 'No backups yet'}
              </div>
            </div>
          </div>

          {/* Backup Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Automatic Backups</Label>
                <p className="text-sm text-slate-600">Automatically create backups when the app starts</p>
              </div>
              <Switch
                checked={autoBackupEnabled}
                onCheckedChange={(checked) => {
                  setAutoBackupEnabled(checked);
                  localStorage.setItem('autoBackupEnabled', checked.toString());
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Backup Location</Label>
              <div className="flex gap-2">
                <Input
                  value={backupLocation}
                  placeholder="Default backup location"
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleSelectBackupLocation}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateBackup} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Create Backup
              </Button>
              <Button variant="outline" disabled={isLoading}>
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
            </div>
          </div>

          {/* Progress Display */}
          {backupProgress && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">
                      {getProgressPhaseText(backupProgress.phase)}
                    </span>
                    <span className="text-sm text-blue-700">
                      {backupProgress.percentage}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${backupProgress.percentage}%` }}
                    />
                  </div>

                  {backupProgress.currentFile && (
                    <div className="text-xs text-blue-700 truncate">
                      Processing: {backupProgress.currentFile}
                    </div>
                  )}

                  <div className="text-xs text-blue-700">
                    {backupProgress.totalFiles > 0 && (
                      <>
                        Files: {backupProgress.filesProcessed}/{backupProgress.totalFiles} • 
                        Size: {formatFileSize(backupProgress.bytesProcessed)}/{formatFileSize(backupProgress.totalBytes)}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backup List */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Available Backups</Label>
            {backups.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <HardDrive className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No backups available</p>
                <p className="text-sm">Create your first backup to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{formatDate(backup.timestamp)}</div>
                      <div className="text-sm text-slate-600">
                        {formatFileSize(backup.size)} • {backup.fileCount} files • v{backup.version}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleValidateBackup(backup.id)}
                        disabled={isLoading}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBackup(backup.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Clean up and optimize your trading journal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 mt-0.5 text-red-500" />
                <div className="text-left">
                  <div className="font-medium">Clean Unused Screenshots</div>
                  <div className="text-sm text-slate-600">Remove screenshots not linked to any trades</div>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Archive Old Data</div>
                  <div className="text-sm text-slate-600">Move trades older than 2 years to archive</div>
                </div>
              </div>
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Data Safety Reminder</div>
                <div className="text-sm text-yellow-700 mt-1">
                  Always create a backup before performing data cleanup operations. 
                  These actions cannot be undone.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure your trading journal preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-slate-600">Use dark theme for the interface</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Startup Reminders</Label>
                  <p className="text-sm text-slate-600">Show trading reminders on app start</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Default Trade Size</Label>
                <Input type="number" placeholder="1000" className="mt-1" />
              </div>
              
              <div>
                <Label>Currency</Label>
                <select className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}