import React from "react";
import Iconify from "./Iconify";

export function NoWalletConnectedMessage() {
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 2,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 3,
          top: "50%",
          left: "50%",
          width: "200px",
          height: "50px",
          marginLeft: "-50px",
          marginTop: " -25px",
          textAlign: "center",
        }}
      >
        <div className="spinner-border" role="status">
          <Iconify icon={'mdi:airplane-alert'} width="24" height="24" /> <br />
          <span className="sr-only"><b>Please connect your Wallet to get started</b></span>
        </div>
      </div>
    </div>
  );
}
