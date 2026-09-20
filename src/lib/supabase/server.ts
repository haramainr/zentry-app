import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getDummyClient } from './dummy'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isDummyEnv = supabaseUrl.includes('placeholder') || supabaseUrl.trim() === '';
  const isDummyAuth = cookieStore.get('dummy_auth')?.value === 'true' || isDummyEnv;
  
  if (isDummyAuth) {
    const dummyRole = cookieStore.get('dummy_role')?.value || 'Manager';
    const userIdCookie = cookieStore.get('dummy_user_id')?.value;
    const nameCookie = cookieStore.get('dummy_name')?.value;
    const decodedName = nameCookie ? decodeURIComponent(nameCookie) : undefined;
    const emailCookie = cookieStore.get('dummy_email')?.value;
    const decodedEmail = emailCookie ? decodeURIComponent(emailCookie) : undefined;
    return getDummyClient(dummyRole, userIdCookie, decodedName, decodedEmail) as any;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
