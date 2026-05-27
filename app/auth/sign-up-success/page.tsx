import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">Avalyst</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Conta Criada!</CardTitle>
              <CardDescription>
                Verifique seu email para confirmar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enviamos um link de confirmacao para o seu email. Clique no link para ativar sua conta e acessar o dashboard.
              </p>
              <Link
                href="/auth/login"
                className="text-primary underline underline-offset-4 text-sm"
              >
                Voltar para login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
