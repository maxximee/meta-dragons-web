import React, { useState, useEffect, useRef } from "react";
import { Moralis } from "moralis";
import { useWeb3ExecuteFunction } from "react-moralis";
//import { abi as contractAbi } from "../constants/abis/Token.json";
import { abi as charContractAbi } from "../constants/abis/Character.json";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  Text,
  Image,
  VStack,
  Button,
  Link,
  Input,
  Heading,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import { Formik, Field, Form } from "formik";
const { default: axios } = require("axios");

const CHAR_CONTRACT = process.env.REACT_APP_CHAR_CONTRACT;

export default function Hashtro({ isServerInfo }) {
  // web3 functionality
  const { fetch, isFetching } = useWeb3ExecuteFunction();
  // Hashtro data
  const [hashtroId, setHashtroId] = useState(null);
  const [hashtroData, setHashtro] = useState(null);
  const [hashtroMetaData, setHashtroMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState();
  const [metaDataFetched, setMetaDataFetched] = useState();
  const [interactionData, setInteractionData] = useState();
  const [showErrorMessage, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMessage, setMessage] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({
    id: null,
  });

  const form = useRef();

  useEffect(() => {
    // if we get the ID to load then fetch that IDs data from chain
    // then dep `interactionData` means we update the display after feeding
    if (hashtroId) {
      fetchData(hashtroId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashtroId, interactionData]); // <-- the above updates on these changing

  useEffect(() => {
    // updates the hashtro's state
    setHashtro(dataFetched);
  }, [dataFetched]); // <-- the above updates on this changing

  useEffect(() => {
    setHashtroMeta(metaDataFetched);
  }, [metaDataFetched]);
  // // fetch Hastro token (NFT)
  // async function fetchData(_id) {
  //   if (isServerInfo) {
  //     const options = {
  //       abi: contractAbi,
  //       contractAddress: CHAR_CONTRACT,
  //       functionName: "getTokenDetails",
  //       params: {
  //         tokenId: _id,
  //       },
  //     };
  //
  //     await fetch({
  //       params: options,
  //       onSuccess: (response) => setDataFetched(response),
  //       onComplete: () => console.log("Fetched"),
  //       onError: (error) => console.log("Error", error),
  //     });
  //   }
  // }

  const messageMarkup = (
    <Box>
      <Alert status="success">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Levelled-up!</AlertTitle>
          <AlertDescription display="block">
            Character Now Level{" "}
            {hashtroData ? hashtroData.attributes.level : ""}! 🏅
          </AlertDescription>
        </Box>
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={() => setMessage(false)}
        />
      </Alert>
    </Box>
  );

  const errorMarkup = (_error) => {
    return (
      <Box>
        <Alert status="error">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription display="block">{_error}.</AlertDescription>
          </Box>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setError(false)}
          />
        </Alert>
      </Box>
    );
  };

  // Realtime UI
  function gameRenderer(_data) {
    if (!hashtroData) {
      return (
        <VStack>
          <Text>Nothing Loaded</Text>
        </VStack>
      );
    } else {
      console.log(hashtroData);

      return (
        <VStack>
          <Box boxSize="sm">
            <Image src={hashtroData.image} alt={hashtroData.name} />
          </Box>
          <Box mt={4} mb={4}>
            <Heading as="h4" size="md">
              {hashtroData.name} #{hashtroData.id}
            </Heading>
          </Box>
          <Box>
            <Text>Level: {hashtroMetaData.attributes.level}</Text>
          </Box>
          <Box>
            <Text>DNA: {hashtroMetaData.attributes.dna}</Text>
          </Box>
          <Box>
            <Text>Evac: {hashtroMetaData.attributes.evac}</Text>
          </Box>
          <Box>
            <Text>Rarity: {hashtroMetaData.attributes.rarity}</Text>
          </Box>
          <Box>
            <Text>
              Metadata:{" "}
              <Link href={hashtroMetaData.attributes.tokenURI} isExternal>
                link to JSON <ExternalLinkIcon mx="2px" />
              </Link>
            </Text>
          </Box>
        </VStack>
      );
    }
  }

  async function readMetadata(_response) {
    console.log(_response);
    // fetch data on NFT from JSON metadata
    let metaDataFetched = {
      id: _response.id,
      attributes: {
        evac: _response.evac,
        tokenURI: _response.tokenURI,
        dna: _response.dna,
        level: _response.level,
        rarity: _response.rarity,
      },
    };
    setMetaDataFetched(metaDataFetched); //<-- temp
    setHashtroMeta(metaDataFetched);
    // console.log(dataMapping);

    // alternatiely fetch data on NFT from JSON metadata
    axios
      .get(_response.tokenURI)
      .then((res) => {
        let dataMapping;
        dataMapping = res.data[0];
        setDataFetched(dataMapping);
        gameRenderer(null);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function levelData(_hostContract, _tokenId) {
    const web3 = await Moralis.enableWeb3();
    const params = {
      hostContract: _hostContract,
      tokenId: _tokenId,
    };
    const signedTransaction = await Moralis.Cloud.run("levelUp", params);
    const fulfillTx = await web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction,
    );
    setMessage(true);
    fetchData(hashtroId);
    setLoading(false);
    console.log(fulfillTx);
  }

  // fetch Hastro token (NFT)
  async function fetchData(_id) {
    const options = {
      abi: charContractAbi,
      contractAddress: CHAR_CONTRACT,
      functionName: "getTokenDetails",
      params: {
        _id: _id,
      },
    };

    await fetch({
      params: options,
      onSuccess: (response) => readMetadata(response),
      onComplete: () => console.log("Character Fetched"),
      onError: (error) => console.log("Error", error),
    });
  }

  // UI interactions
  const handleSubmit = async (e) => {
    console.log("FORM INPUT:", e);

    //e.preventDefault();
    setHashtroId(e.id);
  };
  function onLevelUp(e) {
    e.preventDefault();
    setLoading(true);

    if (hashtroId) {
      levelData(CHAR_CONTRACT, hashtroId);
    }
  }
  // UI
  return (
    <Box style={{ display: "flex", gap: "10px" }}>
      <Box>
        <VStack>
          <Heading className="h1" mb={2}>
            Test NFT Character
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
                <Box mb={2}>
                  {showMessage ? messageMarkup : ""}
                  {showErrorMessage ? errorMarkup(errorMessage) : ""}
                </Box>
                <Field name="id">
                  {({ field, form }) => (
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        id="id"
                        className="first"
                        placeholder="Character ID"
                        mb={2}
                        borderRadius={1}
                        variant="outline"
                        borderColor="teal"
                        borderStyle="solid"
                        lineHeight={0.2}
                        value={field.value ? field.value : ""}
                      />
                      <FormErrorMessage>{form.errors.id}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Button
                  name="fetch"
                  //onClick={onSubmit}
                  disabled={dataFetched || isFetching ? true : false}
                  colorScheme="green"
                  size="lg"
                  variant="solid"
                  leftIcon={"👨‍🚀"}
                  type="submit"
                >
                  Fetch
                </Button>
              </Form>
            )}
          </Formik>
        </VStack>
        <>{gameRenderer(hashtroData)}</>
      </Box>
    </Box>
  );
}
