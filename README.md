# Typeahead Spellchecker

Use Typesense's typo-correction feature to build a Type-Ahead Spellchecker.

## Live Demo

https://spellcheck.typesense.org/

The UI is hosted on S3, the data is indexed in a single-node Typesense Cloud cluster with 512MB RAM in Oregon.

## How it works

We index all [dictionary words](https://www.kaggle.com/rtatman/english-word-frequency), along with the popularity of each word in a Typesense collection.

We then extract the last typed word and send it as a "search" to Typesense. Since Typesense searches for typo-corrected words automatically, it returns closely related typo-corrected words from the dictionary, which we show as type-ahead suggestions.

## Running it locally

```shell
yarn typesenseServer

yarn index

yarn start
```

## Deployment

To deploy the UI run:

```shell
yarn deploy
```
