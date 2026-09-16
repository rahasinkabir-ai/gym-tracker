import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static assets from project root
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'IronPulse' });
});

// Applet config helper (if firebase-applet-config.json exists)
app.get('/api/config', (req, res) => {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return res.json(content);
    } catch (e) {
      console.warn('Failed reading firebase-applet-config.json', e);
    }
  }
  res.json({});
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`IronPulse running at http://0.0.0.0:${PORT}`);
});
