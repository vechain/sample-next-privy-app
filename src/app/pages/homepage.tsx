"use client";

import {
  type ReactElement,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
  Box,
  Spinner,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import {
  useWallet,
  useSendTransaction,
  WalletButton,
  TransactionModal,
  TransactionToast,
  useDAppKitPrivyColorMode,
  useConnex,
} from "@vechain/dapp-kit-react-privy";
import { b3trAbi, b3trMainnetAddress } from "../constants";
import { Interface, ethers } from "ethers";

const HomePage = (): ReactElement => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { toggleColorMode: toggleDAppKitPrivyColorMode } =
    useDAppKitPrivyColorMode();
  const { thor } = useConnex();

  const { connection, smartAccount, connectedWallet, selectedAccount } =
    useWallet();

  // Add these new state variables
  const [amount, setAmount] = useState("0");
  const [receiverAddress, setReceiverAddress] = useState(
    connectedWallet.address
  );
  const [b3trBalance, setB3trBalance] = useState("0");
  const abi = new Interface(b3trAbi);

  // A dummy tx sending 0 b3tr tokens
  const clauses = useMemo(() => {
    if (!receiverAddress || !amount) return [];

    const clausesArray: any[] = [];

    clausesArray.push({
      to: b3trMainnetAddress,
      value: "0x0",
      data: abi.encodeFunctionData("transfer", [
        receiverAddress,
        ethers.parseEther(amount),
      ]),
      comment: `Transfer ${amount} B3TR to ${receiverAddress}`,
      abi: abi.getFunction("transfer"),
    });
    return clausesArray;
  }, [amount, receiverAddress]);

  const {
    sendTransaction,
    status,
    txReceipt,
    resetStatus,
    isTransactionPending,
    error,
  } = useSendTransaction({
    signerAccount: connection.isConnectedWithPrivy
      ? smartAccount
      : connectedWallet,
    privyUIOptions: {
      title: "Sign to confirm",
      description: `Transfer ${amount} B3TR to ${receiverAddress}`,
      buttonText: "Sign",
    },
  });

  const transactionToast = useDisclosure();
  const handleTransactionWithToast = useCallback(async () => {
    transactionToast.onOpen();
    await sendTransaction(clauses);
  }, [sendTransaction, clauses]);

  const transactionModal = useDisclosure();
  const handleTransactionWithModal = useCallback(async () => {
    transactionModal.onOpen();
    await sendTransaction(clauses);
  }, [sendTransaction, clauses]);

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

    getB3trBalance();
  }, [selectedAccount.address, abi]);

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
    <Container>
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
            </Box>
          )}

          <Box>
            <Heading size={"md"}>
              <b>Wallet</b>
            </Heading>
            <Text>Address: {connectedWallet?.address}</Text>
            <Text>Connection Type: {connection.source.type}</Text>
          </Box>

          <Box mt={4}>
            <Heading size={"md"}>
              <b>Actions</b>
            </Heading>

            <VStack spacing={4} mt={4} alignItems="stretch">
              <FormControl>
                <FormLabel>Receiver Address</FormLabel>
                <Input
                  placeholder="0x..."
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Amount (B3TR)</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value !== "" ? e.target.value : "0")
                  }
                  min="0"
                  step="1"
                />
              </FormControl>
            </VStack>
          </Box>

          <Box mt={4}>
            <HStack mt={4} spacing={4}>
              <HStack mt={4} spacing={4}>
                <Button
                  onClick={handleTransactionWithToast}
                  isLoading={isTransactionPending}
                  isDisabled={isTransactionPending}
                >
                  Tx with toast
                </Button>
                <Button
                  onClick={handleTransactionWithModal}
                  isLoading={isTransactionPending}
                  isDisabled={isTransactionPending}
                >
                  Tx with modal
                </Button>
              </HStack>
            </HStack>
          </Box>
        </VStack>
      </Stack>

      <TransactionToast
        isOpen={transactionToast.isOpen}
        onClose={transactionToast.onClose}
        status={status}
        error={error}
        txReceipt={txReceipt}
        resetStatus={resetStatus}
      />

      <TransactionModal
        isOpen={transactionModal.isOpen}
        onClose={transactionModal.onClose}
        status={status}
        txId={txReceipt?.meta.txID}
        errorDescription={error?.reason ?? "Unknown error"}
        showSocialButtons={true}
        showExplorerButton={true}
      />
    </Container>
  );
};

export default HomePage;
