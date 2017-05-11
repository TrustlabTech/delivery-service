pragma solidity ^0.4.8;

import "./Registry.sol";
import "./multisig.sol";
import "./multiowned.sol";
import "../token/HumanStandardToken.sol";

contract DeliveryService is multisig, multiowned {

    struct Transaction {
        address to; // ECD Centre DID
        uint value; // AMPs
    }

    /**@dev Constructor
     * @param _owners Addresses involved in the internal consensus process (i.e. multisig-like)
     * @param _required Minimum number of confirmations required to execute a transaction
     */
    function DeliveryService(address[] _owners, uint _required) multiowned(_owners, _required)
    {
        registry = new Registry(msg.sender, _owners[0]);
    }

    /**@dev Create a new token associated with this registry
     * @param initialAmount The number of tokens initially available (see @link{HumandStandardToken})
     * @param tokenName The of the token (see @link{HumandStandardToken})
     * @param decimalUnits Decimal units to display (see @link{HumandStandardToken})
     * @param tokenSymbol The symbol (i.e. ticker) of the token (see @link{HumandStandardToken})
     */
    function createToken(uint256 initialAmount, string tokenName, string tokenSymbol, uint8 decimalUnits) external
    {
        // do not allow to create more than one token for each registry
        if (token != address(0))
            throw;

        token = new HumanStandardToken(initialAmount, tokenName, decimalUnits, tokenSymbol);
    }

    /**@notice Outside-visible transact entry point that goes into multisig process 
     * @param _to tokens recipient
     * @param _value Amount of tokens to transfer
     * @param _vchash The verifiable claim hash this transaction refers to
     */
    function execute(address _to, uint _value, bytes32 _vchash) external onlyowner() returns (bytes32) 
    {
        if (!confirm(_vchash) && m_txs[_vchash].to == address(0)) {
            m_txs[_vchash].to = _to;
            m_txs[_vchash].value = _value;
            ConfirmationNeeded(_vchash, msg.sender, _value, _to);
            return _vchash;
        }
    }

    /**@notice Confirm a transaction through just the verifiable claim hash it refers to.
     * @param _vchash The vchash the tx refers to
     */
    function confirm(bytes32 _vchash) onlymanyowners(_vchash) returns (bool) 
    {
        if (m_txs[_vchash].to != address(0)) {
            // send AMPs to the ECD Centre
            HumanStandardToken(token).transfer(m_txs[_vchash].to, m_txs[_vchash].value);
            MultiTransact(msg.sender, _vchash, m_txs[_vchash].value, m_txs[_vchash].to);
            delete m_txs[_vchash];
            return true;
        } else
            return false;
    }

    /**@notice Check whether a pending tx for a particular Verifiable Claims exists
     * @param _vchash The verifiable claim hash, i.e. the key in m_txs map
     */
    function isPending(bytes32 _vchash) constant returns(bool)
    {
        return m_txs[_vchash].to != address(0);
    }

    /**@notice Get value of a pending tx
     * @param _vchash The pending tx identifier
     */
    function pendingTxValue(bytes32 _vchash) constant onlyowner() returns(uint)
    {
        return m_txs[_vchash].value;
    }

    /**@notice Get recipient of a pending tx
     * @param _vchash The pending tx identifier
     */
    function pendingTxRecipient(bytes32 _vchash) constant onlyowner() returns(address)
    {
        return m_txs[_vchash].to;
    }

    /// @notice Clear pending txs
    function clearPending() internal 
    {
        uint length = m_pendingIndex.length;
        for (uint i = 0; i < length; ++i)
            delete m_txs[m_pendingIndex[i]];
        super.clearPending();
    }

    address public token;
    address public registry;
    mapping (bytes32 => Transaction) m_txs; // pending transactions we have at present
}