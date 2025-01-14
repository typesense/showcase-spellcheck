import { SearchClient as TypesenseSearchClient } from 'typesense';
import jQuery from 'jquery';
window.$ = jQuery; // workaround for https://github.com/parcel-bundler/parcel/issues/333
import 'bootstrap/js/src/modal';

let TYPESENSE_SERVER_CONFIG = {
  apiKey: process.env.TYPESENSE_SEARCH_API_KEY,
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  numRetries: 8,
};

if (process.env[`TYPESENSE_HOST_2`]) {
  TYPESENSE_SERVER_CONFIG.nodes.push({
    host: process.env[`TYPESENSE_HOST_2`],
    port: process.env.TYPESENSE_PORT,
    protocol: process.env.TYPESENSE_PROTOCOL,
  });
}

if (process.env[`TYPESENSE_HOST_3`]) {
  TYPESENSE_SERVER_CONFIG.nodes.push({
    host: process.env[`TYPESENSE_HOST_3`],
    port: process.env.TYPESENSE_PORT,
    protocol: process.env.TYPESENSE_PROTOCOL,
  });
}

if (process.env[`TYPESENSE_HOST_NEAREST`]) {
  TYPESENSE_SERVER_CONFIG['nearestNode'] = {
    host: process.env[`TYPESENSE_HOST_NEAREST`],
    port: process.env.TYPESENSE_PORT,
    protocol: process.env.TYPESENSE_PROTOCOL,
  };
}

const typesense = new TypesenseSearchClient(TYPESENSE_SERVER_CONFIG);

let lastWord = '';
window.document
  .getElementById('textbox')
  .addEventListener('keyup', async (event) => {
    const currentWord = event.target.value
      .trim()
      .split(' ')
      .pop()
      .toLowerCase();

    // Prevent duplicate requests
    if (lastWord === currentWord) {
      return;
    }
    lastWord = currentWord;

    // Get suggestions
    const results = await typesense.multiSearch.perform({
      searches: [
        {
          q: currentWord,
          query_by: 'word',
          collection: 'english_words',
          sort_by: 'popularity:desc',
          per_page: 4,
        },
      ],
    });

    const suggestedWords = (results['results'][0] || { hits: [] })['hits'].map(
      (h) => h['document']['word']
    );
    console.log(`${currentWord} => ${suggestedWords.join(' | ')}`);

    // Remove existing suggestions, show new ones
    $('#suggestions-list').empty();
    suggestedWords.forEach((word) => {
      // Don't show suggestions if it's exact match
      if (word === currentWord) {
        return;
      }
      $('#suggestions-list').append(
        $(`<li class="list-group-item">${word}</li>`)
      );
    });
  });
