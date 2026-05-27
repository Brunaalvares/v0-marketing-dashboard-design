import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">Avalyst</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-destructive">Erro de Autenticacao</CardTitle>
              <CardDescription>
                Ocorreu um erro ao processar sua solicitacao
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Por favor, tente novamente ou entre em contato com o suporte se o problema persistir.
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
