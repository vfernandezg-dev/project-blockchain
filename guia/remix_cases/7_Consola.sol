// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "hardhat/console.sol";

contract Consola {

    //event Debug(string mensaje, address invocador);

    uint256 private cantidad = 295856;

    function consultarCantidad() public view returns(uint256) {
        console.log("Consultada por: ", msg.sender);
        //emit Debug("Consultada por: ", msg.sender);
        return cantidad;
    }

}
