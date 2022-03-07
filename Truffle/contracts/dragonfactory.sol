// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DragonFactory is Ownable {
  event NewDragon(uint dragonId, string name, Rarity rarity, Class class, uint accel, uint endu, uint hp, uint recov, uint topSpeed, uint weight);

  enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary
  }

  enum Class {
    Fire,
    Frost,
    Poison,
    Tank,
    Rogue
  }

  struct Dragon {
    string name;
    Rarity rarity;
    Class class;
    uint16 winCount;
    uint16 lossCount;
    uint8 acceleration;
    uint8 endurance;
    uint8 hp;
    uint8 recovery;
    uint8 topSpeed;
    uint8 weight;
  }

  Dragon[] public dragons;

  mapping (uint => address) public dragonToOwner;
  mapping (address => uint) ownerDragonCount;

  function _createDragon(string memory _name, Rarity _rarity, Class _class, uint8 _accel, uint8 _endu, uint8 _hp, uint8 _recov, uint8 _topSpeed, uint8 _weight, address _owner) internal {
    dragons.push(Dragon(_name, _rarity, _class, 0, 0, _accel, _endu, _hp, _recov, _topSpeed, _weight));
    uint256 id = dragons.length - 1;
    dragonToOwner[id] = _owner;
    ownerDragonCount[_owner]++;
    emit NewDragon(id, _name, _rarity, _class, _accel, _endu, _hp, _recov, _topSpeed, _weight);
  }

}
