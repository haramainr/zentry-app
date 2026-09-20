const globalForDummy = globalThis as any;

export function getDummyClient(role: string = 'Manager', serverUserId?: string, serverUserName?: string, serverUserEmail?: string) {
  const dummyUser = {
    id: serverUserId || 'dummy-admin-id',
    email: serverUserEmail || 'admin@zentry.com',
    user_metadata: { full_name: serverUserName || `Akun ${role} (Preview)`, role: role }
  };

  
  // Try to load from localStorage first
  if (typeof window !== 'undefined' && !globalForDummy.dummyDataMap) {
    const saved = localStorage.getItem('dummyDataMap');
    if (saved) {
      try {
        globalForDummy.dummyDataMap = JSON.parse(saved);
        const map = globalForDummy.dummyDataMap;
        if (map && map.users && !map.users.find((u: any) => u.id === 'tl-windih')) {
          map.users.push(
            {
              id: 'tl-windih',
              full_name: 'Windih Niswanti Yanna',
              role: 'Leader',
              subscription_status: 'Active',
              subscription_end_date: '2030-12-31',
              email: 'windih@zentry.com',
              supervisor_id: 'dummy-admin-id'
            },
            {
              id: 'sales-dea',
              full_name: 'Dea Resti P',
              role: 'Sales',
              subscription_status: 'Active',
              subscription_end_date: '2030-12-31',
              email: 'dea@zentry.com',
              supervisor_id: 'tl-windih'
            }
          );
          localStorage.setItem('dummyDataMap', JSON.stringify(map));
        }
      } catch(e) {}
    }
  }

  if (!globalForDummy.dummyDataMap) {
    globalForDummy.dummyDataMap = {
      users: [
        {
          id: 'dummy-admin-id',
          full_name: `Akun ${role} (Preview)`,
          role: role,
          subscription_status: 'Active',
          subscription_end_date: '2030-12-31',
          email: `${role.toLowerCase()}@zentry.com`,
          supervisor_id: role === 'Sales' ? 'leader-1-id' : null
        },
        {
          id: 'sales-1',
          full_name: 'Budi Santoso',
          role: 'Sales',
          subscription_status: 'Active',
          subscription_end_date: '2030-12-31',
          email: 'sales1@zentry.com',
          supervisor_id: 'dummy-admin-id'
        },
        {
          id: 'sales-2',
          full_name: 'Siti Aminah',
          role: 'Sales',
          subscription_status: 'Active',
          subscription_end_date: '2030-12-31',
          email: 'sales2@zentry.com',
          supervisor_id: 'dummy-admin-id'
        },
        {
          id: 'leader-1-id',
          full_name: 'Andi Pratama',
          role: 'Leader',
          subscription_status: 'Active',
          subscription_end_date: '2030-12-31',
          email: 'leader1@zentry.com',
          supervisor_id: 'dummy-admin-id'
        },
        {
          id: 'tl-windih',
          full_name: 'Windih Niswanti Yanna',
          role: 'Leader',
          subscription_status: 'Active',
          subscription_end_date: '2030-12-31',
          email: 'windih@zentry.com',
          supervisor_id: 'dummy-admin-id'
        },
        {
          id: 'sales-dea',
          full_name: 'Dea Resti P',
          role: 'Sales',
          subscription_status: 'Active',
          subscription_end_date: '2030-12-31',
          email: 'dea@zentry.com',
          supervisor_id: 'tl-windih'
        }
      ],
      submissions: [
        {
          id: '1',
          status_pemasangan: 'terlaksana',
          biaya_total: 350000,
          created_at: new Date().toISOString(),
          paket_layanan: 'Fiber',
          paket_spec: '100 Mbps',
          promo: 'Pay 5 Get 6',
          sales_id: 'sales-1',
          is_draft: false,
          nama_lengkap: 'Budi Santoso',
          homepass_id: 'HP-001',
          koordinat: '-6.200000, 106.816666',
          sales: { full_name: 'Budi Santoso' }
        },
        {
          id: '2',
          status_pemasangan: 'pending',
          biaya_total: 250000,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          paket_layanan: 'Safe',
          paket_spec: '50 Mbps',
          promo: 'Normal',
          sales_id: 'sales-2',
          is_draft: false,
          nama_lengkap: 'Siti Aminah',
          homepass_id: 'HP-002',
          koordinat: '-6.210000, 106.826666',
          sales: { full_name: 'Siti Aminah' }
        }
      ],
      signatures: []
    };
  } else {
    // Update role if changed
    if (globalForDummy.dummyDataMap.users[0].id === 'dummy-admin-id') {
      globalForDummy.dummyDataMap.users[0].role = role;
      globalForDummy.dummyDataMap.users[0].full_name = `Akun ${role} (Preview)`;
    }
  }

  const dummyDataMap = globalForDummy.dummyDataMap;

  const createBuilder = (table: string) => {
    let currentData = dummyDataMap[table] || [];
    let pendingUpdate: any = null;
    let pendingDelete: boolean = false;

    const executePending = () => {
      if (pendingUpdate && Array.isArray(currentData)) {
        currentData = currentData.map(item => {
          const updatedItem = { ...item, ...pendingUpdate };
          const index = dummyDataMap[table].findIndex((i: any) => i.id === item.id);
          if (index !== -1) dummyDataMap[table][index] = updatedItem;
          return updatedItem;
        });
        pendingUpdate = null;
      }
      if (pendingDelete && Array.isArray(currentData)) {
        currentData.forEach(item => {
          const index = dummyDataMap[table].findIndex((i: any) => i.id === item.id);
          if (index !== -1) dummyDataMap[table].splice(index, 1);
        });
        currentData = [];
        pendingDelete = false;
      }
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dummyDataMap', JSON.stringify(dummyDataMap));
      }
    };

    const builder: any = {
      select: () => builder,
      insert: (payload: any) => {
        const items = Array.isArray(payload) ? payload : [payload];
        const newItems = items.map((item: any) => ({
          id: 'draft-' + Date.now() + Math.floor(Math.random() * 1000),
          ...item,
          created_at: new Date().toISOString()
        }));
        dummyDataMap[table] = [...(dummyDataMap[table] || []), ...newItems];
        currentData = newItems; // Return the newly inserted items
        if (typeof window !== 'undefined') {
          localStorage.setItem('dummyDataMap', JSON.stringify(dummyDataMap));
        }
        return builder;
      },
      update: (payload: any) => {
        pendingUpdate = payload;
        return builder;
      },
      delete: () => {
        pendingDelete = true;
        return builder;
      },
      eq: (field?: string, val?: any) => {
        if (field && val !== undefined && Array.isArray(currentData)) {
          const filtered = currentData.filter((item: any) => item[field] === val);
          currentData = filtered;
        }
        return builder;
      },
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      like: () => builder,
      ilike: () => builder,
      is: () => builder,
      in: () => builder,
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      single: async () => {
        executePending();
        return {
          data: Array.isArray(currentData) ? currentData[0] || null : currentData,
          error: null
        };
      },
      maybeSingle: async () => {
        executePending();
        return {
          data: Array.isArray(currentData) ? currentData[0] || null : currentData,
          error: null
        };
      },
      then: (resolve: any, reject: any) => {
        executePending();
        resolve({ data: currentData, error: null });
      }
    };

    return builder;
  };

  return {
    auth: {
      getUser: async () => {
        let u = dummyUser;
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(/dummy_user_id=([^;]+)/);
          if (match && globalForDummy.dummyDataMap?.users) {
            const found = globalForDummy.dummyDataMap.users.find((x:any) => x.id === match[1]);
            if (found) u = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, role: found.role } };
          }
        }
        return { data: { user: u }, error: null };
      },
      getSession: async () => ({ data: { session: { user: dummyUser } }, error: null }),
      signInWithPassword: async (credentials: any) => {
        let u = dummyUser;
        if (globalForDummy.dummyDataMap?.users) {
          const found = globalForDummy.dummyDataMap.users.find((x:any) => x.email.toLowerCase().trim() === credentials.email.toLowerCase().trim());
          if (found) {
            u = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, role: found.role } };
            if (typeof document !== 'undefined') {
              document.cookie = 'dummy_auth=true; path=/; max-age=86400';
              document.cookie = `dummy_role=${found.role}; path=/; max-age=86400`;
              document.cookie = `dummy_user_id=${found.id}; path=/; max-age=86400`;
                document.cookie = `dummy_name=${encodeURIComponent(found.full_name)}; path=/; max-age=86400`;
                document.cookie = `dummy_email=${encodeURIComponent(found.email)}; path=/; max-age=86400`;
            }
            return { data: { user: u, session: { user: u } }, error: null };
          }
        }
        return { data: { user: null, session: null }, error: new Error('User not found in dummy DB') };
      },
      signUp: async (credentials: any) => {
        const newUser = {
          id: 'dummy-new-' + Date.now(),
          email: credentials.email,
          user_metadata: { full_name: credentials.options?.data?.full_name, role: credentials.options?.data?.role }
        };
        // Add to dummy db
        globalForDummy.dummyDataMap.users.push({
          id: newUser.id,
          full_name: newUser.user_metadata.full_name,
          role: newUser.user_metadata.role,
          subscription_status: 'Pending Approval',
          email: newUser.email,
          supervisor_id: credentials.options?.data?.supervisor_id || null
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('dummyDataMap', JSON.stringify(globalForDummy.dummyDataMap));
        }
        if (typeof document !== 'undefined') {
          document.cookie = 'dummy_auth=true; path=/; max-age=86400';
          document.cookie = `dummy_role=${newUser.user_metadata.role}; path=/; max-age=86400`;
          document.cookie = `dummy_user_id=${newUser.id}; path=/; max-age=86400`;
            document.cookie = `dummy_name=${encodeURIComponent(newUser.user_metadata.full_name)}; path=/; max-age=86400`;
            document.cookie = `dummy_email=${encodeURIComponent(newUser.email)}; path=/; max-age=86400`;
        }
        return { data: { user: newUser, session: { user: newUser } }, error: null };
      },
      signOut: async () => {
        if (typeof document !== 'undefined') {
          document.cookie = "dummy_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "dummy_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        return { error: null };
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => createBuilder(table),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'dummy.pdf' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://placeholder.supabase.co/dummy.pdf' } })
      })
    }
  };
}

