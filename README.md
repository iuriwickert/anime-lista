# Minha Lista de Animes

Aplicativo simples feito com React Native e Expo para cadastrar e organizar animes. Os dados ficam em um banco MySQL, acessado por uma API em Node.js.

## Funcionalidades

- Listar e consultar animes salvos
- Cadastrar anime com título, gênero, nota de 0 a 10 e link da capa
- Editar um anime
- Excluir um anime
- Persistir os dados no MySQL por meio de uma API REST

As capas são informadas por URL; o projeto não faz upload de arquivos de imagem.

## Tecnologias

- React Native e Expo
- React Native Web para abrir o app no navegador
- Node.js, Express e mysql2 na API
- MySQL 8

## Requisitos

Instale na máquina:

- Node.js LTS, que inclui npm
- MySQL Server 8
- MySQL Workbench, para executar o script SQL

## Estrutura

~~~text
anime-lista/
├── App.js                  # Tela e operações do CRUD no app
├── package.json            # Dependências do aplicativo Expo
└── anime-api/
    ├── server.js           # Rotas da API
    ├── database.sql        # Banco, usuário e tabela
    ├── .env.example        # Exemplo de configuração local
    └── package.json        # Dependências da API
~~~

## Configuração inicial do MySQL

1. Abra o MySQL Workbench e conecte ao servidor local como root.
2. Abra anime-api/database.sql e execute o script pelo botão de raio.
3. O script cria o banco lista_animes, o usuário local anime_app e a tabela animes.

Antes de executar, substitua DEFINA_SUA_SENHA_LOCAL em anime-api/database.sql por uma senha escolhida por você. Use essa mesma senha no arquivo .env da API. Não publique sua senha real. Se o usuário anime_app já existir com outra senha, execute no Workbench (substituindo DEFINA_SUA_SENHA_LOCAL pela sua senha local):

~~~sql
ALTER USER 'anime_app'@'localhost'
IDENTIFIED BY 'DEFINA_SUA_SENHA_LOCAL';

GRANT SELECT, INSERT, UPDATE, DELETE
ON lista_animes.* TO 'anime_app'@'localhost';
~~~

## Iniciar o projeto neste computador

Abra o CMD ou terminal do VS Code na pasta anime-lista.

### 1. Instalar dependências do aplicativo

~~~cmd
npm install
~~~

### 2. Configurar e iniciar a API

Abra outro terminal:

~~~cmd
cd anime-api
npm install
copy .env.example .env
notepad .env
~~~

Edite o .env e troque DEFINA_SUA_SENHA_LOCAL em DB_PASSWORD pela mesma senha local definida no database.sql. Salve o arquivo e inicie a API:

~~~cmd
npm run dev
~~~

Deixe esse terminal aberto. A API usa a porta 3000. Para conferir a consulta, acesse http://localhost:3000/api/animes; uma lista vazia é exibida como [].

### 3. Iniciar o aplicativo no navegador

Abra um terceiro terminal posicionado na pasta principal anime-lista e rode:

~~~cmd
npx expo start --web
~~~

O Expo abrirá o app no navegador.

## Abrir o projeto em outro computador

1. Instale Node.js LTS e MySQL Server 8 na máquina da escola.
2. Abra o CMD e clone o repositório:

   ~~~cmd
   git clone URL_DO_REPOSITORIO
   cd anime-lista
   ~~~

3. No Workbench local, execute anime-api/database.sql como root.
4. Instale as dependências do app:

   ~~~cmd
   npm install
   ~~~

5. Abra outro terminal e configure a API:

   ~~~cmd
   cd anime-api
   npm install
   copy .env.example .env
   notepad .env
   ~~~

   Use no .env a mesma senha local definida para anime_app no MySQL dessa máquina. Nunca envie seu .env ao GitHub.

6. Inicie a API:

   ~~~cmd
   npm run dev
   ~~~

7. Abra um novo terminal na pasta principal anime-lista e inicie o Expo Web:

   ~~~cmd
   npx expo start --web
   ~~~

O banco MySQL e o arquivo .env são locais de cada computador; eles não vêm preenchidos pelo clone. O .env não deve ser enviado ao GitHub.

## Usar Expo Go no celular

O endereço padrão do app é http://localhost:3000/api/animes, adequado para o navegador no mesmo computador. Para usar o Expo Go no celular, altere API_URL no início de App.js para o endereço IPv4 do computador, por exemplo http://192.168.0.15:3000/api/animes. O celular e o computador precisam estar na mesma rede Wi-Fi.

## Rotas CRUD

| Método | Rota | Ação |
| --- | --- | --- |
| GET | /api/animes | Lista os animes |
| GET | /api/animes/:id | Consulta um anime |
| POST | /api/animes | Cadastra um anime |
| PUT | /api/animes/:id | Atualiza um anime |
| DELETE | /api/animes/:id | Exclui um anime |

O app envia e recebe dados JSON da API. A API usa consultas parametrizadas para ler e alterar os registros do MySQL.


