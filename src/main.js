import React, { useState, useEffect, useContext } from "react";
import { ButtonBase } from "@mui/material";
import { ethers } from "ethers";
import { BrowserProvider } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import { WalletContext } from './WalletContext';
import 'react-toastify/dist/ReactToastify.css';
import ContractABI from "./Constant/ContractABI";
import FormHeader from "./FormHeader";
import StakeButton from "./StakingButton";
import Navbar from "./Navbar";

const CONTRACT_ADDRESS = "0x0b5c0017B8ca9300E51710Dc1160879d9fD77587";
const CONTRACT_ABI = ContractABI;

const Main = () => {
  const [amount, setAmount] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [noTokenLeft, setNoTokenLeft] = useState(0);
  const [noTokenPurchased, setNoTokenPurchased] = useState(0);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const { account } = useContext(WalletContext);

  useEffect(() => {
    if (account) {
      initializeContract();
    }
  }, [account]); 

  const initializeContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(newContract);
      await updateBalancesAndRewards(newContract, account);
    }
  };

  const updateBalancesAndRewards = async () => {
    if (contract) {
      try {
        // Get the available tokens left in the contract
        const availableTokens = await contract.getTokensLeft();
        setNoTokenLeft(ethers.utils.formatUnits(availableTokens, 18)); // Convert from wei

        // Get the total tokens purchased so far
        const purchasedTokens = await contract.getTokensPurchased();
        setNoTokenPurchased(ethers.utils.formatUnits(purchasedTokens, 18)); // Convert from wei

        // Optionally, get the user's token balance (if relevant)
        const userTokenBalance = await contract.balanceOf(account);
        setTokenBalance(ethers.utils.formatUnits(userTokenBalance, 18)); // Convert from wei

      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    
    if (contract && amount > 0) {
      try {
        setStakeLoading(true);
        
        // Get the price of the tokens in BNB (from the smart contract)
        const tokenPriceBnb = await contract.getTokenPriceInBnb();
        
        // Calculate the required BNB based on the token amount entered by the user
        const requiredBnb = ethers.BigNumber.from(amount)
          .mul(tokenPriceBnb)
          .div(ethers.BigNumber.from(10).pow(18)); // Adjusting decimals

        // Call buyTokens with the token amount and send the required BNB
        const tx = await contract.buyTokens(ethers.BigNumber.from(amount), {
          value: requiredBnb, // Pass the calculated BNB
        });
        
        await tx.wait(); // Wait for the transaction to be mined

        toast.success("Tokens purchased successfully!", { containerId: 'notification' });

        // Update the number of tokens left and purchased after a successful purchase
        await updateBalancesAndRewards();
        
      } catch (error) {
        console.error(error);
        toast.error("Failed to purchase tokens. Please try again.", { containerId: 'notification' });
      } finally {
        setStakeLoading(false);
      }
    } else {
      toast.error("Please enter a valid token amount.", { containerId: 'notification' });
    }
  };

  const StakeForm = ({ amount, setAmount, tokenBalance, handleSubmit, buttonText, disabled = false, loading }) => (
    <form onSubmit={handleSubmit}>
      <div className="w-full mt-[8px]">
        <p className="text-right">Max: {tokenBalance}</p>
        <section className="flex justify-end">
          <div className="flex items-center border border-black flex-[2] px-4 mr-[8px]">
          <input
            type="number"
            name="stake"
            id="stake"
            min={0.1}  // Set minimum value to 0.1
            step={0.1} // Ensure steps of 0.1
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-right no-arrows outline-none focus:outline-none border-none text-[24px] font-bold"
            required  // Ensure input is required
          />
            <p className="ml-5 text-[24px] font-[100] tracking-[0.22512px] leading-[1.5]">
              ETH
            </p>
          </div>
          <ButtonBase
            className="MuiTouchRipple-root"
            onClick={() => setAmount(tokenBalance)}
            style={{
              backgroundColor: "#77787D",
              padding: "20px",
              paddingLeft: "24px",
              paddingRight: "24px",
              fontSize: "14px",
              color: "white",
              borderRadius: "5px",
              textTransform: "uppercase",
              fontWeight: 400,
              letterSpacing: "0.02857em",
              lineHeight: "1.75",
            }}
          >
            Max
          </ButtonBase>
        </section>
        <StakeButton type="submit" buttonText={buttonText} disabled={disabled} Loading={loading} />
      </div>
    </form>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} containerId='notification' />
      <Navbar />
      {account ? (
        <div className="mt-[70px]">
          <article className="pb-[24px] my-[60px] mb-[80px] md:mb-[100px]">
            <h2 className="text-[50px] leading-[56px] font-[400]">
              FUTARES COIN
            </h2>
            <p className="text-[20px] font-[700] leading-[32px]">
              Grow Your Wealth with Futares Coin and Secure the Future.
            </p>
          </article>
          <main className="bg-white text-black rounded-[25px] w-full md:w-[450px] mx-auto p-[16px] pb-0">
            <div className="mb-[24px]">
              <FormHeader leading="Total Tokens" value="240 000 000 FTRS" />
              <FormHeader leading="No of Tokens Purchased" value={`${noTokenPurchased} FTRS`} />
              <FormHeader leading="No of Tokens Left" value={`${noTokenLeft} FTRS`} />
            </div>
            <StakeForm
              amount={amount}
              setAmount={setAmount}
              tokenBalance={tokenBalance}
              handleSubmit={handleBuy}
              buttonText="BUY"
              loading={stakeLoading}
            />
          </main>
        </div>
      ) : (
        <div className="mt-[70px] text-center">
          <h1>Please connect your wallet to Purchase the FTRS COIN.</h1>
          <h2>Making Life Easier.</h2>
        </div>
      )}
    </>
  );
};

export default Main;



