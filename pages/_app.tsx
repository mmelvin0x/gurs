import React from "react";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import Head from "next/head";
import "../styles/globals.css";
import { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// This is the chain your dApp will work on.
const activeChain = ChainId.AvalancheFujiTestnet;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={activeChain}>
      <Head>
        <title>GURS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Token drop for $GURS" />
        <meta
          name="keywords"
          content="token drop, token transfer, token claim, token claim phases, gurs, gurs token, gurs token drop, gurs token transfer, gurs token claim"
        />
      </Head>
      <Component {...pageProps} />
      <ToastContainer />
    </ThirdwebProvider>
  );
}

export default MyApp;
