<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Deque } from './types/Deque'

type SampleFile = {
  name: string
  url: string
  extension: string
}

const modules = import.meta.glob('../public/samples/*', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>

const files: SampleFile[] = Object.entries(modules)
  .map(([path]) => {
    const segments = path.split('/')
    const name = segments[segments.length - 1] ?? ''
    const extension = name.split('.').pop()?.toLowerCase() ?? ''
    // Use the URL provided by Vite's import.meta.glob
    const url = modules[path]

    return {
      name,
      url,
      extension
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const totalFiles = files.length

const query = ref('')
const debouncedQuery = ref('')

const inputBuffer = new Deque<string>()
const DEBOUNCE_DELAY = 100
let debounceHandle: ReturnType<typeof window.setTimeout> | undefined

watch(
  query,
  value => {
    inputBuffer.clear()
    for (const char of value) {
      inputBuffer.addLast(char)
    }

    if (debounceHandle) {
      window.clearTimeout(debounceHandle)
    }

    debounceHandle = window.setTimeout(() => {
      debouncedQuery.value = inputBuffer.toArray().join('')
    }, DEBOUNCE_DELAY)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (debounceHandle) {
    window.clearTimeout(debounceHandle)
  }
})

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  )

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  return matrix[a.length][b.length]
}

const filteredFiles = computed(() => {
  const term = debouncedQuery.value.trim().toLowerCase()

  if (!term) {
    return files
  }

  const matches = files
    .map(file => {
      const normalized = file.name.toLowerCase()
      const includes = normalized.includes(term)
      const startsWith = normalized.startsWith(term)
      const score = levenshtein(normalized, term)

      return {
        file,
        includes,
        startsWith,
        score
      }
    })
    .filter(entry => entry.includes)

  if (!matches.length) {
    return []
  }

  return matches
    .sort((a, b) => {
      if (a.startsWith !== b.startsWith) {
        return a.startsWith ? -1 : 1
      }

      if (a.score !== b.score) {
        return a.score - b.score
      }

      return a.file.name.localeCompare(b.file.name)
    })
    .map(entry => entry.file)
})

const currentPage = ref(1)

const viewportWidth = ref<typeof window extends undefined ? number : number>(
  typeof window !== 'undefined' ? window.innerWidth : 1024
)

let resizeHandler: (() => void) | null = null
onMounted(() => {
  resizeHandler = () => {
    viewportWidth.value = window.innerWidth
  }
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})

const itemsPerPage = computed(() => (viewportWidth.value < 640 ? 4 : 12))

const totalFiltered = computed(() => filteredFiles.value.length)
const pageCount = computed(() => (totalFiltered.value === 0 ? 1 : Math.ceil(totalFiltered.value / itemsPerPage.value)))

const paginatedFiles = computed(() => {
  if (!totalFiltered.value) {
    return []
  }
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredFiles.value.slice(start, start + itemsPerPage.value)
})

const rangeStart = computed(() => (totalFiltered.value ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0))
const rangeEnd = computed(() => (totalFiltered.value ? Math.min(rangeStart.value + itemsPerPage.value - 1, totalFiltered.value) : 0))
const displayedCount = computed(() => paginatedFiles.value.length)

const hasResults = computed(() => totalFiltered.value > 0)
const pageNumbers = computed(() => (hasResults.value ? Array.from({ length: pageCount.value }, (_, index) => index + 1) : []))

const setPage = (page: number) => {
  if (page < 1 || page > pageCount.value) return
  currentPage.value = page
}

const goToPrevious = () => setPage(currentPage.value - 1)
const goToNext = () => setPage(currentPage.value + 1)

watch(debouncedQuery, () => {
  setPage(1)
})

watch(itemsPerPage, () => {
  setPage(1)
})

watch(totalFiltered, () => {
  const maxPage = pageCount.value
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

const isImage = (file: SampleFile) => /\b(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i.test(file.extension)

// Transition the entire page on page change to avoid clipping
const pageKey = computed(() => `${debouncedQuery.value}|${currentPage.value}|${itemsPerPage.value}`)
</script>

<template>
  <div class="shell">
    <header class="hero">
      <h1 class="title">FILESEARCH</h1>
      <label class="search">
        <span class="search-label">pesquise aqui</span>
        <input
          v-model="query"
          type="search"
          autocomplete="off"
          placeholder="Digite o nome do arquivo"
        />
      </label>
      <p class="summary">
        <template v-if="hasResults">
          Exibindo
          <strong>{{ displayedCount }}</strong>
          de
          <strong>{{ totalFiltered }}</strong>
          resultados
          <span class="summary-range">(itens {{ rangeStart }} - {{ rangeEnd }})</span>
        </template>
        <template v-else>
          Nenhum resultado encontrado
        </template>
        <span class="summary-total"> · Total disponível: {{ totalFiles }}</span>
      </p>
    </header>

    <main class="results" aria-live="polite">
      <div v-if="hasResults">
        <transition name="fade" mode="out-in">
          <div class="file-grid" :key="pageKey">
            <article v-for="file in paginatedFiles" :key="file.url" class="file-card">
              <div class="thumbnail" role="presentation">
                <img v-if="isImage(file)" :src="file.url" :alt="file.name" loading="lazy" />
                <div v-else class="placeholder">{{ file.extension ? file.extension.toUpperCase() : 'FILE' }}</div>
              </div>
              <p class="file-name" :title="file.name">{{ file.name }}</p>
            </article>
          </div>
        </transition>

        <nav v-if="pageNumbers.length > 1" class="pagination" aria-label="Paginação de resultados">
          <button type="button" class="page-control" :disabled="currentPage === 1" @click="goToPrevious">
            Anterior
          </button>
          <ul class="page-list">
            <li v-for="page in pageNumbers" :key="page">
              <button
                type="button"
                class="page-number"
                :class="{ active: page === currentPage }"
                @click="setPage(page)"
              >
                {{ page }}
              </button>
            </li>
          </ul>
          <button type="button" class="page-control" :disabled="currentPage === pageNumbers.length" @click="goToNext">
            Próximo
          </button>
        </nav>
      </div>

      <div v-else class="empty">
        <p class="empty-label">Nada encontrado</p>
        <p class="empty-hint">Tente ajustar o termo da pesquisa ou limpar o campo.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.shell {
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(18px);
  border-radius: 32px;
  padding: clamp(2rem, 5vw, 3.5rem);
  box-shadow: 0 20px 60px rgba(25, 42, 72, 0.16);
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: center;
}

.title {
  font-size: clamp(2rem, 6vw, 3rem);
  letter-spacing: 0.12em;
  font-weight: 700;
}

.subtitle {
  color: rgba(24, 24, 24, 0.64);
  font-size: 1rem;
}

.search {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: left;
}

.search-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(24, 24, 24, 0.45);
}

.search input {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(46, 64, 87, 0.15);
  background: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search input:focus {
  outline: none;
  border-color: rgba(46, 64, 87, 0.35);
  box-shadow: 0 0 0 4px rgba(92, 143, 255, 0.2);
}

.summary {
  font-size: 0.95rem;
  color: rgba(24, 24, 24, 0.55);
}

.summary strong {
  color: rgba(24, 24, 24, 0.8);
}

.summary-total {
  display: inline-block;
  margin-left: 0.5rem;
  color: rgba(24, 24, 24, 0.4);
  font-size: 0.9rem;
}

.summary-range {
  margin-left: 0.35rem;
  font-size: 0.85rem;
  color: rgba(24, 24, 24, 0.45);
}

.results {
  min-height: 240px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
}

.file-card {
  background: rgba(248, 250, 255, 0.9);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 12px 28px rgba(25, 42, 72, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.file-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(25, 42, 72, 0.12);
}

.thumbnail {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(219, 229, 255, 0.9));
  display: grid;
  place-items: center;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  font-weight: 600;
  font-size: 1.1rem;
  color: rgba(24, 24, 24, 0.5);
  text-transform: uppercase;
}

.file-name {
  font-size: 0.95rem;
  text-align: center;
  color: rgba(24, 24, 24, 0.8);
  word-break: break-word;
}

.empty {
  border-radius: 24px;
  border: 1px dashed rgba(46, 64, 87, 0.25);
  padding: 3rem 1.5rem;
  text-align: center;
  color: rgba(24, 24, 24, 0.55);
  background: rgba(255, 255, 255, 0.65);
}

.empty-label {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.95rem;
}

.pagination {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-list {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.page-control,
.page-number {
  border: 1px solid rgba(46, 64, 87, 0.2);
  background: rgba(255, 255, 255, 0.85);
  color: rgba(24, 24, 24, 0.75);
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  font-size: 0.9rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.page-number.active {
  background: rgba(92, 143, 255, 0.2);
  border-color: rgba(92, 143, 255, 0.35);
  color: rgba(24, 24, 24, 0.9);
  font-weight: 600;
}

.page-control:disabled,
.page-number:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.page-control:not(:disabled):hover,
.page-number:not(:disabled):hover {
  border-color: rgba(46, 64, 87, 0.35);
  box-shadow: 0 6px 20px rgba(25, 42, 72, 0.12);
  transform: translateY(-2px);
}

.page-control:not(:disabled):focus-visible,
.page-number:not(:disabled):focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(92, 143, 255, 0.25);
  border-color: rgba(92, 143, 255, 0.35);
}

.page-number {
  min-width: 44px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (min-width: 768px) {
  .hero {
    text-align: left;
  }

  .summary {
    text-align: left;
  }
}
</style>
