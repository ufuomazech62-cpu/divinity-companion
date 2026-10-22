import { useNavigate } from "@tanstack/react-router";

// upstream-unshipped placeholder: upstream main references this route but
// never shipped the page (P1: implement the game play experience).
export function GamePlayPage() {
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
      <p style={{ margin: 0, fontWeight: 600 }}>This experience is coming back soon.</p>
      <button style={{ cursor: "pointer" }} onClick={() => navigate({ to: "/tabs/games" })}>
        Back to the game center
      </button>
    </div>
  );
}
