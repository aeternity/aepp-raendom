<template>
  <div class="giphy-search">
    <SearchInput
      v-model="query"
      placeholder="Search GIPHY"
      sided
      @input="newSearch"
    />
    <div
      v-if="resultsCount"
      class="results-count"
    >
      {{ resultsCount }}
    </div>
    <div
      class="results"
      @scroll="loadMore($event.target)"
    >
      <div
        v-for="(item, colIndex) in Array(3)"
        :key="colIndex"
        class="gif-column"
      >
        <template v-for="({ still, animated, original }, index) in results">
          <img
            v-if="index % 3 === colIndex"
            :key="index"
            :src="hovered === index ? animated : still"
            @mouseover="hovered = index"
            @mouseleave="hovered = null"
            @click="$emit('add-gif', original)"
          >
        </template>
      </div>
    </div>
    <Loading v-if="loading" />
  </div>
</template>

<script>
import { fetchJson } from '../../../utils';
import Loading from '../../Loading.vue';
import SearchInput from '../SearchInput.vue';

export default {
  components: {
    Loading,
    SearchInput,
  },
  data() {
    return {
      query: '',
      results: [],
      offset: 0,
      resultsCount: '',
      loading: false,
      hovered: null,
      focused: false,
    };
  },
  mounted() { this.newSearch(); },
  methods: {
    newSearch() {
      this.resultsCount = '';
      this.loading = true;
      this.results = [];
      this.offset = 0;
      this.search();
    },
    async search() {
      try {
        const url = new URL(`https://api.giphy.com/v1/gifs/${this.query ? 'search' : 'trending'}`);
        if (this.query) url.searchParams.set('q', this.query);
        url.searchParams.set('limit', 10);
        url.searchParams.set('offset', this.offset);
        url.searchParams.set('api_key', process.env.VUE_APP_GIPHY_API_KEY);
        const { data, pagination } = await fetchJson(url);
        this.resultsCount = `${pagination.total_count.toLocaleString()} Results`;
        this.results.push(...data.map(({ images }) => ({
          still: images.fixed_width_still.url,
          animated: images.fixed_width.url,
          original: images.original.url,
        })));
      } finally { this.loading = false; }
    },
    loadMore(element) {
      const { clientHeight, scrollTop, scrollHeight } = element;
      if (clientHeight + scrollTop >= scrollHeight - 1 && this.loading === false) {
        this.loading = true;
        this.offset += 10;
        this.search();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.giphy-search {
  position: relative;
  margin: 0.5rem;

  .search-input {
    border-radius: 0.25rem 0.25rem 0 0;
  }

  .results-count {
    background: $light_color;
    text-align: right;
  }

  .results {
    height: 20rem;
    display: flex;
    overflow-y: scroll;
    scrollbar-color: $light_font_color $actions_ribbon_background_color;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 0.25rem;
    }

    &::-webkit-scrollbar-thumb {
      background: $light_font_color;
      border-radius: 0.25rem;
    }

    img {
      background-color: $article_content_color;
      padding: 0.2rem;
      width: 100%;
      display: block;
      cursor: pointer;

      &:hover {
        filter: brightness(1.3);
      }
    }
  }

  .loading {
    position: absolute;
    bottom: 0;
  }
}
</style>
