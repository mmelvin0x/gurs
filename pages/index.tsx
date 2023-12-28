import {
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useTokenSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import Image from "next/image";
import { useMemo } from "react";
import { parseIneligibility } from "../utils/parseIneligibility";
import useSound from "use-sound";

const Home = () => {
  const [play] = useSound("/audio.wav");
  const tokenAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x4CF78ee0f24A34C19d2C4Fe7B151f6d4191c84aC";
  const { contract } = useContract(tokenAddress, "token-drop");
  const address = useAddress();
  const { data: contractMetadata } = useContractMetadata(contract);

  const quantity = 1;

  const claimConditions = useClaimConditions(contract);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    contract,
    address
  );
  const claimIneligibilityReasons = useClaimIneligibilityReasons(contract, {
    quantity,
    walletAddress: address || "",
  });

  const claimedSupply = useTokenSupply(contract);

  const totalAvailableSupply = useMemo(() => {
    try {
      return BigNumber.from(activeClaimCondition.data?.availableSupply || 0);
    } catch {
      return BigNumber.from(1_000_000_000);
    }
  }, [activeClaimCondition.data?.availableSupply]);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data?.value || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    const n = totalAvailableSupply.add(
      BigNumber.from(claimedSupply.data?.value || 0)
    );
    if (n.gte(1_000_000_000)) {
      return "";
    }
    return n.toString();
  }, [totalAvailableSupply, claimedSupply]);

  const priceToMint = useMemo(() => {
    if (quantity) {
      const bnPrice = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      return `${utils.formatUnits(
        bnPrice.mul(quantity).toString(),
        activeClaimCondition.data?.currencyMetadata.decimals || 18
      )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
    }
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0
          )) ||
        numberClaimed === numberTotal
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ]);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return activeClaimCondition.isLoading || !contract;
  }, [activeClaimCondition.isLoading, contract]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading]
  );
  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "Sold Out";
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      if (pricePerToken.eq(0)) {
        return "Claim (Free)";
      }
      return `Claim (${priceToMint})`;
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity);
    }
    if (buttonLoading) {
      return "Checking eligibility...";
    }

    return "Claiming not available";
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ]);

  return (
    <div className={`flex flex-col items-center justify-center`}>
      {(claimConditions.data &&
        claimConditions.data.length > 0 &&
        activeClaimCondition.isError) ||
        (activeClaimCondition.data &&
          activeClaimCondition.data.startTime > new Date() && (
            <p>Drop is starting soon. Please check back later.</p>
          ))}

      {claimConditions.data?.length === 0 ||
        (claimConditions.data?.every((cc) => cc.maxClaimableSupply === "0") && (
          <p>
            This drop is not ready to be minted yet. (No claim condition set)
          </p>
        ))}

      <div className="card bg-base-100 mt-32">
        <div className="card-body">
          <Image src="/hero.png" alt="hero" width={400} height={400} />

          <Web3Button
            theme="light"
            contractAddress={tokenAddress}
            action={(contract) => {
              contract.erc20.claim(quantity);
            }}
            onSuccess={() => play()}
            onError={(err) => alert(err)}
          >
            {buttonText}
          </Web3Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mt-8">
        <div tabIndex={0} className="collapse bg-base-100">
          <div className="collapse-title text-xl font-medium">Roadmap</div>
          <div className="collapse-content">
            <Image src="/roadmap.png" width={400} height={400} alt="Roadmap" />
          </div>
        </div>

        <div tabIndex={0} className="collapse bg-base-100">
          <div className="collapse-title text-xl font-medium">Tolkinomics</div>
          <div className="collapse-content">
            <Image
              src="/tokenomics.png"
              width={400}
              height={400}
              alt="Tokenomics"
            />
          </div>
        </div>

        <div tabIndex={0} className="collapse bg-base-100">
          <div className="collapse-title text-xl font-medium">Team</div>
          <div className="collapse-content">
            <Image src="/team.png" width={400} height={400} alt="Tokenomics" />
          </div>
        </div>
      </div>

      <p className="prose text-center text-xs my-8">
        $GURS is not affialiated with The Arena App. $GURS is a meme coin and
        carries no intrinsic value.
      </p>
    </div>
  );
};

export default Home;
