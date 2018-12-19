pragma solidity 0.5.0;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    constructor () public {
        owner = msg.sender;
    }

    function setCompleted(uint completed) private restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) private restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
