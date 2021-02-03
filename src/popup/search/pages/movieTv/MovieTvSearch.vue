<template>
  <PageLayout :content-transition-name="contentTransitionName" :has-back="videoCount > 1" :back-fn="backFn">
    <template #toolbar>
      <a v-if="videoCount === 1" class="self-center pr-4" @click="toSettings()">
        <fa icon="cog" class="h-icon hover:text-on-primary-hover-500"></fa>
      </a>
    </template>
    <template #content>
      <div class="w-full h-full grid relative justify-center search-content--container">
        <div style="grid-area: search-bar" class="pt-3 pb-2 bg-primary-50">
          <InputField v-model="internalQuery" class="px-2" placeholder-icon="search" placeholder="Search movie or series" />
          <div v-show="getVideoName() !== ''" class="px-5 mt-2 leading-normal text-sm">
            <div class="italic">Search Suggestion</div>
            <a class="relative text-primary-700 hover:underline italic" @click="changeQueryToSuggested">{{ getVideoName() }}</a>
          </div>
        </div>
        <div style="grid-area: loading" class="flex items-end flex-wrap bg-primary-50 shadow-md">
          <LoadingBar :loading="loading && internalQuery !== ''" class="w-full" />
        </div>
        <div v-if="searchResults.length" class="overflow-y-auto" style="grid-area: search-results">
          <div v-for="(item, index) in searchResults" :key="index">
            <Divider v-if="index === 0" style="grid-column: 1/3" class="border-surface-200" />
            <MovieTvSearchEntry :item="item" @select="select" />
            <Divider style="grid-column: 1/3" class="border-surface-200" />
          </div>
        </div>
        <div v-else-if="internalQuery === ''" style="grid-area: search-results; grid-column: 1/2; grid-row: 3/4" class="my-4">
          <FilePick v-model:query="internalQuery" />
        </div>
        <div v-else-if="!loading" class="self-center text-center leading-loose" style="grid-area: search-results">
          <div>Sorry, no movies or tv shows found</div>
          <div>(╯°□°)╯︵ ┻━┻</div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, ref, watch } from 'vue';
import { searchQuery, SearchQueryResultEntry } from './searchQuery';
import { debounce } from '@/composables';
import { SearchStore } from '@/search/store';
import { NavigationStore } from '@/navigation/store';
import { CurrentSelectedVideoSrcStore } from '@/currentSelectedVideoSrc/store';
import { getVideoName } from '@/util/name';
import { VideoStore } from '@/video/store';

import FilePick from '@/file/components/FilePick.vue';
import PageLayout from '@/components/PageLayout.vue';
import Divider from '@/components/Divider.vue';
import MovieTvSearchEntry from './MovieTvSearchEntry.vue';
import LoadingBar from '@/components/LoadingBar.vue';
import { default as InputField } from '@/components/InputField.vue';

export default defineComponent({
  components: {
    InputField,
    LoadingBar,
    FilePick,
    PageLayout,
    Divider,
    MovieTvSearchEntry
  },
  props: {
    query: {
      type: String as PropType<string>,
      required: false,
      default: ''
    },
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup(props) {
    const searchStore = inject<SearchStore>('searchStore');
    const navigationStore = inject<NavigationStore>('navigationStore');
    const currentSelectedVideoSrcStore = inject<CurrentSelectedVideoSrcStore>('currentSelectedVideoSrcStore');
    const videoStore = inject<VideoStore>('videoStore');

    if (!searchStore || !navigationStore || !currentSelectedVideoSrcStore || !videoStore) {
      throw new Error('inject failed');
    }

    const internalQuery = ref(props.query ?? '');
    const searchResults = ref([]);
    const loading = ref(false);

    const { fn: req } = debounce<SearchQueryResultEntry[]>({
      fn: searchQuery,
      timeout: 1500,
      resultRef: searchResults,
      loadingRef: loading
    });

    watch(internalQuery, (query) => req({ query }), { immediate: true });

    return {
      internalQuery,
      searchResults,
      loading,
      videoCount: videoStore.getters.videoCount,
      getVideoName,
      toSettings: navigationStore.actions.toSettings,
      changeQueryToSuggested: () => (internalQuery.value = getVideoName()),
      select: (tmdb: SearchQueryResultEntry): void => {
        searchStore.actions.setTmdbInSelection({
          tmdb_id: tmdb.tmdb_id,
          media_type: tmdb.media_type,
          poster_path: tmdb.poster_path,
          release_date: tmdb.release_date ?? '',
          title: tmdb.title,
          vote_average: tmdb.vote_average ?? 0
        });
        const to = tmdb.media_type === 'movie' ? navigationStore.actions.toSubtitleSearchForMovies : navigationStore.actions.toSubtitleSearchForSeries;
        to({
          tmdb_id: tmdb.tmdb_id,
          media_type: tmdb.media_type,
          searchQuery: internalQuery.value,
          contentTransitionName: 'content-navigate-deeper'
        });
      },
      backFn: (): void => {
        currentSelectedVideoSrcStore.actions.reset();
        navigationStore.actions.toHome();
      }
    };
  }
});
</script>

<style scoped>
.search-content--container {
  min-height: 300px;
  max-height: 500px;
  grid-template-areas:
    'search-bar'
    'loading'
    'search-results';
  grid-template-rows: auto 8px 1fr;
  grid-template-columns: 1fr;
}
</style>