import React from "react";

export default function ThirdwebGuideFooter() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: -120,
          right: -80,
          height: 300,
          width: 150,
          border: "1px solid #eaeaea",
          transform: "rotate(45deg)",
          backgroundColor: " #262935",
          cursor: "pointer",
        }}
        role="button"
        onClick={() =>
          window.open(
            "https://github.com/thirdweb-example/token-drop",
            "_blank"
          )
        }
      />
    </>
  );
}
