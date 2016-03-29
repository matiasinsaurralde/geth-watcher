import GethWatcher from './geth-watcher'
import web3 from 'web3'

const watcher = new GethWatcher({
  provider: new web3.providers.HttpProvider( 'http://localhost:8545' ),
  filter: 'latest'
})

watcher.filter( ( err, block ) => {
  if( !err ) {
    console.log( 'Block #', block )
    var txs = watcher.getTransactions( block )
    txs.forEach( (tx) => {
      console.log( 'TX', tx );
    })
  }
})
