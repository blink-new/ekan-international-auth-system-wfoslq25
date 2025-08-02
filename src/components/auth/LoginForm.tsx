import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onRequestAccess?: () => void
}

export function LoginForm({ onRequestAccess }: LoginFormProps) {
  const [error] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            EKAN International
          </CardTitle>
          <CardDescription>
            Management System - Secure Access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center mb-4">
                <strong>EKAN International Management System</strong><br />
                Secure authentication powered by Blink
              </p>
              <p className="text-xs text-blue-700 text-center">
                Authentication is handled automatically. If you're not signed in, you'll be redirected to complete authentication.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Need Access?
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onRequestAccess}
            >
              Request System Access
            </Button>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-800 text-center">
              <strong>Admin Access:</strong> Admin users (ekanintl007@gmail.com) will have full system access including user management and approval workflows after authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}