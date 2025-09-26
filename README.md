# HTTP Retry Logic

Retries HTTP requests with exponential backoff.

## Original (While Loop)

```javascript
async function getAvodahChallenge() {
  const result = await fetch("http://localhost:8080");

  if (result.status === 200) {
    const resultJson = await result.json();
    console.log("Request succeeded", resultJson.date);
    return;
  } else {
    let counter = 0;
    console.log("Debug entered ELSE =>");

    let delayTime = 500;
    while (counter < 3) {
      await delay(delayTime);
      const result = await fetch("http://localhost:8080");

      if (result.status === 200) {
        const resultJson = await result.json();
        console.log("Request succeeded", resultJson.date);
        return;
      }

      delayTime = delayTime * 2;
      counter++;
    }
    console.log("Request failed", result);
  }
}
```

## Enhanced (Recursive + Timeout)

- Recursive instead of while loop
- 5-second timeout per request (prevents hanging)
- Modular code with separated concerns
- Proper delay capping at 2000ms

```javascript
export async function getAvodahChallenge(attempt = 1, maxAttempts = 4) {
  // Calculate delay with exponential backoff, capped at 2000ms
  const delayTime = Math.min(500 * Math.pow(2, attempt - 1), 2000)

  try {
    const result = await apiRequest()
    if(result === true) return // Success - exit recursion

    if(attempt === 1) {
      console.log('Debug entered ELSE =>')
    }

    // Stop after max attempts reached
    if(attempt >= maxAttempts) {
      console.log('Request failed', result);
      return;
    }

    await delay(delayTime) // Wait before retry
    return getAvodahChallenge(attempt + 1, maxAttempts) // Recursive call
  } catch (error) {
    throw new Error('An error occurred', error)
  }
}

export async function apiRequest() {
  // Setup 5-second timeout to prevent hanging requests
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const result = await fetch('http://localhost:8080', {
      signal: controller.signal // Enable request cancellation
    })
    clearTimeout(timeoutId)

    if(result.status === 200) {
      const resultJson = await result.json()
      console.log('Request succeeded', resultJson.date)
      return true
    }
    return result // Return failed response for logging
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
```

```bash
npm test
node index.js
```

## Tests

- Success on first try
- Failure after all attempts