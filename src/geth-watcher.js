import Web3 from 'web3'

export default class GethWatcher {
  constructor( options ) {

    this.options = options || {}

    this.web3 = new Web3();
    this.web3.setProvider( options.provider )

  }

  filter(cb) {
    this.web3.eth.filter( this.options.filter, cb )
  }

  getTransactions( block ) {
    return this.web3.eth.getBlock( block ).transactions
  }
}
