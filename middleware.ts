import { createServerClient } from '@ssr/supabase' // O la ruta que use tu proyecto para supabase
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Aquí validamos la sesión actual del usuario con Supabase
  // Asegúrate de usar tus variables de entorno públicas configuradas
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Evita refrescar la sesión en rutas estáticas o de API públicas si es necesario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si el usuario no ha iniciado sesión y quiere entrar a una ruta protegida (ej: /armario o /dashboard)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/' // Cambia esto si la raíz '/' debe ser privada
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login' // Redirige a tu vista de inicio de sesión
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitudes excepto las que empiezan por:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}