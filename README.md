# Typeahead Spellchecker

Use Typesense's typo-correction feature to build a Type-Ahead Spellchecker.

## Live Demo

https://spellcheck.typesense.org/

The UI is hosted on S3, the data is indexed in a 3-node geo-distributed <a href="https://cloud.typesense.org" target="_blank">Typesense Cloud</a> cluster with 512MB RAM and nodes in Oregon, Frankfurt and Mumbai.

## How it works

We index 333K [dictionary words](https://www.kaggle.com/rtatman/english-word-frequency), along with the popularity of each word in a Typesense collection.

We then extract the last typed word and send it as a "search" to Typesense. Since Typesense searches for typo-corrected words automatically, it returns closely related typo-corrected words from the dictionary, which we show as type-ahead suggestions.

## Running it locally

```shell
yarn typesenseServer

ln -s .env.development .env

yarn index

yarn start
```

## Deployment

To deploy the UI run:

```shell
yarn deploy
```
