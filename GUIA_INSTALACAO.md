# 🩰 Dança Rainha — Guia de Instalação

Esse guia te leva do zero até o site no ar em uns 30 minutos.
Nenhuma linha de código precisa ser escrita — só copiar e colar.

---

## Passo 1 — Criar conta no Supabase (banco de dados grátis)

1. Acesse **https://supabase.com** e clique em **Start your project**
2. Crie uma conta com Google ou email
3. Clique em **New project**
4. Preencha:
   - Nome: `danca-rainha`
   - Senha do banco: crie uma senha forte e **salve em algum lugar**
   - Região: `East US` (mais próxima do Canadá)
5. Aguarde ~2 minutos enquanto o projeto é criado

---

## Passo 2 — Configurar o banco de dados

1. No painel do Supabase, clique em **SQL Editor** no menu lateral
2. Clique em **New query**
3. Abra o arquivo `supabase_schema.sql` (está na pasta do projeto)
4. Copie **todo o conteúdo** e cole no editor
5. Clique em **Run** (botão verde)
6. Deve aparecer "Success" em verde

---

## Passo 3 — Criar usuário admin (a professora)

1. Ainda no Supabase, vá em **Authentication > Users**
2. Clique em **Add user > Create new user**
3. Preencha:
   - Email: `p.casabrasil@gmail.com` (ou o email dela)
   - Password: crie uma senha forte
4. Clique em **Create user**
5. Agora vá em **SQL Editor** e rode esse comando (trocando pelo ID que apareceu):

```sql
INSERT INTO profiles (id, nome, email, role)
VALUES (
  'COLE_O_ID_DO_USER_AQUI',
  'Professora Patricia',
  'p.casabrasil@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', nome = 'Professora Patricia';
```

---

## Passo 4 — Pegar as chaves do Supabase

1. No Supabase, vá em **Settings > API**
2. Copie:
   - **Project URL** (começa com `https://`)
   - **anon / public key** (chave longa)
3. Na pasta do projeto, copie o arquivo `.env.example` e renomeie para `.env`
4. Abra o `.env` e preencha:

```
VITE_SUPABASE_URL=https://XXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Passo 5 — Hospedar no Vercel (grátis)

### Opção A — Via GitHub (recomendado)

1. Crie uma conta em **https://github.com** se não tiver
2. Crie um repositório novo chamado `danca-rainha`
3. Faça upload de todos os arquivos da pasta do projeto
4. Acesse **https://vercel.com** e crie uma conta
5. Clique em **Add New > Project**
6. Conecte seu GitHub e selecione o repositório `danca-rainha`
7. Antes de confirmar, clique em **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL` → sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` → sua chave anon
8. Clique em **Deploy**
9. Em ~1 minuto o site estará no ar com um link tipo `danca-rainha.vercel.app`

### Opção B — Via terminal (se souber usar)

```bash
npm install -g vercel
cd danca-rainha
vercel
# Siga as instruções e adicione as variáveis de ambiente
```

---

## Passo 6 — Adicionar as alunas

1. Acesse o site e faça login com o email e senha da professora
2. No painel admin, clique em **+ Adicionar aluna**
3. Preencha: nome, email, tipo de plano e uma senha inicial
4. A aluna recebe o email e pode fazer login com essa senha
5. Repita para cada aluna

---

## Resumo do fluxo

```
Professora faz login → Painel admin
  ├── Ver quem pagou / quem está pendente
  ├── Marcar presença das alunas na aula
  ├── Confirmar pagamento (quando receber o e-transfer)
  └── Adicionar novas alunas

Aluna faz login → Painel da aluna
  ├── Ver status do plano (ativa / pendente)
  ├── Ver instruções de pagamento (e-transfer)
  └── Ver histórico de presenças
```

---

## Precisa de ajuda?

Se travar em algum passo, anote em que parte está e peça ajuda.
Tudo foi pensado pra ser o mais simples possível! 🩰
