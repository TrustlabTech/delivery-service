pragma solidity ^0.4.8;

// Gav Wood <g@ethdev.com>
// interface contract for multisig proxy contracts; see below for docs.
contract multisig {

	// EVENTS

    // logged events:
    // Funds has arrived into the wallet (record how much).
    event Deposit(address _from, uint value);
    // Single transaction going out of the wallet (record who signed for it, how much, and to whom it's going).
    event SingleTransact(address owner, uint value, address to);
    // Multi-sig transaction going out of the wallet (record who signed for it last, the operation hash, how much, and to whom it's going).
    event MultiTransact(address owner, bytes32 operation, uint value, address to);
    // Confirmation still needed for a transaction.
    event ConfirmationNeeded(bytes32 operation, address initiator, uint value, address to);
    
    // FUNCTIONS
    
    // TODO: document
    function changeOwner(address _from, address _to) external;
    function execute(address _to, uint _value, bytes32 _vchash) external returns (bytes32);
    function confirm(bytes32 _vchash) returns (bool);
}