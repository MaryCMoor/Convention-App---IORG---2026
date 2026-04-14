# NJ Rainbow Convention 2026 PWA

The Greatest Show on Earth - Progressive Web App for the NJ Rainbow Convention 2026

## Features
- 📅 Master Schedule with favorites
- 🌈 Meet NJ Rainbow members
- 🎤 Featured speakers
- 🔔 Real-time notifications
- ✓ Packing checklist
- 📝 Personal notes
- 💬 Messages
- 📸 Photo gallery
- ⚙️ Admin dashboard
- 📱 Works offline (PWA)

## Setup for GitHub Pages

1. Create a new repository on GitHub
2. Upload all files to your repository
3. Go to Settings → Pages
4. Select "main" branch and "/" (root) folder
5. Save and wait for deployment

## Google Sheets Setup

Your Google Sheet should have these tabs with columns:

### Schedule Sheet
- id, title, time, timeEnd, day, location, description, type, speaker

### Members Sheet
- name, station, assembly, photo, bio

### Speakers Sheet
- name, title, photo, bio, event

### Notifications Sheet
- id, title, message, date, time

### Checklist Sheet
- id, text, category

### Gallery Sheet
- id, url, caption

## Local Development

1. Open `index.html` in your browser
2. Or use a local server: `python -m http.server 8000`

## License
Created for NJ Rainbow Convention 2026
