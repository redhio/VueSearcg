<template>
  <div class="app-container">


    <!-- Title Bar Header -->
    <div class="mui-page-title">

            <h1>RCMP CryptoTracker</h1>
            <h2>Enter your wallet address below!</h2>
    </div>

    <!-- Search Bar Header -->
    <div class="mui-panel">
      <div class="mui-textfield">
        <input v-model="searchTerm" type="text" v-on:keyup="onSearchInput()">
        <label>Search</label>
      </div>
    </div>

  <!-- Search Metadata Card -->
  <div class="mui-panel">
    <div class="mui--text-headline">{{ numHits }} Hits</div>
    <div class="mui--text-subhead">Displaying Results {{ searchOffset }} - {{ searchOffset + 9 }}</div>
  </div>

    <!-- Chart -->
    <div class='chart'>
      <chart-sankey :data='chartData' :config='chartConfig'></chart-sankey>
    </div>

    <!-- Top Pagination Card -->
    <div class="mui-panel pagination-panel">
        <button class="mui-btn mui-btn--flat" v-on:click="prevResultsPage()">Prev Page</button>
        <button class="mui-btn mui-btn--flat" v-on:click="nextResultsPage()">Next Page</button>
    </div>

    <!-- Search Results Card List -->
    <div class="search-results" ref="searchResults">
      <div class="mui-panel" v-for="hit in searchResults" v-on:click="showBookModal(hit)">
        <div class="mui--text-title" v-html="hit.highlight.text[0]"></div>
        <div class="mui-divider"></div>
        <div class="mui--text-subhead">{{ hit._source.title }} - {{ hit._source.author }}</div>
        <div class="mui--text-body2">Location {{ hit._source.location }}</div>
      </div>
    </div>

    <!-- Bottom Pagination Card -->
      <div class="mui-panel pagination-panel">
          <button class="mui-btn mui-btn--flat" v-on:click="onSearchInput()">Refresh</button>
          <button class="mui-btn mui-btn--flat" v-on:click="exportData()">Export Results</button>
      </div>



    <!-- Book Paragraphs Modal Window -->
    <div v-if="selectedParagraph" ref="bookModal" class="book-modal">
      <div class="paragraphs-container">
        <!-- Book Section Metadata -->
        <div class="title-row">
          <div class="mui--text-display2 all-caps">{{ selectedParagraph._source.title }}</div>
          <div class="mui--text-display1">{{ selectedParagraph._source.author }}</div>
        </div>
        <br>
        <div class="mui-divider"></div>
        <div class="mui--text-subhead locations-label">Locations {{ bookOffset - 5 }} to {{ bookOffset + 5 }}</div>
        <div class="mui-divider"></div>
        <br>

        <!-- Book Paragraphs -->
        <div v-for="paragraph in paragraphs">
          <div v-if="paragraph._source.location === selectedParagraph._source.location" class="mui--text-body2">
            <strong>{{ paragraph._source.text }}</strong>
          </div>
          <div v-else class="mui--text-body1">
            {{ paragraph._source.text }}
          </div>
          <br>
        </div>
      </div>

      <!-- Book Pagination Footer -->
      <div class="modal-footer">
            <button class="mui-btn mui-btn--flat" v-on:click="onSearchInput()">Refresh</button>
            <button class="mui-btn mui-btn--flat" v-on:click="exportData()">Export Results</button>
        </div>
  </div>
  </div>
</template>

<script>
    import { ChartSankey } from 'vue-d2b';

    export default {
      data () {
        return {
          baseUrl: 'http://localhost:3000', // API url
          searchTerm: 'Hello Crypto World!', // Default search term
          searchDebounce: null, // Timeout for search bar debounce
          searchResults: [], // Displayed search results
          numHits: null, // Total search results found
          searchOffset: 0, // Search result pagination offset
          selectedParagraph: null, // Selected paragraph object
          bookOffset: 0, // Offset for book paragraphs being displayed
          paragraphs: [], // Paragraphs being displayed in book preview window

          chartData: {
            nodes: [
              {name: 'Node A'},
              {name: 'Node B'},
              {name: 'Node C'},
              {name: 'Node D'},
              {name: 'Node E'}
            ],
            links: [
              {source: 'Node A', target: 'Node E', value: 2},
              {source: 'Node A', target: 'Node C', value: 2},
              {source: 'Node B', target: 'Node C', value: 2},
              {source: 'Node B', target: 'Node D', value: 2},
              {source: 'Node C', target: 'Node D', value: 2},
              {source: 'Node C', target: 'Node E', value: 2},
              {source: 'Node D', target: 'Node E', value: 4}
            ]
          },
          chartConfig (config) {
            config
              .sankey()
              .sankey()
              .nodePadding(100)

            config
              .sankey()
              .nodeDraggableY(true)
            }
          }
      },
      async created () {
        this.searchResults = await this.search() // Search for default term
      },
      methods: {
        /** Debounce search input by 100 ms */
        onSearchInput () {
          clearTimeout(this.searchDebounce)
          this.searchDebounce = setTimeout(async () => {
            this.searchOffset = 0
            this.searchResults = await this.search()
          }, 100)
          console.log("This is some text")
          this.chartData  = {
            nodes: [
              {name: 'Wallet A'},
              {name: 'Wallet B'},
              {name: 'Wallet C'},
              {name: 'Wallet D'},
              {name: 'Wallet E'}
            ],
            links: [
              {source: 'Wallet A', target: 'Wallet E', value: 4},
              {source: 'Wallet A', target: 'Wallet C', value: 10},
              {source: 'Wallet B', target: 'Wallet C', value: 8},
              {source: 'Wallet B', target: 'Wallet D', value: 6},
              {source: 'Wallet C', target: 'Wallet D', value: 6},
              {source: 'Wallet C', target: 'Wallet E', value: 10},
              {source: 'Wallet D', target: 'Wallet E', value: 4}
            ]
          }
          console.log(this.chartData)
        },
        /** Call API to search for inputted term */
        async search () {
          const response = await axios.get(`${this.baseUrl}/search`, { params: { term: this.searchTerm, offset: this.searchOffset } })
          this.numHits = response.data.hits.total
          return response.data.hits.hits
        },
        /** Get next page of search results */
        async nextResultsPage () {
          if (this.numHits > 10) {
            this.searchOffset += 10
            if (this.searchOffset + 10 > this.numHits) { this.searchOffset = this.numHits - 10}
            this.searchResults = await this.search()
            document.documentElement.scrollTop = 0
          }
        },
        /** Get previous page of search results */
        async prevResultsPage () {
          this.searchOffset -= 10
          if (this.searchOffset < 0) { this.searchOffset = 0 }
          this.searchResults = await this.search()
          document.documentElement.scrollTop = 0
        },
        /** Call the API to get current page of paragraphs */
        async getParagraphs (bookTitle, offset) {
          try {
            this.bookOffset = offset
            const start = this.bookOffset
            const end = this.bookOffset + 10
            const response = await axios.get(`${this.baseUrl}/paragraphs`, { params: { bookTitle, start, end } })
            return response.data.hits.hits
          } catch (err) {
            console.error(err)
          }
        },
         /** Get next page (next 10 paragraphs) of selected book */
        async nextBookPage () {
          this.$refs.bookModal.scrollTop = 0
          this.paragraphs = await this.getParagraphs(this.selectedParagraph._source.title, this.bookOffset + 10)
        },
        /** Get previous page (previous 10 paragraphs) of selected book */
        async prevBookPage () {
          this.$refs.bookModal.scrollTop = 0
          this.paragraphs = await this.getParagraphs(this.selectedParagraph._source.title, this.bookOffset - 10)
        },
        /** Display paragraphs from selected book in modal window */
        async showBookModal (searchHit) {
          try {
            document.body.style.overflow = 'hidden'
            this.selectedParagraph = searchHit
            this.paragraphs = await this.getParagraphs(searchHit._source.title, searchHit._source.location - 5)
          } catch (err) {
            console.error(err)
          }
        },
        /** Close the book detail modal */
        closeBookModal () {
          document.body.style.overflow = 'auto'
          this.selectedParagraph = null
        }
      },
      components: {
        ChartSankey
      }
    }
</script>
  <!-- <style scoped>
    .chart{
      width: 100%;
      height: 500px;
    }
</style> -->
<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans|Arial');
</style>
