import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CONFIG = {
  SHEET_CSV_URL:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Hdpox6FZP3QYre_jxScGYlu7UOG9_rXzqSlfIzMy1QrMgTQOwXW3qMV55-PTPSvwzWw2AYrr5w5G/pub?gid=0&single=true&output=csv",
  LOG_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  DEPT_NAME: "혜전대 소방안전관리과",
  BOT_NAME: "파이어봇",
};

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

function RobotMascot({ isTyping, mood }) {
  return (
    <svg viewBox="0 0 160 220" width="80" height="110"
      style={{ filter:"drop-shadow(0 4px 12px rgba(239,68,68,0.35))", animation: isTyping ? "bobbing 0.5s ease-in-out infinite alternate" : "idle 3s ease-in-out infinite alternate", overflow:"visible", flexShrink:0 }}>
      <ellipse cx="80" cy="52" rx="40" ry="44" fill="#dc2626" />
      <rect x="32" y="76" width="96" height="12" rx="6" fill="#b91c1c" />
      <ellipse cx="68" cy="36" rx="14" ry="9" fill="#fca5a5" opacity="0.35" />
      <text x="80" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial,sans-serif" opacity="0.95" letterSpacing="1">119</text>
      <rect x="36" y="80" width="88" height="5" rx="2.5" fill="#fde047" opacity="0.9" />
      <ellipse cx="80" cy="106" rx="34" ry="32" fill="#fed7aa" />
      <ellipse cx="47" cy="106" rx="8" ry="10" fill="#fdba74" />
      <ellipse cx="113" cy="106" rx="8" ry="10" fill="#fdba74" />
      <ellipse cx="47" cy="106" rx="5" ry="6" fill="#fca5a5" opacity="0.5" />
      <ellipse cx="113" cy="106" rx="5" ry="6" fill="#fca5a5" opacity="0.5" />
      <path d="M60 92 Q68 87 76 91" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M84 91 Q92 87 100 92" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="68" cy="103" rx="11" ry="12" fill="white" />
      <ellipse cx="92" cy="103" rx="11" ry="12" fill="white" />
      {mood === "happy" ? (
        <>
          <path d="M57 101 Q68 110 79 101" fill="#1e3a5f" />
          <path d="M81 101 Q92 110 103 101" fill="#1e3a5f" />
          <ellipse cx="63" cy="98" rx="3" ry="2" fill="white" opacity="0.9" />
          <ellipse cx="87" cy="98" rx="3" ry="2" fill="white" opacity="0.9" />
        </>
      ) : (
        <>
          <circle cx="68" cy="104" r="8" fill="#1e3a5f">{isTyping && <animate attributeName="r" values="8;6;8" dur="0.7s" repeatCount="indefinite" />}</circle>
          <circle cx="92" cy="104" r="8" fill="#1e3a5f">{isTyping && <animate attributeName="r" values="8;6;8" dur="0.7s" repeatCount="indefinite" />}</circle>
          <circle cx="68" cy="104" r="4" fill="#3b82f6" />
          <circle cx="92" cy="104" r="4" fill="#3b82f6" />
          <circle cx="71" cy="101" r="2.5" fill="white" opacity="0.95" />
          <circle cx="95" cy="101" r="2.5" fill="white" opacity="0.95" />
          {mood === "thinking" && <path d="M81 103 Q92 108 103 103" stroke="#1e3a5f" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
        </>
      )}
      <ellipse cx="80" cy="114" rx="4" ry="3" fill="#fdba74" />
      {mood === "happy" && <path d="M66 122 Q80 134 94 122" stroke="#ef4444" strokeWidth="3" fill="#fca5a5" strokeLinecap="round" />}
      {mood === "thinking" && <path d="M68 124 Q80 121 92 124" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mood === "idle" && <path d="M68 124 Q80 130 92 124" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      <ellipse cx="54" cy="118" rx="11" ry="7" fill="#f87171" opacity={mood === "happy" ? 0.5 : 0.22} />
      <ellipse cx="106" cy="118" rx="11" ry="7" fill="#f87171" opacity={mood === "happy" ? 0.5 : 0.22} />
      {mood === "thinking" && (
        <>
          <circle cx="118" cy="88" r="4.5" fill="#fbbf24" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.75s" repeatCount="indefinite" /></circle>
          <circle cx="128" cy="76" r="3.5" fill="#fbbf24" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="0.75s" begin="0.2s" repeatCount="indefinite" /></circle>
          <circle cx="136" cy="66" r="2.5" fill="#fbbf24" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.75s" begin="0.4s" repeatCount="indefinite" /></circle>
        </>
      )}
      <rect x="68" y="135" width="24" height="12" rx="6" fill="#fdba74" />
      <rect x="30" y="145" width="100" height="56" rx="20" fill="#1d4ed8" />
      <rect x="30" y="164" width="100" height="7" rx="3" fill="#fde047" opacity="0.92" />
      <rect x="30" y="180" width="100" height="7" rx="3" fill="#fde047" opacity="0.92" />
      <rect x="77" y="145" width="6" height="48" rx="3" fill="#1e40af" opacity="0.5" />
      <rect x="73" y="154" width="14" height="7" rx="3.5" fill="#93c5fd" />
      <path d="M44 178 Q47 164 54 169 Q51 157 59 152 Q57 164 62 162 Q59 174 52 179 Z" fill="#fb923c">{isTyping && <animate attributeName="opacity" values="1;0.4;1" dur="0.4s" repeatCount="indefinite" />}</path>
      <path d="M48 178 Q50 168 55 172 Q53 162 59 158 Q58 168 62 166 Q60 175 54 179 Z" fill="#fde047">{isTyping && <animate attributeName="opacity" values="1;0.4;1" dur="0.4s" begin="0.1s" repeatCount="indefinite" />}</path>
      <rect x="8" y="147" width="24" height="44" rx="12" fill="#1d4ed8" />
      <rect x="8" y="164" width="24" height="7" rx="3" fill="#fde047" opacity="0.9" />
      <ellipse cx="20" cy="196" rx="12" ry="10" fill="#fdba74" />
      <rect x="128" y="147" width="24" height="44" rx="12" fill="#1d4ed8" />
      <rect x="128" y="164" width="24" height="7" rx="3" fill="#fde047" opacity="0.9" />
      <ellipse cx="140" cy="196" rx="12" ry="10" fill="#fdba74" />
    </svg>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", marginBottom:"10px", gap:"6px", alignItems:"flex-end" }}>
      {!isUser && (
        <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🧑‍🚒</div>
      )}
      <div style={{
        maxWidth:"85%", padding:"9px 12px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(30,41,59,0.95)",
        color: isUser ? "#fff" : "#e2e8f0",
        fontSize:"13px", lineHeight:"1.6",
        boxShadow: isUser ? "0 3px 12px rgba(99,102,241,0.3)" : "0 3px 12px rgba(0,0,0,0.3)",
        border: isUser ? "none" : "1px solid rgba(99,102,241,0.2)",
        wordBreak:"keep-all", overflowWrap:"break-word",
      }}>
        {isUser ? (
          <span style={{whiteSpace:"pre-wrap"}}>{msg.content}</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({children}) => <p style={{margin:"0 0 4px",lineHeight:"1.6"}}>{children}</p>,
              h1: ({children}) => <p style={{margin:"6px 0 3px",fontWeight:700,fontSize:"14px",color:"#c7d2fe"}}>{children}</p>,
              h2: ({children}) => <p style={{margin:"6px 0 3px",fontWeight:700,fontSize:"13px",color:"#c7d2fe"}}>{children}</p>,
              h3: ({children}) => <p style={{margin:"4px 0 2px",fontWeight:700,fontSize:"13px",color:"#a5b4fc"}}>{children}</p>,
              ul: ({children}) => <ul style={{margin:"2px 0 4px",paddingLeft:"14px"}}>{children}</ul>,
              ol: ({children}) => <ol style={{margin:"2px 0 4px",paddingLeft:"14px"}}>{children}</ol>,
              li: ({children}) => <li style={{margin:"1px 0",lineHeight:"1.6"}}>{children}</li>,
              strong: ({children}) => <strong style={{color:"#c7d2fe",fontWeight:700}}>{children}</strong>,
              em: ({children}) => <em style={{color:"#a5b4fc"}}>{children}</em>,
              code: ({children}) => <code style={{background:"rgba(99,102,241,0.2)",padding:"1px 4px",borderRadius:"3px",fontSize:"11px",color:"#c7d2fe"}}>{children}</code>,
              hr: () => <hr style={{border:"none",borderTop:"1px solid rgba(99,102,241,0.2)",margin:"4px 0"}} />,
              table: ({children}) => (
                <div style={{overflowX:"auto",margin:"6px 0",width:"100%"}}>
                  <table style={{borderCollapse:"collapse",width:"100%",fontSize:"11px",border:"1px solid rgba(99,102,241,0.4)",tableLayout:"fixed"}}>{children}</table>
                </div>
              ),
              thead: ({children}) => <thead style={{background:"rgba(99,102,241,0.3)"}}>{children}</thead>,
              tbody: ({children}) => <tbody>{children}</tbody>,
              tr: ({children}) => <tr style={{borderBottom:"1px solid rgba(99,102,241,0.2)"}}>{children}</tr>,
              th: ({children}) => <th style={{padding:"4px 6px",textAlign:"left",fontWeight:700,color:"#c7d2fe",border:"1px solid rgba(99,102,241,0.35)",wordBreak:"break-all",overflowWrap:"break-word",whiteSpace:"normal",lineHeight:"1.4",overflow:"hidden"}}>{children}</th>,
              td: ({children}) => <td style={{padding:"4px 6px",color:"#e2e8f0",border:"1px solid rgba(99,102,241,0.2)",verticalAlign:"top",wordBreak:"break-all",overflowWrap:"break-word",whiteSpace:"normal",lineHeight:"1.4",overflow:"hidden"}}>{children}</td>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
      {isUser && (
        <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#f43f5e,#fb923c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>👤</div>
      )}
    </div>
  );
}

export default function DeptQnABot() {
  const [sheetUrl] = useState(CONFIG.SHEET_CSV_URL);
  const [sheetData, setSheetData] = useState(null);
  const [messages, setMessages] = useState([
    { role:"assistant", content:`안녕하세요! 저는 ${CONFIG.DEPT_NAME} AI 도우미 ${CONFIG.BOT_NAME}입니다 🔥\n궁금한 점을 무엇이든 물어보세요!` },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState("idle");
  const [logStatus, setLogStatus] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);
  useEffect(() => { loadSheet(); }, []);

  async function loadSheet() {
    try {
      const res = await fetch(sheetUrl);
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.trim().split("\n");
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const rows = lines.slice(1).map((line) => {
        const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
        const row = {};
        headers.forEach((h, i) => { row[h] = (cols[i] || "").trim().replace(/^"|"$/g, ""); });
        return row;
      });
      setSheetData(rows);
    } catch {}
  }

  async function saveLog(question, answer) {
    if (!CONFIG.LOG_SCRIPT_URL.includes("script.google.com")) return;
    setLogStatus("saving");
    try {
      await fetch(CONFIG.LOG_SCRIPT_URL, { method:"POST", mode:"no-cors", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ question, answer }) });
      setLogStatus("saved");
    } catch { setLogStatus("error"); }
    finally { setTimeout(() => setLogStatus(""), 3000); }
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role:"user", content:userMsg }]);
    setIsLoading(true);
    setMood("thinking");

    const sheetContext = sheetData
      ? `\n\n## 학과 공식 정보 (Google Sheets 데이터)\n${JSON.stringify(sheetData, null, 2)}`
      : "\n\n(Google Sheets 데이터 미연결. 일반 지식으로 답변합니다.)";

    const systemPrompt = `당신은 혜전대학교 소방안전관리과의 친절하고 유능한 AI 도우미 ${CONFIG.BOT_NAME}입니다.
학생, 학부모, 수험생의 질문에 정확하고 친근하게 답변해주세요.

## 답변 시 데이터 우선순위
1순위. 아래 Google Sheets 데이터 (가장 정확한 공식 정보)
2순위. 혜전대학교 소방안전관리과 공식 정보
3순위. 일반적인 소방안전관리 분야 지식

출처가 불분명하거나 확인되지 않은 내용은 "정확한 내용은 학과장(010-5195-3543)에게 문의해 주세요."라고 안내하세요.

## 답변 형식
- 비교, 목록, 일정, 자격증, 교육과정 등 나열 가능한 정보는 반드시 마크다운 표(table)로 제공하세요.
- 표로 표현하기 어려운 경우에만 글머리 기호나 문장으로 답변하세요.
- 답변은 한국어로, 친근하고 전문적인 톤으로 작성하세요. 이모지를 적절히 사용해도 좋습니다.${sheetContext}`;

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1000, system:systemPrompt,
          messages:[
            ...messages.filter((m) => m.role !== "system").map((m) => ({ role:m.role, content:m.content })),
            { role:"user", content:userMsg },
          ],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "죄송해요, 응답을 받지 못했습니다.";
      setMessages((prev) => [...prev, { role:"assistant", content:reply }]);
      setMood("happy");
      setTimeout(() => setMood("idle"), 2000);
      saveLog(userMsg, reply);
    } catch {
      setMessages((prev) => [...prev, { role:"assistant", content:"⚠️ 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
      setMood("idle");
    } finally { setIsLoading(false); }
  }

  return (
    <div style={{ minHeight:"100dvh", height:"100dvh", background:"linear-gradient(135deg,#020617 0%,#0f172a 50%,#1e1b4b 100%)", fontFamily:"'Pretendard','Noto Sans KR',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", padding:"0" }}>
      <style>{`
        @keyframes bobbing { from{transform:translateY(0)} to{transform:translateY(-6px)} }
        @keyframes idle { from{transform:translateY(0) rotate(-1deg)} to{transform:translateY(-3px) rotate(1deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.4);border-radius:2px }
        input:focus { outline:none; }
      `}</style>

      {/* ── 상단 헤더 (캐릭터 + 제목 가로 배치) ── */}
      <div style={{ width:"100%", maxWidth:"100%", display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px 10px", borderBottom:"1px solid rgba(99,102,241,0.15)" }}>
        <RobotMascot isTyping={isLoading} mood={mood} />
        <div>
          <div style={{ fontSize:"18px", fontWeight:800, color:"#f8fafc", letterSpacing:"-0.02em", lineHeight:1.2 }}>{CONFIG.DEPT_NAME}</div>
          <div style={{ fontSize:"12px", color:"#6366f1", fontWeight:600, marginTop:"3px" }}>{CONFIG.BOT_NAME}</div>
          {logStatus && (
            <div style={{ fontSize:"10px", marginTop:"4px",
              color: logStatus==="saved"?"#4ade80":logStatus==="saving"?"#fbbf24":"#f87171" }}>
              {logStatus==="saving"?"저장 중...":logStatus==="saved"?"✓ 저장됨":"저장 실패"}
            </div>
          )}
        </div>
      </div>

      {/* ── 채팅 메시지 영역 ── */}
      <div style={{ width:"100%", maxWidth:"100%", flex:1, overflowY:"auto", padding:"14px 12px", display:"flex", flexDirection:"column", minHeight:0, height:"calc(100dvh - 170px)" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ animation:"fadeIn 0.3s ease" }}>
            <ChatBubble msg={msg} />
          </div>
        ))}
        {isLoading && (
          <div style={{ display:"flex", gap:"6px", alignItems:"flex-end", marginBottom:"10px" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
            <div style={{ padding:"10px 14px", borderRadius:"16px 16px 16px 4px", background:"rgba(30,41,59,0.95)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", gap:"4px", alignItems:"center" }}>
              {[0,0.2,0.4].map((d,i) => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1", animation:`pulse 1s ${d}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── 예시 질문 버튼 ── */}
      {(
        <div style={{ width:"100%", maxWidth:"100%", padding:"6px 12px", display:"flex", flexWrap:"wrap", gap:"6px" }}>
          {["입학 전형은?","졸업 후 진로는?","교육과정 알려줘","장학금 제도는?"].map((q) => (
            <button key={q} onClick={() => setInput(q)}
              style={{ padding:"5px 12px", borderRadius:"999px", border:"1px solid rgba(99,102,241,0.35)", background:"rgba(99,102,241,0.1)", color:"#a5b4fc", fontSize:"12px", cursor:"pointer" }}
              onMouseEnter={(e) => (e.target.style.background="rgba(99,102,241,0.25)")}
              onMouseLeave={(e) => (e.target.style.background="rgba(99,102,241,0.1)")}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── 입력창 ── */}
      <div style={{ width:"100%", maxWidth:"100%", padding:"8px 12px 14px", borderTop:"1px solid rgba(99,102,241,0.15)", display:"flex", gap:"8px", alignItems:"center", background:"rgba(10,15,30,0.95)" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key==="Enter" && !e.shiftKey && sendMessage()}
          placeholder="질문하세요..." disabled={isLoading}
          style={{ flex:1, minWidth:0, padding:"11px 14px", borderRadius:"22px", border:"1px solid rgba(99,102,241,0.35)", background:"rgba(15,23,42,0.9)", color:"#e2e8f0", fontSize:"14px", outline:"none" }}
          onFocus={(e) => (e.target.style.borderColor="rgba(99,102,241,0.7)")}
          onBlur={(e) => (e.target.style.borderColor="rgba(99,102,241,0.35)")} />
        <button onClick={sendMessage} disabled={isLoading||!input.trim()}
          style={{ flexShrink:0, width:44, height:44, borderRadius:"50%", border:"none",
            background:isLoading||!input.trim()?"rgba(99,102,241,0.3)":"linear-gradient(135deg,#6366f1,#8b5cf6)",
            color:"#fff", fontWeight:700, fontSize:"16px", cursor:isLoading||!input.trim()?"not-allowed":"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
          ↑
        </button>
      </div>
    </div>
  );
}
