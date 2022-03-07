pragma solidity ^0.8.4;

import "./dragonownership.sol";

contract DragonMinting is DragonOwnership {

    // Limits the number of dragons the contract owner can ever create.
    uint256 public promoCreationLimit = 500;

    // Counts the number of cats the contract owner has created.
    uint256 public promoCreatedCount;

    function createPromoDragon(string memory _name, Rarity _rarity, Class _class, uint8 _accel, uint8 _endu, uint8 _hp, uint8 _recov, uint8 _topSpeed, uint8 _weight, address _owner) public onlyOwner {
        if (_owner == address(0)) {
            _owner = msg.sender;
        }
        require(promoCreatedCount < promoCreationLimit);

        promoCreatedCount++;
        _createDragon(_name, _rarity, _class, _accel, _endu, _hp, _recov, _topSpeed, _weight, _owner);
    }

}
