"use client";

import { useColorMode } from "@chakra-ui/react";
import dynamic from "next/dynamic";

const VeChainKit = dynamic(
  async () => (await import("@vechain/vechain-kit")).VeChainKit,
  {
    ssr: false,
  }
);

interface Props {
  children: React.ReactNode;
}

export function SocialLoginWrapper({ children }: Props) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  return (
    <VeChainKit
      privy={{
        appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
        clientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!,
        loginMethods: ["google", "twitter", "github", "sms", "email"],
        appearance: {
          accentColor: "#696FFD",
          loginMessage: "Select a social media profile",
          logo: "https://i.ibb.co/ZHGmq3y/image-21.png",
          walletList: ["metamask", "rainbow"],
        },
        embeddedWallets: {
          createOnLogin: "all-users",
        },

        allowPasskeyLinking: true,
      }}
      privyEcosystemAppIDS={[
        "cm4wxxujb022fyujl7g0thb21", //vechain
        "clz41gcg00e4ay75dmq3uzzgr", //cleanify
        "cm153hrup0817axti38avlfyg", //greencart
      ]}
      feeDelegation={{
        delegatorUrl: process.env.NEXT_PUBLIC_DELEGATOR_URL!,
        delegateAllTransactions: true,
      }}
      dappKit={{
        walletConnectOptions: {
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
          metadata: {
            name: "Your App",
            description: "Your app description",
            url: typeof window !== "undefined" ? window.location.origin : "",
            icons: [
              typeof window !== "undefined"
                ? `${window.location.origin}/images/logo/my-dapp.png`
                : "",
            ],
          },
        },
      }}
      loginModalUI={{
        preferredLoginMethods: ["email", "google"],
      }}
      darkMode={isDarkMode}
      language="en"
      network={{
        type: "main",
      }}
    >
      {children}
    </VeChainKit>
  );
}
