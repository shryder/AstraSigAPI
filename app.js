const express = require('express');
const app = express();
const axios = require("axios");
const { ethers } = require("ethers");

const API_PORT = 1865;

app.use(express.json());

app.get("/api/config", (req, res) => {
	if (req.header("Contract-Address").toLowerCase() !== "0x4c7E50caE947540a12Dda90e826A15c47CCe1aC9".toLowerCase()) {
		return res.json({
			success: false,
			message: "Contract not supported"
		});
	}

	return res.json({
		success: true,
		data: {
			// if true, send request to /api/monitor every X milliseconds asking if the API is live otherwise send request to /api/calldata once when task starts
			monitor_mode: false,
	
			// when monitor_mode is enabled, Astra will ping /api/monitor every 100ms to ask for status
			delay: 100
		}
	});
});

const ABI = require("./ABI.json");
const iface = new ethers.utils.Interface(ABI);

app.post("/api/calldata", async (req, res) => {
	const { private_key } = req.body;

	const wallet = new ethers.Wallet(private_key);
	console.log("public address: ", wallet.address);

	return res.json({
		success: true,
		calldata: iface.encodeFunctionData("mint", [
			1,
			"0x5e9c35a8b896c080ea5d376391addd1f3de6df95554328ca5cf967971444212f658a79f0cfcd4485be0148879e00f552e64b9fe483d2a443da00435102e7852e1b"
		]) // returns 0x-prefixed hexdata
	});

	// If the merkle/sig API is down or something, return something like this:

	// return res.json({
	// 	success: false,
	// 	message: `NFT API is down or something`
	// });
});

app.post("/api/monitor", async (req, res) => {
	const { private_key } = req.body;

	const wallet = new ethers.Wallet(private_key);
	console.log("public address: ", wallet.address);

	return res.json({
		live: true,
		calldata: iface.encodeFunctionData("mint", [
			1,
			"0x5e9c35a8b896c080ea5d376391addd1f3de6df95554328ca5cf967971444212f658a79f0cfcd4485be0148879e00f552e64b9fe483d2a443da00435102e7852e1b" // dummy data
		]) // returns 0x-prefixed hexdata
	});

	// If the NFT's signature api is not live yet, return { live: false } and Astra will call this API again in X milliseconds (depending on config.delay)
	// return res.json({
	// 	live: false
	// });
});

app.listen(API_PORT, () => {
	console.log(`Local API listening on port ${API_PORT}`)
});
