require("dotenv").config();

const BATCH_SIZE = process.env.BATCH_SIZE || 5000;
const MAX_LINES = process.env.MAX_LINES || Infinity;
const DATA_FILE = process.env.DATA_FILE || "./scripts/data/eng_words_1K.jsonl";

const fs = require("fs");
const readline = require("readline");
const Typesense = require("typesense");

async function indexWordsToTypesense(typesense, collectionName, words) {
  const results = await typesense
    .collections(collectionName)
    .documents()
    .import(words);

  const failedItems = results.filter((item) => item.success === false);
  if (failedItems.length > 0) {
    console.log(JSON.stringify(failedItems, null, 2));
    throw "Indexing error";
  }
}

module.exports = (async () => {
  const typesense = new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST,
        port: process.env.TYPESENSE_PORT,
        protocol: process.env.TYPESENSE_PROTOCOL,
      },
    ],
    apiKey: process.env.TYPESENSE_ADMIN_API_KEY,
  });

  const collectionName = `english_words_${Date.now()}`;
  const schema = {
    name: collectionName,
    fields: [
      { name: "word", type: "string" },
      { name: "popularity", type: "int32" },
    ],
    default_sorting_field: "popularity",
  };

  console.log(`Populating new collection in Typesense ${collectionName}`);

  console.log("Creating schema: ");
  // console.log(JSON.stringify(schema, null, 2));
  await typesense.collections().create(schema);

  console.log("Adding records: ");

  const fileStream = fs.createReadStream(DATA_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let words = [];
  let currentLine = 0;
  for await (const line of rl) {
    currentLine += 1;
    const parsedRecord = JSON.parse(line);
    try {
      words.push({
        word: String(parsedRecord["word"]),
        popularity: parseInt(parsedRecord["count"]),
      });
      // process.stdout.write(".");
    } catch (e) {
      console.error(e);
      console.error(parsedRecord);
      throw e;
    }

    if (currentLine % BATCH_SIZE === 0) {
      await indexWordsToTypesense(typesense, collectionName, words);
      console.log(` Words upto ${currentLine} ✅`);
      words = [];
    }

    if (currentLine >= MAX_LINES) {
      break;
    }
  }

  if (words.length > 0) {
    await indexWordsToTypesense(typesense, collectionName, words);
    console.log("✅");
  }

  let oldCollectionName;
  try {
    oldCollectionName = await typesense.aliases("english_words").retrieve()[
      "collection_name"
    ];
  } catch (error) {
    // Do nothing
  }

  try {
    console.log(`Update alias english_words -> ${collectionName}`);
    await typesense
      .aliases()
      .upsert("english_words", { collection_name: collectionName });

    if (oldCollectionName) {
      console.log(`Deleting old collection ${oldCollectionName}`);
      await typesense.collections(oldCollectionName).delete();
    }
  } catch (error) {
    console.error(error);
  }
})();
