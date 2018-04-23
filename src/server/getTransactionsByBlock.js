Web3 = require('web3')
//web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.0.10:8545"));
web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));
//console.log(web3.eth.accounts[0])
const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

function bulkIndex(index, type, data) {
  let bulkBody = [];
   //console.log(data);
  data.forEach(item => {
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
        _id: item.id
      }
    });

    bulkBody.push(item);
  });

  esClient.bulk({body: bulkBody})
  .then(response => {
    //console.log("here");
    let errorCount = 0;
    response.items.forEach(item => {
      if (item.index && item.index.error) {
        console.log(++errorCount, item.index.error);
      }
    });
    console.log("Successfully indexed " + (data.length - errorCount) + " out of "+ data.length + " transactions" );
  })
  .catch(console.err);
};
function successIndexCallback(e){
	console.log(e);
}
function failureIndexCallback(e){
	console.log(e);
}
function successBlockCallback(block){
	let bulkBody = [];
	if (block != null && block.transactions != null) {
      block.transactions.forEach( function(e) {
		//console.log(e.from)
        if (myaccount == "*" || myaccount == e.from || myaccount == e.to ) {
            txnRaw = "{"
		    + "tx hash:" + e.hash + ",\n"
            + "nonce:" + e.nonce + ","
            + "blockHash : " + e.blockHash + ",\n"
            + "blockNumber : " + e.blockNumber + ",\n"
            + "transactionIndex : " + e.transactionIndex + ",\n"
            + "from : " + e.from + ",\n"
            + "to : " + e.to + ",\n"
            + "value : " + e.value + ",\n"
            + "timestamp : " + block.timestamp + ",\n"
			+ "time : " + new Date(block.timestamp * 1000).toGMTString() + ",\n"
            + "gasPrice                                                                                                                                                                                                      : " + e.gasPrice + ",\n"
            + "gas             : " + e.gas + ",\n"
			+ "input           : " + e.input + "}";
			index="mainnet";
			type="transaction";

			bulkBody.push({
				"tx hash": e.hash,
				"nonce" : e.nonce,
				blockHash : e.blockHash,
				blockNumber : e.blockNumber,
				transactionIndex : e.transactionIndex,
				timestamp: block.timestamp * 1000,
				from : e.from,
				to : e.to,
				value : e.value,
				timestamp : block.timestamp,
				time : new Date(block.timestamp * 1000).toGMTString(),
				gasPrice : e.gasPrice,
				gas : e.gas,
				input : e.input,
				index: {
					_index: index,
					_type: type,
					_id: e.blockNumber*10+e.transactionIndex, /*e.blockNumber*10+e.transactionIndex*/
					_source: txnRaw
				}

			});

			console.log(bulkBody);


        }
      });
	  bulkIndex("mainnet", "transaction", bulkBody).then(successIndexCallback, failureIndexCallback);
	  //esClient.bulk({body: bulkBody}).then(successIndexCallback, failureIndexCallback);
    }

}
function failureBlockCallback(e){
	//console.log(e);
}

function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
  if (endBlockNumber == null) {
    endBlockNumber = web3.eth.blockNumber;
    console.log("Using endBlockNumber: " + endBlockNumber);
  }
  if (startBlockNumber == null) {
    startBlockNumber = endBlockNumber - 1000;
    console.log("Using startBlockNumber: " + startBlockNumber);
  }
  console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);
  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    if (i % 1000 == 0) {
      console.log("Searching block " + i);
    }
    var block = web3.eth.getBlock(i, true).then(successBlockCallback, failureBlockCallback);

  }
}


//getTransactionsByAccount("0x2cd7e2e65bb6ef5f233f9dea83736cf8195fe70d",5430907,5431007)
myaccount = "0x00923682a1c598cf1AdD82bfd8b2C93a7A9029C0";
getTransactionsByAccount(myaccount,5420907,5530907)

var info = web3.eth.getBlock(5430907)
.then(console.log)




const indexTransaction = function indexTransaction() {
  //const articlesRaw = fs.readFileSync('data.json');
  const transactionsRaw = fs.readFileSync('data.json');
  bulkIndex('library', 'article', articles);
};
