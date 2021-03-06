<template>
  <PageLayout :content-transition-name="contentTransitionName" has-back :back-fn="backFn">
    <template #content>
      <div class="w-full h-full grid relative justify-center subtitle-selection-content--container">
        <div style="grid-area: filter-bar" class="pt-3 pb-2 bg-primary-50">
          <div class="w-full flex pr-2">
            <div class="w-full">
              <InputField v-model="filter" placeholder="Filter subtitles" placeholder-icon="filter" class="px-2" />
            </div>
            <OnlyHearingImpairedFilterButton v-model:only-hearing-impaired="onlyHearingImpaired" />
          </div>
          <LanguageSelect v-model:selected="language" v-model:show="showLanguageSelection"></LanguageSelect>
        </div>
        <div v-show="showSelection" class="w-full h-full overflow-hidden bg-surface-700 bg-opacity-50 backdrop-filter-blur" style="grid-row: 3/5; grid-column: 1/4" />
        <div style="grid-area: loading" class="flex items-end flex-wrap bg-primary-50 shadow-md">
          <LoadingBar :loading="loading" class="w-full" />
        </div>
        <div v-if="filteredEntries.length" class="overflow-y-auto" style="grid-area: search-results">
          <div v-for="(item, index) in filteredEntries" :key="index">
            <Divider v-if="index === 0" style="grid-column: 1/3" class="border-surface-200" />
            <SubtitleSearchEntry :item="item" @select="select" />
            <Divider class="border-surface-200" />
          </div>
        </div>
        <div v-else-if="!loading" class="self-center text-center leading-loose" style="grid-area: search-results">
          <div>Sorry, no subtitle found.</div>
          <div>(╯°□°)╯︵ ┻━┻</div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref, watch } from 'vue';
import { searchQuery, SubtitleSearchForMoviesVariables } from './searchQuery';
import { download } from '@/search/download';

import SubtitleSearchEntry from '@/search/components/SubtitleSearchEntry.vue';
import LanguageSelect from '@/search/components/LanguageSelect.vue';

import Divider from '@/components/Divider.vue';
import PageLayout from '@/components/PageLayout.vue';
import LoadingBar from '@/components/LoadingBar.vue';
import InputField from '@/components/InputField.vue';
import { SubtitleStore } from '@/subtitle/store';
import { SubtitleSearchFragmentResult_data } from '@/search/__gen_gql/SubtitleSearchFragmentResult';
import OnlyHearingImpairedFilterButton from '@/search/components/OnlyHearingImpairedFilterButton.vue';
import { AppStore } from '@/app/store';
import { ISO639, SearchStore } from '@/search/store';
import { NavigationStore } from '@/navigation/store';
import { from, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { useUnmountObservable } from '@/composables';

export default defineComponent({
  components: {
    OnlyHearingImpairedFilterButton,
    InputField,
    LanguageSelect,
    LoadingBar,
    Divider,
    SubtitleSearchEntry,
    PageLayout
  },
  props: {
    searchQuery: {
      type: String as PropType<string>,
      required: true
    },
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    },
    tmdb_id: {
      type: String as PropType<string>,
      required: true
    },
    media_type: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup(props) {
    const appStore = inject<AppStore>('appStore');
    const searchStore = inject<SearchStore>('searchStore');
    const subtitleStore = inject<SubtitleStore>('subtitleStore');
    const navigationStore = inject<NavigationStore>('navigationStore');
    const unmountObservable = useUnmountObservable();

    if (!appStore || !searchStore || !subtitleStore || !navigationStore) {
      throw new Error('inject failed');
    }
    const filter = ref('');

    const language = ref<ISO639>(searchStore.getters.getPreferredLanguageAsIso639.value);
    const showLanguageSelection = ref(false);

    const entries = ref<SubtitleSearchFragmentResult_data[]>([]);

    const loading = ref(true);

    const searchQuerySubject = new Subject<SubtitleSearchForMoviesVariables>();
    searchQuerySubject
      .pipe(
        tap(() => (loading.value = true)),
        switchMap((variables) => from(searchQuery(variables))),
        tap((result) => {
          loading.value = false;
          entries.value = result.subtitleSearch.data;
        }),
        takeUntil(unmountObservable)
      )
      .subscribe();

    watch(
      language,
      (language) =>
        searchQuerySubject.next({
          language: language.iso639_2,
          tmdb_id: props.tmdb_id
        }),
      { immediate: true }
    );

    const onlyHearingImpaired = ref(false);

    return {
      filter,
      onlyHearingImpaired,

      language,
      showLanguageSelection,

      showSelection: computed(() => showLanguageSelection.value),

      loading,
      entries,
      filteredEntries: computed(() =>
        entries.value.filter(({ attributes }) => {
          if (filter.value === '') {
            return onlyHearingImpaired.value ? attributes.hearing_impaired : true;
          }
          const intermediate = attributes.files[0].file_name?.toLowerCase().includes(filter.value.toLowerCase()) ?? false;
          return onlyHearingImpaired.value ? intermediate && attributes.hearing_impaired : intermediate;
        })
      ),
      select: (openSubtitle: SubtitleSearchFragmentResult_data) => {
        appStore.actions.setState({ state: 'SELECTED' });
        appStore.actions.setSrc({ src: 'SEARCH' });
        searchStore.actions.setPreferredLanguage({ preferredLanguage: language.value.iso639_2 });
        searchStore.actions.selectOpenSubtitle({
          format: openSubtitle.attributes.format ?? 'srt',
          languageName: openSubtitle.attributes.language,
          rating: openSubtitle.attributes.ratings.toString(),
          websiteLink: openSubtitle.attributes.url
        });

        download(openSubtitle)
          .then(({ raw, format }) => {
            subtitleStore.actions.setRaw({
              raw,
              format,
              id: openSubtitle.attributes.files[0].file_name,
              language: language.value.iso639_2
            });
            subtitleStore.actions.parse();
          })
          .catch(() => appStore.actions.setState({ state: 'ERROR' }));

        navigationStore.actions.toHome({ contentTransitionName: 'content-navigate-select-to-home' });
      },
      backFn: (): void =>
        navigationStore.actions.toMovieTvSearch({
          contentTransitionName: 'content-navigate-shallow',
          query: props.searchQuery
        })
    };
  }
});
</script>

<style scoped>
.subtitle-selection-content--container {
  min-height: 300px;
  max-height: 500px;
  grid-template-areas:
    'filter-bar'
    'loading'
    'search-results';
  grid-template-rows: auto 8px 1fr;
  grid-template-columns: 1fr;
}
</style>
