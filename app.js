const contractAddress = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708"; // Reemplaza por tu dirección real si cambia
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAccount;

async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0];
        contract = new web3.eth.Contract(abi, contractAddress);

        document.getElementById("walletAddress").innerText = userAccount;
        await loadAllStats();
        await loadUserStats();
    } else {
        alert("MetaMask no está instalada.");
    }
}

async function loadAllStats() {
    try {
        const stats = await contract.methods.getAllStats().call();
        if (Array.isArray(stats) && stats.length === 4) {
            const [totalStaked, totalTreasury, dailyDividend, activeStakers] = stats;

            document.getElementById("totalStaked").innerText = web3.utils.fromWei(totalStaked) + " BNB";
            document.getElementById("totalTreasury").innerText = web3.utils.fromWei(totalTreasury) + " BNB";
            document.getElementById("dailyDividend").innerText = web3.utils.fromWei(dailyDividend) + " BNB";
            document.getElementById("activeStakers").innerText = activeStakers;
        } else {
            console.error("Respuesta inesperada de getAllStats:", stats);
        }
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

async function loadUserStats() {
    try {
        const [
            stakedAmount,
            pendingRewards,
            dailyEstimate,
            userShare,
            nextDistributionIn
        ] = await contract.methods.getUserStats(userAccount).call();

        document.getElementById("userStaked").innerText = web3.utils.fromWei(stakedAmount) + " BNB";
        document.getElementById("pendingRewards").innerText = web3.utils.fromWei(pendingRewards) + " BNB";
        document.getElementById("dailyEstimate").innerText = web3.utils.fromWei(dailyEstimate) + " BNB";
        document.getElementById("userShare").innerText = (Number(userShare) / 1e16).toFixed(2) + "%";
        document.getElementById("nextDistribution").innerText = formatSeconds(nextDistributionIn);
    } catch (error) {
        console.error("Error loading user stats:", error);
    }
}

function formatSeconds(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

async function stake() {
    try {
        const amountInput = document.getElementById("stakeAmount").value;
        if (!amountInput || isNaN(amountInput) || Number(amountInput) <= 0) {
            alert("Introduce una cantidad válida de BNB.");
            return;
        }

        const amount = web3.utils.toWei(amountInput, "ether");

        await contract.methods.stake().send({
            from: userAccount,
            value: amount
        });

        await loadAllStats();
        await loadUserStats();
        alert("¡Staking exitoso!");
    } catch (error) {
        console.error("Stake failed:", error);
        alert("Error al hacer stake: " + (error.message || error));
    }
}

async function withdrawAllStake() {
    try {
        await contract.methods.withdrawStake().send({ from: userAccount });
        await loadAllStats();
        await loadUserStats();
        alert("Stake retirado completamente.");
    } catch (error) {
        console.error("Withdraw failed:", error);
        alert("Error al retirar stake.");
    }
}

async function withdrawPartialStake() {
    try {
        const amountInput = document.getElementById("withdrawAmount").value;
        if (!amountInput || isNaN(amountInput) || Number(amountInput) <= 0) {
            alert("Introduce una cantidad válida para retirar.");
            return;
        }

        const amount = web3.utils.toWei(amountInput, "ether");

        await contract.methods.withdrawPartialStake(amount).send({ from: userAccount });
        await loadAllStats();
        await loadUserStats();
        alert("Cantidad retirada con éxito.");
    } catch (error) {
        console.error("Partial withdraw failed:", error);
        alert("Error al retirar parcialmente.");
    }
}

async function withdrawRewards() {
    try {
        await contract.methods.withdrawRewards().send({ from: userAccount });
        await loadUserStats();
        alert("Recompensas reclamadas.");
    } catch (error) {
        console.error("Claim failed:", error);
        alert("Error al reclamar recompensas.");
    }
}

document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("stakeButton").addEventListener("click", stake);
document.getElementById("withdrawButton").addEventListener("click", withdrawAllStake);
document.getElementById("withdrawPartialButton").addEventListener("click", withdrawPartialStake);
document.getElementById("claimButton").addEventListener("click", withdrawRewards);
