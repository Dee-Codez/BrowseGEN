/**
 * Example script demonstrating Natural Language Website Interaction
 * 
 * Run this with: npx ts-node examples/test-nlp-service.ts
 */

interface CommandResult {
  interpretation: any;
  result: any;
  success: boolean;
  sessionId?: string;
}

async function executeCommand(
  command: string,
  sessionId?: string,
  useContext = false
): Promise<CommandResult> {
  const response = await fetch('http://localhost:3001/api/commands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, sessionId, useContext }),
  });

  return response.json();
}

async function createSession(): Promise<string> {
  const response = await fetch('http://localhost:3001/api/commands/session', {
    method: 'POST',
  });
  const data = await response.json();
  return data.sessionId;
}

async function closeSession(sessionId: string): Promise<void> {
  await fetch(`http://localhost:3001/api/commands/session/${sessionId}`, {
    method: 'DELETE',
  });
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Example 1: Simple Navigation
async function example1() {
  console.log('\n=== Example 1: Simple Navigation ===');
  
  const result = await executeCommand('go to example.com');
  console.log('Command:', result.interpretation.action);
  console.log('Success:', result.success);
  console.log('URL:', result.result?.url);
}

// Example 2: Search on Google
async function example2() {
  console.log('\n=== Example 2: Google Search ===');
  
  const sessionId = await createSession();
  console.log('Created session:', sessionId);
  
  try {
    // Navigate to Google
    let result = await executeCommand('go to google.com', sessionId);
    console.log('Navigated to Google:', result.success);
    await wait(2000);
    
    // Search for something
    result = await executeCommand(
      'search for artificial intelligence',
      sessionId,
      true // Use context for better element detection
    );
    console.log('Search executed:', result.success);
    await wait(3000);
    
    // Take screenshot
    result = await executeCommand('take a screenshot', sessionId);
    console.log('Screenshot saved:', result.result?.filename);
  } finally {
    await closeSession(sessionId);
    console.log('Session closed');
  }
}

// Example 3: Multi-Step Workflow
async function example3() {
  console.log('\n=== Example 3: Multi-Step Workflow ===');
  
  const result = await executeCommand(
    'go to github.com, search for playwright, and click the first result'
  );
  
  console.log('Interpretation:', result.interpretation);
  console.log('Steps executed:', result.interpretation.steps?.length || 0);
  console.log('Success:', result.success);
}

// Example 4: Form Interaction
async function example4() {
  console.log('\n=== Example 4: Form Interaction ===');
  
  const sessionId = await createSession();
  
  try {
    // Navigate to a form page
    await executeCommand('go to https://www.w3schools.com/html/html_forms.asp', sessionId);
    await wait(2000);
    
    // Fill in form fields
    const result = await executeCommand(
      'fill the first name field with John',
      sessionId,
      true
    );
    
    console.log('Form filled:', result.success);
    console.log('Target:', result.interpretation.target);
    console.log('Value:', result.interpretation.value);
  } finally {
    await closeSession(sessionId);
  }
}

// Example 5: Data Extraction
async function example5() {
  console.log('\n=== Example 5: Data Extraction ===');
  
  const sessionId = await createSession();
  
  try {
    // Navigate to a page
    await executeCommand('go to news.ycombinator.com', sessionId);
    await wait(2000);
    
    // Extract data
    const result = await executeCommand(
      'extract all article titles',
      sessionId,
      true
    );
    
    console.log('Extracted items:', result.result?.count || 0);
    console.log('Sample data:', result.result?.data?.slice(0, 3));
  } finally {
    await closeSession(sessionId);
  }
}

// Example 6: Session-Based Interaction
async function example6() {
  console.log('\n=== Example 6: Session-Based Interaction ===');
  
  const sessionId = await createSession();
  
  try {
    const commands = [
      'go to reddit.com',
      'wait 2 seconds',
      'scroll down',
      'take a screenshot',
      'scroll to top',
    ];
    
    for (const command of commands) {
      console.log(`Executing: ${command}`);
      const result = await executeCommand(command, sessionId, true);
      console.log(`  Result: ${result.success}`);
      await wait(1000);
    }
  } finally {
    await closeSession(sessionId);
  }
}

// Example 7: Error Handling
async function example7() {
  console.log('\n=== Example 7: Error Handling ===');
  
  try {
    const result = await executeCommand('click the nonexistent button');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error caught:', (error as Error).message);
  }
}

// Example 8: Complex Natural Language
async function example8() {
  console.log('\n=== Example 8: Complex Natural Language ===');
  
  const complexCommands = [
    'navigate to amazon.com',
    'find the search box and type wireless headphones',
    'press enter',
    'wait for 3 seconds',
    'click on the first product',
  ];
  
  const sessionId = await createSession();
  
  try {
    for (const command of complexCommands) {
      console.log(`\nCommand: "${command}"`);
      const result = await executeCommand(command, sessionId, true);
      console.log('  Action:', result.interpretation.action);
      console.log('  Confidence:', result.interpretation.confidence);
      console.log('  Success:', result.success);
      await wait(2000);
    }
  } finally {
    await closeSession(sessionId);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('Starting Natural Language Website Interaction Examples');
  console.log('Make sure the API server is running on http://localhost:3001\n');
  
  try {
    await example1();
    await wait(2000);
    
    await example2();
    await wait(2000);
    
    await example3();
    await wait(2000);
    
    // Uncomment to run more examples
    // await example4();
    // await example5();
    // await example6();
    // await example7();
    // await example8();
    
    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    console.error('Make sure:');
    console.error('1. API server is running (npm run dev)');
    console.error('2. OPENAI_API_KEY is set in .env');
    console.error('3. Playwright is installed (npx playwright install)');
  }
}

// Run if executed directly
// @ts-ignore - CommonJS module check
if (typeof require !== 'undefined' && require.main === module) {
  runAllExamples();
}

export {
  executeCommand,
  createSession,
  closeSession,
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  example7,
  example8,
};
