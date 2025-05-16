const contractAddress = "0x99874Ea86dD899CaCE932Af1B41ea406103f0708";
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"activeStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllStats","outputs":[{"internalType":"uint256","name":"_totalStaked","type":"uint256"},{"internalType":"uint256","name":"_totalTreasury","type":"uint256"},{"internalType":"uint256","name":"_dailyDividend","type":"uint256"},{"internalType":"uint256","name":"_activeStakers","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getPendingRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getTimeUntilNextDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTotalDailyDividend","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserDailyDividendEstimate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserShare","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddr","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"dailyEstimate","type":"uint256"},{"internalType":"uint256","name":"userShare","type":"uint256"},{"internalType":"uint256","name":"nextDistributionIn","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastGlobalUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stake","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTreasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartialStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawStake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

let web3;
let contract;
let userAccount;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    userAccount = (await web3.eth.getAccounts())[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    loadStats();
    setupEventListeners();
  } else {
    alert("MetaMask no detectado.");
  }
});

async function loadStats() {
  try {
    const [
      totalStaked,
      totalTreasury,
      totalDividend,
      pendingRewards,
      userEstimate,
      nextDistribution,
      userShare,
      userStake
    ] = await Promise.all([
      contract.methods.totalStaked().call(),
      contract.methods.totalTreasury().call(),
      contract.methods.getTotalDailyDividend().call(),
      contract.methods.getPendingRewards(userAccount).call(),
      contract.methods.getUserDailyDividendEstimate(userAccount).call(),
      contract.methods.getTimeUntilNextDistribution(userAccount).call(),
      contract.methods.getUserShare(userAccount).call(),
      contract.methods.getUserStake(userAccount).call()
    ]);

    const usersWithStake = await contract.methods.getStakersLength().call();

    // Mostrar datos
    document.getElementById("totalStaked").innerText = formatBNB(totalStaked) + " BNB";
    document.getElementById("totalTreasury").innerText = formatBNB(totalTreasury) + " BNB";
    document.getElementById("dailyDividend").innerText = formatBNB(totalDividend) + " BNB";
    document.getElementById("activeStakers").innerText = usersWithStake;

    document.getElementById("userShare").innerText = (userShare / 100).toFixed(4) + " %";
    document.getElementById("userStaked").innerText = formatBNB(userStake) + " BNB";
    document.getElementById("pendingRewards").innerText = formatBNB(pendingRewards) + " BNB";
    document.getElementById("dailyEstimate").innerText = formatBNB(userEstimate) + " BNB";

    document.getElementById("nextDistribution").innerText = formatTime(nextDistribution);

    // Dibujar gráfico (simulado por ahora)
    drawChart([
      formatBNB(totalTreasury),
      formatBNB(totalDividend),
      formatBNB(totalStaked)
    ]);

  } catch (err) {
    console.error("Error al cargar estadísticas:", err);
  }
}

function formatBNB(value) {
  return parseFloat(web3.utils.fromWei(value, "ether")).toFixed(8);
}

function formatTime(seconds) {
  seconds = parseInt(seconds);
  if (isNaN(seconds) || seconds <= 0) return "Ahora mismo";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function setupEventListeners() {
  document.getElementById("stakeButton").onclick = async () => {
    const amount = document.getElementById("stakeAmount").value;
    if (!amount || isNaN(amount) || amount <= 0) return;
    const weiAmount = web3.utils.toWei(amount, "ether");
    try {
      await contract.methods.stake().send({ from: userAccount, value: weiAmount });
      loadStats();
    } catch (err) {
      console.error("Error en stake:", err);
    }
  };

  document.getElementById("withdrawButton").onclick = async () => {
    try {
      await contract.methods.withdrawAllStake().send({ from: userAccount });
      loadStats();
    } catch (err) {
      console.error("Error al retirar stake:", err);
    }
  };

  document.getElementById("claimButton").onclick = async () => {
    try {
      await contract.methods.claimRewards().send({ from: userAccount });
      loadStats();
    } catch (err) {
      console.error("Error al reclamar recompensas:", err);
    }
  };
}

function drawChart(data) {
  const ctx = document.getElementById("treasuryChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Tesoro", "Dividendos", "Total Stakeado"],
      datasets: [{
        label: "BNB",
        data: data.map(x => parseFloat(x)),
        backgroundColor: ["#00acc1", "#4dd0e1", "#80deea"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + " BNB";
            }
          }
        }
      }
    }
  });
}
