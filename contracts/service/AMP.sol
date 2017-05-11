pragma solidity ^0.4.8;

contract AMP {

    struct Unit {
        uint value; // value per unit
        string name; // optional, human-readable name (e.g. "normal", "disabled", "at war")
    }

    modifier onlyAdmin() {
        if (msg.sender != admin)
            throw;
        _;
    }

    function AMP(address _admin) {
        admin = _admin;
    }

    function set(uint _code, uint _value, string _name) external onlyAdmin()
    {
        units[_code] = Unit(_value, _name);
    }

    function getName(uint _code) external constant returns(string) {
        return units[_code].name;
    }

    function getValue(uint _code) external constant returns(uint) {
        return units[_code].value;
    }

    address public admin;
    mapping (uint => Unit) public units;
}