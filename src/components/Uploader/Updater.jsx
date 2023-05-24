import React, { useRef, useState } from "react";
import { Box, Button, Heading } from "@chakra-ui/react";
import { Formik, Form } from "formik";
//import { Moralis } from "moralis";
import { useWeb3ExecuteFunction } from "react-moralis";
//import { abi as objContractAbi } from "../../constants/abis/Token.json";
import { abi as charContractAbi } from "../../constants/abis/Character.json";
import { default as axios } from "axios";
import Moralis from "moralis";
//import { useMoralis } from "react-moralis";
//const request = require("request");

// Moralis creds
//const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
//onst APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
//const MSTRKEY = process.env.REACT_APP_MASTER_KEY;
const API_URL = process.env.REACT_APP_API_URL;
const API_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const CHAR_CONTRACT = process.env.REACT_APP_CHAR_CONTRACT;
const NFT_CONTRACT = process.env.META_DRAGON_CONTRACT;

export default function Updater() {
  //const { fetch } = useWeb3ExecuteFunction();
  const [initialFormValues, setInitialFormValues] = useState({});
  let totalFiles = 0;
  const form = useRef();
  const handleSubmit = async (e, a) => {
    //console.log("FORM INPUT:", e);
    //await Moralis.start({ serverUrl: API_URL, appId: API_ID});
    // TODO find a way to not have to validate each request
    // await Moralis.enableWeb3({
    //   chainId: 80001,
    //   privateKey:
    //     "d23da211fdc31983b9d3e82b1dfc4999ccda2e544a8aa6bb89c87c720d754f58",
    // });

    // // common
    // for (let i = 12; i <= 31; i++) {
    //   await mint("QmYj9dAQE5djvq5VrzTNKXAM77GEbbz7kMNTPxyH4XDpwm", i, "common", Math.floor(Math.random() * 90) + 10,Math.floor(Math.random() * 90) + 10,Math.floor(Math.random() * 90) + 10,Math.floor(Math.random() * 90) + 10);
    // }
    // // uncommon
    // for (let i = 60; i <= 68; i++) {
    //   await mint("QmSoogfm4KpwtY6etHk7CDtQvuzwFTUmdHiUDjNPaYVbJ9", i, "uncommon", Math.floor(Math.random() * 90) + 90,Math.floor(Math.random() * 90) + 90,Math.floor(Math.random() * 90) + 90,Math.floor(Math.random() * 90) + 90);
    // }
    //
    // //rare
    // for (let i = 69; i <= 94; i++) {
    //   await mint("QmXtMueNmjDkpXRp9HptYyL6Ja6FeHQQQzFp3dM6XhFx59", i, "rare", Math.floor(Math.random() * 90) + 170,Math.floor(Math.random() * 90) + 170,Math.floor(Math.random() * 90) + 170,Math.floor(Math.random() * 90) + 170);
    // }
    //
    // //epic
    // for (let i = 95; i <= 100; i++) {
    //   await mint("QmPggWxZGSrXMtYvoDvZ9GyJB4gf79bVskLKGfEcGqALRn", i, "epic", Math.floor(Math.random() * 90) + 250,Math.floor(Math.random() * 90) + 250,Math.floor(Math.random() * 90) + 250,Math.floor(Math.random() * 90) + 250);
    // }

    await mint(
      "QmTtGo4TiKAmziHvourj7JPCFA8Y2eVPxdBsEsoTkgsKRx/yt_DA1iZslZpA",
      998,
      "epic",
      Math.floor(Math.random() * 90) + 250,
      Math.floor(Math.random() * 90) + 250,
      Math.floor(Math.random() * 90) + 250,
      Math.floor(Math.random() * 90) + 250,
    );
    await mint(
      "QmTtGo4TiKAmziHvourj7JPCFA8Y2eVPxdBsEsoTkgsKRx/yt_DA1iZslZpA",
      999,
      "epic",
      Math.floor(Math.random() * 90) + 250,
      Math.floor(Math.random() * 90) + 250,
      Math.floor(Math.random() * 90) + 250,
      Math.floor(Math.random() * 90) + 250,
    );
  };

  async function mint(rarityUri, dragonId, rarityString, tps, det, yld, acc) {
    let options = {
      contractAddress: "0x9523214EC3658931ecEA366033E22e9F2eC4c148",
      functionName: "mintDragon",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "_tokenURI",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_bloodType",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_topSpeed",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_acceleration",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_yield",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_diet",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "_rarity",
              type: "string",
            },
          ],
          name: "mintDragon",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      params: {
        _tokenURI:
          "https://meta-dragons.infura-ipfs.io/ipfs/" + rarityUri + ".json",
        _bloodType: dragonId,
        _topSpeed: tps,
        _acceleration: acc,
        _yield: yld,
        _diet: det,
        _rarity: rarityString,
      },
    };
    await Moralis.executeFunction(options);
  }

  return (
    <Box className="container text-center mt-5">
      <Heading className="h1" mb={2}>
        NFT Batch Minter
      </Heading>
      <Formik
        initialValues={initialFormValues}
        validateOnMount={true}
        enableReinitialize={true}
        onSubmit={async (values, { resetForm }) => {
          handleSubmit(values, { resetForm });
        }}
      >
        {(props) => (
          <Form ref={form}>
            <Button
              colorScheme="teal"
              isFullWidth={true}
              type="submit"
              textAlign="center"
            >
              Mint ⇧
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
