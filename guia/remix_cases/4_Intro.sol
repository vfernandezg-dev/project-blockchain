// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts@4.9.3/utils/Counters.sol";

contract Intro {
    
    uint256 private cantidad;
    string public nombre = "Upao";

    constructor(uint256 _valorCantidad) {
        cantidad = _valorCantidad;
    }

    function cambiarCantidad(uint256 _cantidad) public {
        cantidad = _cantidad;
    }

    function obtenerCantidad() public view returns (uint256) {
        return cantidad;
    }

    function obtenerSuma(uint256 primero, uint256 segundo) public pure returns(uint256){
        return primero + segundo;
    }


}
