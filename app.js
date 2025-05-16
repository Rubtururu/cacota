
// Replace this with your contract's ABI and address
const CONTRACT_ADDRESS = "0x99874ea86dd899cace932af1b41ea406103f0708";
const CONTRACT_ABI = [/* ABI goes here */];

let contract;
let signer;
let userAddress;

async function init() {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        loadStats();
        loadUserStats();
    } else {
        alert("Please install MetaMask!");
    }
}

async function loadStats() {
    try {
        const [totalStaked, totalTreasury, totalDividend, activeStakers] = await contract.getAllStats();

        document.getElementById("totalStaked").innerText = (Number(totalStaked) / 1e18).toFixed(4) + " BNB";
        document.getElementById("totalTreasury").innerText = (Number(totalTreasury) / 1e18).toFixed(4) + " BNB";
        document.getElementById("totalDividend").innerText = (Number(totalDividend) / 1e18).toFixed(4) + " BNB";
        document.getElementById("activeStakers").innerText = Number(activeStakers);
    } catch (err) {
        console.error("Error loading global stats:", err);
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
        ] = await contract.getUserStats(userAddress);

        document.getElementById("userStaked").innerText = (Number(stakedAmount) / 1e18).toFixed(4) + " BNB";
        document.getElementById("pendingRewards").innerText = (Number(pendingRewards) / 1e18).toFixed(4) + " BNB";
        document.getElementById("dailyEstimate").innerText = (Number(dailyEstimate) / 1e18).toFixed(4) + " BNB";
        document.getElementById("userShare").innerText = ((Number(userShare) / 1e16).toFixed(2)) + " %";

        const seconds = Number(nextDistributionIn);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        document.getElementById("nextDistribution").innerText = `${hours}h ${minutes}m ${secs}s`;
    } catch (err) {
        console.error("Error loading user stats:", err);
    }
}

async function stakeBNB() {
    const amount = document.getElementById("amountInput").value;
    if (!amount || isNaN(amount)) return alert("Ingrese una cantidad válida");

    const tx = await contract.stake({ value: ethers.utils.parseEther(amount) });
    await tx.wait();
    await loadStats();
    await loadUserStats();
}

async function withdrawStake() {
    const tx = await contract.withdrawStake();
    await tx.wait();
    await loadStats();
    await loadUserStats();
}

async function withdrawRewards() {
    const tx = await contract.withdrawRewards();
    await tx.wait();
    await loadStats();
    await loadUserStats();
}

window.onload = init;
