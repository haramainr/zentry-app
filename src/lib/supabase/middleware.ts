import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isPlaceholder = supabaseUrl.includes('placeholder') || supabaseUrl.trim() === '';
  const isDummyLoggedIn = request.cookies.get('dummy_auth')?.value === 'true';
  const dummyRole = request.cookies.get('dummy_role')?.value || 'Manager';

  if (isPlaceholder || isDummyLoggedIn) {
    const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || 
                          request.nextUrl.pathname.startsWith('/register') || 
                          request.nextUrl.pathname.startsWith('/forgot-password') || 
                          request.nextUrl.pathname.startsWith('/update-password') || 
                          request.nextUrl.pathname.startsWith('/auth') ||
                          request.nextUrl.pathname === '/';

    if (!isDummyLoggedIn && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    if (isDummyLoggedIn && isPublicRoute) {
      const url = request.nextUrl.clone();
      if (dummyRole === 'Admin' || dummyRole === 'Manager') url.pathname = '/manager';
      else if (dummyRole === 'Leader') url.pathname = '/leader';
      else if (dummyRole === 'Developer') url.pathname = '/developer';
      else url.pathname = '/sales';
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define unprotected routes
  const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/register') || 
                        request.nextUrl.pathname.startsWith('/forgot-password') || 
                        request.nextUrl.pathname.startsWith('/update-password') || 
                        request.nextUrl.pathname.startsWith('/auth') ||
                        request.nextUrl.pathname === '/'; // Assuming root is public/login

  // Protect routes based on auth status
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  let profile: any = null;
  if (user) {
    try {
      const { data } = await supabase
        .from('users')
        .select('role, subscription_status, subscription_end_date')
        .eq('id', user.id)
        .single()
      profile = data;
    } catch (e) {
      console.error('Error fetching profile in middleware', e)
    }
  }

  // Redirect logged in users away from public routes
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    if (profile) {
      if (profile.role === 'Admin' || profile.role === 'Manager') url.pathname = '/manager';
      else if (profile.role === 'Leader') url.pathname = '/leader';
      else if (profile.role === 'Developer') url.pathname = '/developer';
      else url.pathname = '/sales'; // Changed from /sales/form to /sales
    } else {
      url.pathname = '/sales'; // Changed from /sales/form to /sales
    }
    return NextResponse.redirect(url)
  }

  // Check subscription status if user exists
  if (user && profile && !request.nextUrl.pathname.startsWith('/suspended') && !isPublicRoute) {
    // Admin dan Developer tidak diblokir
    if (profile.role !== 'Admin' && profile.role !== 'Developer') {
      const now = new Date()
      const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
      
      const isStatusNotActive = profile.subscription_status !== 'Active';
      const isExpired = endDate && endDate < now;
      
      // Block if status is not active, OR if it's active but expired
      if (isStatusNotActive || isExpired) {
        // Prevent infinite redirect loop
        if (request.nextUrl.pathname !== '/suspended') {
          const url = request.nextUrl.clone()
          url.pathname = '/suspended'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  return supabaseResponse
}
