"use client";

import { type ReactElement, useState, useEffect } from "react";
import {
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
  useColorMode,
  VStack,
  Box,
  Spinner,
  Grid,
} from "@chakra-ui/react";
import {
  useWallet,
  WalletButton,
  useDAppKitPrivyColorMode,
  useConnex,
} from "@vechain/dapp-kit-react-privy";
import { ethers } from "ethers";
import { TransferB3TR, TransferVET } from "../components";
import { b3trAbi, b3trMainnetAddress } from "../constants";
import { Interface } from "ethers";

const abi = new Interface(b3trAbi);

const HomePage = (): ReactElement => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { toggleColorMode: toggleDAppKitPrivyColorMode } =
    useDAppKitPrivyColorMode();
  const { thor } = useConnex();

  const { connection, smartAccount, connectedWallet, selectedAccount } =
    useWallet();

  const [b3trBalance, setB3trBalance] = useState("0");
  const [vetBalance, setVETBalance] = useState({
    balance: BigInt(0),
    energy: BigInt(0),
  });

  useEffect(() => {
    const getB3trBalance = async () => {
      if (!selectedAccount.address) return;

      const balanceOf = abi.getFunction("balanceOf");
      if (!balanceOf) throw new Error("balanceOf function not found in ABI");

      const res = await thor
        .account("0x5ef79995FE8a89e0812330E4378eB2660ceDe699")
        .method(balanceOf)
        .call(selectedAccount.address);

      if (res.reverted) {
        setB3trBalance("0");
      } else {
        setB3trBalance(res.decoded[0].toString());
      }
    };

    const getVETBalance = async () => {
      if (!selectedAccount.address) return;

      const balance = await thor.account(selectedAccount.address).get();

      setVETBalance({
        balance: BigInt(balance.balance.toString()),
        energy: BigInt(balance.energy.toString()),
      });
    };

    getB3trBalance();
    getVETBalance();
  }, [selectedAccount.address]);

  if (connection.isLoadingPrivyConnection) {
    return (
      <Container>
        <HStack justifyContent={"center"}>
          <Spinner />
        </HStack>
      </Container>
    );
  }

  if (!connection.isConnected) {
    return (
      <Container>
        <HStack justifyContent={"center"}>
          <WalletButton />
        </HStack>
      </Container>
    );
  }

  return (
    <Container maxWidth={"container.lg"}>
      <HStack justifyContent={"space-between"}>
        <WalletButton />

        <Button
          onClick={() => {
            toggleDAppKitPrivyColorMode();
            toggleColorMode();
          }}
        >
          {colorMode === "dark" ? "Light" : "Dark"}
        </Button>
      </HStack>

      <Stack
        mt={10}
        overflowWrap={"break-word"}
        wordBreak={"break-word"}
        whiteSpace={"normal"}
      >
        <VStack spacing={4} alignItems="flex-start">
          {smartAccount.address && (
            <Box mt={4}>
              <Heading size={"md"}>
                <b>Smart Account</b>
              </Heading>
              <Text>Smart Account: {smartAccount.address}</Text>
              <Text>Deployed: {smartAccount.isDeployed.toString()}</Text>
              <Text>B3TR Balance: {ethers.formatEther(b3trBalance)}</Text>
              <Text>
                VET Balance: {ethers.formatEther(vetBalance.balance).toString()}
              </Text>
              <Text>
                VTHO Balance: {ethers.formatEther(vetBalance.energy).toString()}
              </Text>
            </Box>
          )}

          <Box>
            <Heading size={"md"}>
              <b>Wallet</b>
            </Heading>
            <Text>Address: {connectedWallet?.address}</Text>
            <Text>Connection Type: {connection.source.type}</Text>
          </Box>

          <Box mt={10}>
            <Heading size={"md"}>
              <b>Smart Account Actions</b>
            </Heading>
          </Box>

          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <TransferB3TR />
            <TransferVET />
          </Grid>
        </VStack>
      </Stack>
    </Container>
  );
};

export default HomePage;
