import React from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function SpinnerEmpty() {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-card p-6 rounded-lg text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <Spinner className="mx-auto text-black" />
          </div>
          <h3 className="text-lg font-semibold text-black">Carregando suas receitas...</h3>
          <p className="text-sm text-muted-foreground">Aguarde enquanto processamos. Não recarregue a página.</p>
          <div className="mt-4">
            <Button variant="outline" size="lg">Cancelar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
