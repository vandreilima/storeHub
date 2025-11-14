Este projeto suporta três idiomas:

- 🇧🇷 Português (pt) - Idioma padrão
- 🇺🇸 Inglês (en)
- 🇪🇸 Espanhol (es)

## Como usar

### 1. No template HTML

```html
<h1>{{ 'common.welcome' | translate }}</h1>

<p>{{ 'forms.password_min_length' | translate: {min: '8'} }}</p>
```

### 2. No componente TypeScript

```typescript
import { TranslationService } from './shared/services/translation.service';

constructor(private translationService: TranslationService) {}

// Obter tradução
const message = this.translationService.translate('common.welcome');

// Obter tradução com parâmetros
const passwordMessage = this.translationService.translate('forms.password_min_length', { min: '8' });

// Mudar idioma
this.translationService.setLanguage('en');
```

### 3. Seletor de idioma

```html
<app-language-selector></app-language-selector>
```

## Estrutura dos arquivos de tradução

Os arquivos JSON estão organizados em seções:

- `common`: Textos comuns (botões, ações básicas)
- `navigation`: Itens de navegação
- `messages`: Mensagens do sistema
- `forms`: Validações e labels de formulários

## Adicionando novas traduções

1. Adicione a chave no arquivo `pt.json`
2. Adicione as traduções correspondentes em `en.json` e `es.json`
3. Use a chave no template ou componente

Exemplo:

```json
// pt.json
{
  "user": {
    "profile": "Perfil do Usuário"
  }
}

// en.json
{
  "user": {
    "profile": "User Profile"
  }
}

// es.json
{
  "user": {
    "profile": "Perfil de Usuario"
  }
}
```
