// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('NaturalWeb Extension installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXECUTE_COMMAND') {
    handleCommand(request.command, sender.tab?.id)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
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

    // Execute the action on the page if needed
    if (tabId && result.actions) {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: executeActions,
        args: [result.actions],
      });
    }

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

async function getTabUrl(tabId: number): Promise<string> {
  const tab = await chrome.tabs.get(tabId);
  return tab.url || '';
}

function executeActions(actions: any[]) {
  // This function runs in the page context
  actions.forEach((action) => {
    if (action.type === 'click') {
      const element = document.querySelector(action.selector);
      if (element instanceof HTMLElement) {
        element.click();
      }
    } else if (action.type === 'fill') {
      const element = document.querySelector(action.selector);
      if (element instanceof HTMLInputElement) {
        element.value = action.value;
      }
    }
  });
}

async function storeMetric(metric: any) {
  const { metrics = [] } = await chrome.storage.local.get('metrics');
  metrics.push(metric);
  await chrome.storage.local.set({ metrics: metrics.slice(-1000) }); // Keep last 1000
}
