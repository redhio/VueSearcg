const elasticsearch = require('elasticsearch')

// Core ES variables for this project
const index = 'library' /* 'mainnet */
const type = 'novel' /*transaction */
const port = 9200
const host = process.env.ES_HOST || 'localhost'  /**replace localhost with index.redh.io, remove process.env...*/
const client = new elasticsearch.Client({ host: { host, port } })

/** Check the ES connection status */
async function checkConnection () {
  let isConnected = false
  while (!isConnected) {
    console.log('Connecting to ES')
    try {
      const health = await client.cluster.health({})
      console.log(health)
      isConnected = true
    } catch (err) {
      console.log('Connection Failed, Retrying...', err)
    }
  }
}

/** Clear the index, recreate it, and add mappings */
async function resetIndex () {
  if (await client.indices.exists({ index })) {
    await client.indices.delete({ index })
  }

  await client.indices.create({ index })
  await putBookMapping()
}

/** Add book section schema mapping to ES */
async function putBookMapping () {
  const schema = {
    title: { type: 'keyword' },
    author: { type: 'keyword' },
    location: { type: 'integer' },
    text: { type: 'text' }
  }

  return client.indices.putMapping({ index, type, body: { properties: schema } })
}

/** Exports properties & functions to be accessed by rest of the app */
module.exports = {
  client, index, type, checkConnection, resetIndex
}
