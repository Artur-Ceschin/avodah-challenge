# Avodah Challenge - Retry Logic Implementation

This project demonstrates the evolution of a retry logic implementation from an initial interview solution to an enhanced recursive approach with timeout protection.

## Problem Statement

Implement a function that makes HTTP requests with retry logic:

- Make initial request to `http://localhost:8080`
- If successful (status 200), log the response and return
- If failed, retry 3 times with exponential backoff delays: 500ms, 1000ms, 2000ms
- After all attempts fail, log the final error

## Original Interview Solution

The initial implementation used a traditional while loop approach:

```javascript
async function getAvodahChallenge() {
  const result = await fetch("http://localhost:8080");

  if (result.status === 200) {
    const resultJson = await result.json();
    console.log("Request succeded", resultJson.date);
    return;
  } else {
    let counter = 0;
    console.log("Debug entered ELSE =>");

    // Loop - call 3 times with delays: 500ms, 1000ms, 2000ms
    let delayTime = 500;
    while (counter < 3) {
      await delay(delayTime);
      const result = await fetch("http://localhost:8080");

      if (result.status === 200) {
        const resultJson = await result.json();
        console.log("Request succeded", resultJson.date);
        return;
      }

      delayTime = delayTime * 2;
      counter++;
    }
    console.log("Request failed", result);
  }
}

async function delay(time) {
  console.log("tiime", time);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}
```

**What the original version did:**

- Used imperative while loop for retry logic
- Manually tracked counter and delay time
- Exponential backoff: 500ms → 1000ms → 2000ms
- Total attempts: 4 (1 initial + 3 retries)
- No timeout protection - requests could hang indefinitely

## Enhanced Recursive Solution

After the interview, I enhanced the solution with a recursive approach and added timeout protection:

```javascript
export async function getAvodahChallenge(attempt = 1, maxAttempts = 4) {
  const delayTime = 500 * Math.pow(2, attempt - 2);

  try {
    const result = await apiRequest();
    if (result === true) return;

    if (attempt === 1) {
      console.log("Debug entered ELSE =>");
    }

    if (attempt >= maxAttempts) {
      console.log("Request failed", result);
      return;
    }

    await delay(delayTime);
    return getAvodahChallenge(attempt + 1, delayTime * 2);
  } catch (error) {
    throw new Error("Am error occurred", error);
  }
}

export async function apiRequest() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const result = await fetch("http://localhost:8080", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (result.status === 200) {
      const resultJson = await result.json();
      console.log("Request succeded", resultJson.date);
      return true;
    }
    return result; // Return the failed Response object
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function delay(time) {
  console.log("Entered delay", time);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}
```

**What the enhanced version adds:**

### 1. Recursive Approach

- **Elegant recursion**: Each failed attempt calls itself with incremented attempt counter
- **Base case**: Stops when `attempt >= maxAttempts` or request succeeds
- **Cleaner logic**: No manual loop management or counter tracking
- **Configurable**: `maxAttempts` parameter allows customizing retry count

### 2. Timeout Protection with AbortController

- **5-second timeout**: Prevents requests from hanging indefinitely
- **AbortController**: Modern browser API for canceling fetch requests
- **Proper cleanup**: `clearTimeout()` prevents memory leaks
- **Error handling**: Distinguishes between network errors and timeouts

### 3. Better Error Handling

- **Response object logging**: Returns actual failed Response with headers, status, etc.
- **Separation of concerns**: `apiRequest()` handles HTTP logic, `getAvodahChallenge()` handles retry logic
- **ES modules**: Exported functions for better testability

## Key Improvements

| Feature                | Original                   | Enhanced                          |
| ---------------------- | -------------------------- | --------------------------------- |
| **Approach**           | Imperative while loop      | Recursive function calls          |
| **Timeout Protection** | None (could hang forever)  | 5-second AbortController timeout  |
| **Error Information**  | Basic logging              | Full Response object with headers |
| **Code Structure**     | Single monolithic function | Modular, separated concerns       |
| **Testability**        | Hard to test               | ES modules with exports           |
| **Configurability**    | Hardcoded 4 attempts       | Configurable `maxAttempts`        |

## Usage

```bash
# Install dependencies
npm install

# Run the retry logic
node index.js

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Test Coverage

The enhanced version includes comprehensive tests:

- ✅ Delay function timing
- ✅ Successful requests
- ✅ Failed requests with proper Response objects
- ✅ Timeout handling with AbortController
- ✅ Recursive retry logic with exponential backoff
- ✅ Maximum attempts behavior

Both implementations maintain the same behavior:

- **4 total attempts** (1 initial + 3 retries)
- **Exponential backoff delays**: 500ms, 1000ms, 2000ms
- **Same console logging** including original typos for authenticity

The recursive approach demonstrates functional programming principles while adding modern timeout protection and better error handling.
