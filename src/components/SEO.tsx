import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonicalUrl?: string
  type?: 'website' | 'article' | 'recipe'
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export default function SEO({
  title = 'Papo de Panela - Receitas Deliciosas do Mundo',
  description = 'Descubra receitas deliciosas de todo o mundo. Busque, salve suas favoritas, crie receitas com IA e compartilhe com a comunidade!',
  keywords = 'receitas, culinária, gastronomia, cozinha, pratos, comida, papodepanela, receitas brasileiras, receitas internacionais',
  ogImage = 'https://papodepanela.site/og-image.png',
  canonicalUrl = 'https://papodepanela.site/',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
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

    const removeMetaTag = (name: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      const element = document.querySelector(`meta[${attribute}="${name}"]`)
      if (element) {
        element.remove()
      }
    }

    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:url', canonicalUrl, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true)
      updateMetaTag('og:image:width', '1200', true)
      updateMetaTag('og:image:height', '630', true)
      updateMetaTag('twitter:image', ogImage)
      updateMetaTag('twitter:card', 'summary_large_image')
    }

    // Article-specific meta tags
    if (type === 'article' || type === 'recipe') {
      if (author) {
        updateMetaTag('article:author', author, true)
      }
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, true)
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, true)
      }
    } else {
      // Remove article tags if not article
      removeMetaTag('article:author', true)
      removeMetaTag('article:published_time', true)
      removeMetaTag('article:modified_time', true)
    }

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [title, description, keywords, ogImage, canonicalUrl, type, author, publishedTime, modifiedTime])

  return null
}
