// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./Ownable.sol";

// Balancer Vault interface for flash loans
interface IBalancerVault {
    function flashLoan(
        address recipient,
        address[] calldata tokens,
        uint256[] calldata amounts,
        bytes calldata userData
    ) external;
}

// Generic DEX interface (e.g., Uniswap V2-style routers)
interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);
}

contract BalancerFlashLoanArbitrage is Ownable {
    IBalancerVault public constant balancerVault =
        IBalancerVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8); // Polygon Balancer Vault
    address public profitReceiver;

    event ArbitrageExecuted(
        address tokenBorrow,
        uint256 amountBorrow,
        address tokenPay,
        uint256 profit
    );
    event SwapDebug(
        uint256 borrowBalance,
        uint256 payBalanceBefore,
        uint256 payBalanceAfter
    );

    constructor() {
        profitReceiver = msg.sender;
    }

    // Estimate profit before executing the flash loan
    function estimateProfit(
        address tokenBorrow,
        uint256 amountBorrow,
        address tokenPay,
        address dexRouter,
        bytes calldata swapData,
        bool isParaSwap
    ) external view returns (uint256 estimatedProfit) {
        if (isParaSwap) {
            // ParaSwap profit estimation is handled off-chain by the script
            return 0; // Skip on-chain estimation for ParaSwap
        }

        address[] memory path = abi.decode(swapData, (address[])); // Assume swapData encodes the path
        uint256[] memory amountsOut = IUniswapV2Router(dexRouter).getAmountsOut(
            amountBorrow,
            path
        );
        uint256 expectedOut = amountsOut[amountsOut.length - 1];

        // Estimate fees (simplified; you can improve this with actual gas cost estimation)
        uint256 dexFee = (expectedOut * 3) / 1000; // Assume 0.3% DEX fee
        uint256 totalCost = amountBorrow + dexFee; // Add gas cost if possible

        return expectedOut > totalCost ? expectedOut - totalCost : 0;
    }

    // Initiate a flash loan and arbitrage
    function initiateFlashLoan(
        address tokenBorrow,
        uint256 amountBorrow,
        address tokenPay,
        address dexRouter,
        bytes calldata swapData1, // First swap: tokenBorrow -> tokenPay
        bytes calldata swapData2, // Second swap: tokenPay -> tokenBorrow
        bool isParaSwap
    ) external onlyOwner {
        // Check if the swap is profitable (skip for ParaSwap, handled by script)
        if (!isParaSwap) {
            uint256 estimatedProfit = this.estimateProfit(
                tokenBorrow,
                amountBorrow,
                tokenPay,
                dexRouter,
                swapData1,
                isParaSwap
            );
            require(estimatedProfit > 0, "No profit expected");
        }

        address[] memory tokens = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        tokens[0] = tokenBorrow;
        amounts[0] = amountBorrow;

        bytes memory userData = abi.encode(
            tokenPay,
            dexRouter,
            swapData1,
            swapData2,
            isParaSwap
        );
        balancerVault.flashLoan(address(this), tokens, amounts, userData);
    }

    // Internal function to handle the second swap and profit calculation
    function executeSecondSwapAndProfit(
        address tokenPay,
        address tokenBorrow,
        address dexRouter,
        bytes memory swapData2,
        bool isParaSwap,
        uint256 amountPayReceived,
        uint256 repayAmount
    ) internal returns (uint256 profit) {
        // Second swap: tokenPay -> tokenBorrow
        if (isParaSwap) {
            IERC20(tokenPay).approve(dexRouter, amountPayReceived);
            (bool success, ) = dexRouter.call(swapData2);
            require(success, "Second ParaSwap swap failed");
            IERC20(tokenPay).approve(dexRouter, 0); // Reset approval
        } else {
            IERC20(tokenPay).approve(dexRouter, amountPayReceived);
            (bool success, ) = dexRouter.call(swapData2);
            require(success, "Second swap failed");
            IERC20(tokenPay).approve(dexRouter, 0); // Reset approval
        }

        // Record balances after second swap
        uint256 borrowBalanceAfter = IERC20(tokenBorrow).balanceOf(
            address(this)
        );

        // Calculate profit in terms of tokenBorrow
        require(
            borrowBalanceAfter >= repayAmount,
            "Insufficient funds to repay loan"
        );
        profit = borrowBalanceAfter > repayAmount
            ? borrowBalanceAfter - repayAmount
            : 0;

        if (profit > 0) {
            IERC20(tokenBorrow).transfer(profitReceiver, profit);
        }
    }

    // Balancer flash loan callback
    function receiveFlashLoan(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata feeAmounts,
        bytes calldata userData
    ) external {
        require(
            msg.sender == address(balancerVault),
            "Caller not Balancer Vault"
        );
        require(tokens.length == 1, "Single token loan only");

        address tokenBorrow = tokens[0];
        uint256 amountBorrow = amounts[0];
        uint256 feeAmount = feeAmounts[0];
        (
            address tokenPay,
            address dexRouter,
            bytes memory swapData1,
            bytes memory swapData2,
            bool isParaSwap
        ) = abi.decode(userData, (address, address, bytes, bytes, bool));

        // Record initial balances
        uint256 borrowBalanceBefore = IERC20(tokenBorrow).balanceOf(
            address(this)
        );
        uint256 payBalanceBefore = IERC20(tokenPay).balanceOf(address(this));

        // First swap: tokenBorrow -> tokenPay
        if (isParaSwap) {
            IERC20(tokenBorrow).approve(dexRouter, amountBorrow);
            (bool success, ) = dexRouter.call(swapData1);
            require(success, "First ParaSwap swap failed");
            IERC20(tokenBorrow).approve(dexRouter, 0); // Reset approval
        } else {
            IERC20(tokenBorrow).approve(dexRouter, amountBorrow);
            (bool success, ) = dexRouter.call(swapData1);
            require(success, "First swap failed");
            IERC20(tokenBorrow).approve(dexRouter, 0); // Reset approval
        }

        // Record balance after first swap
        uint256 payBalanceAfterFirstSwap = IERC20(tokenPay).balanceOf(
            address(this)
        );
        uint256 amountPayReceived = payBalanceAfterFirstSwap - payBalanceBefore;

        // Emit debug event
        emit SwapDebug(
            borrowBalanceBefore,
            payBalanceBefore,
            payBalanceAfterFirstSwap
        );

        // Calculate repay amount
        uint256 repayAmount = amountBorrow + feeAmount;

        // Execute second swap and calculate profit
        uint256 profit = executeSecondSwapAndProfit(
            tokenPay,
            tokenBorrow,
            dexRouter,
            swapData2,
            isParaSwap,
            amountPayReceived,
            repayAmount
        );

        // Repay the flash loan
        IERC20(tokenBorrow).transfer(address(balancerVault), repayAmount);

        // Emit ArbitrageExecuted event
        emit ArbitrageExecuted(tokenBorrow, amountBorrow, tokenPay, profit);
    }

    function setProfitReceiver(address _newReceiver) external onlyOwner {
        require(_newReceiver != address(0), "Invalid receiver address");
        profitReceiver = _newReceiver;
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }

    receive() external payable {}
}
