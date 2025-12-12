import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';
import '../styles/main.css';

console.log('WebGen content script loaded');

// Create mount point
const MOUNT_ID = 'webgen-extension-root';
if (!document.getElementById(MOUNT_ID)) {
    const mountPoint = document.createElement('div');
    mountPoint.id = MOUNT_ID;

    // Ensure the host element doesn't affect page layout or cause scrolling
    Object.assign(mountPoint.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '0',
        height: '0',
        zIndex: '2147483647', // Max z-index
        pointerEvents: 'none' // Let clicks pass through by default
    });

    // Use Shadow DOM to isolate styles
    const shadowRoot = mountPoint.attachShadow({ mode: 'open' });

    // Inject CSS into Shadow DOM
    const mainStyle = document.createElement('link');
    mainStyle.rel = 'stylesheet';
    mainStyle.href = chrome.runtime.getURL('assets/style.css');
    shadowRoot.appendChild(mainStyle);

    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    shadowRoot.appendChild(rootDiv);

    document.body.appendChild(mountPoint);

    createRoot(rootDiv).render(
        <React.Fragment>
            <App />
        </React.Fragment>
    );
}

// Minimal message listener for basic events, heavy lifting in ChatInterface now
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
    if (request.type === 'TOGGLE_OVERLAY') {
        window.dispatchEvent(new CustomEvent('WEBGEN_TOGGLE_OVERLAY'));
    }
    return true;
});
