// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract P2PLending {
    enum Status { None, Offered, Active, Repaid, Cancelled }

    struct Loan {
        address lender;
        address borrower;
        uint256 principal;
        uint256 apr;
        uint256 duration;
        uint256 startTs;
        uint256 dueTs;
        uint256 repaid;
        uint256 createdAt; // para ordenar en UI
        Status  status;    // ciclo de vida
        string comment;
    }

    uint256 public nextId;                         // empieza en 0; primera oferta será id=1
    mapping(uint256 => Loan) public loans;

    // Índices para el frontend
    uint256[] public allOfferIds;                  // todas las ofertas creadas
    uint256[] public openOfferIds;                 // ofertas abiertas (no aceptadas/canceladas)
    mapping(uint256 => uint256) private openIndex; // id => index+1 en openOfferIds (0 = no está)
    mapping(address => uint256[]) public offersByLender; // ids por prestamista

    // Eventos
    event OfferCreated(uint256 indexed id, address indexed lender, uint256 principal, uint256 duration, uint256 apr, string comment);
    event OfferCancelled(uint256 indexed id);
    event LoanAccepted(uint256 indexed id, address indexed borrower, uint256 startTs, uint256 dueTs);
    event Repaid(uint256 indexed id, address indexed borrower, uint256 amount, uint256 totalRepaid);

    function createOffer(uint256 principal, uint256 duration, uint256 apr, string memory comment) external returns (uint256 id) {
        require(principal > 0, "principal=0");
        require(duration > 0, "duration=0");

        id = ++nextId;
        loans[id] = Loan({
            lender: msg.sender,
            borrower: address(0),
            principal: principal,
            duration: duration,
            apr: apr,
            startTs: 0,
            dueTs: 0,
            repaid: 0,
            createdAt: block.timestamp,
            status: Status.Offered,
            comment: comment
        });

        // indexación
        allOfferIds.push(id);
        openOfferIds.push(id);
        openIndex[id] = openOfferIds.length; // guardamos index+1
        offersByLender[msg.sender].push(id);

        emit OfferCreated(id, msg.sender, principal, duration, apr, comment);
    }

    function cancelOffer(uint256 id) external {
        Loan storage L = loans[id];
        require(L.lender != address(0), "no offer");
        require(L.status == Status.Offered, "not open");
        require(L.lender == msg.sender, "not lender");

        L.status = Status.Cancelled;
        _removeFromOpen(id);

        emit OfferCancelled(id);
    }

    function acceptOffer(uint256 id) external {
        Loan storage L = loans[id];
        require(L.lender != address(0), "no offer");
        require(L.status == Status.Offered, "not open");

        L.borrower = msg.sender;
        L.startTs = block.timestamp;
        L.dueTs   = block.timestamp + L.duration;
        L.status  = Status.Active;

        _removeFromOpen(id);

        emit LoanAccepted(id, msg.sender, L.startTs, L.dueTs);
    }

    function repay(uint256 id, uint256 amount) external {
        Loan storage L = loans[id];
        require(L.status == Status.Active, "not active");
        require(L.borrower == msg.sender, "not borrower");
        require(amount > 0, "amount=0");

        L.repaid += amount;
        emit Repaid(id, msg.sender, amount, L.repaid);
    }

    function getOffer(uint256 id) external view returns (Loan memory) {
        return loans[id];
    }

    /// @notice IDs de ofertas abiertas en [offset, offset+limit)
    function getOpenOfferIds(uint256 offset, uint256 limit)
        external
        view
        returns (uint256[] memory slice)
    {
        uint256 n = openOfferIds.length;
        if (offset >= n) {
            return slice;
        }

        uint256 end = offset + limit;
        if (end > n) end = n;
        uint256 len = end - offset;

        slice = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            slice[i] = openOfferIds[offset + i];
        }
    }

    /// @notice IDs de ofertas por prestamista en [offset, offset+limit)
    function getOffersByLenderIds(address lender, uint256 offset, uint256 limit)
        external
        view
        returns (uint256[] memory slice)
    {
        uint256 n = offersByLender[lender].length;
        if (offset >= n) {
            return slice;
        }

        uint256 end = offset + limit;
        if (end > n) end = n;
        uint256 len = end - offset;

        slice = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            slice[i] = offersByLender[lender][offset + i];
        }
    }

    function openOffersLength() external view returns (uint256) { return openOfferIds.length; }
    function allOffersLength()  external view returns (uint256) { return allOfferIds.length; }
    function offersByLenderLength(address lender) external view returns (uint256) { return offersByLender[lender].length; }

    function _removeFromOpen(uint256 id) internal {
        uint256 idxPlusOne = openIndex[id];
        if (idxPlusOne == 0) return;
        uint256 i = idxPlusOne - 1;
        uint256 lastId = openOfferIds[openOfferIds.length - 1];

        openOfferIds[i] = lastId;
        openIndex[lastId] = i + 1;

        openOfferIds.pop();
        openIndex[id] = 0;
    }
}