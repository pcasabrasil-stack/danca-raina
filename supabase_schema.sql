-- =============================================
-- DANÇA RAINHA — Schema do Supabase
-- Cole isso no SQL Editor do Supabase
-- =============================================

-- 1. Tabela de perfis (extensão do auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'aluna')),
  tipo TEXT CHECK (tipo IN ('mensalista', 'avulsa')),
  pagamento_status TEXT DEFAULT 'pendente' CHECK (pagamento_status IN ('pago', 'pendente')),
  pagamento_mes TEXT, -- formato: '2025-05'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de presenças
CREATE TABLE presencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluna_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aluna_id, data) -- não duplica presença no mesmo dia
);

-- =============================================
-- SEGURANÇA (Row Level Security)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;

-- Profiles: admin vê tudo, aluna vê só ela mesma
CREATE POLICY "Admin vê todos os perfis" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Aluna vê só seu perfil" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Presenças: admin vê tudo, aluna vê só as dela
CREATE POLICY "Admin vê todas as presenças" ON presencas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Aluna vê só suas presenças" ON presencas
  FOR SELECT USING (aluna_id = auth.uid());

-- =============================================
-- CRIAR PERFIL AUTOMATICAMENTE NO CADASTRO
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'aluna')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
