export const useFetch = (url, options = {}) => {
  if (window.location.host === "op.nexentgame.com") {
    const apiUrl = "https://op-api.nexentgame.com"
    const globalUrl = "https://global-api.nexentgame.com"
    url = url.startsWith("/api") ? `${apiUrl}${url}` : `${globalUrl}${url}`
    return fetch(url, { mode: "cors", ...options })
  }
  return fetch(url, options)
}
