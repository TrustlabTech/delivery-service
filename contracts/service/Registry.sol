pragma solidity ^0.4.8;

import "./AMP.sol";
import "./DeliveryService.sol";

contract Registry {

    struct VCRecord {
        uint timestamp;
        string centreDID;
        uint claimedTokens; // 0 is a valid value for our domain logic
        bool recorded;      // used only to check existence of a vchash in registry
    }

    event Record(bytes32 vchash, uint timestamp, string centreDID, uint claimedTokens);

    modifier onlyAdmin() {
        if (msg.sender != admin)
            throw;
        _;
    }

    modifier onlySystem() {
        if (msg.sender != system)
            throw;
        _;
    }

    function Registry(address _admin, address _system)
    {
        admin = _admin;
        system = _system;

        amp = new AMP(admin);
    }

    /**@notice Record a per-child verifiable claim
     * @param _unitCode The internal identifier of the value-per-unit for this attendee
     * @param _timestamp Verifiable claim creation timestamp
     * @param _vchash Verifiable claim hash
     * @param _centreDID Digital Identity of the centre this verifiable claim belongs to
     */
    function record(bytes32 _vchash, uint _timestamp, uint _unitCode, string _centreDID) external onlySystem()
    {
        if (registry[_vchash].recorded)
            throw;
        
        uint _claimedTokens = 1;

        uint unitValue = AMP(amp).getValue(_unitCode);
        
        if (unitValue != uint(0))
            _claimedTokens = unitValue;

        // notarize
        registry[_vchash] = VCRecord({
            timestamp: _timestamp,
            centreDID: _centreDID, 
            claimedTokens: _claimedTokens,
            recorded: true
        });

        Record(_vchash, _timestamp, _centreDID, _claimedTokens);
    }

    /**@notice Check whether a verifiable claim has been recorded
     * @param _vchash The verifiable claim hash, i.e. the key in registry map
     */
    function exists(bytes32 _vchash) constant returns(bool)
    {
        return registry[_vchash].recorded;
    }

    /**@notice Update AMP contract address
     * @param _amp The new AMP contract address
     */
    function updateAmp(address _amp) onlyAdmin() {
        amp = _amp;
    }

    /**@notice Update admin address
     * @param _admin The new admin address
     */
    function updateAdmin(address _admin) onlyAdmin() {
        admin = _admin;
    }

    /**@notice Update address authorized to record verifiable claims
     * @param _system The new system address
     */
    function updateSystem(address _system) onlyAdmin() {
        system = _system;
    }    
    
    address public amp;
    address public admin;
    address public system;
    mapping (bytes32 => VCRecord) public registry;
}