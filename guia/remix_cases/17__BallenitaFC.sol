// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BallenitaFCToken is ERC20 {

    address public owner;

    constructor() ERC20("Ballenita Futbol Club Token", "BFT") {
        owner = msg.sender;
        _mint(owner, 1000 * 10**18);
    }

    modifier isOwner() {
        require(msg.sender == owner, "No eres el propietario");
        _;
    }

    function mintear(address to, uint256 cantidad) public isOwner {
        _mint(to, cantidad * 10 ** 18);
    }

    function esSocio(address cuenta) public view returns (bool) {
        return balanceOf(cuenta) > 0;
    }
}