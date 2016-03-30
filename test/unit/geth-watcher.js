var chai = require( 'chai' )
chai.should()

// require('dotenv').config()

const account = '0x20a88ea8f656fc10a79af2823dd0bcc5f55d5936',
      accountPassword = 'crackme',
      knownWallet = '0x0000000000000000000000000000000000000000'

describe( 'geth-watcher', function() {

  const GethWatcher = require( '../../lib/geth-watcher').default,
        Web3 = require( 'web3' ),
        Redis = require( 'redis' ),
        async = require( 'async' )
        redis = Redis.createClient()

  // Store knownWallet as a Redis key
  redis.set( knownWallet, '' )

  const provider = new Web3.providers.HttpProvider( 'http://localhost:8545' )

  const watcher = new GethWatcher({
    provider: provider,
    filter: 'latest'
  })

  const web3 = new Web3()
  web3.setProvider( provider )

  web3.personal.unlockAccount( account, accountPassword )

  it( 'should send a tx & match our Redis key', (done) => {
    var txId = web3.eth.sendTransaction({from: account, to: '0x0000000000000000000000000000000000000000', value: 100 } )
    watcher.filter( (err,block) => {
      var txs = watcher.getTransactions( block )
      if( txs.indexOf( txId ) > -1 ) {
        var tx = web3.eth.getTransaction( txId )
        async.parallel([
          function( callback ) {
            redis.exists( tx.from, ( err, reply ) => {
              callback( err, reply )
            })
          },
          function( callback ) {
            redis.exists( tx.to, ( err, reply ) => {
              callback( err, reply )
            })
          }
        ], (err, results) => {
          if( results[0] == 1 || results[1] == 1 ) {
            done()
          }
        })
      }
    })
  })

  it( 'should send a tx & ignore the tx (not a known address)', (done) => {
    var txId = web3.eth.sendTransaction({from: account, to: '0x0000000000000000000000000000000000000001', value: 100 } )
    watcher.filter( (err,block) => {
      var txs = watcher.getTransactions( block )
      if( txs.indexOf( txId ) > -1 ) {
        var tx = web3.eth.getTransaction( txId )
        async.parallel([
          function( callback ) {
            redis.exists( tx.from, ( err, reply ) => {
              callback( err, reply )
            })
          },
          function( callback ) {
            redis.exists( tx.to, ( err, reply ) => {
              callback( err, reply )
            })
          }
        ], (err, results) => {
          if( results[0] == 0 || results[1] == 0 ) {
            done()
          }
        })
      }
    })
  })

})
