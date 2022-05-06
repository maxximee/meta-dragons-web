import React, { useRef, useState } from "react";
import { Box, Button, Heading } from "@chakra-ui/react";
import { Formik, Form } from "formik";
//import { Moralis } from "moralis";
import { useWeb3ExecuteFunction } from "react-moralis";
//import { abi as objContractAbi } from "../../constants/abis/Token.json";
import { abi as charContractAbi } from "../../constants/abis/Character.json";
import {default as axios} from "axios";
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
    console.log("FORM INPUT:", e);
    //await Moralis.start({ serverUrl: API_URL, appId: API_ID});
    await Moralis.enableWeb3({ chainId: 80001, privateKey: "d23da211fdc31983b9d3e82b1dfc4999ccda2e544a8aa6bb89c87c720d754f58" });

    // common
      for (let i = 18; i <= 31; i++) {
          await mint("QmSp7wpqqfvVz65Lu7v3JJ9oSndJMxLtSbBBRCJsKmwrJ9", i);
      }
    // uncommon
      for (let i = 32; i <= 68; i++) {
          await mint("QmUQ2gLx9KzvjUMyiJtNtmcm4fS3MAkRsmR4fZgY3vooUz", i);
      }

      //rare
      for (let i = 69; i <= 94; i++) {
          await mint("QmSnAhyhYd8hDNDbRXyS2smLopmPhtdK13e2115o7bbfX4", i);
      }

      //epic
      for (let i = 95; i <= 100; i++) {
          await mint("QmNMQ9dP7JPUrA7JsaKVsbwTtoEsWcS5K1FURxWTpFAusx", i);
      }
  };


    async function mint(rarityUri, dragonId) {
        let options = {
            contractAddress: "0x5766bEcdB6Ce1b35bF5AcA4B925a1499B5239A12",
            functionName: "mintDragon",
            abi: [
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "_tokenURI",
                            "type": "string"
                        },
                        {
                            "internalType": "uint32",
                            "name": "_bloodType",
                            "type": "uint32"
                        }
                    ],
                    "name": "mintDragon",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
            ],
            params: {
                _tokenURI: "https://meta-dragons.infura-ipfs.io/ipfs/"+rarityUri+"/"+dragonId+".json",
                _bloodType: dragonId,
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
