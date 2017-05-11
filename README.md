# Service Delivery Smart Contract

## Abstract

## Methods

## Tests

### Preparing
This repository is built with [Truffle Framework](https://github.com/trufflesuite/truffle) which works nicely with [ethereumjs-testrpc](https://github.com/ethereumjs/testrpc).

For successfully running tests you will need the same accounts used during development:

```
EthereumJS TestRPC v3.0.4

Available Accounts
==================
(0) 0xfd358dd806680a249290a429c082c6ecf7813f24
(1) 0xe76842888177cb81ce9be7af9033876d5de2b5aa
(2) 0x4c3b31b8385eaca26561eb6ff4e5ab50f0008d36

Private Keys
==================
(0) d235579793f239ed7011b26855ce4c91b4d799165fd40754b86b750d8c6aff69
(1) 60adbc04c996ae365ec35ee04767618773294aeec95d7c0b68ae70a60ba57411
(2) eb6b5826acbdeba23e41d5713b05ac2ff9c33fb66653dfa075afe56e4a07e614
```

In order to spawn `testrpc` with these accounts available, just run the following command:

```
testrpc \
--account=0xd235579793f239ed7011b26855ce4c91b4d799165fd40754b86b750d8c6aff69,balance=1000000000000000000000 \
--account=0x60adbc04c996ae365ec35ee04767618773294aeec95d7c0b68ae70a60ba57411,balance=1000000000000000000 \
--account=0xeb6b5826acbdeba23e41d5713b05ac2ff9c33fb66653dfa075afe56e4a07e614,balance=1000000000000000000000
```

For more information about `testrpc` command-line options, please refer to the [Official Documentation](https://github.com/ethereumjs/testrpc#welcome-to-testrpc).

### Running

For running test simply `cd` to the root of the project and run:
```
truffle test
```

## TODO

* restrict access to `mint` and `burn` functionalities
* connect `Units` smart contract to other components

## Author

[Alberto Dallaporta](https://github.com/39otrebla)
[(alberto@novalab.io)](mailto:alberto@novalab.io)

## License

Copyright (c) 2017 Trustlab Pty Ltd, under licence from Global Consent Limited
See our [License](https://github.com/TrustlabTech/ecd-service-delivery/blob/master/LICENSE.md).

