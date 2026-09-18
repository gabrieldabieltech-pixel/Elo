
"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Download, X } from "lucide-react"

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [showAutoPrompt, setShowAutoPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent
    const webkit = !!ua.match(/WebKit/i)
    const isIPad = !!ua.match(/iPad/i)
    const isIPhone = !!ua.match(/iPhone/i)
    const isIOSSafari = isIPad || isIPhone && webkit && !ua.match(/CriOS/i)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

    if (isIOSSafari && !isStandalone) {
      setIsIOS(true)
      if (!localStorage.getItem("elo_pwa_dismissed")) {
        setShowAutoPrompt(true)
      }
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      
      if (!localStorage.getItem("elo_pwa_dismissed")) {
        setShowAutoPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    setShowAutoPrompt(false)
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsInstallable(false)
      }
      setDeferredPrompt(null)
    }
  }

  const dismissPrompt = () => {
    setShowAutoPrompt(false)
    localStorage.setItem("elo_pwa_dismissed", "true")
  }

  return (
    <>
      {(isInstallable || isIOS) && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={isIOS ? () => setShowAutoPrompt(true) : handleInstallClick} 
          className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
        >
          <Download size={16} />
          Baixar App
        </Button>
      )}

      {showAutoPrompt && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-surface border border-border shadow-2xl rounded-xl p-5 max-w-md mx-auto relative flex flex-col sm:flex-row items-center gap-4">
            <button onClick={dismissPrompt} className="absolute top-2 right-2 p-1 text-text-secondary hover:bg-surface-muted rounded-full">
              <X size={16} />
            </button>
            <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
              <Download size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">Instale o App Elo</h3>
              {isIOS ? (
                <p className="text-sm text-text-secondary mt-1">Para instalar no iOS, toque em <b>Compartilhar</b> na barra do Safari e depois em <b>Adicionar à Tela de Início</b>.</p>
              ) : (
                <p className="text-sm text-text-secondary mt-1">Tenha acesso rápido e fácil direto na sua tela inicial!</p>
              )}
            </div>
            {!isIOS && (
              <Button onClick={handleInstallClick} className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                Instalar
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
