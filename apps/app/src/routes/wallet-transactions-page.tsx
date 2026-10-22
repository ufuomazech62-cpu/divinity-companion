import { useNavigate } from "@tanstack/react-router";

// upstream-unshipped placeholder: upstream main references this route but
// never shipped the page (P1: implement the wallet transactions list).
export function WalletTransactionsPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        padding: 24,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>Wallet activity is coming back soon.</p>
      <button style={{ cursor: "pointer" }} onClick={() => navigate({ to: "/profile/wallet" })}>
        Back to wallet
      </button>
    </div>
  );
}
