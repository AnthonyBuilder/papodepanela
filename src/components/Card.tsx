import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

import UnsplashImage from './UnsplashImage'

type CardProps = {
  title: string
  description?: string
  image?: string
  query?: string
}

const Card: React.FC<CardProps> = ({ title, description, image, query }) => {
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()

  const openRecipe = () => {
    const q = encodeURIComponent(query ?? title)
    navigate(`/recipe/${q}`)
  }

  return (
    <article className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border">
      <div className="h-44 w-full bg-gray-200/20 relative overflow-hidden">
        {image && !imgError ? (
          <img src={image} alt={title} className="object-cover w-full h-full" loading="lazy" onError={() => setImgError(true)} />
        ) : query ? (
          <UnsplashImage query={query} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-3xl bg-white/5">🍲</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description || 'Uma delícia prática e saborosa.'}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="default" size="sm" onClick={openRecipe}>
            Ver
          </Button>
        </div>
      </div>
    </article>
  )
}

export default Card
