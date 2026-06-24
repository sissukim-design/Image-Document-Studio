import { useState } from "react";
import { Globe, Clipboard, Check, Share2 } from "lucide-react";

interface LocalizedSnsShareProps {
  lang: string;
  fileName?: string;
  fileType?: "image" | "document";
  fileUrl?: string; // Prop for processed file Blob/Object URL
}

const shareTexts: Record<
  string,
  {
    header: string;
    sub: string;
    copied: string;
    copyBtn: string;
    defaultText: string;
    kakaoBtn: string;
    kakaoFallback: string;
    shareSuccess: string;
    shareError: string;
  }
> = {
  ko: {
    header: "🎉 파일 처리 완료! 편리한 도구를 친구들에게 공유해보세요",
    sub: "개인정보 유출 걱정 없이 100% 내 브라우저 안에서 안전하고 초고속으로 작동하는 BigGrids를 소개해보세요.",
    copied: "추천 문구와 홈페이지 링크가 클립보드에 복사되었습니다! 카카오톡이나 단톡방에 붙여넣어 공유하세요. 🔗",
    copyBtn: "🔗 추천 문구 복사하기",
    defaultText: "서버 업로드 없이 100% 브라우저에서 안전하고 빠르게 작동하는 이미지 압축 및 PDF 스튜디오 도구! 완전 무료라 진짜 편리해요 👉",
    kakaoBtn: "💛 카카오톡 / 파일 직접 공유",
    kakaoFallback: "카카오톡 대화방에 바로 붙여넣기 하실 수 있도록 추천 소개글과 링크가 복사되었습니다! 💛",
    shareSuccess: "성공적으로 공유 창을 열었습니다! 🎉",
    shareError: "공유를 시작할 수 없습니다. 대신 클립보드에 복사되었습니다! 🔗",
  },
  en: {
    header: "🎉 Processing completed! Share this safe tool with friends",
    sub: "Help others discover BigGrids - 100% secure in-browser offline-first file compression & PDF editing.",
    copied: "Share link and text copied to clipboard! Share it with your friends. 🔗",
    copyBtn: "🔗 Copy Share Text & Link to Clipboard",
    defaultText: "Awesome 100% offline-first secure image compressor and PDF studio tool! Completely free 👉",
    kakaoBtn: "💛 Share File & Link directly",
    kakaoFallback: "Share text and link copied to clipboard! Paste it to share. 🔗",
    shareSuccess: "Share prompt opened successfully! 🎉",
    shareError: "Could not open share prompt. Copied to clipboard instead! 🔗",
  },
  ja: {
    header: "🎉 処理が完了しました！お気に入りのツールを共有",
    sub: "サーバー送信一切なしで100%ブラウザ内で安全に動作する BigGrids を友達にすすめましょう。",
    copied: "共有リンクと紹介テキスト가コピーされました！LINE等に貼り付けて送信してください。 🔗",
    copyBtn: "🔗 LINE・メッセージ共有用の紹介文をコピー",
    defaultText: "サーバー不要で超安全にブラウザ上で画像圧縮・PDF変換ができる完全無料의便利ツール！ 👉",
    kakaoBtn: "💬 LINE / システムで直接共有",
    kakaoFallback: "LINEやメッセージに貼り付けられるよう、紹介テキストがコピーされました！ 🔗",
    shareSuccess: "共有画面を開きました！ 🎉",
    shareError: "共有を開始できませんでした。代わりにコピーされました。 🔗",
  },
  zh: {
    header: "🎉 处理成功完成！向朋友分享这个实用工具",
    sub: "推荐 BigGrids - 100% 浏览器内本地离线安全处理，确保您的个人数据安全不泄露。",
    copied: "分享链接和推荐语已复制到剪贴板！可直接粘贴至微信或QQ进行分享。 🔗",
    copyBtn: "🔗 复制微信/QQ好友分享推荐语",
    defaultText: "无需上传服务器，直接在浏览器中100%安全快速压缩图片、编辑PDF的免安装完全免费工具 👉",
    kakaoBtn: "🔴 微信/QQ系统直接分享文件",
    kakaoFallback: "分享推荐语和链接已复制到剪贴板！可以直接粘贴发送。 🔗",
    shareSuccess: "已成功打开分享窗口！ 🎉",
    shareError: "无法调用系统分享。已复制推荐语到剪贴板。 🔗",
  },
  es: {
    header: "🎉 ¡Procesamiento exitoso! Compartir herramienta",
    sub: "Recomiende BigGrids: procesamiento de archivos local y 100% seguro sin cargar datos a ningún servidor.",
    copied: "¡Enlace y texto de recomendación copiado al portapapeles! 🔗",
    copyBtn: "🔗 Copiar texto y enlace de recomendación",
    defaultText: "¡Excelente herramienta gratuita de compresión de imágenes y PDF en tu navegador de forma 100% local! 👉",
    kakaoBtn: "🔗 Compartir archivo directamente",
    kakaoFallback: "¡Copiado al portapapeles para compartir! 🔗",
    shareSuccess: "¡Ventana de compartir abierta! 🎉",
    shareError: "Copiado al portapapeles. 🔗",
  },
  fr: {
    header: "🎉 Traité avec succès ! Partager cet outil en ligne",
    sub: "Recommandez BigGrids : traitement de fichiers 100% sécurisé localement dans votre navigateur.",
    copied: "Lien et texte copiés dans le presse-papiers ! Partagez-le avec vos proches. 🔗",
    copyBtn: "🔗 Copier le texte de recommandation et le lien",
    defaultText: "Super outil gratuit de compression d'images et de PDF 100% local et hautement sécurisé ! 👉",
    kakaoBtn: "🔗 Partager le fichier directement",
    kakaoFallback: "Texte copié dans le presse-papiers ! 🔗",
    shareSuccess: "Partage ouvert avec succès ! 🎉",
    shareError: "Copié dans le presse-papiers ! 🔗",
  },
  de: {
    header: "🎉 Erfolgreich verarbeitet! Teilen Sie dieses Tool",
    sub: "Empfehlen Sie BigGrids - 100 % sichere, lokale Dateiverarbeitung direkt im eigenen Browser.",
    copied: "Freigabelink und Text wurden in die Zwischenablage kopiert! 🔗",
    copyBtn: "🔗 Freigabetext und Link kopieren",
    defaultText: "Sicheres Bildkomprimierungs- und PDF-Studio-Tool direkt im Browser! Völlig kostenlos 👉",
    kakaoBtn: "🔗 Datei direkt teilen",
    kakaoFallback: "Freigabelink kopiert! 🔗",
    shareSuccess: "Freigabedialog geöffnet! 🎉",
    shareError: "Kopiert! 🔗",
  },
  vi: {
    header: "🎉 Đã xử lý thành công! Chia sẻ công cụ hữu ích này",
    sub: "Giới thiệu BigGrids - xử lý tệp tin cục bộ bảo mật 100% ngay trên trình duyệt mà không cần tải lên server.",
    copied: "Đã sao chép liên kết và văn bản chia sẻ vào bộ nhớ tạm! 🔗",
    copyBtn: "🔗 Sao chép tin nhắn chia sẻ nhanh",
    defaultText: "Công cụ nén ảnh và chỉnh sửa PDF tuyệt vời hoạt động 100% offline trên trình duyệt! Hoàn toàn miễn phí 👉",
    kakaoBtn: "🔗 Chia sẻ tập tin trực tiếp",
    kakaoFallback: "Đã sao chép tin nhắn chia sẻ nhanh! 🔗",
    shareSuccess: "Đã mở hộp thoại chia sẻ! 🎉",
    shareError: "Đã sao chép vào bộ nhớ tạm! 🔗",
  },
  hi: {
    header: "🎉 सफलतापूर्वक संसाधित! इस शानदार टूल को साझा करें",
    sub: "BigGrids की सिफारिश करें - बिना सर्वर अपलोड के 100% सुरक्षित ब्राउज़र-आधारित फ़ाइल प्रोसेसिंग।",
    copied: "साझाकरण लिंक और पाठ क्लिपबोर्ड पर कॉपी हो गया! 🔗",
    copyBtn: "🔗 साझाकरण पाठ और लिंक कॉपी करें",
    defaultText: "बिना किसी सर्वर अपलोड के सीधे ब्राउज़र में इमेज कंप्रेसर और पीडीएफ स्टूडियो टूल! 100% मुफ्त 👉",
    kakaoBtn: "🔗 फ़ाइल सीधे साझा करें",
    kakaoFallback: "क्लिपबोर्ड पर कॉपी हो गया! 🔗",
    shareSuccess: "साझाकरण संवाद खुला! 🎉",
    shareError: "कॉपी हो गया! 🔗",
  },
  ar: {
    header: "🎉 تم المعالجة بنجاح! شارك هذه الأداة مع أصدقائك",
    sub: "انصح بـ BigGrids - معالجة محلية آمنة 100% داخل المتصفح دون القلق من الخصوصية.",
    copied: "تم نسخ رابط المشاركة والنص إلى الحافظة لسهولة إرساله عبر الواتساب والجروبات! 🔗",
    copyBtn: "🔗 نسخ نص ورابط المشاركة السريعة",
    defaultText: "أداة ضغط الصور وحقيبة ملفات PDF الآمنة تماماً والذكية داخل المتصفح! مجانية 100% 👉",
    kakaoBtn: "🔗 مشاركة الملف مباشرة",
    kakaoFallback: "تم النسخ بنجاح! 🔗",
    shareSuccess: "تم فتح نافذة المشاركة بنجاح! 🎉",
    shareError: "تم نسخ النص للحافظة! 🔗",
  },
  pt: {
    header: "🎉 Processado com sucesso! Compartilhe esta ferramenta",
    sub: "Recomende o BigGrids: processamento de arquivos local 100% seguro direto no seu navegador.",
    copied: "Link e texto de recomendação copiados para a área de transferência! 🔗",
    copyBtn: "🔗 Copiar texto e link de compartilhamento",
    defaultText: "Ótima ferramenta de compressão de imagem e PDF segura e 100% local! Totalmente grátis 👉",
    kakaoBtn: "🔗 Compartilhar arquivo diretamente",
    kakaoFallback: "Copiado para a área de transferência! 🔗",
    shareSuccess: "Compartilhamento aberto! 🎉",
    shareError: "Copiado! 🔗",
  },
  it: {
    header: "🎉 Elaborato con successo! Condividi con amici",
    sub: "Consiglia BigGrids: elaborazione file locale al 100% sicura direttamente nel tuo browser.",
    copied: "Link e testo di condivisione copiati negli appunti! 🔗",
    copyBtn: "🔗 Copia testo e link di condivisione",
    defaultText: "Ottimo strumento di compressione immagini e PDF 100% locale e sicuro! Completamente gratis 👉",
    kakaoBtn: "🔗 Condividi file direttamente",
    kakaoFallback: "Copiato negli appunti! 🔗",
    shareSuccess: "Condivisione aperta! 🎉",
    shareError: "Copiato! 🔗",
  },
  ru: {
    header: "🎉 Успешно обработано! Расскажите друзьям о сервисе",
    sub: "Рекомендуйте BigGrids - 100% безопасная локальная обработка файлов прямо в браузере без риска утечки.",
    copied: "Ссылка и текст для публикации скопированы в буфер обмена! 🔗",
    copyBtn: "🔗 Скопировать текст и ссылку для соцсетей",
    defaultText: "Отличный бесплатный инструмент для сжатия изображений и работы с PDF прямо в браузере! 👉",
    kakaoBtn: "🔗 Поделиться файлом напрямую",
    kakaoFallback: "Скопировано в буфер обмена! 🔗",
    shareSuccess: "Окно поделиться открыто! 🎉",
    shareError: "Скопировано! 🔗",
  },
};

export default function LocalizedSnsShare({
  lang,
  fileName,
  fileType,
  fileUrl,
}: LocalizedSnsShareProps) {
  const [copied, setCopied] = useState(false);
  const [kakaoCopied, setKakaoCopied] = useState(false);
  const activeLang = shareTexts[lang] ? lang : "en";
  const dict = shareTexts[activeLang];

  const appUrl = "https://www.biggrids.com";
  const rawShareText = `${dict.defaultText} ${appUrl}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(rawShareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Handles native file/link sharing which launches the system share sheet (perfect for KakaoTalk)
  const handleNativeShare = async () => {
    try {
      if (fileUrl) {
        // Fetch the local blob file
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        
        // Define clean extension and mime type
        let extension = fileType === "image" ? "png" : "pdf";
        if (fileName && fileName.includes(".")) {
          const parts = fileName.split(".");
          extension = parts[parts.length - 1];
        }
        
        const cleanName = fileName || `biggrids_file.${extension}`;
        const file = new File([blob], cleanName, { type: blob.type });

        // Check if browser supports file sharing
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: cleanName,
            text: rawShareText,
          });
          alert(dict.shareSuccess);
          return;
        }
      }

      // Fallback: Share link + text
      if (navigator.share) {
        await navigator.share({
          title: "BigGrids",
          text: rawShareText,
          url: appUrl,
        });
        alert(dict.shareSuccess);
      } else {
        throw new Error("Native share API not supported on this device/browser");
      }
    } catch (error) {
      console.warn("Native share failed or not supported, falling back to clipboard copy:", error);
      
      // Fallback: Copy to clipboard and notify with elegant message
      navigator.clipboard.writeText(rawShareText).then(() => {
        setKakaoCopied(true);
        alert(dict.kakaoFallback);
        setTimeout(() => setKakaoCopied(false), 4000);
      });
    }
  };

  // Pre-configured localized and global popular social networks
  const getSnsList = () => {
    const list: Array<{
      name: string;
      color: string;
      hoverColor: string;
      icon: string;
      url: string;
      isPrimary?: boolean;
    }> = [];

    // Localized SNS selection based on language code
    if (activeLang === "ko") {
      // 1. Naver Band
      list.push({
        name: "Naver Band",
        color: "bg-[#06C755]",
        hoverColor: "hover:bg-[#05b04b]",
        icon: "🟢",
        url: `https://band.us/plugin/share?body=${encodeURIComponent(rawShareText)}&route=BigGrids`,
        isPrimary: true,
      });
      // 2. Naver Blog
      list.push({
        name: "Naver Blog",
        color: "bg-[#1EC800]",
        hoverColor: "hover:bg-[#19a500]",
        icon: "N",
        url: `https://share.naver.com/web/shareView?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(dict.defaultText)}`,
        isPrimary: true,
      });
    } else if (activeLang === "ja") {
      // LINE is absolute #1 in Japan
      list.push({
        name: "LINE",
        color: "bg-[#06C755]",
        hoverColor: "hover:bg-[#05b04b]",
        icon: "💬",
        url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(dict.defaultText)}`,
        isPrimary: true,
      });
    } else if (activeLang === "zh") {
      // Weibo
      list.push({
        name: "Weibo (微博)",
        color: "bg-[#DF2029]",
        hoverColor: "hover:bg-[#c21a22]",
        icon: "🔴",
        url: `http://service.weibo.com/share/share.php?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(dict.defaultText)}`,
        isPrimary: true,
      });
    } else if (activeLang === "ru") {
      // VKontakte
      list.push({
        name: "VK (ВКонтакте)",
        color: "bg-[#0077FF]",
        hoverColor: "hover:bg-[#0066dd]",
        icon: "vk",
        url: `https://vk.com/share.php?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(dict.defaultText)}`,
        isPrimary: true,
      });
    }

    // Always append WhatsApp (Very popular globally)
    list.push({
      name: "WhatsApp",
      color: "bg-[#25D366]",
      hoverColor: "hover:bg-[#20ba59]",
      icon: "📞",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(rawShareText)}`,
      isPrimary: activeLang !== "ko" && activeLang !== "ja" && activeLang !== "zh" && activeLang !== "ru",
    });

    // Telegram (Highly popular globally)
    list.push({
      name: "Telegram",
      color: "bg-[#0088cc]",
      hoverColor: "hover:bg-[#0077b3]",
      icon: "✈️",
      url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(dict.defaultText)}`,
      isPrimary: activeLang === "ru" || activeLang === "ar" || activeLang === "vi",
    });

    // Twitter / X (Global)
    list.push({
      name: "Twitter / X",
      color: "bg-[#15181c]",
      hoverColor: "hover:bg-[#000000]",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(dict.defaultText)}&url=${encodeURIComponent(appUrl)}`,
      isPrimary: activeLang === "ja" || activeLang === "en",
    });

    // Facebook (Universal)
    list.push({
      name: "Facebook",
      color: "bg-[#1877F2]",
      hoverColor: "hover:bg-[#166fe5]",
      icon: "f",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`,
    });

    return list;
  };

  const snsList = getSnsList();

  return (
    <div
      className="p-4 bg-gradient-to-br from-indigo-50/40 via-violet-50/30 to-purple-50/20 dark:from-zinc-900/60 dark:via-zinc-900/40 dark:to-zinc-900/20 rounded-2xl border border-indigo-100/50 dark:border-zinc-800 text-left space-y-3 mt-4"
      id="localized-sns-share-widget"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-[13px] font-black text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 leading-tight">
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{dict.header}</span>
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-normal max-w-xl">
            {dict.sub}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1.5 items-stretch sm:items-center">
        {/* KakaoTalk / Direct System Share Button (Yellow Brand Button) */}
        <button
          onClick={handleNativeShare}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer text-[#191919] bg-[#FEE500] hover:bg-[#E6CF00] shadow-sm hover:-translate-y-0.5`}
          id="kakaotalk-native-share-btn"
          title="Share directly via KakaoTalk/System Share"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{dict.kakaoBtn}</span>
        </button>

        {/* Copy recommended statement button */}
        <button
          onClick={handleCopyText}
          className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            copied
              ? "bg-emerald-600 text-white shadow-3xs"
              : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-gray-150 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-3xs hover:bg-indigo-50/20 dark:hover:bg-zinc-750"
          }`}
          id="copy-recommended-sns-text-btn"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{dict.copied.split("!")[0] + "!"}</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5" />
              <span>{dict.copyBtn}</span>
            </>
          )}
        </button>

        {/* Quick share platform link badges */}
        <div className="flex flex-wrap items-center gap-1.5" id="quick-sns-badges-list">
          {snsList.map((sns, index) => (
            <a
              key={index}
              href={sns.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-[11px] font-bold text-white transition-all shadow-3xs hover:-translate-y-0.5 ${
                sns.color
              } ${sns.hoverColor} ${
                sns.isPrimary ? "ring-2 ring-purple-400 dark:ring-purple-500 ring-offset-2 dark:ring-offset-zinc-950 font-black scale-[1.03]" : ""
              }`}
              title={`Share on ${sns.name}`}
            >
              {sns.icon && (
                <span className="font-mono text-xs w-3.5 h-3.5 flex items-center justify-center leading-none shrink-0">
                  {sns.icon}
                </span>
              )}
              <span>{sns.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
