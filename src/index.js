import { SearchClient as TypesenseSearchClient } from "typesense";
import jQuery from "jquery";
window.$ = jQuery; // workaround for https://github.com/parcel-bundler/parcel/issues/333
import "bootstrap/js/src/modal";

const typesense = new TypesenseSearchClient({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: process.env.TYPESENSE_SEARCH_API_KEY,
});

let lastWord = "";
window.document
  .getElementById("textbox")
  .addEventListener("keyup", async (event) => {
    const currentWord = event.target.value
      .trim()
      .split(" ")
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
          query_by: "word",
          collection: "english_words",
          sort_by: "popularity:desc",
          per_page: 4,
        },
      ],
    });

    const suggestedWords = (results["results"][0] || { hits: [] })["hits"].map(
      (h) => h["document"]["word"]
    );
    console.log(`${currentWord} => ${suggestedWords.join(" | ")}`);

    // Remove existing suggestions, show new ones
    $("#suggestions-list").empty();
    suggestedWords.forEach((word) => {
      // Don't show suggestions if it's exact match
      if (word === currentWord) {
        return;
      }
      $("#suggestions-list").append(
        $(`<li class="list-group-item">${word}</li>`)
      );
    });
  });
