const { ethers } = require('ethers');
const axios = require('axios');

const provider = new ethers.JsonRpcProvider('RPC_URL');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);

const contractAddress = 'CONTRACT_ADDRESS'; // Replace with your deployed contract address
const contractABI = [
    "function initiateFlashLoan(address tokenBorrow, uint256 amountBorrow, address tokenPay, address dexRouter, bytes swapData1, bytes swapData2, bool isParaSwap) external",
    "function estimateProfit(address tokenBorrow, uint256 amountBorrow, address tokenPay, address dexRouter, bytes swapData, bool isParaSwap) external view returns (uint256)",
    "event ArbitrageExecuted(address tokenBorrow, uint256 amountBorrow, address tokenPay, uint256 profit)",
    "event SwapDebug(uint256 borrowBalance, uint256 payBalanceBefore, uint256 payBalanceAfter)"
];
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const tokens = {
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    AAVE: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
    LINK: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
    WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    QUICK: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
    SUSHI: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
    MANA: '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4',
    SAND: '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683',
    CRV: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
    BAL: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',    // Balancer
    BUSD: '0xdAb529f40E690507F96c013f4EE837880a6cB9B5',   // Binance USD
    UNI: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',     // Uniswap
    COMP: '0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c',   // Compound
    MKR: '0x6f7C932e7684666C9fd1d44527765433e01fF61d',    // Maker
    SNX: '0x50B728D8D964fd00C2d0AAD81718b71311feF68a',    // Synthetix
    YFI: '0xDA537104D6A5edd53c6fBba9A898708E465260b6',     // yearn.finance
    GRT: '0x5fe2B58c013d7601147DcdD68C143A77499f5531',    // The Graph
    BAT: '0x3Cef98bb43d732E2F285eE605a8158cDE967D219',    // Basic Attention Token
    ENJ: '0x7eC26842F195c852Fa843bB9f6D8B583a274a157',    // Enjin Coin
    OCEAN: '0x282d8efCe846A88B159800bd4130ad77443Fa1A1',  // Ocean Protocol
    ZRX: '0x5559Edb74751A0edE9DeA4DC23aeE72cCA6bE3D5',    // 0x Protocol
    OMG: '0x62414D03084EeB269E18C970a21f45D2967F0170',    // OMG Network
    KNC: '0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C',    // Kyber Network Crystal
    TUSD: '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756',   // TrueUSD
    PAX: '0x553d3D295e0f695B9228246232eDF400ed3560B5',    // Paxos Standard
    UMA: '0x3066818837c5e6eD6601bd5a91B0762877A6B731',    // UMA
    REN: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',    // Ren
    LRC: '0x84e1670F61347CDaeD56dcc736FB990fBB47ddC1',    // Loopring
    NMR: '0x0Bf519bD69670dB7A08f973675Abb52375eD9A28',    // Numeraire
    POLY: '0xcB059C5573646047D6d88dDdb87B745C18161d3b',   // Polymath
    RARI: '0x780053837cE2CeEaD2A90D9151aA21FC89eD49c2',   // Rarible
    DPI: '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369',    // DeFi Pulse Index
    GHST: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',   // Aavegotchi GHST
    RNDR: '0x61299774020dA444Af134c82fa83E3810b309991',
    FLUID: '0xf50D05A1402d0adAfA880D36050736f9f6ee7dee',
    BET: '0xbF7970D56a150cD0b60BD08388A4A75a27777777',
    TEL: '0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32',
    LDO: '0xC3C7d422809852031b44ab29EEC9F1EfF2A58756',
    VOXEL:'0xd0258a3fD00f38aa8090dfee343f10A9D4d30D3F',
    XSGD: '0xDC3326e71D45186F113a2F448984CA0e8D201995',
    SOL: '0xd93f7E271cB87c23AaA73edC008A79646d1F9912',
    KIT: '0x4D0Def42Cf57D6f27CD4983042a55dce1C9F853c',
    TruMATIC: '0xf33687811f3ad0cd6b48Dd4B39F9F977BD7165A2',
    BOB:'0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
    ULT: '0xf0059CC2b3E980065A906940fbce5f9Db7ae40A7',
    NYA: '0x38F9bf9dCe51833Ec7f03C9dC218197999999999',
    SURE: '0xF88332547c680F755481Bf489D890426248BB275',
};

const dexes = {
    QuickSwap: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    SushiSwap: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    UniswapV3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    ParaSwap: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57'
};

const config = {
    minProfitStable: ethers.parseUnits('0.01', 6),
    minProfitNative: ethers.parseUnits('0.01', 18),
    loopDelayMs: 60000,
    baseAmounts: [ethers.parseUnits('100', 18), ethers.parseUnits('1000', 18)],
};

async function getTokenDecimals(token) {
    try {
        const tokenContract = new ethers.Contract(token, ['function decimals() view returns (uint8)'], provider);
        return await tokenContract.decimals();
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to fetch decimals for ${token}: ${error.message}`);
        return 18;
    }
}

async function getPriceQuoteV2(dexRouter, tokenIn, tokenOut, amountIn) {
    const routerContract = new ethers.Contract(dexRouter, [
        "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
    ], provider);
    const path = [tokenIn, tokenOut];
    try {
        const amounts = await routerContract.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching V2 quote from ${dexRouter}: ${error.message}`);
        return BigInt(0);
    }
}

async function getPriceQuoteParaSwap(tokenIn, tokenOut, amountIn) {
    const decimalsIn = await getTokenDecimals(tokenIn);
    const url = `https://apiv5.paraswap.io/prices/?srcToken=${tokenIn}&destToken=${tokenOut}&amount=${amountIn.toString()}&srcDecimals=${decimalsIn}&destDecimals=${await getTokenDecimals(tokenOut)}&side=SELL&network=137`;
    try {
        const response = await axios.get(url);
        const priceRoute = response.data.priceRoute;
        return BigInt(priceRoute.destAmount);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching ParaSwap quote: ${error.message}`);
        return BigInt(0);
    }
}

async function generateSwapDataV2(dexRouter, tokenIn, tokenOut, amountIn) {
    const routerContract = new ethers.Contract(dexRouter, [
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)"
    ], provider);
    const path = [tokenIn, tokenOut];
    const amountOutMin = 0; // Note: You might want to set a stricter amountOutMin based on the estimateProfit result
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    return routerContract.interface.encodeFunctionData("swapExactTokensForTokens", [
        amountIn,
        amountOutMin,
        path,
        contractAddress,
        deadline
    ]);
}

async function generateSwapDataParaSwap(tokenIn, tokenOut, amountIn) {
    const decimalsIn = await getTokenDecimals(tokenIn);
    const decimalsOut = await getTokenDecimals(tokenOut);
    const url = `https://apiv5.paraswap.io/transactions/137?ignoreChecks=true`;
    const payload = {
        srcToken: tokenIn,
        destToken: tokenOut,
        srcAmount: amountIn.toString(),
        srcDecimals: decimalsIn,
        destDecimals: decimalsOut,
        userAddress: contractAddress,
        receiver: contractAddress,
    };
    try {
        const response = await axios.post(url, payload);
        return response.data.data;
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error building ParaSwap swap: ${error.message}`);
        return "0x";
    }
}

async function checkArbitrage(tokenBorrow, amountBorrow, tokenPay) {
    const decimalsBorrow = await getTokenDecimals(tokenBorrow);
    const decimalsPay = await getTokenDecimals(tokenPay);
    let bestProfit = BigInt(0);
    let bestDex = ethers.ZeroAddress;
    let bestDirection = 'None';
    let bestSwapData1 = "0x";
    let bestSwapData2 = "0x";
    let isParaSwap = false;

    for (const [dexName, dexRouter] of Object.entries(dexes)) {
        let direction1 = `${tokenBorrow} -> ${tokenPay} -> ${tokenBorrow}`;
        let direction2 = `${tokenPay} -> ${tokenBorrow} -> ${tokenPay}`;

        if (dexName === 'ParaSwap') {
            const amountOut1 = await getPriceQuoteParaSwap(tokenBorrow, tokenPay, amountBorrow);
            const amountBack1 = await getPriceQuoteParaSwap(tokenPay, tokenBorrow, amountOut1);
            const profit1 = amountBack1 > amountBorrow ? amountBack1 - amountBorrow : BigInt(0);
            let swapData1 = "0x";
            let swapData2 = "0x";
            if (profit1 > bestProfit) {
                swapData1 = await generateSwapDataParaSwap(tokenBorrow, tokenPay, amountBorrow);
                swapData2 = await generateSwapDataParaSwap(tokenPay, tokenBorrow, amountOut1);
                bestProfit = profit1;
                bestDex = dexRouter;
                bestDirection = direction1;
                bestSwapData1 = swapData1;
                bestSwapData2 = swapData2;
                isParaSwap = true;
            }

            const amountBorrowPay = ethers.parseUnits(ethers.formatUnits(amountBorrow, decimalsBorrow), decimalsPay);
            const amountOut2 = await getPriceQuoteParaSwap(tokenPay, tokenBorrow, amountBorrowPay);
            const amountBack2 = await getPriceQuoteParaSwap(tokenBorrow, tokenPay, amountOut2);
            const profit2 = amountBack2 > amountBorrowPay ? amountBack2 - amountBorrowPay : BigInt(0);
            if (profit2 > bestProfit) {
                swapData1 = await generateSwapDataParaSwap(tokenPay, tokenBorrow, amountBorrowPay);
                swapData2 = await generateSwapDataParaSwap(tokenBorrow, tokenPay, amountOut2);
                bestProfit = profit2;
                bestDex = dexRouter;
                bestDirection = direction2;
                bestSwapData1 = swapData1;
                bestSwapData2 = swapData2;
                isParaSwap = true;
            }
        } else if (dexName !== 'UniswapV3') {
            const amountOut1 = await getPriceQuoteV2(dexRouter, tokenBorrow, tokenPay, amountBorrow);
            const amountBack1 = await getPriceQuoteV2(dexRouter, tokenPay, tokenBorrow, amountOut1);
            const profit1 = amountBack1 > amountBorrow ? amountBack1 - amountBorrow : BigInt(0);
            let swapData1 = "0x";
            let swapData2 = "0x";
            if (profit1 > bestProfit) {
                swapData1 = await generateSwapDataV2(dexRouter, tokenBorrow, tokenPay, amountBorrow);
                swapData2 = await generateSwapDataV2(dexRouter, tokenPay, tokenBorrow, amountOut1);
                try {
                    const contractProfit = await contract.estimateProfit(tokenBorrow, amountBorrow, tokenPay, dexRouter, swapData1, false);
                    if (contractProfit > 0) { // Only proceed if the first swap is profitable
                        bestProfit = profit1;
                        bestDex = dexRouter;
                        bestDirection = direction1;
                        bestSwapData1 = swapData1;
                        bestSwapData2 = swapData2;
                        isParaSwap = false;
                    }
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Error estimating profit for ${dexName} direction1: ${error.message}`);
                }
            }

            const amountBorrowPay = ethers.parseUnits(ethers.formatUnits(amountBorrow, decimalsBorrow), decimalsPay);
            const amountOut2 = await getPriceQuoteV2(dexRouter, tokenPay, tokenBorrow, amountBorrowPay);
            const amountBack2 = await getPriceQuoteV2(dexRouter, tokenBorrow, tokenPay, amountOut2);
            const profit2 = amountBack2 > amountBorrowPay ? amountBack2 - amountBorrowPay : BigInt(0);
            if (profit2 > bestProfit) {
                swapData1 = await generateSwapDataV2(dexRouter, tokenPay, tokenBorrow, amountBorrowPay);
                swapData2 = await generateSwapDataV2(dexRouter, tokenBorrow, tokenPay, amountOut2);
                try {
                    const contractProfit = await contract.estimateProfit(tokenPay, amountBorrowPay, tokenBorrow, dexRouter, swapData1, false);
                    if (contractProfit > 0) { // Only proceed if the first swap is profitable
                        bestProfit = profit2;
                        bestDex = dexRouter;
                        bestDirection = direction2;
                        bestSwapData1 = swapData1;
                        bestSwapData2 = swapData2;
                        isParaSwap = false;
                    }
                } catch (error) {
                    console.error(`[${new Date().toISOString()}] Error estimating profit for ${dexName} direction2: ${error.message}`);
                }
            }
        }

        console.log(`[${new Date().toISOString()}] ${dexName} - ${bestDirection}: Profit = ${ethers.formatUnits(bestProfit, bestDirection.includes(tokenBorrow) ? decimalsBorrow : decimalsPay)} ${bestDirection.includes(tokenBorrow) ? tokenBorrow : tokenPay}`);
    }

    // Validate profit to catch API errors
    const maxReasonableProfit = ethers.parseUnits('1000', bestDirection.includes(tokenBorrow) ? decimalsBorrow : decimalsPay);
    if (bestProfit > maxReasonableProfit) {
        console.warn(`[${new Date().toISOString()}] Suspicious profit detected: ${ethers.formatUnits(bestProfit, bestDirection.includes(tokenBorrow) ? decimalsBorrow : decimalsPay)} ${bestDirection.includes(tokenBorrow) ? tokenBorrow : tokenPay}. Capping to 0.`);
        bestProfit = BigInt(0);
    }

    return { bestDex, bestProfit, bestDirection, bestSwapData1, bestSwapData2, isParaSwap };
}

async function executeFlashLoan(tokenBorrow, amountBorrow, tokenPay, bestDex, bestSwapData1, bestSwapData2, isParaSwap) {
    const decimalsBorrow = await getTokenDecimals(tokenBorrow);
    console.log(`[${new Date().toISOString()}] Initiating flash loan: borrow=${ethers.formatUnits(amountBorrow, decimalsBorrow)} ${tokenBorrow}`);

    try {
        const gasPrice = await provider.getFeeData().then(fee => fee.gasPrice * BigInt(150) / BigInt(100));
        const gasEstimate = await contract.initiateFlashLoan.estimateGas(tokenBorrow, amountBorrow, tokenPay, bestDex, bestSwapData1, bestSwapData2, isParaSwap);
        const tx = await contract.initiateFlashLoan(tokenBorrow, amountBorrow, tokenPay, bestDex, bestSwapData1, bestSwapData2, isParaSwap, {
            gasLimit: gasEstimate * BigInt(130) / BigInt(100),
            gasPrice
        });
        const receipt = await tx.wait();
        console.log(`[${new Date().toISOString()}] Flash loan executed: ${receipt.transactionHash}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Flash loan error: ${error.message}`);
    }
}

async function runArbitrageLoop() {
    console.log(`[${new Date().toISOString()}] Starting Polygon arbitrage bot with Balancer...`);
    const tokenList = Object.values(tokens);

    while (true) {
        try {
            for (const tokenBorrow of tokenList) {
                const decimalsBorrow = await getTokenDecimals(tokenBorrow);
                const amounts = config.baseAmounts.map(amount => ethers.parseUnits(ethers.formatUnits(amount, 18), decimalsBorrow));

                for (const tokenPay of tokenList) {
                    if (tokenBorrow === tokenPay) continue;

                    for (const amountBorrow of amounts) {
                        console.log(`[${new Date().toISOString()}] Checking arbitrage for ${tokenBorrow} <-> ${tokenPay} with ${ethers.formatUnits(amountBorrow, decimalsBorrow)} borrow`);
                        const { bestDex, bestProfit, bestDirection, bestSwapData1, bestSwapData2, isParaSwap } = await checkArbitrage(tokenBorrow, amountBorrow, tokenPay);
                        const decimalsPay = await getTokenDecimals(tokenPay);
                        const minProfit = (bestDirection.includes(tokenBorrow) && tokenBorrow === tokens.WMATIC) || (bestDirection.includes(tokenPay) && tokenPay === tokens.WMATIC) ? config.minProfitNative : config.minProfitStable;

                        if (bestProfit > minProfit) {
                            console.log(`[${new Date().toISOString()}] Profit detected: ${bestDirection}, Profit: ${ethers.formatUnits(bestProfit, bestDirection.includes(tokenBorrow) ? decimalsBorrow : decimalsPay)} ${bestDirection.includes(tokenBorrow) ? tokenBorrow : tokenPay}, DEX: ${bestDex}`);
                            await executeFlashLoan(tokenBorrow, amountBorrow, tokenPay, bestDex, bestSwapData1, bestSwapData2, isParaSwap);
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        } else {
                            console.log(`[${new Date().toISOString()}] No arbitrage opportunity for ${tokenBorrow} <-> ${tokenPay}`);
                        }
                    }
                }
            }
            console.log(`[${new Date().toISOString()}] Completed cycle. Waiting ${config.loopDelayMs / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, config.loopDelayMs));
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Loop error: ${error.message}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, config.loopDelayMs));
        }
    }
}

runArbitrageLoop().catch(err => console.error(`[${new Date().toISOString()}] Startup error: ${err.message}`));