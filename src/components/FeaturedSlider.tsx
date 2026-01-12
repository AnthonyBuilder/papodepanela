import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Recipe {
  title: string
  description: string
  image: string
  id: string
}

interface FeaturedSliderProps {
  recipes: Recipe[]
}

const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ recipes }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const navigate = useNavigate()

  if (recipes.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? recipes.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === recipes.length - 1 ? 0 : prev + 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    }
    if (isRightSwipe) {
      goToPrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const currentRecipe = recipes[currentIndex]

  return (
    <div className="relative w-full mb-6 md:mb-10">
      <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl">
        <div 
          className="relative h-[350px] sm:h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${currentRecipe.image})` }}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-end p-4 pb-12 sm:p-6 sm:pb-14 md:p-10 md:pb-16">
            <div className="max-w-2xl">
              <div className="inline-block px-2.5 py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3">
                ⭐ Em Destaque
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 font-noto-serif drop-shadow-lg leading-tight">
                {currentRecipe.title}
              </h2>
              <p className="text-white/90 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-6 line-clamp-2 leading-relaxed">
                {currentRecipe.description}
              </p>
              <Button
                variant="default"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm md:text-base px-4 py-2 md:px-6 md:py-3"
                onClick={() => navigate(`/recipe/${currentRecipe.id}`)}
              >
                Ver Receita
              </Button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
            {recipes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6 sm:w-8'
                    : 'bg-white/50 hover:bg-white/75 w-1.5 sm:w-2'
                }`}
                aria-label={`Ir para receita ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Desktop Only - Outside slider */}
      <button
        onClick={goToPrevious}
        className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 backdrop-blur-md hover:bg-orange-500 hover:text-white rounded-full items-center justify-center shadow-lg transition-all border border-gray-200"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/50 backdrop-blur-md hover:bg-orange-500 hover:text-white rounded-full items-center justify-center shadow-lg transition-all border border-gray-200"
        aria-label="Próximo"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}

export default FeaturedSlider
