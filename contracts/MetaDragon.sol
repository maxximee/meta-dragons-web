// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MetaDragon is ERC721URIStorage, ERC721Burnable, Ownable {
    constructor() ERC721("MetaDragon", "MTD") {
        contractOwner = msg.sender;
    }

    using Counters for Counters.Counter;
    using SafeMath for uint256;

    mapping (uint => address) tokenIdToAddress;
    string public notRevealedUri = "https://meta-dragons.infura-ipfs.io/ipfs/QmcrwL9Lc8bMAy8xT7pZmtbUKZeeStRRS3UhzCEncGnLBR";
    bool public revealed = false;
    uint256 public constant maxSupply = 10000;
    uint256 fee = 0.00 ether;
    uint16 rarityBonus = 8;
    Counters.Counter private _tokenIds;
    address public contractOwner;
    mapping(address => uint256) public addressMintedBalance;
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
        uint32 bloodType;
        uint8 level;
        string rarity;
        string tokenURI;
    }

    Dragon[maxSupply] public _tokenDetails;
    event NewDragon(address indexed owner, uint256 id, uint32 bloodType, string rarity);

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

    function mintDragon(string memory _tokenURI, uint32 _bloodType, string memory _rarity)
    public
    payable
    mintCompliance()
    {
        _tokenIds.increment();
        uint256 newDragonID = _tokenIds.current();

        _safeMint(msg.sender, newDragonID);
        _setTokenURI(newDragonID, _tokenURI);

        // id, bloodType, level, rarity, tokenURI
        Dragon memory newDragon = Dragon(
            newDragonID,
            _bloodType,
            1,
            _tokenURI,
            _rarity
        );

        _tokenDetails[newDragonID] = newDragon;

        emit NewDragon(msg.sender, newDragonID, _bloodType, _rarity);

        addressMintedBalance[msg.sender]++;

    }

    function setMaxMintAmountPerAddress(uint256 _newPerAddressLimit)
    public onlyOwner {
        perAddressLimit = _newPerAddressLimit;
    }

    function updateMetadata(
        uint256 _id,
        string memory _uri,
        bool _levelUp
    ) public onlyOwner {
        require(_exists(_id), "ERC721URIStorage: URI set of nonexistent token");
        Dragon storage dragon = _tokenDetails[_id];
        dragon.tokenURI = _uri;
        _setTokenURI(_id, _uri);
        // level up
        if (_levelUp == true) {
            dragon.level++;
        }
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
  *  - condition: total minted + this potential tx is under maxsupply
  *  - condition: minting limit per address
  */
    modifier mintCompliance() {
        require(!paused, "The contract is paused.");

        // condition: insufficient account balance
        require(msg.value <= msg.sender.balance, "Insufficient balance.");


        // condition: total minted + this potential tx is under maxsupply
        require(
            _tokenIds.current() + 1 <= maxSupply,
            "Max supply exceeded."
        );

        // condition: value more than fee
        // TODO: opensea won't let list with fee(?)
        require(msg.value >= fee , "Insufficient funds.");

        uint256 ownerMintedCount = addressMintedBalance[msg.sender];
        // condition: minting limit per address
        require(
            ownerMintedCount + 1 <= perAddressLimit,
            "Max NFT per address exceeded."
        );
        _;
    }

}
