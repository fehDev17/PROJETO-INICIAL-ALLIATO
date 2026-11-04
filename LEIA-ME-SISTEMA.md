# ALIATTO: guia do sistema restrito e das notícias

## Dois modos de funcionamento
**1. Com servidor PHP (recomendado):** notícias salvas e imagens enviadas aparecem **na hora** para todos os visitantes. O login é conferido no servidor.
**2. Sem servidor (site estático ou arquivo aberto no computador):** o painel funciona, mas só no navegador de quem usa. É preciso clicar em "Exportar para o site" e substituir `assets/js/noticias-seed.js`.

O site escolhe o modo sozinho. Se a pasta `api/` responder, usa o servidor.

## Instalando o modo servidor
1. Envie o site inteiro (inclusive as pastas `api/` e `uploads/`) para uma hospedagem com PHP 7.4 ou superior.
2. Dê permissão de escrita (755 ou 775) às pastas `api/data` e `uploads`.
3. Acesse `html/admin.html`. No canto esquerdo do painel deve aparecer "Servidor conectado".
4. Usuário **Fernando**, senha de 1 a 8. Para trocar a senha, abra `api/config.php`, calcule o SHA-256 do texto `aliatto-2026` + sua nova senha (junto, sem espaço) e cole em `pass_hash`.

Depois que o servidor estiver funcionando, apague a senha antiga do arquivo `assets/js/aliatto.js` (constante USERS), pois ela só é usada no modo sem servidor.

## Login com Google
1. Google Cloud > APIs e serviços > Credenciais > ID do cliente OAuth (Aplicativo da Web).
2. Em "Origens JavaScript autorizadas", coloque o endereço https do site.
3. Cole o ID em `assets/js/config.js` (GOOGLE_CLIENT_ID) **e** em `api/config.php` (google_client_id), e liste os e-mails permitidos em `allowed_emails` no `api/config.php`. O servidor confere o token com o Google.

## Clima
A faixa abaixo do topo da página inicial usa a API gratuita Open-Meteo (sem chave). Mostra Brasília por padrão; o visitante pode usar a própria localização.

## Dados dos clientes
Clientes e documentos ainda ficam **somente no navegador** de quem usa (localStorage e IndexedDB). Faça backup no Dashboard. Para guardar com segurança no servidor e acessar de vários computadores, o próximo passo é mover esse cadastro para a API.
