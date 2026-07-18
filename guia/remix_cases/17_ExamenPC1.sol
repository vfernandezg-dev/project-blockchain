// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "hardhat/console.sol";

contract musico000256370 {

    struct Musico {
        uint id;
        string nombre;
        string genero;
        bool estado;
    }

    address public dirContrato;
    uint256 public cantidad;
    mapping(uint => Musico) public musicos;
    mapping(uint => bool) private idsRegistrados;
    uint[] private idsMusicos;

    modifier logEjecucion() {
        console.log("Ejecutado por: 000256370 - Valentin Emanuel Fernandez Gutierrez");
        _;
    }

    constructor() logEjecucion {
        dirContrato = address(this);
    }

    function agregarElemento(uint _id, string memory _nombre, string memory _genero, bool _estado) public {
        require(!idsRegistrados[_id], "El id ya existe");
        require(bytes(_nombre).length > 0, "El nombre no puede estar vacio");

        musicos[_id] = Musico(_id, _nombre, _genero, _estado);
        idsRegistrados[_id] = true;
        idsMusicos.push(_id);
        cantidad++;
    }

    function contarElementos() public view logEjecucion returns (uint) {
        return cantidad;
    }

    function inactivarElemento(uint _id) public logEjecucion {
        require(idsRegistrados[_id], "El id no existe");
        musicos[_id].estado = false;
    }

    function pintarElementosActivos() public view logEjecucion {
        for (uint i = 0; i < idsMusicos.length; i++) {
            uint id = idsMusicos[i];

            if (musicos[id].estado) {
                console.log(
                    "Musico activo",
                    musicos[id].id,
                    musicos[id].nombre,
                    musicos[id].genero
                );
            }
        }
    }
}