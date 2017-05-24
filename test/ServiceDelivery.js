var Registry = artifacts.require("./service/Registry.sol")
var DeliveryService = artifacts.require("./service/DeliveryService.sol")
var HumanStandardToken = artifacts.require("./token/HumanStandardToken.sol")

var EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

// owners, which should also be accounts[1] and accounts[2]
var owners = [
  "0xe76842888177cb81ce9be7af9033876d5de2b5aa",
  "0x4c3b31b8385eaca26561eb6ff4e5ab50f0008d36",
]

var INITIAL_SUPPLY = 1000000000

var ATTENDEES = 73,
    CLAIMED_TOKENS = 73,
    UNIT_CODE = 1001,
    CENTRE_ADDRESS = '0x0536806df512D6cDDE913Cf95c9886f65b1D3462',
    DATE = new Date(742745040 * 1000).toISOString(),
    CENTRE_DID = new Buffer('did:0x0536806df512D6cDDE913Cf95c9886f65b1D3462', 'utf8').toString('hex'),
    VC_HASH = '0x03b2dee406816f8550309c3345f1e8ba96a28079481503c68dcc524560ad65cf'

// run tests sequentially
var registryDeployed = false,
    tokenDeployed = false,
    tokenCheckBalance = false,
    verfiableClaimRecorded = false,
    initMultisig = false,
    confirmMultisig = false

// print results
var recordedClaim = undefined

contract('DeliveryService', function(accounts) {

  var checkInit = function(done) {
    if (registryDeployed && tokenDeployed)
      done()
    else
      setTimeout(function() { checkInit(done) }, 1000)
  }

  var checkInitAndRecord = function(done) {
    if (registryDeployed && tokenDeployed && tokenCheckBalance && verfiableClaimRecorded)
      done()
    else
      setTimeout(function() { checkInit(done) }, 1000)
  }

  var checkInitMultiSig = function(done) {
    if (registryDeployed && tokenDeployed && tokenCheckBalance && verfiableClaimRecorded && initMultisig)
      done()
    else
      setTimeout(function() { checkInit(done) }, 1000)
  }
  
  var checkConfirmMutliSig = function(done) {
    // advantages of 21:9 monitor .... :)
    if (registryDeployed && tokenDeployed && tokenCheckBalance && verfiableClaimRecorded && initMultisig && confirmMultisig)
      done()
    else
      setTimeout(function() { checkInit(done) }, 1000)
  }

  describe('Init', function() {
    it("should create the Verifiable Claim registry", function() {
      return DeliveryService.deployed().then(function(instance) {
        return instance.registry()
      }).then(function(registryAddress) {
        assert.notStrictEqual(registryAddress, EMPTY_ADDRESS, "Registry has not been deployed")
        registryDeployed = true
      })
    })

    it("should create AMP token", function() {
      return DeliveryService.deployed()
      .then(function(instance) {
        instance.createToken(INITIAL_SUPPLY, "Amply".toString('hex'), "AMP".toString('hex'), 2)
        .then(function() {
          return instance.token()
        }).then(function(tokenAddress) {
          assert.notStrictEqual(tokenAddress, EMPTY_ADDRESS, "Token has not been deployed")
          tokenDeployed = true
        })
      })
    })
  })

  describe('Check initial supply', function() {
    before(function(done) {
      checkInit(done)
    })

    it("should have rewarded the DeliveryService contract address with ${INITIAL_SUPPLY} AMP", function() {
      return DeliveryService.deployed()
      .then(function(instance) {
        instance.token()
        .then(function(tokenAddress) {
          var Token = HumanStandardToken.at(tokenAddress)
          return Token.balanceOf.call(instance.address)
        }).then(function(balance) {
          assert.equal(parseInt(balance.toString(10)), INITIAL_SUPPLY, "Token has not credited AMP to DeliveryService contract address")
          tokenCheckBalance = true
        })
      })
    })
  })

  describe('Record verifiable claim', function() {
    before(function(done) {
      checkInit(done)
    })

    it("should record a verfiable claim", function() {
      return DeliveryService.deployed()
      .then(function(instance) {
        instance.registry()
        .then(function(registryAddress) {
          var Reg = Registry.at(registryAddress)
          Reg.record(VC_HASH, DATE, UNIT_CODE, CENTRE_DID, { from: owners[0] })
          .then(function() {
            Reg.exists(VC_HASH).then(function(exists) {            
              assert.isTrue(exists, "Verifiable Claim has not been recorded")
              verfiableClaimRecorded = true
              Reg.registry(VC_HASH).then(function (vc) { recordedClaim = vc })
            })
          })
        })
      })
    })
  })

  describe('Init multisig process', function() {
    before(function(done) {
      checkInitAndRecord(done)
    })

    it("should init multisig process for transferring tokens to the ECD Centre", function() {
      return DeliveryService.deployed()
      .then(function(instance) {
        instance.execute(CENTRE_ADDRESS, CLAIMED_TOKENS, VC_HASH, { from: owners[0] })
        .then(function() {
          instance.isPending(VC_HASH)
          .then(function(pending) {
            assert.isTrue(pending, "DeliveryService has not initiated multisig process for transferring tokens to the ECDCentre")
            initMultisig = true
          })
        })
      })
    })
  })

  describe('Confirm multisig process', function() {
    before(function(done) {
      checkInitMultiSig(done)
    })

    it("should confirm transaction for transferring tokens to the ECD Centre", function() {
      return DeliveryService.deployed()
      .then(function(instance) {
        instance.confirm(VC_HASH, { from: owners[1] })
        .then(function() {
          instance.isPending(VC_HASH)
          .then(function(pending) {
            assert.isFalse(pending, "DeliveryService has not completed multisig process for transferring tokens to the ECDCentre")
            confirmMultisig = true
          })
        })
      })
    })
  })

  describe('Check actual transfer of tokens', function() {
    before(function(done) {
      checkConfirmMutliSig(done)
    })

    it("should have sent claimed tokens to the ECDCentre DID address", function() {
      return DeliveryService.deployed()
      .then(function(instance) {
        instance.token()
        .then(function(tokenAddress) {
          var Token = HumanStandardToken.at(tokenAddress)
          Token.balanceOf(instance.address)
          .then(function(sdBalance) {
            assert.equal(sdBalance, INITIAL_SUPPLY - CLAIMED_TOKENS, "DeliveryService has not sent claimed tokens to the ECDCentre DID address")
            return Token.balanceOf(CENTRE_ADDRESS)
            .then(function(centreBalance) {
              assert.equal(centreBalance, CLAIMED_TOKENS, "DeliveryService has not sent claimed tokens to the ECDCentre DID address")
              console.log()
              console.log('Recorded claim:\n')
              console.log('Date: ' + recordedClaim[0])
              console.log('Centre DID: ' + (new Buffer(recordedClaim[1], 'hex').toString('utf8')))
              console.log('Claimed tokens: ' + recordedClaim[2].toString())
              console.log()
            })
          })
        })
      })
    })
  })

});
