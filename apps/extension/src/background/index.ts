/// <reference types="chrome" />

// WebGen Background Service v2.0
// Handles API communication to avoid CORS in content script

async function getTabUrl(tabId: number): Promise<string> {
    try {
        const tab = await chrome.tabs.get(tabId);
        return tab.url || '';
    } catch {
        return '';
    }
}

async function storeMetric(metric: any) {
    const data = await chrome.storage.local.get('metrics');
    const metrics = data.metrics || [];
    metrics.push(metric);
    await chrome.storage.local.set({ metrics });
}

// Handle messages from React app (ChatInterface)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'EXECUTE_COMMAND') {
        handleCommand(request.command, sender.tab?.id)
            .then(sendResponse)
            .catch(err => sendResponse({ error: err.message }));
        return true; // Keep channel open
    }
    return true;
});

async function handleCommand(command: string, tabId?: number) {
    try {
        // Send command to API
        const response = await fetch('http://localhost:3001/api/commands', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                command,
                url: tabId ? await getTabUrl(tabId) : '',
            }),
        });

        const result = await response.json();

        // Store metrics
        await storeMetric({
            command,
            timestamp: new Date().toISOString(),
            success: true,
        });

        return result;
    } catch (error) {
        await storeMetric({
            command,
            timestamp: new Date().toISOString(),
            success: false,
        });
        throw error;
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log('WebGen Extension installed');
    console.log('WebGen Background Service v2.0 LOADED');
});
