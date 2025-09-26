

export async function getAvodahChallenge(attempt = 1, maxAttempts = 4) {
  const delayTime = Math.min(500 * Math.pow(2, attempt - 1), 2000)

  try {
    const result = await apiRequest()
    if(result === true) return

    if(attempt === 1) {
      console.log('Debug entered ELSE =>')
    }

    if(attempt >= maxAttempts) {
      console.log('Request failed', result);
      return;
    }

    await delay(delayTime)
    return getAvodahChallenge(attempt + 1, maxAttempts)
  } catch (error) {
    throw new Error('Am error occurred', error)
  }
}


export async function apiRequest() {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const result = await fetch('http://localhost:8080', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if(result.status === 200) {
        const resultJson = await result.json()
        console.log('Request succeded', resultJson.date)
        return true
      }
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

export async function delay(time) {
  console.log('tiime', time)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

getAvodahChallenge()

