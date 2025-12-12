# Browser Extension

Chrome/Firefox browser extension for NaturalWeb.

## Development

```bash
npm install
npm run dev
```

## Loading the Extension

### Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` from the `dist` folder

## Building for Production

```bash
npm run build
```
