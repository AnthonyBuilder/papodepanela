import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

import UnsplashImage from './UnsplashImage'
import { Bookmark } from 'lucide-react'

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

  const saveRecipe = () => {
    alert('Funcionalidade de salvar receita ainda não implementada.')
  }

  return (
    <article className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border flex flex-col h-full">
      <div className="h-44 w-full bg-gray-200/20 relative overflow-hidden">
        {image && !imgError ? (
          <img src={image} alt={title} className="object-cover w-full h-full" loading="lazy" onError={() => setImgError(true)} />
        ) : query ? (
          <UnsplashImage query={query} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-3xl bg-white/5">🍲</div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">{description || 'Uma delícia prática e saborosa.'}</p>
        <h4 className="text-sm text-gray-400 mt-2">#PapoDePanela</h4>
        <div className="flex flex-col gap-2 mt-auto">

          <div className="flex gap-2 mt-4">
            <Button variant="default" size="sm" className='flex-1 bg-amber-800' onClick={saveRecipe}>
              <Bookmark className="w-4 h-4 mr-2" />
            Salvar para depois
          </Button>
          <Button variant="default" size="sm" className='flex-1' onClick={openRecipe}>
            Ver
          </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default Card
