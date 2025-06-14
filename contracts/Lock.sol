// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract Lock {
    uint public unlockTime;
    address payable public owner; // Tetap simpan owner sebagai informasi

    event Withdrawal(uint amount, uint when);

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender); // Owner tetap diatur saat deploy
    }

    function withdraw() public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        // !!! PENTING: PASTIKAN BARIS INI TIDAK ADA ATAU DIKOMENTARI !!!
        // require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        // Ganti ini agar dana dikirim ke siapa pun yang memanggil
        // Jika Anda ingin owner asli yang menerima, biarkan owner.transfer
        payable(msg.sender).transfer(address(this).balance);
    }
}