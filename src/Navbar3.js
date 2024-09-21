import React, { useState, useEffect, useContext } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast, ToastContainer } from 'react-toastify';
import { WalletContext } from './WalletContext';
import 'react-toastify/dist/ReactToastify.css';

const BNB_TESTNET_CHAIN_ID = '0x61'; // BNB Testnet chain ID (97 in decimal)

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { account, setAccount } = useContext(WalletContext);

  useEffect(() => {
    if (account) {
      checkAndSwitchNetwork();
    }
  }, [account]);

  const checkAndSwitchNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== BNB_TESTNET_CHAIN_ID) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BNB_TESTNET_CHAIN_ID }],
          });
        }
      } catch (error) {
        console.error('Error switching network:', error);
        toast.error('Failed to switch to the correct network. Please switch to BNB Testnet manually.');
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);

    if (typeof window.ethereum !== 'undefined') {
      // Desktop with MetaMask extension
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        await checkAndSwitchNetwork();
        setIsOpen(false);
        toast.success('Wallet connected successfully');
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        toast.error('Failed to connect to MetaMask. Please try again.');
      }
    } else {
      // Mobile or desktop without MetaMask extension
      const dappUrl = window.location.href;
      const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
      
      // Open MetaMask app
      window.open(metamaskAppDeepLink, '_blank');

      // Show a message to the user
      toast.info('Please open this dApp in the MetaMask app browser', {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    }

    setIsConnecting(false);
  };

  return (
    <>
      <div className="w-full flex flex-col justify-end items-baseline h-[8vh] md:h-[12vh]">
        <button
          className="bg-transparent px-[25px] py-[10px] text-[16px] border-white border-[2px] font-[900] rounded-[10px] text-white self-end"
          onClick={() => setIsOpen(true)}
        >
          {account ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed z-[1050] top-0 left-0 right-0 bottom-0 bg-[#00000080] flex items-center justify-center"
        >
          <section 
            className="bg-[#11141F] max-w-[400px] rounded-[10px] z-[1060] py-[16px] pb-[30px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="flex justify-center items-center h-[40px] w-[40px] rounded-full bg-[#1A1F2E] absolute top-[20px] right-[20px] cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={24} />
            </div>
            <section className="p-12">
              <h2 className="text-[24px] font-sans mb-6">Connect Wallet to continue</h2>
              <button
                className="w-full bg-[#6cdf00] text-white py-2 px-4 rounded mb-2"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
              {!window.ethereum && (
                <p className="text-sm text-gray-400 mt-2">
                  MetaMask not detected. If you're on mobile, please open this dApp in the MetaMask mobile app.
                </p>
              )}
            </section>
          </section>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default Navbar;