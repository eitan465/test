document.getElementById('connectWallet').addEventListener('click', async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            // Request wallet connection
            const response = await window.solana.connect();
            console.log('Connected to wallet:', response.publicKey.toString());

            // Display wallet information
            document.getElementById('walletAddress').textContent = response.publicKey.toString();
            document.getElementById('walletInfo').style.display = 'block';

        } catch (err) {
            console.error('Wallet connection failed:', err);
        }
    } else {
        alert('Phantom wallet not found. Please install Phantom wallet extension.');
    }
});

document.getElementById('distributionForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const tokenAmount = parseFloat(document.getElementById('tokenAmount').value);
    const walletCount = parseInt(document.getElementById('walletCount').value);
    const addresses = document.getElementById('addresses').value.split(',');

    if (addresses.length !== walletCount) {
        alert('The number of addresses must match the wallet count.');
        return;
    }

    if (!window.solana || !window.solana.isConnected) {
        alert('Please connect your wallet first.');
        return;
    }

    try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
        const fromWallet = window.solana.publicKey;

        for (let i = 0; i < walletCount; i++) {
            const toWallet = new solanaWeb3.PublicKey(addresses[i].trim());
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromWallet,
                    toPubkey: toWallet,
                    lamports: solanaWeb3.LAMPORTS_PER_SOL * (tokenAmount / walletCount), // Adjust as needed for your token
                })
            );
            const { signature } = await window.solana.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signature);
            console.log('Transaction successful:', signature);
        }
        alert('Tokens distributed successfully!');
    } catch (err) {
        console.error('Error distributing tokens:', err);
        alert('Transaction failed. Check console for more details.');
    }
});
