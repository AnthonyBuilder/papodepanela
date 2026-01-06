import React, { useEffect, useState } from 'react'

type Props = {
  query: string
  className?: string
  alt?: string
}

const UnsplashImage: React.FC<Props> = ({ query, className = '', alt = '' }) => {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) {
      setUrl(null)
      setLoading(false)
      return
    }

    const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
    let canceled = false

    const fetchOne = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!key) {
          // fallback to source.unsplash single image
          setUrl(`https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`)
          return
        }

        const res = await fetch(
          `https://api.unsplash.com/search/photos?page=1&per_page=1&query=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Client-ID ${key}` } }
        )
        if (!res.ok) throw new Error(`Unsplash error ${res.status}`)
        const data = await res.json()
        const first = data.results && data.results[0]
        if (first && first.urls && !canceled) setUrl(first.urls.regular)
        else if (!canceled) setUrl(`https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`)
      } catch (err: any) {
        if (!canceled) setError(err.message || 'Erro ao buscar imagem')
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    fetchOne()

    return () => {
      canceled = true
    }
  }, [query])

  if (loading) return <div className={`w-full h-full bg-gray-200 animate-pulse ${className}`} />
  if (error) return <div className={`w-full h-full flex items-center justify-center text-sm text-red-400 ${className}`}>{error}</div>
  if (!url) return <div className={`w-full h-full bg-gray-200 ${className}`} />

  return <img src={url} alt={alt || query} className={className} loading="lazy" />
}

export default UnsplashImage
