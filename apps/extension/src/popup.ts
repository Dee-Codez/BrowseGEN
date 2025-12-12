document.addEventListener('DOMContentLoaded', () => {
  const commandInput = document.getElementById('commandInput') as HTMLTextAreaElement;
  const executeBtn = document.getElementById('executeBtn') as HTMLButtonElement;
  const btnText = document.getElementById('btnText') as HTMLSpanElement;
  const btnLoader = document.getElementById('btnLoader') as HTMLSpanElement;
  const resultDiv = document.getElementById('result') as HTMLDivElement;
  const dashboardLink = document.getElementById('dashboardLink') as HTMLAnchorElement;

  executeBtn.addEventListener('click', async () => {
    const command = commandInput.value.trim();
    if (!command) return;

    // Show loading state
    executeBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    resultDiv.style.display = 'none';

    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        type: 'EXECUTE_COMMAND',
        command,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Show success
      resultDiv.className = 'result success';
      resultDiv.textContent = 'Command executed successfully!';
      resultDiv.style.display = 'block';

      // Clear input after success
      setTimeout(() => {
        commandInput.value = '';
      }, 1000);
    } catch (error) {
      // Show error
      resultDiv.className = 'result error';
      resultDiv.textContent = `Error: ${(error as Error).message}`;
      resultDiv.style.display = 'block';
    } finally {
      // Reset button state
      executeBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  });

  // Allow Enter to submit (with Shift for new line)
  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeBtn.click();
    }
  });

  dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});
