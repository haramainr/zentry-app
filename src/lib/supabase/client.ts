import { createBrowserClient } from '@supabase/ssr'
import { getDummyClient } from './dummy'

let dummyClientInstance: any = null;
let dummyClientRole: string = '';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isDummyEnv = supabaseUrl.includes('placeholder') || supabaseUrl.trim() === '';
  
  if ((typeof document !== 'undefined' && document.cookie.includes('dummy_auth=true')) || isDummyEnv) {
    let role = 'Manager';
    if (typeof document !== 'undefined') {
      const roleMatch = document.cookie.match(/dummy_role=([^;]+)/);
      if (roleMatch) role = decodeURIComponent(roleMatch[1]);
    }
    
    if (!dummyClientInstance || dummyClientRole !== role) {
      dummyClientInstance = getDummyClient(role);
      dummyClientRole = role;
    }
    
    return dummyClientInstance as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
