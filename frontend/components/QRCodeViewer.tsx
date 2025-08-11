'use client'

import { useState } from 'react'
import { animalsAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Download, Copy, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

interface QRCodeViewerProps {
  animalId: number
  animalName: string
  qrCodeUrl?: string
}

export function QRCodeViewer({ animalId, animalName, qrCodeUrl }: QRCodeViewerProps) {
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      setError(null)
      
      const blob = await animalsAPI.downloadQRCode(animalId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${animalName}-QRCode.png`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download QR code')
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!qrCodeUrl) return
    
    try {
      await navigator.clipboard.writeText(qrCodeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  if (!qrCodeUrl) {
    return (
      <Card className="bg-yellow-900/20 border-yellow-500/30">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-yellow-400 text-sm">
            QR code not available for this animal
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* QR Code Display */}
      <div className="relative">
        <div className="bg-white p-4 rounded-lg mx-auto w-fit">
          <img
            src={qrCodeUrl}
            alt={`QR Code for ${animalName}`}
            className="w-32 h-32 mx-auto"
            style={{
              imageRendering: 'pixelated',
              imageRendering: '-moz-crisp-edges',
              imageRendering: 'crisp-edges'
            }}
          />
        </div>
        
        {/* Cyber glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/20 to-neon-green/20 blur-xl rounded-lg -z-10" />
      </div>

      {/* QR Code Info */}
      <div className="text-center space-y-2">
        <p className="text-white font-medium">{animalName}</p>
        <p className="text-gray-400 text-sm">
          Scan to view animal details
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-gradient-to-r from-cyber-blue to-neon-green hover:from-cyber-blue/80 hover:to-neon-green/80"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </>
          )}
        </Button>
        
        <Button
          onClick={handleCopyUrl}
          variant="outline"
          className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy QR URL
            </>
          )}
        </Button>
      </div>

      {/* QR Code URL Display */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-gray-400 text-xs mb-1">QR Code URL:</p>
        <p className="text-gray-300 text-xs font-mono break-all">
          {qrCodeUrl}
        </p>
      </div>

      {/* Usage Instructions */}
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="p-3">
          <h4 className="text-white text-sm font-medium mb-2">How to use:</h4>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Print the QR code and attach to animal tag</li>
            <li>• Scan with any QR code reader</li>
            <li>• Quick access to animal information</li>
            <li>• Works offline once printed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
