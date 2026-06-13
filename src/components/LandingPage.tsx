import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const configs: Record<string, {title:string;desc:string;tab:string;benefits:string[];steps:string[];color:string}> = {
  'compress-image-for-instagram':{title:'Instagram 이미지 압축',desc:'화질 손상 없이 Instagram 최적화 이미지를 만드세요.',tab:'image',benefits:['Instagram 권장 사이즈 자동 조정','스마트 압축으로 화질 유지','JPG/PNG/WebP 지원'],steps:['이미지 업로드','자동 최적화','다운로드'],color:'from-pink-500 to-purple-600'},
  'convert-png-to-webp':{title:'PNG → WebP 변환',desc:'PNG를 WebP로 변환해 웹 로딩 속도를 개선하세요.',tab:'image',benefits:['평균 30% 용량 절감','최신 브라우저 지원','배치 변환 지원'],steps:['PNG 업로드','WebP 선택','변환 완료'],color:'from-blue-500 to-cyan-500'},
  'compress-pdf-for-email':{title:'이메일용 PDF 압축',desc:'이메일 첨부에 최적화된 크기로 PDF를 압축하세요.',tab:'document',benefits:['이메일 한도 이하 조정','품질 유지','서버 없이 처리'],steps:['PDF 업로드','압축 설정','다운로드'],color:'from-orange-500 to-red-500'},
  'resize-image-free':{title:'이미지 크기 조정',desc:'픽셀 또는 비율로 이미지를 무료로 리사이징하세요.',tab:'image',benefits:['픽셀/퍼센트 조정','비율 유지','가입 불필요'],steps:['이미지 업로드','크기 입력','다운로드'],color:'from-violet-500 to-indigo-600'},
};

interface Props { slug: string; onStart: (tab: string) => void; }

const LandingPage: React.FC<Props> = ({ slug, onStart }) => {
  const c = configs[slug];
  useEffect(() => { if (c) document.title = c.title + ' | 이미지 & 문서 스튜디오'; }, [c]);
  if (!c) return <div className="flex items-center justify-center h-screen"><button onClick={() => onStart('image')} className="text-blue-500">홈으로</button></div>;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`bg-gradient-to-br ${c.color} text-white py-20 px-6`}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{c.title}</h1>
          <p className="text-lg opacity-90 mb-8">{c.desc}</p>
          <button onClick={() => onStart(c.tab)} className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition inline-flex items-center gap-2">지금 시작하기 <ArrowRight size={18}/></button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 dark:text-white">주요 특징</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{c.benefits.map((b,i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3"><CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5"/><p className="text-sm text-gray-700 dark:text-gray-300">{b}</p></div>)}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 dark:text-white">3단계로 완료</h2>
          <div className="flex items-center justify-center gap-6">{c.steps.map((s,i) => <React.Fragment key={i}><div><div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.color} text-white flex items-center justify-center font-bold mx-auto mb-2`}>{i+1}</div><p className="text-sm font-medium dark:text-gray-300">{s}</p></div>{i<2 && <ArrowRight size={16} className="text-gray-300"/>}</React.Fragment>)}</div>
          <button onClick={() => onStart(c.tab)} className={`mt-10 bg-gradient-to-r ${c.color} text-white font-semibold px-10 py-3 rounded-full hover:opacity-90 inline-flex items-center gap-2`}>무료로 시작하기 <ArrowRight size={18}/></button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
