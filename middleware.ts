import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Obtenemos la ruta actual a la que intenta entrar el usuario
  const path = request.nextUrl.pathname

  // Definimos qué rutas son PÚBLICAS (las que no exigen iniciar sesión)
  const isPublicPath = 
    path === '/login' || 
    path === '/register' || 
    path.startsWith('/auth') || 
    path.startsWith('/api')

  // Buscamos si existe una cookie de sesión (puedes cambiar 'session' por el nombre de la cookie que uses)
  const session = request.cookies.get('session')?.value || request.cookies.get('token')?.value

  // CASO 1: Si intenta entrar a una ruta privada (como /dashboard o /armario) y NO tiene sesión
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // CASO 2: Si ya tiene sesión e intenta ir al login o registro, lo mandamos a la app principal
  if (isPublicPath && session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url)) // Cambia '/dashboard' por tu ruta principal privada
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto archivos estáticos de Next.js e imágenes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}