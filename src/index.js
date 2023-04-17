require('dotenv').config()
const Binance = require('node-binance-api');

console.log("BOT START")
const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    test: true, // Set test option to true if you're using the Futures Testnet
    futures: true, // Set futures option to true for Futures API
    useServerTime: true
});

const tradingSymbol = "BTCUSDT";
const amountToTrade = 0.01; // Trade 1% of total account balance
const stopLoss = 0.20; // Set stop loss at 20%
const takeProfit = 0.40; // Set take profit at 40%
const leverage = 10; // Set leverage to 10x

// Check if the golden cross strategy is met
function isGoldenCross() {
    return binance.candlesticks(tradingSymbol, "1d", (error, ticks) => {
        const lastTick = ticks[ticks.length - 1];
        const previousTick = ticks[ticks.length - 2];
        const ema20 = calculateEMA(20, ticks);
        const ema50 = calculateEMA(50, ticks);

        if (ema20 > ema50 && previousTick[4] < ema20 && lastTick[4] > ema20) {
            console.log("Golden cross detected!");
            return true;
        } else {
            return false;
        }
    });
}

// Calculate the exponential moving average for a given period
function calculateEMA(period, ticks) {
    let sum = 0;
    for (let i = ticks.length - period; i < ticks.length; i++) {
        sum += parseFloat(ticks[i][4]); // Use closing price for calculation
    }
    return sum / period;
}

// Place a long position trade with stop loss and take profit
function placeTrade() {
    binance.futuresMarketBuy(tradingSymbol, amountToTrade, { stopPrice: binance.round(parseFloat(binance.prevDay(tradingSymbol).lowPrice) * (1 - stopLoss)), closePosition: false, reduceOnly: false, takeProfitPrice: binance.round(parseFloat(binance.prevDay(tradingSymbol).highPrice) * (1 + takeProfit)), leverage: leverage }, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Trade placed:", response);
        }
    });
}

// Close the current position
function closePosition() {
    binance.futuresMarketSell(tradingSymbol, amountToTrade, { reduceOnly: true }, (error, response) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Position closed:", response);
        }
    });
}

// Check for the golden cross strategy every minute
setInterval(() => {
    console.log("Start Loop")
    if (isGoldenCross()) {
        // Close the current position before opening a new one
        closePosition();

        // Place a new trade
        placeTrade();
    } else {
        console.log("Golden cross not detected.");
    }
}, 60000); // Check every minute