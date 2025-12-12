export async function executeActions(actions: any[]) {
    console.log('WebGen: Executing actions client-side', actions);

    for (const action of actions) {
        console.log('WebGen: Running action', action);

        if (action.type === 'click') {
            const element = document.querySelector(action.selector) as HTMLElement;
            if (element) {
                // Highlight before click
                element.style.outline = '2px solid red';
                await new Promise(r => setTimeout(r, 200));
                element.click();
                element.style.outline = '';
            } else {
                console.warn('Click target missing:', action.selector);
            }
        } else if (action.type === 'fill') {
            let element = document.querySelector(action.selector) as HTMLInputElement | HTMLTextAreaElement;

            // Smart Amazon fallback
            if (!element && (action.selector === 'input' || action.selector.includes('search'))) {
                element = (document.querySelector('input[type="search"]') ||
                    document.querySelector('#twotabsearchtextbox') || // Amazon ID
                    document.querySelector('[name="field-keywords"]')) as HTMLInputElement;
            }

            if (element) {
                element.style.outline = '2px solid blue';
                await new Promise(r => setTimeout(r, 200));

                element.focus();
                element.value = action.value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));

                // Submit if it looks like a search
                element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));

                // Try finding the search button for Amazon specifically
                if (window.location.hostname.includes('amazon')) {
                    const searchBtn = document.querySelector('#nav-search-submit-button') as HTMLElement;
                    if (searchBtn) searchBtn.click();
                }

                element.style.outline = '';
            } else {
                console.warn('Fill target missing:', action.selector);
            }
        } else if (action.type === 'navigate') {
            window.location.href = action.url;
        } else if (action.type === 'scroll') {
            // Scroll by one viewport height (approx) instead of going to bottom
            const amount = window.innerHeight * 0.8;
            const direction = action.direction === 'down' ? 1 : -1;

            window.scrollBy({
                top: amount * direction,
                behavior: 'smooth'
            });
        }

        await new Promise(r => setTimeout(r, 800)); // Pace the actions
    }
}
