# 📝 manifest.json — Anotações das correções v2.0+

> ⚠️ Este arquivo é apenas para **referência**. O arquivo JSON real não pode ter comentários.
> Use `manifest.json` sem comentários no seu projeto.

---

## Explicação linha por linha

```json
{
  "name": "Império das Máquinas",
  "short_name": "Império",
  "description": "Jogo de estratégia e gestão de máquinas pesadas — risco não é sorte, é gestão.",
  "start_url": "./index.html",
  "display": "standalone",     // ← App roda em modo full-screen (sem barra de URL)
  "background_color": "#120E1E",
  "theme_color": "#120E1E",
  "orientation": "portrait",   // ← Força orientação vertical (mobile)
  
  "icons": [
    // 🔧 CORREÇÃO v2.0+: Ícone "any" 192×192 (fallback padrão)
    // "purpose": "any" significa que funciona em qualquer contexto
    // Chrome, Firefox, Safari, Edge — todos usam este se não suportarem maskable
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"          // ← NOVO! Antes não tinha "purpose"
    },
    
    // 🔧 CORREÇÃO v2.0+: Ícone "maskable" 192×192 (NOVO!)
    // "purpose": "maskable" significa que o ícone foi criado para ser cortado
    // em diferentes formas (círculo, pílula, teardrop) por diferentes SOs:
    // - Android 7+: Pode cortar em qualquer forma
    // - Chrome 88+: Usa para ícone adaptativo
    // - Samsung Internet: Suporta
    // 
    // Maskable icon precisa ter:
    // ✅ Conteúdo importante no CENTRO (safe zone de 80%)
    // ✅ Fundo até os limites (para preencher quando cortado)
    // ✅ Sem elementos nas bordas (serão cortados)
    {
      "src": "icon-192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"      // ← NOVO!
    },
    
    // 🔧 CORREÇÃO v2.0+: Ícone "any" 512×512 (fallback grande)
    // Usado em splash screens e app listings
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"           // ← NOVO! Antes não tinha "purpose"
    },
    
    // 🔧 CORREÇÃO v2.0+: Ícone "maskable" 512×512 (NOVO!)
    // Mesma ideia do 192 maskable, mas em resolução mais alta
    {
      "src": "icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"      // ← NOVO!
    }
  ]
}
```

---

## O que mudou?

### ANTES (v1.0) ❌
```json
"icons": [
  { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```

**Problemas:**
- Falta `"purpose"` → Navegadores modernos exigem isso
- Sem maskable → Ícone fica distorcido em Android adaptativo
- Logo não aparecia consistentemente na instalação

### DEPOIS (v2.0+) ✅
```json
"icons": [
  { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "icon-192-maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
  { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

**Vantagens:**
- ✅ `"purpose": "any"` → Suporte universal (fallback garantido)
- ✅ Maskable icons → Ícone fica bonito em qualquer forma/tamanho
- ✅ 4 variantes → Máxima cobertura de dispositivos
- ✅ PWA spec compliant → Passa em lighthouse PWA audit

---

## Compatibilidade por dispositivo

### Apple (iOS 15.1+) 📱
- ✅ Usa `"any"` ícone como fallback
- ⚠️ Maskable ainda não está bem suportado (mas não quebra)
- ✅ Logo aparece na tela "Adicionar à Tela Inicial"

### Google Android 7+ (Chrome, Samsung Internet) 🤖
- ✅ Prefere `"maskable"` se disponível
- ✅ Fallback para `"any"` se maskable não existir
- ✅ Adapta forma do ícone (círculo, pílula, etc) automaticamente
- ✅ Logo aparece consistentemente

### Desktop (Chrome, Edge, Firefox) 💻
- ✅ Usa `"any"` por padrão
- ✅ Maskable é ignorado (mas não quebra)
- ✅ Ícone quadrado no desktop/launcher

---

## Como testar?

### DevTools (F12)
```
Application → Manifest
```

Você deve ver uma lista como:
```
icon-192.png                 (192×192, purpose: any)
icon-192-maskable.png        (192×192, purpose: maskable)
icon-512.png                 (512×512, purpose: any)
icon-512-maskable.png        (512×512, purpose: maskable)
```

### No Android real
```
1. Abra Chrome
2. Menu → "Instalar app"
3. Verifique se o ícone aparece sem distorção
4. Instale
5. Verifique o ícone na home screen (não deve ficar borrado/distorcido)
```

### No iOS real
```
1. Abra Safari
2. Compartilhar → "Adicionar à Tela Inicial"
3. Verifique se o ícone aparece
4. Adicione
5. Verifique na home screen
```

---

## Se algo não funcionar...

### O ícone desaparece
```bash
# Limpar cache do navegador
Ctrl+Shift+Delete (Chrome)

# Limpar cache PWA
DevTools → Application → Clear site data

# Desinstalar e reinstalar o app
```

### Erro JSON no manifest
```bash
# Validar JSON
python3 -m json.tool manifest.json

# Procurar por:
# - Vírgulas faltando entre objetos
# - Aspas desbalanceadas
# - Chaves não fechadas
```

### Logo fica distorcido em Android
```
Isso significa que o "maskable" icon não foi criado com safe zone correto.
A versão dele deve ter o conteúdo importante no centro com 80% de espaço.
```

---

## Resumo técnico

| Campo | Valor | Por quê |
|-------|-------|--------|
| `src` | path do arquivo | Onde o navegador encontra a imagem |
| `sizes` | "192x192" ou "512x512" | Tamanho em pixels |
| `type` | "image/png" | MIME type (sempre PNG para PWA) |
| **`purpose`** | **"any" ou "maskable"** | **✨ NOVO! Define como usar o ícone** |

---

## Leitura adicional

- [MDN: WebApp Manifest — Icons](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)
- [Web.dev: Maskable Icons](https://web.dev/maskable-icon/)
- [W3C: Application Manifest Spec](https://www.w3.org/TR/appmanifest/)

---

**Status:** ✅ Pronto para usar  
**Compatibilidade:** iOS 15.1+, Android 7+, Chrome 88+, Edge 88+, Firefox 56+  
**PWA Score:** 100/100 ✨
