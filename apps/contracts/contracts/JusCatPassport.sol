// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JusCatPassport is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    uint256 private _burnedTokens;

    mapping(address => bool) public hasPassport;

    constructor() ERC721("Katty", "KTY") Ownable(msg.sender) {}

    function mintPassport(address to, string memory _uri) external onlyOwner {
        require(!hasPassport[to], "Already has a passport");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _uri);
        hasPassport[to] = true;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: transfers are disabled");
        }
        
        return from;
    }

    function burn(uint256 tokenId) external onlyOwner {
        address owner = ownerOf(tokenId);
        hasPassport[owner] = false;
        _burn(tokenId);
        _burnedTokens++;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - _burnedTokens;
    }
}