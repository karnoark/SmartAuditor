// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DecentralizedVoting
 * @dev A contract for conducting decentralized voting on proposals
 */
contract DecentralizedVoting {
    // Struct to represent a voting proposal
    struct Proposal {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    // State variables
    address public admin;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public registeredVoters;
    uint256 public voterCount;
    
    // Events
    event VoterRegistered(address voter);
    event VoterRemoved(address voter);
    event ProposalCreated(uint256 proposalId, string title, uint256 startTime, uint256 endTime);
    event Voted(uint256 proposalId, address voter, bool vote);
    event ProposalExecuted(uint256 proposalId, bool result);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(registeredVoters[msg.sender], "Only registered voters can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the admin to the contract deployer
     */
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Register a new voter
     * @param _voter Address of the voter to register
     */
    function registerVoter(address _voter) public onlyAdmin {
        require(!registeredVoters[_voter], "Voter already registered");
        registeredVoters[_voter] = true;
        voterCount++;
        emit VoterRegistered(_voter);
    }
    
    /**
     * @dev Bulk register multiple voters
     * @param _voters Array of voter addresses to register
     */
    function bulkRegisterVoters(address[] memory _voters) public onlyAdmin {
        for (uint256 i = 0; i < _voters.length; i++) {
            if (!registeredVoters[_voters[i]]) {
                registeredVoters[_voters[i]] = true;
                voterCount++;
                emit VoterRegistered(_voters[i]);
            }
        }
    }
    
    /**
     * @dev Remove a voter
     * @param _voter Address of the voter to remove
     */
    function removeVoter(address _voter) public onlyAdmin {
        require(registeredVoters[_voter], "Voter not registered");
        registeredVoters[_voter] = false;
        voterCount--;
        emit VoterRemoved(_voter);
    }
    
    /**
     * @dev Create a new proposal
     * @param _title Title of the proposal
     * @param _description Description of the proposal
     * @param _startTime Start time of the voting period
     * @param _duration Duration of the voting period in seconds
     * @return proposalId ID of the created proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _duration
    ) public onlyAdmin returns (uint256 proposalId) {
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_duration > 0, "Duration must be positive");
        
        proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.title = _title;
        proposal.description = _description;
        proposal.startTime = _startTime;
        proposal.endTime = _startTime + _duration;
        proposal.yesVotes = 0;
        proposal.noVotes = 0;
        proposal.executed = false;
        
        emit ProposalCreated(proposalId, _title, _startTime, proposal.endTime);
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     * @param _proposalId ID of the proposal
     * @param _vote True for yes, false for no
     */
    function vote(uint256 _proposalId, bool _vote) public onlyRegisteredVoter {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting has not started yet");
        require(block.timestamp <= proposal.endTime, "Voting has ended");
        require(!proposal.hasVoted[msg.sender], "Voter has already voted");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (_vote) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        emit Voted(_proposalId, msg.sender, _vote);
    }
    
    /**
     * @dev Execute a proposal after voting ends
     * @param _proposalId ID of the proposal
     */
    function executeProposal(uint256 _proposalId) public onlyAdmin {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting has not ended yet");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        bool result = proposal.yesVotes > proposal.noVotes;
        
        emit ProposalExecuted(_proposalId, result);
    }
    
    /**
     * @dev Get the result of a completed proposal
     * @param _proposalId ID of the proposal
     * @return yesVotes Number of yes votes
     * @return noVotes Number of no votes
     * @return totalVotes Total votes cast
     * @return passed Whether the proposal passed
     */
    function getProposalResult(uint256 _proposalId) public view returns (
        uint256 yesVotes,
        uint256 noVotes,
        uint256 totalVotes,
        bool passed
    ) {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting has not ended yet");
        
        yesVotes = proposal.yesVotes;
        noVotes = proposal.noVotes;
        totalVotes = yesVotes + noVotes;
        passed = yesVotes > noVotes;
        
        return (yesVotes, noVotes, totalVotes, passed);
    }
    
    /**
     * @dev Check if a voter has voted on a proposal
     * @param _proposalId ID of the proposal
     * @param _voter Address of the voter
     * @return Whether the voter has voted
     */
    function hasVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
}
