import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonicalUrl?: string
}

export default function SEO({
  title = 'Papo de Panela - Receitas Deliciosas do Mundo',
  description = 'Descubra receitas deliciosas de todo o mundo. Salve suas favoritas e cozinhe como um chef profissional!',
  keywords = 'receitas, culinária, gastronomia, cozinha, pratos, comida, papodepanela',
  ogImage,
  canonicalUrl = 'https://papodepanela.vercel.app/',
}: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = title

    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:url', canonicalUrl, true)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true)
      updateMetaTag('twitter:image', ogImage)
    }

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [title, description, keywords, ogImage, canonicalUrl])

  return null
}
