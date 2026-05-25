export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px", color: "#1A1F36", fontFamily: "Arial, sans-serif", lineHeight: 1.8, background: "#ffffff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>개인정보처리방침</h1>
      <p style={{ color: "#6b7280", marginBottom: 40 }}>최종 업데이트: 2026년 5월 25일</p>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>1. 수집하는 정보</h2>
        <p>Reset Pilot은 다음 정보를 처리합니다:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>사용자가 직접 입력한 오늘의 상황 텍스트</li>
          <li>에너지 수준, 불안 수준, 남은 시간 (숫자/텍스트)</li>
          <li>앱 사용 기록 (기기 내 로컬 저장, 서버 전송 없음)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>2. 정보 사용 방법</h2>
        <p>입력한 정보는 AI 복구 플랜 생성을 위해 OpenAI API로 전송됩니다. 이 데이터는 플랜 생성 후 당사 서버에 저장되지 않습니다.</p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>3. 제3자 서비스</h2>
        <p>Reset Pilot은 AI 응답 생성을 위해 <strong>OpenAI</strong>를 사용합니다. OpenAI의 개인정보처리방침은 <a href="https://openai.com/privacy" style={{ color: "#FF6B35" }}>openai.com/privacy</a>에서 확인할 수 있습니다.</p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>4. 데이터 저장</h2>
        <p>앱 사용 기록(히스토리, 인사이트)은 사용자의 기기에만 저장됩니다. 당사 서버로 전송되거나 저장되지 않습니다. 앱을 삭제하면 모든 데이터가 삭제됩니다.</p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>5. 미성년자</h2>
        <p>Reset Pilot은 9세 이상을 대상으로 합니다. 당사는 9세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.</p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>6. 문의</h2>
        <p>개인정보 처리에 관한 문의사항이 있으시면 아래로 연락해 주세요:</p>
        <p style={{ marginTop: 8 }}>
          이메일: <a href="mailto:dlwjdghks9729@gmail.com" style={{ color: "#FF6B35" }}>dlwjdghks9729@gmail.com</a>
        </p>
      </section>
    </main>
  );
}
