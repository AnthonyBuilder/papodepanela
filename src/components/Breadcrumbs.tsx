import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

type BreadcrumbItem = {
  label: string
  onClick?: () => void
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 hover:text-orange-500 transition-colors"
        aria-label="Página inicial"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">{items[0]?.label}</span>
      </button>
      
      {items.slice(1).map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-orange-500 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="font-medium text-gray-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumbs
