// --- Konfigurasi Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyCyPi0BkSGOK03rgw7GrD2EbBi-TTBq5Cs",
  authDomain: "selsi-privatesale.firebaseapp.com",
  projectId: "selsi-privatesale",
  storageBucket: "selsi-privatesale.firebasestorage.app",
  messagingSenderId: "1009458074742",
  appId: "1:1009458074742:web:aaa84eff8151d3d22bbb57",
  measurementId: "G-PX0D4QPXY5",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Data Kontrak ---
const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT BSC
const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

const SELSI_PRIVATE_SALE_CONTRACT_ADDRESS =
  "0xF60b02E59Eb5A1fc4a7cF2FaAc324924c550AD19";
  const SELSI_PRIVATE_SALE_CONTRACT_ADDRESS2 =
  "CNq9K5igjDDRS9srELJ9ydjf21TqZUbQ5HMphFvzQDZd";
const SELSI_PRIVATE_SALE_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// --- Variabel Global ---
let isWalletConnected = false;
let userAddress = null;

// --- Fungsi Helper ---
function formatAddress(address) {
  if (!address) return "0x0";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}

// --- UI Functions ---
function updateButtonUI(balance, address) {
  const buttons = [
    document.getElementById("connectWalletBtn"),
    document.getElementById("connectWalletMobileBtn"),
  ];
  const buyButton = document.getElementById("openBuyModal");

  const displayAddress = formatAddress(address);
  const newButtonContent = `
      <img src="assets/usdt.png" class="coin-logo" alt="USDT Logo">
      <span>${balance}</span>
      <div class="divider"></div>
      <span>${displayAddress}</span>
  `;

  buttons.forEach((btn) => {
    if (btn) {
      btn.innerHTML = newButtonContent;
      btn.classList.add("wallet-connected");
    }
  });

  if (buyButton) buyButton.disabled = false;
}

function resetButtonUI() {
  const buttons = [
    document.getElementById("connectWalletBtn"),
    document.getElementById("connectWalletMobileBtn"),
  ];
  const buyButton = document.getElementById("openBuyModal");

  buttons.forEach((btn) => {
    if (btn) btn.innerHTML = "CONNECT WALLET";
  });
  if (buyButton) buyButton.disabled = true;
}

// --- Blockchain Functions ---
async function getUSDTBalance(address) {
  if (!window.ethereum) return "0.00";
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      provider
    );
    const balance = await usdtContract.balanceOf(address);
    return parseFloat(ethers.utils.formatUnits(balance, 18)).toFixed(2);
  } catch (err) {
    console.error("Error getting USDT balance:", err);
    return "0.00";
  }
}

async function connectWallet() {
  // Cek apakah perangkat adalah mobile dan tidak di dalam in-app browser MetaMask
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isMetaMaskApp = window.ethereum && window.ethereum.isMetaMask;

  if (isMobile && !isMetaMaskApp) {
    // Alihkan ke MetaMask mobile app via deep link
    const currentUrl = encodeURIComponent(window.location.href);
    const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}?connect=true`;
    window.location.href = metamaskUrl;
    return; // Hentikan eksekusi lebih lanjut
  }

  // Logika koneksi untuk desktop atau in-app browser
  if (!window.ethereum) {
    return alert(
      "Please install MetaMask or open this page in a crypto wallet browser."
    );
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    userAddress = accounts[0];
    localStorage.setItem("connectedWalletAddress", userAddress);
    const balance = await getUSDTBalance(userAddress);
    updateButtonUI(balance, userAddress);
    isWalletConnected = true;
  } catch (err) {
    console.error("Connect wallet failed:", err);
  }
   // --- Tutup mobile menu kalau terbuka ---
   const mobileMenu = document.querySelector('.mobile-menu');
   if (mobileMenu && mobileMenu.classList.contains('active')) {
     mobileMenu.classList.remove('active');
   }
}

function disconnectWallet() {
  isWalletConnected = false;
  userAddress = null;
  localStorage.removeItem("connectedWalletAddress");
  resetButtonUI();
  console.log("Wallet disconnected.");
   // --- Tutup mobile menu kalau terbuka ---
   const mobileMenu = document.querySelector('.mobile-menu');
   if (mobileMenu && mobileMenu.classList.contains('active')) {
     mobileMenu.classList.remove('active');
   }
}

// --- Modal Functions ---
function setupModalListeners() {
  const modal = document.getElementById("buyModal");
  const openBtn = document.getElementById("openBuyModal");
  const closeBtn = document.querySelector(".close-button");
  const buyAmountInput = document.getElementById("buyAmount");
  const estimatedTokens = document.getElementById("estimatedTokens");
  const solanaInput = document.getElementById("solanaAddress");
  const emailInput = document.getElementById("emailAddress");
  const modalBuyBtn = document.getElementById("modalBuyButton");

  const PRICE_PER_SELSI = 0.3;
  const PRICE_PER_USDT = 1 / PRICE_PER_SELSI;

  const resetInputs = () => {
    buyAmountInput.value = "";
    estimatedTokens.textContent = "0 SELSI";
    solanaInput.value = "";
    emailInput.value = "";
    modalBuyBtn.disabled = true;
  };

  const validateInputs = () => {
    const amount = parseFloat(buyAmountInput.value);
    let error = "";

    if (!isNaN(amount) && amount > 0) {
      estimatedTokens.textContent = `${(amount * PRICE_PER_USDT).toFixed(2)} SELSI`;

      if (amount < 500) {
        error = "❌ The minimum purchase is 500 USDT";
      } else if (amount > 10000) {
        error = "❌ The maximum purchase is 10000 USDT.";
      }
    } else {
      estimatedTokens.textContent = "0 SELSI";
    }

    if (errorMessage) errorMessage.textContent = error;

    modalBuyBtn.disabled =
      isNaN(amount) ||
      amount < 500 ||
      amount > 10000 ||
      solanaInput.value.trim() === "" ||
      emailInput.value.trim() === "";
  };

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      if (!isWalletConnected) return alert("Connect wallet first!");
      modal.style.display = "block";
      document.getElementById("walletAddressModal").textContent = userAddress;
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
      resetInputs();
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      resetInputs();
    }
  });

  [buyAmountInput, solanaInput, emailInput].forEach((el) => {
    if (el) el.addEventListener("input", validateInputs);
  });

  if (modalBuyBtn) {
    modalBuyBtn.addEventListener("click", handleBuyTransaction);
  }
}

async function handleBuyTransaction() {
  const modalBuyBtn = document.getElementById("modalBuyButton");
  const usdtAmount = parseFloat(document.getElementById("buyAmount").value);
  const solanaAddress = document.getElementById("solanaAddress").value.trim();
  const emailAddress = document.getElementById("emailAddress").value.trim();

  if (isNaN(usdtAmount) || usdtAmount < 1 || !solanaAddress || !emailAddress) {
    return alert("Please fill all fields correctly.");
  }

  try {
    modalBuyBtn.disabled = true;
    const originalText = modalBuyBtn.textContent;
    modalBuyBtn.textContent = "Processing... ⏳";

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      signer
    );
    const amountWei = ethers.utils.parseUnits(usdtAmount.toString(), 18);
    const approveTx = await usdtContract.approve(
      SELSI_PRIVATE_SALE_CONTRACT_ADDRESS,
      amountWei
    );
    await approveTx.wait();
    console.log("USDT approved.");

    const selsiContract = new ethers.Contract(
      SELSI_PRIVATE_SALE_CONTRACT_ADDRESS,
      SELSI_PRIVATE_SALE_ABI,
      signer
    );

    let buyTx;
    if (selsiContract.buy) {
      buyTx = await selsiContract.buy(amountWei);
    } else if (selsiContract.contribute) {
      buyTx = await selsiContract.contribute(amountWei);
    } else {
      throw new Error("Function buy/contribute not found in contract!");
    }
    await buyTx.wait();

    const PRICE_PER_SELSI = 0.1;
    const selsiAmount = usdtAmount / PRICE_PER_SELSI;

    showSuccessModal(usdtAmount, selsiAmount, buyTx.hash);
    document.getElementById("buyModal").style.display = "none";

    await db.collection("transactions").add({
      wallet: userAddress,
      usdt: usdtAmount,
      selsi: selsiAmount,
      solana: solanaAddress,
      email: emailAddress,
      txHash: buyTx.hash,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Transaction saved to Firebase!");

    setupModalListeners();
  } catch (err) {
    console.error("Transaction failed:", err);
    alert(`Transaksi gagal: ${err.message}`);
  } finally {
    modalBuyBtn.disabled = false;
    modalBuyBtn.textContent = "BUY NOW";
  }
}

// --- Realtime Update Progress Bar & Stats dari Firebase ---
function setupRealtimeProgress() {
  const TARGET_USDT = 1000000; // Total target private sale, diperbarui dari 100
  const dataProgressElems = document.querySelectorAll(".data-proggress p");
  const progressBar = document.getElementById("myProgressBar");
  const dataPembelianElems = document.querySelectorAll(".data-pembelian p");

  db.collection("transactions").onSnapshot((snapshot) => {
    const transactions = snapshot.docs.map((doc) => doc.data());

    const totalUSDT = transactions.reduce((sum, tx) => {
      const usdt = parseFloat(tx.usdt);
      return sum + (isNaN(usdt) ? 0 : usdt);
    }, 0);

    const progressPercent = Math.min((totalUSDT / TARGET_USDT) * 100, 100);
    const participantCount = transactions.length;

    if (dataProgressElems.length >= 2) {
      dataProgressElems[0].textContent = `${participantCount} PARTICIPANT${
        participantCount > 1 ? "S" : ""
      }`;
      dataProgressElems[1].textContent = `PROGRESS ${progressPercent.toFixed(
        2
      )}%`;
    }

    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    if (dataPembelianElems.length >= 1) {
      dataPembelianElems[0].textContent = `${totalUSDT.toFixed(2)} USDT`;
      if (dataPembelianElems.length >= 2) {
        dataPembelianElems[1].textContent = `${TARGET_USDT.toFixed(2)} USDT`;
      }
    }
  });
}

// --- Show Success Modal ---
function showSuccessModal(usdtAmount, selsiAmount, txHash) {
  const successModal = document.getElementById("successModal");
  const closeBtn = document.querySelector(".close-success");

  const tge = selsiAmount * 0.15;
  const vestingMonthly = selsiAmount * 0.077;

  document.getElementById(
    "successYouBuy"
  ).textContent = `You Buy: ${usdtAmount} USDT / ${selsiAmount.toFixed(
    2
  )} SELSI`;
  document.getElementById("successTGE").textContent = `TGE 15% = ${tge.toFixed(
    2
  )} SELSI`;
  document.getElementById(
    "successVesting"
  ).textContent = `Vesting 11 Month 7.7% = ${vestingMonthly.toFixed(
    2
  )} SELSI / Month`;
  document.getElementById(
    "successContract"
  ).textContent = `Selsi Contract Address: ${SELSI_PRIVATE_SALE_CONTRACT_ADDRESS2}`;
  document.getElementById(
    "bscScanLink"
  ).href = `https://bscscan.com/tx/${txHash}`;

  successModal.style.display = "block";

  if (closeBtn) {
    closeBtn.onclick = () => (successModal.style.display = "none");
  }

  window.onclick = (e) => {
    if (e.target === successModal) successModal.style.display = "none";
  };
}

// --- Initialize ---
document.addEventListener("DOMContentLoaded", async () => {
  // Cek apakah Ethers.js dimuat
  if (!window.ethereum || !ethers) {
    console.error("Ethers.js not loaded or MetaMask not found.");
  }

  const connectBtn = document.getElementById("connectWalletBtn");
  const connectMobileBtn = document.getElementById("connectWalletMobileBtn"); // --- Perbaikan Logika Disconnect --- // Menggunakan fungsi terpisah untuk menangani klik tombol

  const handleConnectClick = () => {
    if (isWalletConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  }; // Menambahkan event listener ke tombol

  if (connectBtn) {
    connectBtn.addEventListener("click", handleConnectClick);
  }
  if (connectMobileBtn) {
    connectMobileBtn.addEventListener("click", handleConnectClick);
  }

  setupModalListeners(); // --- Toggle mobile menu ---

  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  } // --- Realtime listener untuk update participant & progress ---

  setupRealtimeProgress(); // --- Logika koneksi ulang saat refresh ---

  const storedAddress = localStorage.getItem("connectedWalletAddress");
  if (storedAddress) {
    userAddress = storedAddress;
    isWalletConnected = true;
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.includes(userAddress)) {
        const balance = await getUSDTBalance(userAddress);
        updateButtonUI(balance, userAddress);
      } else {
        disconnectWallet();
      }
    } else {
      updateButtonUI("N/A", userAddress);
      const buyButton = document.getElementById("openBuyModal");
      if (buyButton) buyButton.disabled = true;
    }
  } else {
    resetButtonUI();
  }
});


document.getElementById("copyBtn").addEventListener("click", function () {
  const link = "https://privatesale.selsiworld.com/";

  // Salin ke clipboard
  navigator.clipboard.writeText(link).then(() => {
    alert("Link berhasil disalin: " + link);
  }).catch(err => {
    console.error("Gagal menyalin link: ", err);
  });
});