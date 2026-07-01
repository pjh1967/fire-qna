import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// ───────────────────────────────────────────────
//  ⚙️  설정 — 실제 값으로 교체하세요
// ───────────────────────────────────────────────
const CONFIG = {
  // Google Sheets CSV 공개 URL (파일 > 공유 > 웹에 게시 > CSV)
  SHEET_CSV_URL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Hdpox6FZP3QYre_jxScGYlu7UOG9_rXzqSlfIzMy1QrMgTQOwXW3qMV55-PTPSvwzWw2AYrr5w5G/pub?gid=0&single=true&output=csv",
  // Apps Script 웹앱 URL (대화 로그 저장용)
  // Apps Script 배포 > 새 배포 > 웹 앱 > 배포 후 URL 붙여넣기
  LOG_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  // 학과 이름
  DEPT_NAME: "소방안전관리학과",
  // 로봇 이름
  BOT_NAME: "파이어봇",
};

// ───────────────────────────────────────────────
//  CSV 파서
// ───────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || "").trim().replace(/^"|"$/g, "");
    });
    return row;
  });
}

// ───────────────────────────────────────────────
//  🔥 귀여운 사람 소방관 캐릭터 SVG
// ───────────────────────────────────────────────
function RobotMascot({ isTyping, mood }) {
  return (
    <svg
      viewBox="0 0 160 220"
      width="clamp(60px, 15vw, 120px)"
      height="clamp(82px, 20vw, 165px)"
      style={{
        filter: "drop-shadow(0 6px 18px rgba(239,68,68,0.30))",
        animation: isTyping
          ? "bobbing 0.5s ease-in-out infinite alternate"
          : "idle 3s ease-in-out infinite alternate",
        overflow: "visible",
      }}
    >
      {/* ─── 헬멧 ─── */}
      {/* 헬멧 뒤판 */}
      <ellipse cx="80" cy="52" rx="40" ry="44" fill="#dc2626" />
      {/* 헬멧 챙 */}
      <rect x="32" y="76" width="96" height="12" rx="6" fill="#b91c1c" />
      {/* 헬멧 앞면 광택 */}
      <ellipse cx="68" cy="36" rx="14" ry="9" fill="#fca5a5" opacity="0.35" />
      {/* 헬멧 119 텍스트 */}
      <text x="80" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold"
        fontFamily="Arial,sans-serif" opacity="0.95" letterSpacing="1">119</text>
      {/* 헬멧 노란 줄 */}
      <rect x="36" y="80" width="88" height="5" rx="2.5" fill="#fde047" opacity="0.9" />

      {/* ─── 얼굴 ─── */}
      {/* 피부 */}
      <ellipse cx="80" cy="106" rx="34" ry="32" fill="#fed7aa" />
      {/* 귀 */}
      <ellipse cx="47" cy="106" rx="8" ry="10" fill="#fdba74" />
      <ellipse cx="113" cy="106" rx="8" ry="10" fill="#fdba74" />
      {/* 귀 안쪽 */}
      <ellipse cx="47" cy="106" rx="5" ry="6" fill="#fca5a5" opacity="0.5" />
      <ellipse cx="113" cy="106" rx="5" ry="6" fill="#fca5a5" opacity="0.5" />

      {/* 눈썹 */}
      <path d="M60 92 Q68 87 76 91" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"
        style={{ transform: mood === "thinking" ? "translateY(-1px)" : "none" }} />
      <path d="M84 91 Q92 87 100 92" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"
        style={{ transform: mood === "thinking" ? "translateY(-1px)" : "none" }} />

      {/* 눈 흰자 */}
      <ellipse cx="68" cy="103" rx="11" ry="12" fill="white" />
      <ellipse cx="92" cy="103" rx="11" ry="12" fill="white" />

      {/* 눈동자 + 반짝임 */}
      {mood === "happy" ? (
        <>
          {/* happy: 반달눈 */}
          <path d="M57 101 Q68 110 79 101" fill="#1e3a5f" />
          <path d="M81 101 Q92 110 103 101" fill="#1e3a5f" />
          <ellipse cx="63" cy="98" rx="3" ry="2" fill="white" opacity="0.9" />
          <ellipse cx="87" cy="98" rx="3" ry="2" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          <circle cx="68" cy="104" r="8" fill="#1e3a5f">
            {isTyping && <animate attributeName="r" values="8;6;8" dur="0.7s" repeatCount="indefinite" />}
          </circle>
          <circle cx="92" cy="104" r="8" fill="#1e3a5f">
            {isTyping && <animate attributeName="r" values="8;6;8" dur="0.7s" repeatCount="indefinite" />}
          </circle>
          <circle cx="68" cy="104" r="4" fill="#3b82f6" />
          <circle cx="92" cy="104" r="4" fill="#3b82f6" />
          <circle cx="71" cy="101" r="2.5" fill="white" opacity="0.95" />
          <circle cx="95" cy="101" r="2.5" fill="white" opacity="0.95" />
          {/* thinking: 한쪽 눈 윙크처럼 */}
          {mood === "thinking" && (
            <path d="M81 103 Q92 108 103 103" stroke="#1e3a5f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </>
      )}

      {/* 코 */}
      <ellipse cx="80" cy="114" rx="4" ry="3" fill="#fdba74" />

      {/* 입 */}
      {mood === "happy" && (
        <path d="M66 122 Q80 134 94 122" stroke="#ef4444" strokeWidth="3" fill="#fca5a5" strokeLinecap="round" />
      )}
      {mood === "thinking" && (
        <path d="M68 124 Q80 121 92 124" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {mood === "idle" && (
        <path d="M68 124 Q80 130 92 124" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* 볼 홍조 */}
      <ellipse cx="54" cy="118" rx="11" ry="7" fill="#f87171" opacity={mood === "happy" ? 0.5 : 0.22} />
      <ellipse cx="106" cy="118" rx="11" ry="7" fill="#f87171" opacity={mood === "happy" ? 0.5 : 0.22} />

      {/* thinking 말풍선 점 */}
      {mood === "thinking" && (
        <>
          <circle cx="118" cy="88" r="4.5" fill="#fbbf24" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.75s" repeatCount="indefinite" />
          </circle>
          <circle cx="128" cy="76" r="3.5" fill="#fbbf24" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.75s" begin="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="136" cy="66" r="2.5" fill="#fbbf24" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.75s" begin="0.4s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* ─── 목 ─── */}
      <rect x="68" y="135" width="24" height="12" rx="6" fill="#fdba74" />

      {/* ─── 몸통 (방화복) ─── */}
      {/* 몸통 본체 */}
      <rect x="30" y="145" width="100" height="56" rx="20" fill="#1d4ed8" />
      {/* 반사 테이프 */}
      <rect x="30" y="164" width="100" height="7" rx="3" fill="#fde047" opacity="0.92" />
      <rect x="30" y="180" width="100" height="7" rx="3" fill="#fde047" opacity="0.92" />
      {/* 지퍼 */}
      <rect x="77" y="145" width="6" height="48" rx="3" fill="#1e40af" opacity="0.5" />
      {/* 지퍼 탭 */}
      <rect x="73" y="154" width="14" height="7" rx="3.5" fill="#93c5fd" />
      {/* 가슴 불꽃 뱃지 */}
      <path d="M44 178 Q47 164 54 169 Q51 157 59 152 Q57 164 62 162 Q59 174 52 179 Z" fill="#fb923c">
        {isTyping && <animate attributeName="opacity" values="1;0.4;1" dur="0.4s" repeatCount="indefinite" />}
      </path>
      <path d="M48 178 Q50 168 55 172 Q53 162 59 158 Q58 168 62 166 Q60 175 54 179 Z" fill="#fde047">
        {isTyping && <animate attributeName="opacity" values="1;0.4;1" dur="0.4s" begin="0.1s" repeatCount="indefinite" />}
      </path>

      {/* ─── 팔 ─── */}
      {/* 왼팔 */}
      <rect x="8" y="147" width="24" height="44" rx="12" fill="#1d4ed8" />
      <rect x="8" y="164" width="24" height="7" rx="3" fill="#fde047" opacity="0.9" />
      {/* 왼손 */}
      <ellipse cx="20" cy="196" rx="12" ry="10" fill="#fdba74" />
      {/* 손가락 느낌 */}
      <rect x="10" y="189" width="6" height="10" rx="3" fill="#fca5a5" opacity="0.6" />
      <rect x="17" y="187" width="6" height="12" rx="3" fill="#fca5a5" opacity="0.6" />
      <rect x="24" y="189" width="6" height="10" rx="3" fill="#fca5a5" opacity="0.6" />

      {/* 오른팔 */}
      <rect x="128" y="147" width="24" height="44" rx="12" fill="#1d4ed8" />
      <rect x="128" y="164" width="24" height="7" rx="3" fill="#fde047" opacity="0.9" />
      {/* 오른손 + 소방 호스 */}
      <ellipse cx="140" cy="196" rx="12" ry="10" fill="#fdba74" />
      <rect x="148" y="186" width="18" height="7" rx="3.5" fill="#6b7280" />
      <rect x="163" y="182" width="8" height="15" rx="4" fill="#9ca3af" />
      {/* 물 분사 */}
      {isTyping && (
        <>
          <ellipse cx="174" cy="179" rx="3" ry="2" fill="#93c5fd" opacity="0.9">
            <animate attributeName="cx" values="174;180;186" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.5;0" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="176" cy="175" rx="2" ry="1.5" fill="#bfdbfe" opacity="0.8">
            <animate attributeName="cx" values="176;183;190" dur="0.5s" begin="0.15s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.4;0" dur="0.5s" begin="0.15s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="172" cy="183" rx="2.5" ry="1.5" fill="#93c5fd" opacity="0.7">
            <animate attributeName="cx" values="172;178;184" dur="0.5s" begin="0.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.3;0" dur="0.5s" begin="0.3s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}

      {/* ─── 다리 & 부츠 ─── */}
      <rect x="42" y="198" width="30" height="16" rx="8" fill="#1d4ed8" />
      <rect x="88" y="198" width="30" height="16" rx="8" fill="#1d4ed8" />
      {/* 부츠 */}
      <rect x="36" y="208" width="38" height="13" rx="6" fill="#111827" />
      <rect x="86" y="208" width="38" height="13" rx="6" fill="#111827" />
      {/* 부츠 반사띠 */}
      <rect x="36" y="212" width="38" height="4" rx="2" fill="#fde047" opacity="0.8" />
      <rect x="86" y="212" width="38" height="4" rx="2" fill="#fde047" opacity="0.8" />
    </svg>
  );
}
// ───────────────────────────────────────────────
//  채팅 버블
// ───────────────────────────────────────────────
function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
        gap: "8px",
        alignItems: "flex-end",
      }}
    >
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>🧑‍🚒</div>
      )}
      <div
        style={{
          maxWidth: "72%",
          padding: "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
            : "rgba(30,41,59,0.9)",
          color: isUser ? "#fff" : "#e2e8f0",
          fontSize: "14px",
          lineHeight: "1.6",
          boxShadow: isUser
            ? "0 4px 16px rgba(99,102,241,0.3)"
            : "0 4px 16px rgba(0,0,0,0.3)",
          border: isUser ? "none" : "1px solid rgba(99,102,241,0.2)",
          whiteSpace: "pre-wrap",
        }}
      >
        {isUser ? msg.content : (
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{margin:"0 0 8px",lineHeight:"1.7"}}>{children}</p>,
              h1: ({children}) => <p style={{margin:"0 0 8px",fontWeight:700,fontSize:"16px"}}>{children}</p>,
              h2: ({children}) => <p style={{margin:"0 0 8px",fontWeight:700,fontSize:"15px"}}>{children}</p>,
              h3: ({children}) => <p style={{margin:"0 0 6px",fontWeight:700,fontSize:"14px"}}>{children}</p>,
              ul: ({children}) => <ul style={{margin:"4px 0 8px",paddingLeft:"18px"}}>{children}</ul>,
              ol: ({children}) => <ol style={{margin:"4px 0 8px",paddingLeft:"18px"}}>{children}</ol>,
              li: ({children}) => <li style={{margin:"3px 0",lineHeight:"1.6"}}>{children}</li>,
              strong: ({children}) => <strong style={{color:"#c7d2fe",fontWeight:700}}>{children}</strong>,
              em: ({children}) => <em style={{color:"#a5b4fc"}}>{children}</em>,
              code: ({children}) => <code style={{background:"rgba(99,102,241,0.2)",padding:"1px 6px",borderRadius:"4px",fontSize:"13px",color:"#c7d2fe"}}>{children}</code>,
              hr: () => <hr style={{border:"none",borderTop:"1px solid rgba(99,102,241,0.2)",margin:"8px 0"}} />,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg,#f43f5e,#fb923c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>👤</div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────
//  메인 앱
// ───────────────────────────────────────────────
export default function DeptQnABot() {
  const [sheetUrl, setSheetUrl] = useState(CONFIG.SHEET_CSV_URL);
  const [sheetData, setSheetData] = useState(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `안녕하세요! 저는 ${CONFIG.DEPT_NAME} AI 도우미 ${CONFIG.BOT_NAME}입니다 🤖\n궁금한 점을 무엇이든 물어보세요!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState("idle");
  const [showSetup, setShowSetup] = useState(false);
  const [logStatus, setLogStatus] = useState(""); // "saving" | "saved" | "error"
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 페이지 로드 시 시트 자동 연결
  useEffect(() => {
    loadSheet();
  }, []);

  // Google Sheets CSV 불러오기
  async function loadSheet() {
    if (!sheetUrl.includes("docs.google.com")) {
      setSheetError("올바른 Google Sheets URL을 입력해주세요.");
      return;
    }
    setSheetLoading(true);
    setSheetError("");
    try {
      const res = await fetch(sheetUrl);
      if (!res.ok) throw new Error("시트를 불러올 수 없습니다.");
      const text = await res.text();
      const rows = parseCSV(text);
      setSheetData(rows);
      setShowSetup(false);
    } catch (e) {
      setSheetError(e.message + "\n\n💡 시트를 \"웹에 게시 > CSV\"로 공유했는지 확인하세요.");
    } finally {
      setSheetLoading(false);
    }
  }

  // Google Sheets 대화 로그 저장
  async function saveLog(question, answer) {
    if (!CONFIG.LOG_SCRIPT_URL.includes("script.google.com")) return;
    setLogStatus("saving");
    try {
      await fetch(CONFIG.LOG_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script CORS 헤더 없음 → no-cors 필수
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      setLogStatus("saved");
    } catch {
      setLogStatus("error");
    } finally {
      setTimeout(() => setLogStatus(""), 3000);
    }
  }

  // Claude AI 호출
  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    setMood("thinking");

    // 시트 데이터를 시스템 프롬프트에 주입
    const sheetContext = sheetData
      ? `\n\n## 학과 공식 정보 (Google Sheets 데이터)\n${JSON.stringify(sheetData, null, 2)}`
      : "\n\n(아직 Google Sheets 데이터가 연결되지 않았습니다. 일반 지식으로만 답변합니다.)";

    const systemPrompt = `당신은 ${CONFIG.DEPT_NAME}의 친절하고 유능한 AI 도우미 ${CONFIG.BOT_NAME}입니다.
학생과 학부모, 수험생의 질문에 정확하고 친근하게 답변해주세요.
아래 Google Sheets 데이터를 최우선으로 참고하여 답변하고, 시트에 없는 내용은 일반 지식으로 보완하세요.
답변은 한국어로, 친근하고 전문적인 톤으로 작성하세요. 이모지를 적절히 사용해도 좋습니다.${sheetContext}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages
              .filter((m) => m.role !== "system")
              .map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg },
          ],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "죄송해요, 응답을 받지 못했습니다.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setMood("happy");
      setTimeout(() => setMood("idle"), 2000);
      // 대화 로그 Sheets에 저장
      saveLog(userMsg, reply);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      ]);
      setMood("idle");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#020617 0%,#0f172a 50%,#1e1b4b 100%)",
      fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px 8px",
    }}>
      <style>{`
        @keyframes bobbing { from{transform:translateY(0)} to{transform:translateY(-8px)} }
        @keyframes idle { from{transform:translateY(0) rotate(-1deg)} to{transform:translateY(-4px) rotate(1deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.4);border-radius:3px }
      `}</style>

      {/* 헤더 */}
      <div style={{ textAlign: "center", marginBottom: "24px", animation: "fadeIn 0.6s ease" }}>

        <h1 style={{
          fontSize: "clamp(20px,4vw,28px)",
          fontWeight: 800,
          color: "#f8fafc",
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          {CONFIG.DEPT_NAME}
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0" }}>
          AI 학과 안내 챗봇 — {CONFIG.BOT_NAME}
        </p>
      </div>

      {/* 메인 카드 */}
      <div style={{
        width: "100%",
        maxWidth: "800px",
        background: "rgba(15,23,42,0.8)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "24px",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        animation: "fadeIn 0.8s ease",
      }}>
        {/* 설정 패널 */}
        {showSetup && (
          <div style={{
            padding: "24px",
            borderBottom: "1px solid rgba(99,102,241,0.2)",
            background: "rgba(99,102,241,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>📋</span>
              <span style={{ color: "#c7d2fe", fontWeight: 700, fontSize: "14px" }}>
                Google Sheets 연결
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
              시트 → 파일 → 공유 → 웹에 게시 → CSV 형식 URL을 붙여넣으세요
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(99,102,241,0.3)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                onClick={loadSheet}
                disabled={sheetLoading}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  opacity: sheetLoading ? 0.6 : 1,
                }}
              >
                {sheetLoading ? "로딩..." : "연결"}
              </button>
            </div>
            {sheetError && (
              <div style={{
                marginTop: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.3)",
                color: "#fda4af",
                fontSize: "12px",
                whiteSpace: "pre-line",
              }}>
                {sheetError}
              </div>
            )}
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button
                onClick={() => setShowSetup(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  fontSize: "12px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                시트 없이 계속하기 →
              </button>
            </div>
          </div>
        )}

        {/* 로봇 + 채팅 영역 */}
        <div style={{ display: "flex", gap: "0", height: showSetup ? "420px" : "500px" }}>
          {/* 로봇 사이드바 */}
          <div style={{
            width: "clamp(80px, 20vw, 160px)",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 6px",
            borderRight: "1px solid rgba(99,102,241,0.15)",
            background: "rgba(99,102,241,0.04)",
            gap: "8px",
          }}>
            <RobotMascot isTyping={isLoading} mood={mood} />
            <div style={{
              textAlign: "center",
              color: "#a5b4fc",
              fontSize: "clamp(10px, 2.5vw, 13px)",
              fontWeight: 700,
            }}>
              {CONFIG.BOT_NAME}
            </div>


            {/* 로그 저장 상태 */}
            {logStatus && (
              <div style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: logStatus === "saved"
                  ? "rgba(74,222,128,0.1)"
                  : logStatus === "saving"
                  ? "rgba(251,191,36,0.1)"
                  : "rgba(244,63,94,0.1)",
                border: `1px solid ${logStatus === "saved" ? "rgba(74,222,128,0.3)" : logStatus === "saving" ? "rgba(251,191,36,0.3)" : "rgba(244,63,94,0.3)"}`,
                color: logStatus === "saved" ? "#4ade80" : logStatus === "saving" ? "#fbbf24" : "#f87171",
                textAlign: "center",
              }}>
                {logStatus === "saving" ? "저장 중..." : logStatus === "saved" ? "✓ 시트 저장" : "저장 실패"}
              </div>
            )}
          </div>

          {/* 채팅 영역 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* 메시지 목록 */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ animation: "fadeIn 0.3s ease" }}>
                  <ChatBubble msg={msg} />
                </div>
              ))}
              {isLoading && (
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", marginBottom: "12px" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>🤖</div>
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "rgba(30,41,59,0.9)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#6366f1",
                        animation: `pulse 1s ${d}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 입력창 */}
            <div style={{
              padding: "10px",
              borderTop: "1px solid rgba(99,102,241,0.15)",
              display: "flex",
              gap: "6px",
              alignItems: "center",
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="질문하세요..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(99,102,241,0.3)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#e2e8f0",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.7)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.3)")}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  flexShrink: 0,
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "none",
                  background: isLoading || !input.trim()
                    ? "rgba(99,102,241,0.3)"
                    : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                전송 ↑
              </button>
            </div>
          </div>
        </div>

        {/* 예시 질문 */}
        {messages.length <= 1 && (
          <div style={{
            padding: "16px",
            borderTop: "1px solid rgba(99,102,241,0.1)",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}>
            {[
              "입학 전형은 어떻게 되나요?",
              "졸업 후 진로는?",
              "교육과정을 알려주세요",
              "장학금 제도가 있나요?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: "1px solid rgba(99,102,241,0.3)",
                  background: "rgba(99,102,241,0.08)",
                  color: "#a5b4fc",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "rgba(99,102,241,0.2)")}
                onMouseLeave={(e) => (e.target.style.background = "rgba(99,102,241,0.08)")}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <p style={{ color: "#334155", fontSize: "12px", marginTop: "16px" }}>
        Powered by Claude AI · Google Sheets 연동
      </p>
    </div>
  );
}
