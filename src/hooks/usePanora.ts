import Panora, { PanoraConfig } from "@panoraexchange/swap-sdk"
import { Offer, useSwapStore } from "@/store/useSwapStore"
import { useWalletStore } from "@/store/useWalletStore"

// export type PanoraQuote = {
//     chainId: string;
//     fromTokenAddress: string;
//     toTokenAddress: string;
//     fromTokenAmount: string;
//     expectedOutput: string;
//     estimatedGas: string;
//     priceImpact: string;
// }

export type PanoraQuote = {
    quotes: Array<{
        toTokenAmount: string;
        toTokenAmountUSD: string;
        priceImpact: string;
        feeAmount: string;
    }>;
}

export const usePanora = () => {
    const { sellAmount, sellToken, buyToken } = useSwapStore()
    const { address } = useWalletStore()

    const config: PanoraConfig = {
        apiKey: "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
        rpcUrl: "https://fullnode.mainnet.aptoslabs.com/v1"
      }
    const client = new Panora(config);

    const getPanoraQuotes = async () => {
        try {
          const response = await client.ExactInSwapQuote({
            chainId: "1",
            fromTokenAddress: sellToken?.ca,
            toTokenAddress: buyToken?.ca,
            fromTokenAmount: sellAmount.toString(),
            toWalletAddress: address || "",
            slippagePercentage: "1",
            integratorFeeAddress: address || "",
            integratorFeePercentage: "1",
            getTransactionData: "rawTransaction"
          });
          
          console.log('Swap Quote Response:', response);
          return response
        } catch (error) {
          console.error('Error getting swap quote:', error);
        }
      };

    const toOfferList = (response: PanoraQuote): Offer[] => {
        if (!response.quotes || response.quotes.length === 0) {
            return [];
        }

        return response.quotes.map((quote) => ({
            name: buyToken?.symbol || "",
            amount: parseFloat(quote.toTokenAmount),
            usdValue: parseFloat(quote.toTokenAmountUSD),
            gasFee: parseFloat(quote.feeAmount),
            difference: 'BEST',
            priceImpact: parseFloat(quote.priceImpact)
        }));
    }

    return {
        getPanoraQuotes,
        toOfferList
    }
}