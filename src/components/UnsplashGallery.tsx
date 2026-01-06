import React, { useEffect, useState } from 'react'

type UnsplashPhoto = {
  id: string
  alt_description: string | null
  urls: { small: string; regular: string }
}

type Props = {
  query: string
  perPage?: number
  onSelect?: (url: string) => void
}

const UnsplashGallery: React.FC<Props> = ({ query, perPage = 9, onSelect }) => {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) {
      setPhotos([])
      return
    }

    const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
    const controller = new AbortController()

    const fetchPhotos = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!key) {
          // Fallback: use source.unsplash.com random images when no key
          const fallback: UnsplashPhoto[] = Array.from({ length: perPage }).map((_, i) => ({
            id: `fallback-${i}`,
            alt_description: query,
            urls: { small: `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}&sig=${i}`, regular: `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}&sig=${i}` }
          }))
          setPhotos(fallback)
          return
        }

        const url = `https://api.unsplash.com/search/photos?page=1&per_page=${perPage}&query=${encodeURIComponent(query)}`
        const res = await fetch(url, {
          headers: { Authorization: `Client-ID ${key}` },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Unsplash error: ${res.status}`)
        const data = await res.json()
        setPhotos(data.results || [])
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Erro ao buscar imagens')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()

    return () => controller.abort()
  }, [query, perPage])

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Imagens para: "{query}"</h2>
        <div className="text-sm text-gray-300">{loading ? 'Carregando...' : `${photos.length} imagens`}</div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect && onSelect(p.urls.regular)}
            className="block w-full h-36 bg-gray-200/10 overflow-hidden rounded-lg shadow-sm"
          >
            <img src={p.urls.small} alt={p.alt_description || 'Unsplash'} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default UnsplashGallery
