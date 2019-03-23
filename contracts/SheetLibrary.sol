pragma solidity ^0.5.0;

contract SheetLibrary {

    address public owner;

    enum State {atOwner, borrowing, returning, atBorrower, nonexistent}

    struct Sheet {
        string title;
        address owner;
        address currentHolder;
        uint availableCopies;
        State state;
        bool isSheet;
    }

    // Store number of available Sheets
    uint public numSheets;
    mapping (uint => Sheet) private sheetLibrary;

    uint[] private sheetIndex;
    uint[] borrowings;

    event sheetIdDoesNotExist(uint id);
    event borrowingRequestWasAccepted(string message);
    event error(string message);

    constructor () public {
        owner = msg.sender;
        addNewSheets("Example Sheet 1", 42);
    }

    function close() public {
        if(msg.sender == owner){
            selfdestruct(msg.sender);
        }
    }

    function addNewSheets(string memory title, uint copies) public returns (uint sheetID) {
        numSheets++;
        sheetID = numSheets;
        sheetIndex.push(sheetID);
        sheetLibrary[sheetID] = Sheet(title, msg.sender, msg.sender, copies, State.atOwner, true);
        return sheetID;
    }

    function getSheet(uint sheetID) public view returns (
        string memory title, 
        address sheetOwner, 
        address currentHolder,
        uint availableCopies,
        State state){
        if(isSheet(sheetID)){
            return (
                sheetLibrary[sheetID].title,
                sheetLibrary[sheetID].owner,
                sheetLibrary[sheetID].currentHolder,
                sheetLibrary[sheetID].availableCopies,
                sheetLibrary[sheetID].state
                );
        } else {
            revert("ID does not exist.");
            //return("", address(0), address(0), 0, State.nonexistent);
        }
    }

    function isSheet(uint sheetID) public view returns (bool isIndeedASheet) {
        return sheetLibrary[sheetID].isSheet;
    }

    function borrowSheet(uint sheetID) public returns (bool success) {
        if (isSheet(sheetID)){
            Sheet storage s = sheetLibrary[sheetID];
            if(s.currentHolder != msg.sender){
                s.currentHolder = msg.sender;
                s.state = State.borrowing;
                return true;
            } else {
                emit error("You already hold that sheet.");
                revert("You already hold that sheet.");
                //return false;
            }
        } else {
            emit sheetIdDoesNotExist(sheetID);
            revert("ID does not exist.");
            //return false;
        }        
    }

    function approveBorrowing(uint sheetID) public returns (bool success) {
        if(isSheet(sheetID)){
            if(sheetLibrary[sheetID].owner == msg.sender){
                sheetLibrary[sheetID].state = State.atBorrower;
                return true;
            } else {
                emit error("You are not allowed to approve the borrowing of this Sheet.");
                revert("You are not allowed to approve the borrowing of this Sheet.");
                //return false;
            }
        } else {
            emit sheetIdDoesNotExist(sheetID);
            revert("ID does not exist.");
            //return false;
        }
    }

    function returnSheet(uint sheetID) public returns (bool success) {
        if(isSheet(sheetID)){
            if(sheetLibrary[sheetID].currentHolder == msg.sender){
                sheetLibrary[sheetID].state = State.returning;
                return true;
            } else {
                emit error("You are not allowed to return this sheet since you don't hold it.");
                revert("You are not allowed to return this sheet since you don't hold it.");
                //return false;
            }
        } else {
            emit sheetIdDoesNotExist(sheetID);
            revert("ID does not exist.");
            //return false;
        }
    }

    function acceptReturnedSheet(uint sheetID) public returns (bool success){
        if(isSheet(sheetID)){
            if(sheetLibrary[sheetID].owner == msg.sender){
                if(sheetLibrary[sheetID].state == State.returning){
                    Sheet storage s = sheetLibrary[sheetID];
                    s.state = State.atOwner;
                    s.currentHolder = msg.sender;
                    return true;
                } else {
                    emit error("Sheets are currently not being returned.");
                    revert("Sheets are currently not being returned.");
                    //return false;
                }
            } else {
                emit error("You are not allowed to perform this action on this sheet.");
                revert("You are not allowed to perform this action on this sheet.");
                //return false;
            }
        } else {
            emit sheetIdDoesNotExist(sheetID);
            revert("ID does not exist.");
            //return false;
        }
    }
}