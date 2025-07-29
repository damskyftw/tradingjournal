Prompt 8.1: Screenshot Management
Implement screenshot functionality:

1. Create ImageUpload component:
   - Drag and drop support
   - Paste from clipboard
   - Multiple file selection
   - Image preview gallery
2. Store images in data/screenshots/
3. Generate thumbnails for performance
4. Add image viewer with zoom
5. Delete unused images when trade deleted

Handle large images gracefully. Commit: "feat: add screenshot management"
Prompt 8.2: Backup and Restore
Add data safety features:

1. Create Backup service that:
   - Zips entire data directory
   - Names with timestamp
   - Stores in backups folder
2. Add Settings page with:
   - Manual backup button
   - Auto-backup toggle
   - Backup location selector
   - Restore from backup
3. Validate backup integrity before restore
4. Show progress during backup/restore
5. Add backup reminder notification

Test with large datasets. Commit: "feat: add backup and restore"
Prompt 8.3: Final Polish
Let's polish the app for production:

1. Add keyboard shortcuts:
   - Cmd/Ctrl+N: New trade
   - Cmd/Ctrl+F: Focus search
   - Escape: Close dialogs
2. Improve error handling:
   - User-friendly error messages
   - Retry mechanisms
   - Error boundaries
3. Add loading states everywhere
4. Implement smooth transitions
5. Optimize performance:
   - React.memo where needed
   - Virtual scrolling for long lists
   - Image lazy loading
6. Add app icon and metadata

Test everything thoroughly. Commit: "feat: final polish and optimizations"