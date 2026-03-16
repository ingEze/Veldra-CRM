export async function fetchAPI (url: string, method: string, data?: unknown): Promise<Response> {
    try {
      if (data) {
        return await fetch(url, {
          method: method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      } else {
        return await fetch(url, {
          method: method,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (err: any) {
      throw err
    }
  }