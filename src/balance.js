require('dotenv').config()
const Binance = require('node-binance-api');

console.log("BOT START")
const binanceClient = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    test: true, // Set test option to true if you're using the Futures Testnet
    futures: true, // Set futures option to true for Futures API
    useServerTime: true
});

async function getAccountBalance() {
    try {
        const accountInfo = await binanceClient.futuresAccount();
        //console.log('Account balances:', accountInfo);
        const klines = await binanceClient.futuresCandles("BTCUSDT", "5m", { limit: 50 });
        console.dir(klines)
    } catch (error) {
        console.error('Error:', error);
    }
}

getAccountBalance();