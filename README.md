# HTTP Retry Logic

Makes HTTP requests with retry logic and exponential backoff.

## Features

- 4 total attempts (1 initial + 3 retries)
- Exponential backoff: 500ms → 1000ms → 2000ms → 2000ms (capped at 2s)
- 5-second timeout protection
- Recursive implementation

## Usage

```bash
npm test          # Run tests
node index.js     # Run the retry logic
```

## Implementation

```javascript
export async function getAvodahChallenge(attempt = 1, maxAttempts = 4) {
  const delayTime = Math.min(500 * Math.pow(2, attempt - 1), 2000);

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
    return getAvodahChallenge(attempt + 1, maxAttempts);
  } catch (error) {
    throw new Error("An error occurred", error);
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
      console.log("Request succeeded", resultJson.date);
      return true;
    }
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
```

## Tests

- ✅ Success on first try
- ✅ Failure after all attempts
- ✅ Proper retry timing and limits
