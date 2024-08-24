
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

const REWARD_RATE = 0.004566210045662;



const Main = () => {
  const [amount, setAmount] = useState(0);
  const [unstakeAmount, setUnstakeAmount] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [stakeReward, setStakeReward] = useState(0);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unstakeLoading, setUnStakeLoading] = useState(false);
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
      const newContract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
      setContract(newContract);
      await updateBalancesAndRewards(newContract, account);
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




   /* useEffect(() => {
    const initializeContract = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
        setContract(newContract);

        // Get initial balances and rewards
        await updateBalancesAndRewards(newContract, await signer.getAddress());
      }
    };

    initializeContract();
  }, []);  */

  const updateBalancesAndRewards = async (contractInstance, userAddress) => {
    const balance = await contractInstance.getStakedBalance(userAddress);
    const rewards = await contractInstance.getPendingRewards(userAddress);
    //const ethBalance = await contractInstance.provider.getBalance(userAddress);

    setStakedBalance(ethers.formatEther(balance));
    setStakeReward(ethers.formatEther(rewards));
    //setTokenBalance(ethers.formatEther(ethBalance));
  };

  const handleStake = async (e) => {
    e.preventDefault();
    if (amount < 0.1) {
      if (!toast.isActive('stake-error')) {
        toast.error("Minimum stake amount is 0.1 ETH", {
          toastId: 'stake-error',
          containerId: 'notification'
        });
      }
      return;
    }
    setStakeLoading(true);
    
    try {
      const tx = await contract.stake({ value: ethers.parseEther(amount.toString()) });
      await tx.wait();
      if (!toast.isActive('stake-success')) {
        toast.success("Token staked successfully", {
          toastId: 'stake-success',
          containerId: 'notification'
        });
      }
      await updateBalancesAndRewards(contract, await contract.runner.getAddress());
      setAmount(0);
    } catch (error) {
      if (!toast.isActive('stake-failure')) {
        toast.error("Staking failed: " + error.message, {
          toastId: 'stake-failure',
          containerId: 'notification'
        });
      }
    } finally {
      setStakeLoading(false);
    }
  };

  const handleUnstake = async (e) => {
    e.preventDefault();
    if (unstakeAmount < 0.1) {
      if (!toast.isActive('unstake-error')) {
        toast.error("Minimum unstake amount is 0.1 ETH", {
          toastId: 'unstake-error',
          containerId: 'notification'
        });
      }
      return;
    }
    setUnStakeLoading(true);
    
    try {
      const tx = await contract.unstake(ethers.parseEther(unstakeAmount.toString()));
      await tx.wait();
      if (!toast.isActive('unstake-success')) {
        toast.success("Token unstaked successfully", {
          toastId: 'unstake-success',
          containerId: 'notification'
        });
      }
      await updateBalancesAndRewards(contract, await contract.runner.getAddress());
      setUnstakeAmount(0);
    } catch (error) {
      if (!toast.isActive('unstake-failure')) {
        toast.error("Unstaking failed: " + error.message, {
          toastId: 'unstake-failure',
          containerId: 'notification'
        });
      }
    } finally {
      setUnStakeLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      const tx = await contract.claim();
      await tx.wait();
      if (!toast.isActive('claim-success')) {
        toast.success("Rewards claimed successfully", {
          toastId: 'claim-success',
          containerId: 'notification'
        });
      }
      await updateBalancesAndRewards(contract, await contract.runner.getAddress());
    } catch (error) {
      if (!toast.isActive('claim-failure')) {
        toast.error("Claiming failed: " + error.message, {
          toastId: 'claim-failure',
          containerId: 'notification'
        });
      }
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} containerId='notification' />
      <Navbar />
      {account ? (
              <div className="mt-[70px]">
              <article className="pb-[24px] my-[60px] mb-[80px] md:mb-[100px]">
                <h2 className="text-[50px] leading-[56px] font-[400]">
                  SINGLE STAKING POOL
                </h2>
                <p className="text-[20px] font-[700] leading-[32px]">
                  Staked $BASE is locked until maturity.
                </p>
              </article>
              <main className="bg-white text-black rounded-[25px] w-full md:w-[450px] mx-auto p-[16px] pb-0">
                <div className="mb-[24px]">
                  <FormHeader leading="APY" value="1200%" />
                  <FormHeader leading="Lock Time" value="1 month" />
                  <FormHeader leading="Staked Balance" value={`${stakedBalance} ETH`} />
                </div>
                <StakeForm
                  amount={amount}
                  setAmount={setAmount}
                  tokenBalance={tokenBalance}
                  handleSubmit={handleStake}
                  buttonText="Stake"
                  loading={stakeLoading}
                />
                <StakeForm
                  amount={unstakeAmount}
                  setAmount={setUnstakeAmount}
                  tokenBalance={stakedBalance}
                  handleSubmit={handleUnstake}
                  buttonText="UnStake"
                  disabled={false}
                  loading={unstakeLoading}
                />
                <article>
                  <hr />
                  <section className="flex justify-between items-center mt-[24px]">
                    <h3 className="text-[16px] font-[700]">Your Rewards</h3>
                    <h3 className="text-[24px] font-[700]">{stakeReward} ETH</h3>
                  </section>
                  <StakeButton
                    buttonText="CLAIM REWARDS"
                    onClick={handleClaim}
                    disabled={false}
                    paddingBottom={"20px"}
                  />
                </article>
              </main>
            </div>
      ) : (
        <div className="mt-[70px] text-center">
          <h2>Please connect your wallet to use the staking interface.</h2>
        </div>
      )
      }

    </>
  );
};

export default Main;