# FilaZero-WebSite

Landing page publica do Fila Zero.

## Desenvolvimento local

1. Instale as dependencias:
	`npm install`
2. Rode o servidor local:
	`npm run dev`
3. Abra `http://localhost:3000`

## Deploy no Railway

Este projeto esta preparado para deploy direto no Railway via Nixpacks.

### Como subir

1. Envie este repositorio para o GitHub.
2. No Railway, clique em `New Project`.
3. Escolha `Deploy from GitHub repo`.
4. Selecione o repositorio `FilaZero-WebSite`.
5. O Railway vai detectar o `package.json` automaticamente.

### Configuracao esperada

- Build command: `npm install`
- Start command: `npm start`
- Porta: Railway injeta `PORT` automaticamente

### Observacoes

- O site e estatico, entao nao precisa banco nem variaveis de ambiente para subir.
- O formulario atual e apenas front-end e nao envia dados para backend ainda.

## Deploy na Vercel

Este projeto tambem esta pronto para deploy na Vercel.

### Como subir

1. Envie este repositorio para o GitHub.
2. Na Vercel, clique em `Add New...` > `Project`.
3. Importe o repositorio `FilaZero-WebSite`.
4. Se for monorepo, configure `Root Directory` para `FilaZero-WebSite`.
5. Clique em `Deploy`.

### Configuracao esperada

- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: vazio
- Install Command: vazio

### Observacoes

- A Vercel consegue servir este site como estatico sem backend adicional.
- O arquivo `vercel.json` ja foi incluido para manter URLs limpas.

## Estrutura principal

- `index.html`: landing page
- `styles.css`: estilos e responsividade
- `script.js`: interacoes e galerias
- `assets/screens/landing`: screenshots prontos para uso publico

