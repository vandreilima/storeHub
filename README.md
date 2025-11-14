<div align="center">

# StoreHub

**Simulação de e-commerce real com Angular**

[![Deploy](https://img.shields.io/badge/deploy-online-success?logo=firebase)](https://store-hub-online.web.app)
[![Angular](https://img.shields.io/badge/Angular-v20-red?logo=angular)](https://angular.dev)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-v20-blue?logo=prime)](https://primeng.org)

**[Acessar aplicação](https://store-hub-online.web.app)**

</div>

---

## Sobre o Projeto

Este projeto tem como objetivo simular um caso real de e-commerce, portanto temos nele métodos de segurança para impedir usuários não autorizados de acessar telas privadas. Como é um cenário fake, todo usuário logado recebe a role "admin", mas em um caso real ele viria do servidor.

Logo após o login chamamos uma rota para a identificação do usuário e coleta das roles, conforme o padrão OAuth solicita.

---

## Tecnologias Utilizadas

- **Angular** v20
- **PrimeNG** v20
- **jwt-decode** v4
- **Fake Store API**

---

## Credenciais de Acesso

Para realizar login nesse projeto você pode utilizar a seguinte conta:

```json
{
  "username": "johnd",
  "password": "m38rmF$"
}
```

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── auth/                           # Módulo de autenticação
│   │   ├── sigin-in/                   # Componente de login
│   │   ├── sigin-up/                   # Componente de cadastro
│   │   └── forgot-password/            # Componente de recuperação de senha
│   │
│   ├── features/                       # Módulos de funcionalidades
│   │   ├── products/                   # Listagem e gerenciamento de produtos
│   │   └── shop/                       # Loja virtual
│   │       └── components/
│   │           └── product-detail-modal/  # Modal de detalhes do produto
│   │
│   ├── shared/                         # Recursos compartilhados
│   │   ├── components/                 # Componentes reutilizáveis
│   │   │   ├── cart/                   # Componente do carrinho de compras
│   │   │   ├── cookie-consent/         # Componente de consentimento de cookies
│   │   │   ├── language-selector/      # Seletor de idioma
│   │   │   └── products/
│   │   │       └── filters/            # Filtros de produtos
│   │   │
│   │   ├── guards/                     # Guards de rota
│   │   │   ├── auth.guard.ts           # Proteção de rotas autenticadas
│   │   │   └── config-complete.guard.ts # Validação de configurações
│   │   │
│   │   ├── interceptors/               # HTTP Interceptors
│   │   │   ├── auth.interceptor.ts     # Interceptor para adicionar token JWT
│   │   │   └── error.interceptor.ts    # Tratamento global de erros HTTP
│   │   │
│   │   ├── pipes/                      # Pipes customizados
│   │   │   └── translate.pipe.ts       # Pipe de tradução
│   │   │
│   │   ├── services/                   # Serviços compartilhados
│   │   │   ├── auth/                   # Serviço de autenticação
│   │   │   ├── cart/                   # Serviços do carrinho (API e State)
│   │   │   ├── consent/                # Serviço de consentimento
│   │   │   ├── products/               # Serviços de produtos (API e State)
│   │   │   └── user/                   # Serviço de usuário
│   │   │
│   │   ├── translate/                  # Serviços de internacionalização
│   │   │   ├── translation-loader.service.ts
│   │   │   └── translation.service.ts
│   │   │
│   │   └── utils/                      # Utilitários
│   │       └── form.utils.ts           # Funções auxiliares para formulários
│   │
│   ├── types/                          # Definições de tipos TypeScript
│   │   ├── auth.interface.d.ts         # Interfaces de autenticação
│   │   ├── cart.interface.d.ts         # Interfaces do carrinho
│   │   ├── product.d.ts                # Tipos de produtos
│   │   └── user.interface.d.ts         # Interfaces de usuário
│   │
│   ├── privacy-policy/                 # Página de política de privacidade
│   ├── app.config.ts                   # Configurações da aplicação
│   ├── app.routes.ts                   # Definição de rotas
│   └── app.ts                          # Componente raiz
│
├── lang/                               # Arquivos de tradução
│   └── i18n/
│       ├── pt.json                     # Traduções em português
│       ├── en.json                     # Traduções em inglês
│       └── es.json                     # Traduções em espanhol
│
├── styles/                             # Estilos globais
│   ├── primeng-preset.ts               # Preset do PrimeNG
│   ├── primeng-theme.scss              # Tema customizado do PrimeNG
│   ├── design-tokens.ts                # Tokens de design
│   └── _common.scss                    # Estilos comuns
│
├── main.ts                             # Ponto de entrada da aplicação
├── index.html                          # HTML principal
└── styles.scss                         # Estilos globais
```

### Descrição das Pastas Principais

- **auth/** - Contém todas as páginas e componentes relacionados à autenticação (login, cadastro, recuperação de senha)
- **features/** - Módulos de funcionalidades principais da aplicação (produtos, loja)
- **shared/** - Recursos compartilhados entre diferentes módulos:
  - **guards/** - Proteção de rotas e validações de acesso
  - **interceptors/** - Interceptação de requisições HTTP para autenticação e tratamento de erros
  - **services/** - Lógica de negócio e comunicação com API (padrão API + State)
  - **components/** - Componentes reutilizáveis em toda a aplicação
- **types/** - Definições de tipos e interfaces TypeScript para type-safety
- **lang/** - Arquivos de internacionalização (i18n) para suporte multi-idioma
- **styles/** - Configurações de tema e estilos globais do PrimeNG

## Processo de Desenvolvimento

O desenvolvimento deste projeto seguiu uma abordagem estruturada em etapas:

1. **Estilização e Design System** - Inicialmente foi desenvolvida toda a parte de estilização, incluindo a instalação e configuração do PrimeNG, personalização dos design tokens (cores e principalmente espaçamentos) para criar uma identidade visual consistente.

2. **Autenticação e Segurança** - Em seguida, foi construído o módulo de autenticação completo com guards de rota, implementando métodos de segurança robustos para gerenciar o estado de autenticação e proteger rotas privadas.

3. **Funcionalidades Principais** - Por fim, foram desenvolvidas as principais telas da aplicação, como a Loja (Shop) e a listagem de Produtos, integrando todos os componentes e serviços criados anteriormente.

---

## Deploy

A aplicação está hospedada no Firebase:

**https://store-hub-online.web.app**
