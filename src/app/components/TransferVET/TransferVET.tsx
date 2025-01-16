"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import {
  Button,
  Heading,
  HStack,
  useDisclosure,
  VStack,
  Box,
  FormControl,
  FormLabel,
  Input,
  Card,
  CardBody,
  Grid,
} from "@chakra-ui/react";
import {
  useWallet,
  useSendTransaction,
  TransactionModal,
  TransactionToast,
} from "@vechain/vechain-kit";
import { isValidAddress } from "../../AddressUtils";
import { ethers } from "ethers";

export const TransferVET = () => {
  const { connection, smartAccount, connectedWallet } = useWallet();
  const [vetAmount, setVETAmount] = useState("0");
  const [vetReceiverAddress, setVETReceiverAddress] = useState(
    connectedWallet.address
  );

  const transferVETClauses = useMemo(() => {
    if (
      !vetReceiverAddress ||
      !vetAmount ||
      !isValidAddress(vetReceiverAddress)
    )
      return [];

    const clausesArray: any[] = [];

    clausesArray.push({
      to: vetReceiverAddress,
      value: ethers.parseEther(vetAmount),
    });

    return clausesArray;
  }, [vetAmount, vetReceiverAddress]);

  const {
    sendTransaction: sendVETTransaction,
    status: vetStatus,
    txReceipt: vetTxReceipt,
    resetStatus: resetVETStatus,
    isTransactionPending: isVETTransactionPending,
    error: vetError,
  } = useSendTransaction({
    signerAccountAddress: connection.isConnectedWithPrivy
      ? smartAccount.address
      : connectedWallet.address,
    privyUIOptions: {
      title: "Sign to confirm",
      description: `Transfer ${vetAmount} VET to ${vetReceiverAddress}`,
      buttonText: "Sign",
    },
  });

  const vetTransactionToast = useDisclosure();
  const handleVETTransactionWithToast = useCallback(async () => {
    vetTransactionToast.onOpen();
    await sendVETTransaction(transferVETClauses);
  }, [sendVETTransaction, transferVETClauses]);

  const vetTransactionModal = useDisclosure();
  const handleVETTransactionWithModal = useCallback(async () => {
    vetTransactionModal.onOpen();
    await sendVETTransaction(transferVETClauses);
  }, [sendVETTransaction, transferVETClauses]);

  // Update the receiverAddress each time the connectedWallet changes
  useEffect(() => {
    if (connectedWallet.address !== undefined) {
      setVETReceiverAddress(connectedWallet.address);
    }
  }, [connectedWallet.address]);
  return (
    <>
      <Card mt={4}>
        <CardBody>
          <Heading size={"sm"}>
            <b>Transfer VET</b>
          </Heading>
          <Box>
            <VStack spacing={4} mt={4} alignItems="stretch">
              <FormControl>
                <FormLabel>Receiver Address</FormLabel>
                <Input
                  isInvalid={!isValidAddress(vetReceiverAddress)}
                  placeholder="0x..."
                  value={vetReceiverAddress ?? ""}
                  onChange={(e) => setVETReceiverAddress(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Amount (VET)</FormLabel>
                <Input
                  type="number"
                  value={vetAmount}
                  onChange={(e) =>
                    setVETAmount(e.target.value !== "" ? e.target.value : "0")
                  }
                  min="0"
                  step="1"
                />
              </FormControl>
            </VStack>
          </Box>

          <Grid
            templateColumns={["1fr", "1fr", "repeat(2, 1fr)"]}
            gap={4}
            mt={4}
          >
            <Button
              onClick={handleVETTransactionWithToast}
              isLoading={isVETTransactionPending}
              isDisabled={isVETTransactionPending}
            >
              Tx + toast
            </Button>
            <Button
              onClick={handleVETTransactionWithModal}
              isLoading={isVETTransactionPending}
              isDisabled={isVETTransactionPending}
            >
              Tx + modal
            </Button>
          </Grid>
        </CardBody>
      </Card>
      <TransactionToast
        isOpen={vetTransactionToast.isOpen}
        onClose={vetTransactionToast.onClose}
        status={vetStatus}
        error={vetError}
        txReceipt={vetTxReceipt}
        resetStatus={resetVETStatus}
      />
      <TransactionModal
        isOpen={vetTransactionModal.isOpen}
        onClose={vetTransactionModal.onClose}
        status={vetStatus}
        txId={vetTxReceipt?.meta.txID}
        errorDescription={vetError?.reason ?? "Unknown error"}
        showSocialButtons={true}
        showExplorerButton={true}
      />
    </>
  );
};
