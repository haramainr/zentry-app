-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Users (Extends Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Sales', 'Leader', 'Manager', 'Developer')),
    supervisor_id UUID REFERENCES public.users(id),
    subscription_status TEXT DEFAULT 'Active' CHECK (subscription_status IN ('Active', 'Suspended')),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Managers and Developers can view all profiles" 
    ON public.users FOR SELECT 
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Manager', 'Developer')
    );

CREATE POLICY "Anyone can view leaders" 
    ON public.users FOR SELECT 
    USING (role = 'Leader');

CREATE POLICY "Leaders can view their team members" 
    ON public.users FOR SELECT 
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'Leader'
        AND supervisor_id = auth.uid()
    );

CREATE POLICY "Developers can update user profiles" 
    ON public.users FOR UPDATE 
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'Developer'
    )
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'Developer'
    );

-- 2. Tabel Signatures (Vault)
CREATE TABLE public.signatures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL UNIQUE,
    signature_url TEXT NOT NULL, -- Base64 String
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for signatures
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own signatures" 
    ON public.signatures FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Sales can view their supervisor signature" 
    ON public.signatures FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE public.users.id = auth.uid() 
            AND public.users.supervisor_id = public.signatures.user_id
        )
    );

CREATE POLICY "Users can insert their own signatures" 
    ON public.signatures FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures" 
    ON public.signatures FOR UPDATE 
    USING (auth.uid() = user_id);

-- 3. Tabel Submissions (ZEntry Forms)
CREATE TABLE public.submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sales_id UUID REFERENCES public.users(id) NOT NULL,
    
    -- Step 1
    nama_lengkap TEXT NOT NULL,
    tempat_lahir TEXT,
    tanggal_lahir DATE,
    ktp VARCHAR(16) NOT NULL,
    jenis_kelamin TEXT,
    telp_selular TEXT,
    telp_rumah TEXT,
    
    -- Step 2
    alamat TEXT,
    rt VARCHAR(3),
    rw VARCHAR(3),
    kode_pos VARCHAR(5),
    status_kepemilikan TEXT,
    email TEXT,
    
    -- Step 3
    paket_layanan TEXT,
    paket_spec TEXT,
    router_qty INTEGER DEFAULT 0,
    smartbox_qty INTEGER DEFAULT 0,
    
    -- Step 4
    username_zentry TEXT,
    tgl_pemasangan DATE,
    waktu_pemasangan TEXT,
    catatan TEXT,
    
    -- Step 5 (CC details are sensitive, consider encryption or omit if not needed in DB)
    cc_nama TEXT,
    cc_nomor TEXT, -- Should be masked ideally
    cc_berlaku TEXT,
    cc_bank TEXT,
    cc_wewenang BOOLEAN DEFAULT false,
    cc_signature_url TEXT, -- If different from main vault
    
    biaya_pemasangan NUMERIC DEFAULT 0,
    biaya_paket NUMERIC DEFAULT 0,
    biaya_tambahan NUMERIC DEFAULT 0,
    biaya_services NUMERIC DEFAULT 0,
    biaya_addons NUMERIC DEFAULT 0,
    biaya_perangkat NUMERIC DEFAULT 0,
    biaya_lainnya NUMERIC DEFAULT 0,
    
    -- New fields for auto calculation
    vas TEXT,
    promo TEXT,
    biaya_administrasi NUMERIC DEFAULT 5000,
    biaya_ppn NUMERIC DEFAULT 0,
    
    biaya_total NUMERIC DEFAULT 0,
    
    -- Commission
    tl_commission NUMERIC DEFAULT 0,
    
    -- Installation Details
    homepass_id TEXT,
    titik_koordinat TEXT,
    
    -- PDF Data
    pdf_url TEXT, -- URL to generated PDF in Storage
    status_pemasangan TEXT DEFAULT 'Pending' CHECK (status_pemasangan IN ('Pending', 'Terlaksana', 'Batal')),
    is_draft BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales can view their own submissions" 
    ON public.submissions FOR SELECT 
    USING (auth.uid() = sales_id);

CREATE POLICY "Sales can insert their own submissions" 
    ON public.submissions FOR INSERT 
    WITH CHECK (auth.uid() = sales_id);

CREATE POLICY "Sales can update their own submissions" 
    ON public.submissions FOR UPDATE 
    USING (auth.uid() = sales_id)
    WITH CHECK (auth.uid() = sales_id);

CREATE POLICY "Leaders can view their team submissions" 
    ON public.submissions FOR SELECT 
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'Leader'
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = public.submissions.sales_id 
            AND supervisor_id = auth.uid()
        )
    );

CREATE POLICY "Managers and Developers can view all submissions" 
    ON public.submissions FOR SELECT 
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Manager', 'Developer')
    );

-- 4. Tabel Targets (Sales/Team Targets)
CREATE TABLE public.targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    target_month DATE NOT NULL, -- e.g., '2026-06-01' to represent June 2026
    target_revenue NUMERIC DEFAULT 0,
    target_registrations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_month)
);

-- RLS for targets
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own targets" 
    ON public.targets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Leaders and Managers can manage targets" 
    ON public.targets FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('Leader', 'Manager', 'Developer')
        )
    );

-- Function to handle new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role, supervisor_id, subscription_end_date)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'Sales'),
    NULLIF(new.raw_user_meta_data->>'supervisor_id', '')::uuid,
    NOW() + INTERVAL '1 month' -- Default 1 month free trial
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
