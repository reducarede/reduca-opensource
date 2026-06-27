-- 1. Criar coluna de e-mail no perfil dos usuários
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reduca_email text UNIQUE;

-- 2. Criar Tabela de Emails
CREATE TABLE IF NOT EXISTS public.emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  folder text NOT NULL CHECK (folder IN ('inbox', 'sent', 'drafts', 'trash', 'spam')),
  sender_name text,
  sender_addr text,
  recipients jsonb NOT NULL,
  subject text,
  body text,
  is_read boolean DEFAULT false,
  is_starred boolean DEFAULT false,
  labels jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Adicionar Busca Full-Text
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  to_tsvector('portuguese', coalesce(subject, '') || ' ' || coalesce(body, '') || ' ' || coalesce(sender_name, '') || ' ' || coalesce(sender_addr, ''))
) STORED;

CREATE INDEX IF NOT EXISTS emails_fts_idx ON public.emails USING GIN (fts);

-- 4. Segurança (RLS)
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can insert their own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON public.emails;
DROP POLICY IF EXISTS "Users can delete their own emails" ON public.emails;

CREATE POLICY "Users can view their own emails" ON public.emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own emails" ON public.emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own emails" ON public.emails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own emails" ON public.emails FOR DELETE USING (auth.uid() = user_id);

-- 5. Habilitar Atualizações em Tempo Real
ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;

-- 6. Gatilho (Trigger) para Entrega Interna Instantânea
CREATE OR REPLACE FUNCTION handle_internal_email_delivery()
RETURNS trigger AS $$
DECLARE
  recipient_email text;
  recipient_id uuid;
BEGIN
  -- Se um novo e-mail foi salvo na pasta "Enviados"
  IF NEW.folder = 'sent' THEN
    -- Para cada destinatário na lista
    FOR recipient_email IN SELECT * FROM jsonb_array_elements_text(NEW.recipients)
    LOOP
      -- Busca qual usuário do Reduca é o dono desse endereço @reduca.net
      SELECT id INTO recipient_id FROM public.profiles WHERE reduca_email = recipient_email LIMIT 1;
      
      -- Se o usuário existe, faz uma cópia do e-mail na Caixa de Entrada dele!
      IF recipient_id IS NOT NULL THEN
        INSERT INTO public.emails (
          user_id, folder, sender_name, sender_addr, recipients, subject, body, is_read, created_at
        ) VALUES (
          recipient_id, 'inbox', NEW.sender_name, NEW.sender_addr, NEW.recipients, NEW.subject, NEW.body, false, NEW.created_at
        );
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS email_sent_trigger ON public.emails;
CREATE TRIGGER email_sent_trigger
  AFTER INSERT ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION handle_internal_email_delivery();
