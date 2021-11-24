import useSWR, { cache } from "swr"
import { toDataOrError } from "../response"
import { handleError } from "../Error"

const useInternalBrandToken = (brandCode) => {
  let keys = brandCode ? `/global-api/brand/token/${brandCode}` : undefined

  const ResultCacheKey = `${useInternalBrandToken.name}:${brandCode}`
  let cached = cache.get(ResultCacheKey)
  let { data, mutate, ...rest } = useSWR(
    keys,
    (url) => {
      try {
        return fetch(url)
          .then(toDataOrError)
          .then((result) => {
            cache.set(ResultCacheKey, result)
            return result
          })
      } catch (error) {
        console.error(error)
        return Promise.reject(error)
      }
    },
    {
      initialData: keys && cached ? cached : undefined
    }
  )

  return {
    data,
    mutate: (data, shouldRevalidate) => {
      cache.delete(keys)
      cache.delete(ResultCacheKey)
      mutate(data, shouldRevalidate)
    },
    deleteCache: () => {
      cache.delete(keys)
      cache.delete(ResultCacheKey)
    },
    clearCache: () => cache.clear(),
    ...rest
  }
}

export const useBrandToken = ({ brandCode, currency }) => {
  let { data, ...rest } = useInternalBrandToken(brandCode)

  return {
    token: data,
    ...rest
  }
}
/*{
  let apiKey = useApiKey(brandCode)
  let { data: internalBrandToken } = useInternalBrandToken(brandCode)
  let keys =
    brandCode && currency && apiKey && internalBrandToken
      ? ["/api/auth/jwt", brandCode, currency, internalBrandToken]
      : undefined

  const ResultCacheKey = `${useBrandToken.name}:${brandCode}:${currency}:${internalBrandToken}`
  let cached = cache.get(ResultCacheKey)
  let { data, mutate, ...rest } = useSWR(
    keys,
    (url, brandCode, currency) =>
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${internalBrandToken}`
        },
        body: JSON.stringify({
          client: apiKey,
          currency
        })
      })
        .then(toDataOrError)
        .then((result) => {
          cache.set(ResultCacheKey, result)
          return result
        }),
    {
      initialData: keys && cached?.token ? cached : undefined
    }
  )

  return {
    token: data?.token,
    expires: data?.expires,
    mutate: (data, shouldRevalidate) => {
      cache.delete(keys)
      cache.delete(ResultCacheKey)
      mutate(data, shouldRevalidate)
    },
    deleteCache: () => {
      cache.delete(keys)
      cache.delete(ResultCacheKey)
    },
    clearCache: () => cache.clear(),
    ...rest
  }
}
*/

const useApiKey = (code) => {
  let brands = useBrands()
  return brands.find((brand) => brand.brandCode === code)?.apiKey ?? ""
}

export const useBrands = () => {
  let url = `/global-api/brand/apikeys?showAll=true`

  const CacheKey = url
  let brands = cache.get(CacheKey) ?? undefined

  let { data } = useSWR(
    url,
    (url) =>
      fetch(url)
        .then(toDataOrError)
        .then((data) => {
          let brands = data?.items
          cache.set(CacheKey, brands)
          return brands
        }),
    { initialData: brands }
  )

  return data ?? []
}

export const useBrandAnnouncementList = ({ brandCode, currency }) => {
  let { token: brandToken, ...brandTokenHook } = useBrandToken({
    brandCode,
    currency
  })

  let keys =
    brandToken && currency
      ? [`/api/announcement/list`, brandCode, currency]
      : undefined
  let { data: result, error, ...rest } = useSWR(keys, (url) =>
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "brand-token": brandToken
      }
    })
      .then(toDataOrError)
      .catch(handleError({ brandTokenHook }))
  )

  return {
    items: result?.data,
    error,
    isLoading: keys && !result && !error,
    ...rest
  }
}
