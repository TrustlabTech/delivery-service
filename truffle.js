module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      from: "0xfd358dd806680a249290a429c082c6ecf7813f24", // testrpc, account[0]
    },
  },
  mocha: {
    useColors: true,
    bail: true,
  }
};

/**
 * testrpc \ 
 * --account=0xd235579793f239ed7011b26855ce4c91b4d799165fd40754b86b750d8c6aff69,balance=1000000000000000000000 \
 * --account=0x60adbc04c996ae365ec35ee04767618773294aeec95d7c0b68ae70a60ba57411,balance=1000000000000000000000 \
 * --account=0xeb6b5826acbdeba23e41d5713b05ac2ff9c33fb66653dfa075afe56e4a07e614,balance=1000000000000000000000 \
 * --gasLimit=4712388
 */