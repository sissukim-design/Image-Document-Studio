import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface ContactViewProps {
  language: string;
  onBack: () => void;
}

interface MessageHistory {
  id: string;
  name: string;
  email: string;
  category: string;
  text: string;
  date: string;
}

export default function ContactView({ language, onBack }: ContactViewProps) {
  const isKo = language === 'ko';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: isKo ? '업무 협합 문의' : 'Partnership Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketHistory, setTicketHistory] = useState<MessageHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert(isKo ? "모든 필드를 작성해주세요." : "Please complete all fields before sending.");
      return;
    }

    setIsSubmitting(true);

    // Simulate safe local storage and network latency
    setTimeout(() => {
      const newTicket: MessageHistory = {
        id: Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: formData.name,
        email: formData.email,
        category: formData.category,
        text: formData.message,
        date: new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setTicketHistory((prev) => [newTicket, ...prev]);
      setIsSubmitting(false);

      // Trigger spectacular client confetti feedback
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Clear layout state except info
      setFormData({
        name: '',
        email: '',
        category: isKo ? '업무 협합 문의' : 'Partnership Inquiry',
        message: '',
      });

      setActiveTab('history');
    }, 1300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 border border-gray-150/45 dark:border-zinc-850/80 rounded-3xl p-6 sm:p-10 shadow-lg text-left"
      id="contact-viewport-container"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-6 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          id="contact-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isKo ? "작업 스튜디오로 돌아가기" : "Back to Workspace"}</span>
        </button>

        <div className="flex rounded-xl bg-gray-100 dark:bg-zinc-950 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-zinc-850 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300'
            }`}
          >
            {isKo ? "문의 작성" : "Contact Support"}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-zinc-850 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300'
            }`}
          >
            <span>{isKo ? "전송 내역" : "Inbox History"}</span>
            {ticketHistory.length > 0 && (
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/40 text-[9.5px] px-1.5 py-0.5 rounded-md font-mono font-black">
                {ticketHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Contact Info Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">
              {isKo ? "실시간 문의 및 지원" : "Get in Touch"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-normal">
              {isKo
                ? "도구 사용 도중 제안하시고 싶은 추가 기능이나 버그 등 피드백이 있으시다면 언제든 편하게 아래 내역을 전송해주세요."
                : "Have feature proposals, custom integration queries, or client-side feedback? Drop us a prompt."}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/45 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-gray-900 dark:text-zinc-200 block">Email Support</span>
                <a href="mailto:biggridsteam@gmail.com" className="text-gray-500 dark:text-zinc-400 hover:underline">
                  biggridsteam@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/45 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-gray-900 dark:text-zinc-200 block">{isKo ? "업무 지원 운영 시간" : "Operating Hours"}</span>
                <span className="text-gray-500 dark:text-zinc-400 leading-none">
                  {isKo ? "평일 09:00 ~ 18:00 (주말/공휴일 오프라인)" : "Mon-Fri: 09:00 AM - 06:00 PM UTC+9"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-gray-900 dark:text-zinc-200 block">{isKo ? "개발 및 저작권 문의" : "Development & Copyrights"}</span>
                <span className="text-gray-500 dark:text-zinc-400">
                  Biggrids Team
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive form or ticket list with anim mode */}
        <div className="lg:col-span-8 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-gray-150/50 dark:border-zinc-850 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'create' ? (
              <motion.form
                key="create-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
                id="contact-form-node"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                      {isKo ? "이름 (Name) *" : "Your Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder={isKo ? "홍길동" : "e.g. Liam Taylor"}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                      {isKo ? "이메일 주소 (Email) *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="user@example.com"
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                    {isKo ? "문의 유형 (Category)" : "Topic / Category"}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option>{isKo ? "💻 시스템 사용 / 오류 제보" : "💻 General Bug Support"}</option>
                    <option>{isKo ? "🚀 맞춤형 기능 개발 제안" : "🚀 Custom Feature Proposal"}</option>
                    <option>{isKo ? "🤝 기업 라이센스 미팅 문의" : "🤝 Enterprise Licensing"}</option>
                    <option>{isKo ? "🔒 프라이버시 백서 자료 요청" : "🔒 Privacy Policy Whitepaper Requests"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
                    {isKo ? "문의 사양 입력 (Message) *" : "Message details *"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder={isKo ? "문의하실 상세 피드백 내용을 자유롭게 남겨주세요." : "Let us know details of your sandbox requirements."}
                    className="w-full text-xs font-semibold p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-md shadow-blue-500/10 cursor-pointer active:scale-98 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>{isKo ? "전송 통신중..." : "Sending Securely..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isKo ? "문의사항 전송하기" : "Submit Support Ticket"}</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="history-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
                id="contact-tickets-history"
              >
                {ticketHistory.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-bold">{isKo ? "이번 세션에 전송된 문의 내역이 없습니다." : "Your support ticket outbox is empty."}</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                      {isKo ? "상단 탭의 '문의 작성'을 통해 새로운 질의를 안전하게 가상 접수해보세요." : "Write a ticket on the support tab to test the system integration."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold leading-relaxed">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{isKo ? "✓ 안전하게 접수되었습니다! 전송 로그가 브라우저에 임시 기록되었습니다." : "✓ Ticket safely dispatched! Current logs are stored temporarily in this active session."}</span>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-1">
                      {ticketHistory.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-left">
                          <div className="flex items-center justify-between text-[10px] leading-none">
                            <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black">
                              TICKET #{item.id}
                            </span>
                            <span className="text-gray-400 font-medium">{item.date}</span>
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                              {item.name} <span className="text-gray-400 text-[10.5px] font-normal">({item.email})</span>
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-mono font-bold leading-normal">
                              {isKo ? "유형:" : "Topic:"} {item.category}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-850 font-medium">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
