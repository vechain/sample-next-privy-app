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
} from "@vechain/vechain-kit";
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

  const { connection, smartAccount, connectedWallet, account } = useWallet();

  const [b3trBalance, setB3trBalance] = useState("0");
  const [vetBalance, setVETBalance] = useState({
    balance: BigInt(0),
    energy: BigInt(0),
  });

  useEffect(() => {
    const getB3trBalance = async () => {
      if (!account.address) return;

      const balanceOf = abi.getFunction("balanceOf");
      if (!balanceOf) throw new Error("balanceOf function not found in ABI");

      const res = await thor
        .account("0x5ef79995FE8a89e0812330E4378eB2660ceDe699")
        .method(balanceOf)
        .call(account.address);

      if (res.reverted) {
        setB3trBalance("0");
      } else {
        setB3trBalance(res.decoded[0].toString());
      }
    };

    const getVETBalance = async () => {
      if (!account.address) return;

      const balance = await thor.account(account.address).get();

      setVETBalance({
        balance: BigInt(balance.balance.toString()),
        energy: BigInt(balance.energy.toString()),
      });
    };

    getB3trBalance();
    getVETBalance();
  }, [account.address]);

  if (connection.isLoadingPrivyConnection) {
    return (
      <Container minH="100vh" py={4}>
        <HStack justifyContent={"center"}>
          <Spinner />
        </HStack>
      </Container>
    );
  }

  if (!connection.isConnected) {
    return (
      <Container minH="100vh" py={4}>
        <HStack justifyContent={"center"}>
          <WalletButton />
        </HStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" minH="100vh" py={4} wordBreak="break-word">
      <VStack width="full" spacing={6}>
        <HStack width="full" justifyContent={"space-between"}>
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

        <VStack width="full" spacing={8} alignItems="stretch">
          {smartAccount.address && (
            <VStack width="full" alignItems="flex-start" spacing={2}>
              <Heading size={"md"}>
                <b>Smart Account</b>
              </Heading>
              <Text>Address: {smartAccount.address}</Text>
              <Text>Deployed: {smartAccount.isDeployed.toString()}</Text>
              <Text>B3TR Balance: {ethers.formatEther(b3trBalance)}</Text>
              <Text>
                VET Balance: {ethers.formatEther(vetBalance.balance).toString()}
              </Text>
              <Text>
                VTHO Balance: {ethers.formatEther(vetBalance.energy).toString()}
              </Text>
            </VStack>
          )}

          <VStack width="full" alignItems="flex-start" spacing={2}>
            <Heading size={"md"}>
              <b>Wallet</b>
            </Heading>
            <Text>Address: {connectedWallet?.address}</Text>
            <Text>Connection Type: {connection.source.type}</Text>
          </VStack>

          <VStack width="full" alignItems="flex-start" spacing={4}>
            <Heading size={"md"}>
              <b>Smart Account Actions</b>
            </Heading>
            <Grid
              templateColumns={["1fr", "1fr", "repeat(2, 1fr)"]}
              gap={4}
              width="full"
            >
              <TransferB3TR />
              <TransferVET />
            </Grid>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  );
};

export default HomePage;
