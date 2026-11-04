/* Configuração do banco de dados (Supabase). Veja LEIA-ME-SISTEMA.md, passo a passo.
   Enquanto SUPABASE_URL e SUPABASE_KEY estiverem vazios, o site funciona em "modo local"
   (dados salvos só no navegador de quem usa). */
window.AL_CONFIG={
  SUPABASE_URL:"",          // ex.: "https://abcdefgh.supabase.co"
  SUPABASE_KEY:"",          // chave "anon public" do projeto
  LOGIN_EMAILS:{            // usuário digitado no login -> e-mail cadastrado no Supabase
    fernando:""             // ex.: "fernando@gmail.com"
  }
};
