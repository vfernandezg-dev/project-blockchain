// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract BallenitaNFT is ERC721, Ownable {
    uint256 private _contadorId = 1;

    constructor() 
        ERC721("Ballenita Poster Token - NFT", "BPT")
        Ownable(msg.sender)
    {

    }

    struct Poster {
        uint256 id;
        string nombre;
        uint256 level;
        uint256 rareza;
        uint256 precio;
    }

    mapping(uint256 => Poster) private posters;

    function mint(string memory _nombre, uint256 _level, uint256 _rareza) public onlyOwner {

        uint idPoster = _contadorId;

        uint256 precioCalculado = 0.001 ether * _level * _rareza;

        posters[idPoster] = Poster(idPoster, _nombre, _level, _rareza, precioCalculado);
        _mint(address(this), _contadorId);
        _contadorId++;

    }

    function verPoster(uint256 tokenId) public view returns (uint256 id, string memory nombre, uint256 level, uint256 rareza, uint256 precio) {
        Poster memory poster = posters[tokenId];
        return (poster.id, poster.nombre, poster.level, poster.rareza, poster.precio);
    }

    function verPostersProp(address propietario) public view returns (Poster[] memory) {
        uint256 cantidadPosters = balanceOf(propietario);
        Poster[] memory resultado = new Poster[](cantidadPosters);

        uint256 contador = 0;

        for(uint256 tokenId = 1; tokenId < _contadorId + 1 ; tokenId++ ) {
            if(ownerOf(tokenId) == propietario) {
                resultado[contador] = posters[tokenId];
                contador++;
            }
        }

        return resultado;
    }

    function comprarPoster(uint256 tokenId) public payable {
        require(ownerOf(tokenId) == address(this), "El poster no esta disponible");
        Poster memory poster = posters[tokenId];
        require(msg.value >= poster.precio, "ETH insuficiente");        
        _transfer(address(this), msg.sender, tokenId);
    }

    function retirar() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    

}
