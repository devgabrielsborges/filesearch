# 📂 Filesearch

**Filesearch** é uma ferramenta de busca de arquivos locais desenvolvida em  **TypeScript** , **Vue 3** e  **Vite** .

O sistema permite buscar arquivos de forma rápida e intuitiva, exibindo os resultados em **ordem de similaridade** com o termo pesquisado.

Para otimizar a performance, utiliza um **deque** para armazenar os caracteres digitados e implementa **debouncing** para evitar buscas desnecessárias.

---

## 🚀 Funcionalidades

*  **Busca eficiente** em lista de arquivos locais.
*  **Resultados ordenados por relevância** (similaridade com a pesquisa).
*  **Deque** para manipulação dinâmica da entrada de caracteres.
*  **Debouncing inteligente** para reduzir buscas excessivas.
*  Construído com **Vue 3 + Vite** para máxima performance e DX.

---

## 📖 Como funciona

1. O usuário digita os caracteres do termo de busca.
2. O **deque** armazena os caracteres em tempo real.
3. O **debouncing** aguarda o usuário parar de digitar antes de disparar a busca.
4. Os arquivos encontrados são exibidos em ordem de  **similaridade** .

---

## 🛠️ Tecnologias utilizadas

* [TypeScript](https://www.typescriptlang.org/)
* [Vue 3](https://vuejs.org/) (Composition API)
* [Vite](https://vitejs.dev/)
* Estruturas de dados: **Deque**
* Algoritmos de similaridade (ex.: `String.prototype.localeCompare`, `Levenshtein`, `SequenceMatcher`, etc.)

---

## 📦 Instalação e execução

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/filesearch.git
cd filesearch
```

Instale as dependências:

```bash
npm install
# ou
yarn install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Build para produção:

```bash
npm run build
```

---