require('dotenv').config()
const Binance = require('node-binance-api');
const { Squeeze } = require('technicalindicators');
const { RSI, EMA } = require('technicalindicators');


console.log("BOT START")
const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    test: true, // Set test option to true if you're using the Futures Testnet
    futures: true, // Set futures option to true for Futures API
    useServerTime: true
});

// Define the strategy parameters
const leverage = 10; // Leverage to use for the position
const stopLossLevel = 0.75; // Stop loss level as a percentage of entry price
const takeProfitLevel = 1.5; // Take profit level as a percentage of entry price
const recentHighLowPeriod = 50; // Number of candles to use for recent high and low calculation

// Define the function to execute the strategy
async function executeStrategy2() {
    try {
        // Get the candlestick data for the specified symbol
        const candlesticks = await binance.futuresCandles('BTCUSDT', '1m', { limit: 2 });

        // Extract the most recent candlestick and the previous candlestick
        const currentCandlestick = candlesticks[candlesticks.length - 1];
        const previousCandlestick = candlesticks[candlesticks.length - 2];

        // Get the last price and the previous close price
        const lastPrice = parseFloat(currentCandlestick.close);
        const prevClosePrice = parseFloat(previousCandlestick.close);

        // Calculate momentum
        const momentum = lastPrice - prevClosePrice;

        // Get the recent high and low prices
        const klines = await binance.futuresCandles('BTCUSDT', '1m', { limit: recentHighLowPeriod });
        const highs = klines.map((kline) => parseFloat(kline.high));
        const lows = klines.map((kline) => parseFloat(kline.low));
        const recentHigh = Math.max(...highs);
        const recentLow = Math.min(...lows);
        //console.dir(klines)
        console.log("1 if", (momentum > 0 && ticker.lastPrice > recentHigh))
        console.log("2 if", (momentum < 0 && ticker.lastPrice < recentLow))
        console.log("3 if", (momentum < 0 && ticker.lastPrice < recentLow))

        // Determine whether to take a long or short position
        if (momentum > 0 && ticker.lastPrice > recentHigh) {
            // Take a long position
            const position = await binance.futuresMarketBuy('BTCUSDT', positionSize, { leverage });
            const entryPrice = parseFloat(position.avgPrice);
            const stopLossPrice = entryPrice * stopLossLevel;
            const takeProfitPrice = entryPrice * takeProfitLevel;
            console.log(`Long position opened at ${entryPrice}`);
            console.log(`Stop loss set at ${stopLossPrice}`);
            console.log(`Take profit set at ${takeProfitPrice}`);

            // Monitor the position
            while (true) {
                // Get the current position data
                const currentPosition = await binance.futuresPositionRisk('BTCUSDT');

                // Check if the position has been closed
                if (currentPosition.positionAmt === '0') {
                    console.log(`Position closed at ${currentPosition.entryPrice}`);
                    break;
                }

                // Check if the stop loss has been triggered
                if (currentPosition.unRealizedProfit < -(stopLossPrice * positionSize)) {
                    await binance.futuresMarketSell('BTCUSDT', positionSize, { reduceOnly: true });
                    console.log(`Stop loss triggered at ${stopLossPrice}`);
                    break;
                }

                // Check if the take profit has been triggered
                if (currentPosition.unRealizedProfit > (takeProfitPrice * positionSize)) {
                    await binance.futuresMarketSell('BTCUSDT', positionSize, { reduceOnly: true });
                    console.log(`Take profit triggered at ${takeProfitPrice}`);
                    break;
                }
                // Wait for the next candle
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        } else if (momentum < 0 && ticker.lastPrice < recentLow) {
            // Take a short position
            const position = await binance.futuresMarketSell('BTCUSDT', positionSize, { leverage });
            const entryPrice = parseFloat(position.avgPrice);
            const stopLossPrice = entryPrice * (1 + stopLossLevel);
            const takeProfitPrice = entryPrice * (1 - takeProfitLevel);
            console.log(`Short position opened at ${entryPrice}`);
            console.log(`Stop loss set at ${stopLossPrice}`);
            console.log(`Take profit set at ${takeProfitPrice}`);

            // Monitor the position
            while (true) {
                // Get the current position data
                const currentPosition = await binance.futuresPositionRisk('BTCUSDT');

                // Check if the position has been closed
                if (currentPosition.positionAmt === '0') {
                    console.log(`Position closed at ${currentPosition.entryPrice}`);
                    break;
                }

                // Check if the stop loss has been triggered
                if (currentPosition.unRealizedProfit < -(stopLossPrice * positionSize)) {
                    await binance.futuresMarketBuy('BTCUSDT', positionSize, { reduceOnly: true });
                    console.log(`Stop loss triggered at ${stopLossPrice}`);
                    break;
                }

                // Check if the take profit has been triggered
                if (currentPosition.unRealizedProfit > (takeProfitPrice * positionSize)) {
                    await binance.futuresMarketBuy('BTCUSDT', positionSize, { reduceOnly: true });
                    console.log(`Take profit triggered at ${takeProfitPrice}`);
                    break;
                }

                // Wait for the next candle
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        } else if (momentum < 0 && ticker.lastPrice < recentLow) {
            // Take a short position

            const position = await binance.futuresMarketSell('BTCUSDT', positionSize, { leverage });
            const entryPrice = parseFloat(position.avgPrice);
            const stopLossPrice = entryPrice * (1 + stopLossLevel);
            const takeProfitPrice = entryPrice * (1 - takeProfitLevel);
            console.log(`Short position opened at ${entryPrice}`);
            console.log(`Stop loss set at ${stopLossPrice}`);
            console.log(`Take profit set at ${takeProfitPrice}`);

            // Monitor the position
            while (true) {
                // Get the current position data
                const currentPosition = await binance.futuresPositionRisk('BTCUSDT');

                // Check if the position has been closed
                if (currentPosition.positionAmt === '0') {
                    console.log(`Position closed at ${currentPosition.entryPrice}`);
                    break;
                }

                // Check if the stop loss has been triggered
                if (currentPosition.unRealizedProfit < -(stopLossPrice * positionSize)) {
                    await binance.futuresMarketBuy('BTCUSDT', positionSize, { reduceOnly: true });
                    console.log(`Stop loss triggered at ${stopLossPrice}`);
                    break;
                }

                // Check if the take profit has been triggered
                if (currentPosition.unRealizedProfit > (takeProfitPrice * positionSize)) {
                    await binance.futuresMarketBuy('BTCUSDT', positionSize, { reduceOnly: true });
                    console.log(`Take profit triggered at ${takeProfitPrice}`);
                    break;
                }

                // Wait for the next candle
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        }
    } catch (error) {
        console.dir(error)
        console.error(error);
    }
}

// Call the executeStrategy function to start the trading bot
//executeStrategy2();

const delayTime = 5000; // delay in milliseconds
async function executeStrategy() {
    try {
        // Get the most recent candlestick data
        const candlesticks = await binance.futuresCandles('BTCUSDT', '1m', { limit: 2 });
        const currentCandlestick = candlesticks[candlesticks.length - 1];
        const previousCandlestick = candlesticks[candlesticks.length - 2];
        const lastPrice = parseFloat(currentCandlestick.close);
        const prevClosePrice = parseFloat(previousCandlestick.close);
        const momentum = lastPrice - prevClosePrice;

        // Check if there is an open position
        const currentPosition = await binance.futuresPositionRisk('BTCUSDT');
        const positionSize = Math.abs(parseFloat(currentPosition.positionAmt));
        if (positionSize > 0) {
            // Check if the position needs to be closed
            if (currentPosition.positionSide === 'BUY' && momentum < 0) {
                await binance.futuresMarketSell('BTCUSDT', positionSize, { reduceOnly: true });
                console.log(`Long position closed at ${lastPrice}`);
            } else if (currentPosition.positionSide === 'SELL' && momentum > 0) {
                await binance.futuresMarketBuy('BTCUSDT', positionSize, { reduceOnly: true });
                console.log(`Short position closed at ${lastPrice}`);
            } else {
                // If the position is still valid, wait for the next candle
                await new Promise(resolve => setTimeout(resolve, 60000));
                executeStrategy(); // Call the function recursively to continue monitoring the position
            }
        } else {
            // Check if a new position should be opened
            const capital = Promise.resolve(getAvailableBalance()); // Total capital in USDT
            const priceArray = await binance.futuresCandles('BTCUSDT', '1m', { limit: 200 });
            const highPrices = priceArray.map(candle => parseFloat(candle.high));
            const lowPrices = priceArray.map(candle => parseFloat(candle.low));
            const highestHigh = Math.max(...highPrices);
            const lowestLow = Math.min(...lowPrices);
            const priceAction = lastPrice > highestHigh ? 'BUY' : (lastPrice < lowestLow ? 'SELL' : null);
            if (momentum > 0 && priceAction === 'BUY') {
                // Open a long position
                const position = await binance.futuresMarketBuy('BTCUSDT', capital * 0.01, { leverage });
                const entryPrice = parseFloat(position.avgPrice);
                const stopLossPrice = entryPrice * (1 - stopLossLevel);
                const takeProfitPrice = entryPrice * (1 + takeProfitLevel);
                console.log(`Long position opened at ${entryPrice}`);
                console.log(`Stop loss set at ${stopLossPrice}`);
                console.log(`Take profit set at ${takeProfitPrice}`);
            } else if (momentum < 0 && priceAction === 'SELL') {
                // Open a short position
                const position = await binance.futuresMarketSell('BTCUSDT', capital * 0.01, { leverage });
                const entryPrice = parseFloat(position.avgPrice);
                const stopLossPrice = entryPrice * (1 + stopLossLevel);
                const takeProfitPrice = entryPrice * (1 - takeProfitLevel);
                console.log(`Short position opened at ${entryPrice}`);
                console.log(`Stop loss set at ${stopLossPrice}`);
                console.log(`Take profit set at ${takeProfitPrice}`);
            }
        }
        console.log("run end")
        setTimeout(executeStrategy, delayTime);
    } catch (error) {
        console.error(error)
    }
}

// call the function to start the recursive loop
executeStrategy();

async function getAvailableBalance() {
    // get the futures account information
    const account = await binance.futuresAccount();

    // extract the available balance from the account object
    const availableBalance = account.availableBalance;

    // log the available balance to the console
    console.log(`Available balance: ${availableBalance}`);
    return availableBalance
}