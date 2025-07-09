// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IJusCatPassport
 * @dev Interface for the JusCatPassport contract.
 */
interface IJusCatPassport {
    /**
     * @dev Returns whether an address has a passport.
     * @param account The address to check.
     * @return Whether the address has a passport.
     */
    function hasPassport(address account) external view returns (bool);

    /**
     * @dev Mints a passport to the specified address.
     * @param to The address to mint the passport to.
     * @param _uri The URI for the token metadata.
     */
    function mintPassport(address to, string memory _uri) external;

    /**
     * @dev Burns a passport with the specified ID.
     * @param tokenId The ID of the token to burn.
     */
    function burn(uint256 tokenId) external;

    /**
     * @dev Returns the total number of passports.
     * @return The total supply of passports.
     */
    function totalSupply() external view returns (uint256);
} 