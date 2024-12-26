import {
  Card,
  CardBody,
  Heading,
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { isValidAddress } from "../../AddressUtils";
import {
  TransactionToast,
  TransactionModal,
  useWallet,
  useSendTransaction,
} from "@vechain/dapp-kit-react-privy";
import { useCallback, useMemo, useState } from "react";
import { Interface, ethers } from "ethers";
import { b3trAbi, b3trMainnetAddress } from "../../constants";

export const TransferB3TR = () => {
  const { connection, smartAccount, connectedWallet } = useWallet();

  const [amount, setAmount] = useState("0");
  const [receiverAddress, setReceiverAddress] = useState(
    connectedWallet.address
  );
  const abi = new Interface(b3trAbi);

  const clauses = useMemo(() => {
    if (!receiverAddress || !amount || !isValidAddress(receiverAddress))
      return [];

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

  return (
    <>
      <Card mt={4}>
        <CardBody>
          <Heading size={"sm"}>
            <b>Transfer B3TR</b>
          </Heading>
          <Box>
            <VStack spacing={4} mt={4} alignItems="stretch">
              <FormControl>
                <FormLabel>Receiver Address</FormLabel>
                <Input
                  isInvalid={!isValidAddress(receiverAddress)}
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
        </CardBody>
      </Card>

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
    </>
  );
};
