const contractAddress = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708";
const contractABI = /**
 *Submitted for verification at testnet.bscscan.com on 2025-05-15
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SmartStakingBNB {
    address public owner;
    uint256 public totalStaked;
    uint256 public totalTreasury;
    uint256 public lastGlobalUpdate;
    uint256 public activeStakers;
    uint256 constant DAY = 1 days;

    struct User {
        uint256 stakedAmount;
        uint256 rewardDebt;
        uint256 pendingRewards;
        uint256 lastUpdate;
    }

    mapping(address => User) public users;
    mapping(address => bool) public hasStaked;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        lastGlobalUpdate = block.timestamp;
    }

    receive() external payable {
        stake();
    }

    function stake() public payable {
        require(msg.value > 0, "Must send BNB");

        uint256 amount = msg.value;
        uint256 toTreasury = (amount * 90) / 100;
        uint256 toDividends = (amount * 7) / 100;
        uint256 toOwner = amount - toTreasury - toDividends;

        _updateUserDividends(msg.sender);

        users[msg.sender].stakedAmount += toTreasury;
        totalStaked += toTreasury;
        totalTreasury += toDividends;

        if (!hasStaked[msg.sender]) {
            hasStaked[msg.sender] = true;
            activeStakers += 1;
        }

        payable(owner).transfer(toOwner);
        emit Staked(msg.sender, toTreasury);
    }

    function withdrawPartialStake(uint256 amount) public {
        _updateUserDividends(msg.sender);

        User storage user = users[msg.sender];
        require(user.stakedAmount >= amount, "Insufficient staked amount");

        user.stakedAmount -= amount;
        totalStaked -= amount;

        if (user.stakedAmount == 0 && hasStaked[msg.sender]) {
            hasStaked[msg.sender] = false;
            activeStakers -= 1;
        }

        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function withdrawStake() public {
        _updateUserDividends(msg.sender);

        User storage user = users[msg.sender];
        uint256 amount = user.stakedAmount;
        require(amount > 0, "Nothing to withdraw");

        user.stakedAmount = 0;
        totalStaked -= amount;

        if (hasStaked[msg.sender]) {
            hasStaked[msg.sender] = false;
            activeStakers -= 1;
        }

        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function withdrawRewards() public {
        _updateUserDividends(msg.sender);

        uint256 reward = users[msg.sender].pendingRewards;
        require(reward > 0, "No rewards");

        users[msg.sender].pendingRewards = 0;
        payable(msg.sender).transfer(reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function _updateUserDividends(address userAddr) internal {
        User storage user = users[userAddr];

        if (user.stakedAmount == 0) {
            user.lastUpdate = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - user.lastUpdate;
        if (timeElapsed < DAY) return;

        uint256 userShare = (user.stakedAmount * 1e18) / totalStaked;
        uint256 daysPassed = timeElapsed / DAY;
        uint256 dailyDividend = (totalTreasury * 3) / 100;

        uint256 reward = (dailyDividend * daysPassed * userShare) / 1e18;
        user.pendingRewards += reward;
        user.lastUpdate = block.timestamp;
    }

    // === ESTADÍSTICAS ===

    function getUserStakedAmount(address userAddr) public view returns (uint256) {
        return users[userAddr].stakedAmount;
    }

    function getUserDailyDividendEstimate(address userAddr) public view returns (uint256) {
        if (totalStaked == 0) return 0;
        uint256 dailyDividend = (totalTreasury * 3) / 100;
        uint256 share = (users[userAddr].stakedAmount * 1e18) / totalStaked;
        return (dailyDividend * share) / 1e18;
    }

    function getTotalDailyDividend() public view returns (uint256) {
        return (totalTreasury * 3) / 100;
    }

    function getUserShare(address userAddr) public view returns (uint256) {
        if (totalStaked == 0) return 0;
        return (users[userAddr].stakedAmount * 1e18) / totalStaked;
    }

    function getTimeUntilNextDistribution(address userAddr) public view returns (uint256) {
        uint256 last = users[userAddr].lastUpdate;
        if (last == 0) return 0;
        uint256 elapsed = block.timestamp - last;
        if (elapsed >= DAY) return 0;
        return DAY - elapsed;
    }

    function getPendingRewards(address userAddr) public view returns (uint256) {
        User storage user = users[userAddr];

        if (user.stakedAmount == 0 || totalStaked == 0) return user.pendingRewards;

        uint256 timeElapsed = block.timestamp - user.lastUpdate;
        uint256 daysPassed = timeElapsed / DAY;
        if (daysPassed == 0) return user.pendingRewards;

        uint256 userShare = (user.stakedAmount * 1e18) / totalStaked;
        uint256 dailyDividend = (totalTreasury * 3) / 100;
        uint256 reward = (dailyDividend * daysPassed * userShare) / 1e18;

        return user.pendingRewards + reward;
    }

    function getAllStats() public view returns (
        uint256 _totalStaked,
        uint256 _totalTreasury,
        uint256 _dailyDividend,
        uint256 _activeStakers
    ) {
        return (
            totalStaked,
            totalTreasury,
            getTotalDailyDividend(),
            activeStakers
        );
    }

    function getUserStats(address userAddr) public view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 dailyEstimate,
        uint256 userShare,
        uint256 nextDistributionIn
    ) {
        stakedAmount = users[userAddr].stakedAmount;
        pendingRewards = getPendingRewards(userAddr);
        dailyEstimate = getUserDailyDividendEstimate(userAddr);
        userShare = getUserShare(userAddr);
        nextDistributionIn = getTimeUntilNextDistribution(userAddr);
    }
};

let web3, contract, userAddress;
const connectBtn = document.getElementById("connectWallet");
const stakeInput = document.getElementById("stakeAmount");
const stakeBtn = document.getElementById("stakeButton");
const withdrawPartialBtn = document.getElementById("withdrawStakeButton");
const claimBtn = document.getElementById("withdrawRewardsButton");

// Global stats
const elTotalStaked = document.getElementById("totalStaked");
const elTotalTreasury = document.getElementById("totalTreasury");
const elDailyDividend = document.getElementById("totalDailyDividend");
const elActiveStakers = document.getElementById("totalUsers");

// User stats
const elUserStaked = document.getElementById("userStaked");
const elPending = document.getElementById("pendingRewards");
const elEstimate = document.getElementById("dailyEstimate");
const elShare = document.getElementById("userShare");
const elNextDist = document.getElementById("nextDistribution");

// Formateo
const fmtBNB = v => Number(web3.utils.fromWei(v.toString(), 'ether')).toFixed(4);
const fmtPct = v => (Number(v) / 1e16).toFixed(4); // 1e18 -> 100%

async function connectWallet() {
  if (!window.ethereum) return alert("Instala MetaMask");
  web3 = new Web3(window.ethereum);
  const accs = await ethereum.request({ method: 'eth_requestAccounts' });
  userAddress = accs[0];
  connectBtn.textContent = userAddress.slice(0, 6) + "…" + userAddress.slice(-4);
  contract = new web3.eth.Contract(contractABI, contractAddress);
  refreshAll();
}

async function refreshAll() {
  try {
    // Global
    const [totSt, totT, dailyD, active] = await contract.methods.getAllStats().call();
    elTotalStaked.textContent = fmtBNB(totSt) + " BNB";
    elTotalTreasury.textContent = fmtBNB(totT) + " BNB";
    elDailyDividend.textContent = fmtBNB(dailyD) + " BNB";
    elActiveStakers.textContent = active;

    if (!userAddress) return;

    // Obtener stats individuales por separado (más confiable)
    const stakedAmount = await contract.methods.getUserStakedAmount(userAddress).call();
    const pendingRewards = await contract.methods.getPendingRewards(userAddress).call();
    const dailyEstimate = await contract.methods.getUserDailyDividendEstimate(userAddress).call();
    const userShare = await contract.methods.getUserShare(userAddress).call();
    const nextDist = await contract.methods.getTimeUntilNextDistribution(userAddress).call();

    elUserStaked.textContent = fmtBNB(stakedAmount) + " BNB";
    elPending.textContent = fmtBNB(pendingRewards) + " BNB";
    elEstimate.textContent = fmtBNB(dailyEstimate) + " BNB";
    elShare.textContent = fmtPct(userShare) + " %";
    elNextDist.textContent = formatCountdown(Number(nextDist));

    // Debug en consola
    console.log({
      stakedAmount,
      pendingRewards,
      dailyEstimate,
      userShare,
      nextDist
    });

  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
  }
}

function formatCountdown(sec) {
  if (sec <= 0) return "Disponible";
  const h = Math.floor(sec / 3600),
        m = Math.floor((sec % 3600) / 60),
        s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

async function doStake() {
  const amt = stakeInput.value;
  if (!amt || amt <= 0) return alert("Monto inválido");
  const val = web3.utils.toWei(amt, 'ether');
  await contract.methods.stake().send({ from: userAddress, value: val });
  refreshAll();
}

async function doPartialWithdraw() {
  const amt = prompt("¿Cuánto BNB retirar? (ej: 0.1)");
  if (!amt || amt <= 0) return;
  const val = web3.utils.toWei(amt, 'ether');
  await contract.methods.withdrawPartialStake(val).send({ from: userAddress });
  refreshAll();
}

async function doClaim() {
  await contract.methods.withdrawRewards().send({ from: userAddress });
  refreshAll();
}

// Eventos
connectBtn.onclick = connectWallet;
stakeBtn.onclick = doStake;
withdrawPartialBtn.onclick = doPartialWithdraw;
claimBtn.onclick = doClaim;

// Al cargar la página
window.addEventListener("load", () => {
  if (window.ethereum) {
    connectBtn.onclick = connectWallet;
  } else {
    alert("Instala MetaMask");
  }
});
