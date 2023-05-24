// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./AtomDust.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MetaDragon is ERC721URIStorage, ERC721Burnable, Ownable {
    constructor() ERC721("MetaDragon", "MTD") {
        contractOwner = msg.sender;
        atomDustToken = AtomDust(0x0400c0624a90CA9097F8F248F4c04173b8C3f8ea);
    }

    AtomDust atomDustToken;
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    mapping (uint => address) tokenIdToAddress;
    string public notRevealedUri = "https://meta-dragons.infura-ipfs.io/ipfs/QmcrwL9Lc8bMAy8xT7pZmtbUKZeeStRRS3UhzCEncGnLBR";
    bool public revealed = false;
    uint256 fee = 0.00 ether;
    Counters.Counter private _tokenIds;
    address public contractOwner;
    mapping(address => uint256) public addressOwnedBalance;
    uint256 public perAddressLimit = 20;
    bool public paused = false;

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 _id)
    public
    view
    virtual
    override(ERC721, ERC721URIStorage)
    returns (string memory)
    {
        require(_exists(_id), "ERC721Metadata: URI query for nonexistent token");
        if (revealed == true) {
            return _tokenDetails[_id].tokenURI;
        } else {
            return notRevealedUri;
        }
    }

    function reveal() public onlyOwner {
        revealed = true;
    }

    struct Dragon {
        uint256 id;
        uint256 bloodType;
        uint256 topSpeed;
        uint256 acceleration;
        uint256 yield;
        uint256 diet;
        uint8 level;
        string rarity;
        string tokenURI;
    }

    Dragon[] public _tokenDetails;
    event NewDragon(address indexed owner, uint256 id, uint256 bloodType, string rarity);

    // helper func
    function _createRandomNum(uint256 _mod) internal view returns (uint256) {
        uint256 randomNum = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        return randomNum % _mod;
    }

    function getTokenDetails(uint256 _id) public view returns (Dragon memory) {
        return _tokenDetails[_id];
    }

    function getTokenCirculations() public view returns (uint256) {
        return _tokenIds.current();
    }

    function mintDragon(string memory _tokenURI, uint256 _bloodType,
        uint256 _topSpeed,
        uint256 _acceleration,
        uint256 _yield,
        uint256 _diet,string memory _rarity)
    public
    payable
    mintCompliance()
    {
        uint256 newDragonID = _tokenIds.current();
        _tokenIds.increment();

        _safeMint(msg.sender, newDragonID);
        _setTokenURI(newDragonID, _tokenURI);

        Dragon memory newDragon = Dragon(
            newDragonID,
            _bloodType,
            _topSpeed,
            _acceleration,
            _yield,
            _diet,
            1,
            _rarity,
            _tokenURI
        );

        _tokenDetails.push(newDragon);
        tokenIdToAddress[newDragonID] = msg.sender;

        emit NewDragon(msg.sender, newDragonID, _bloodType, _rarity);

        addressOwnedBalance[msg.sender]++;

    }

    function getDragonsByOwner(address _owner) external view returns(uint[] memory) {
        uint[] memory result = new uint[](addressOwnedBalance[_owner]);
        uint counter = 0;
        for (uint i = 0; i < _tokenDetails.length; i++) {
            if (tokenIdToAddress[i] == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function setMaxMintAmountPerAddress(uint256 _newPerAddressLimit)
    public onlyOwner {
        perAddressLimit = _newPerAddressLimit;
    }

    function updateMetadata(
        uint256 _id,
        string memory _uri
    ) public onlyOwner {
        require(_exists(_id), "ERC721URIStorage: URI set of nonexistent token");
        Dragon storage dragon = _tokenDetails[_id];
        dragon.tokenURI = _uri;
        _setTokenURI(_id, _uri);
    }

    function levelUp(
        uint256 _id,
        uint256 _cost,
        uint256 _accel,
        uint256 _topSpeed,
        uint256 _yield,
        uint256 _diet,
        address _dragonOwner
    ) external onlyOwner {
        require(_exists(_id), "ERC721URIStorage: URI set of nonexistent token");
        require(tokenIdToAddress[_id] == _dragonOwner, "The dragon must belong to its owner");
        require(_cost > 0, "You can't level up for free");
        require(atomDustToken.balanceOf(_dragonOwner) > _cost, "Not enough Atoms to level up");
        atomDustToken.approve(address(this), _cost);
        atomDustToken.transferFrom(_dragonOwner, contractOwner, _cost);

        Dragon storage dragon = _tokenDetails[_id];
        dragon.acceleration += _accel;
        dragon.topSpeed += _topSpeed;
        dragon.yield += _yield;
        dragon.diet += _diet;
        dragon.level++;
    }


    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
        addressOwnedBalance[from]--;
        addressOwnedBalance[to]++;
        tokenIdToAddress[tokenId] = to;
    }

    function updateFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    function withdraw() external payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    /** func to apply conditions to token mint/creation
  *  - condition: contract paused/unpaused
  *  - condition: insufficient account balance
  *  - condition: minting at least 1 or more
  *  - condition: minting limit per address
  */
    modifier mintCompliance() {
        require(!paused, "The contract is paused.");

        // condition: insufficient account balance
        require(msg.value <= msg.sender.balance, "Insufficient balance.");

        // condition: value more than fee
        // TODO: opensea won't let list with fee(?)
        require(msg.value >= fee , "Insufficient funds.");

        uint256 ownerMintedCount = addressOwnedBalance[msg.sender];
        // condition: minting limit per address
        require(
            ownerMintedCount + 1 <= perAddressLimit,
            "Max NFT per address exceeded."
        );
        _;
    }

}
