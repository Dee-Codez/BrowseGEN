// Content script injected into web pages
console.log('NaturalWeb content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'HIGHLIGHT_ELEMENT') {
    highlightElement(request.selector);
    sendResponse({ success: true });
  } else if (request.type === 'GET_PAGE_INFO') {
    sendResponse(getPageInfo());
  }
  return true;
});

function highlightElement(selector: string) {
  const element = document.querySelector(selector);
  if (element instanceof HTMLElement) {
    element.style.outline = '3px solid #6366f1';
    element.style.outlineOffset = '2px';
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 2000);
  }
}

function getPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
    buttons: Array.from(document.querySelectorAll('button')).length,
    inputs: Array.from(document.querySelectorAll('input')).length,
    links: Array.from(document.querySelectorAll('a')).length,
  };
}

// Add a floating button for quick access
function addFloatingButton() {
  const button = document.createElement('button');
  button.id = 'naturalweb-floating-btn';
  button.innerHTML = '🌐';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    z-index: 10000;
    transition: transform 0.2s;
  `;
  button.onmouseenter = () => (button.style.transform = 'scale(1.1)');
  button.onmouseleave = () => (button.style.transform = 'scale(1)');
  button.onclick = () => chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  document.body.appendChild(button);
}

// Add floating button after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addFloatingButton);
} else {
  addFloatingButton();
}
