import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { useApp, DEFAULT_LOGO } from './AppContext';
import { translations } from './i18n';
import { hapticFeedback } from './haptics';
import {
  ArrowLeft,
  Download,
  Check,
  QrCode,
  Smartphone,
  Globe,
  Info,
  Users,
  AtSign,
  User,
  ShieldCheck,
  Calendar,
  Mail,
  Loader2,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface MemberIdCardViewProps {
  onBack?: () => void;
}

export const MemberIdCardView: React.FC<MemberIdCardViewProps> = ({ onBack }) => {
  const { profile, user, language, setActiveTab, withdrawRequests, appLogo } = useApp();
  const t = translations[language];
  const effectiveAppLogo = appLogo || DEFAULT_LOGO;

  const [copied, setCopied] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Check if user has completed or approved withdrawal
  const hasWithdrawn = Boolean(
    Number(profile?.total_withdrawn) > 0 ||
    (withdrawRequests && withdrawRequests.some((w) => w.status === 'approved'))
  );

  // User Profile Data
  const fullName = profile?.displayName || profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Member User';
  const username = profile?.username || user?.displayName?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0] || 'member';
  const usernameHandle = `@${username}`;

  // Format Member ID like MF-2026-XXXXXX
  const memberId = useMemo(() => {
    const rawUid = profile?.uid || '8A72K9';
    const cleanUid = rawUid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
    return `MF-2026-${cleanUid.padEnd(6, 'X')}`;
  }, [profile?.uid]);

  // Formatted join date (e.g. 17 August 2026)
  const joinDateFormatted = useMemo(() => {
    if (!profile?.createdAt) return '17 August 2026';
    const d = new Date(profile.createdAt);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }, [profile?.createdAt]);

  // Public Verification URL (Real live URL)
  const hostDomain = typeof window !== 'undefined' && window.location.host && !window.location.host.includes('localhost')
    ? window.location.host
    : 'mailfactory.top';

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/#verify/${profile?.uid || 'member'}`
    : `https://${hostDomain}/#verify/${profile?.uid || 'member'}`;

  const handleCopyLink = () => {
    hapticFeedback.medium();
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Ultra-crisp, reliable HTML5 Canvas Card Generator (No remote stylesheet or CSS rule reading issues)
  const handleDownloadCard = async () => {
    hapticFeedback.heavy();
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // High-resolution dimensions for crisp printing & sharing
      const width = 1600;
      const height = 1040;
      canvas.width = width;
      canvas.height = height;

      // Load App Logo image for Canvas
      let logoImgElement: HTMLImageElement | null = null;
      if (effectiveAppLogo) {
        try {
          const lImg = new Image();
          lImg.crossOrigin = 'anonymous';
          lImg.src = effectiveAppLogo;
          await new Promise((resolve) => {
            lImg.onload = () => {
              logoImgElement = lImg;
              resolve(null);
            };
            lImg.onerror = () => resolve(null);
            setTimeout(resolve, 800);
          });
        } catch {
          logoImgElement = null;
        }
      }

      // 1. Overall Outer Transparent/Base Canvas
      ctx.clearRect(0, 0, width, height);

      // 2. Card Container (Rounded Rectangle with subtle shadow)
      const cardX = 30;
      const cardY = 30;
      const cardW = width - 60;
      const cardH = height - 60;
      const cardRadius = 40;

      // Draw Main White Card Background
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.fill();
      ctx.restore();

      // Clip inside card for header and footer rounded corners
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.clip();

      // ==========================================
      // 3. TOP HEADER (Navy gradient bar)
      // ==========================================
      const headerH = 240;
      const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
      headerGrad.addColorStop(0, '#020b1e');
      headerGrad.addColorStop(0.5, '#041d3d');
      headerGrad.addColorStop(1, '#072d5c');

      ctx.fillStyle = headerGrad;
      ctx.fillRect(cardX, cardY, cardW, headerH);

      // Cyan accent bottom border under header
      ctx.strokeStyle = '#00b4d8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cardX, cardY + headerH);
      ctx.lineTo(cardX + cardW, cardY + headerH);
      ctx.stroke();

      // Header dot matrix subtle pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let x = cardX; x < cardX + cardW; x += 32) {
        for (let y = cardY; y < cardY + headerH; y += 32) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Draw App Logo Box in Header ---
      const logoBoxX = cardX + 60;
      const logoBoxY = cardY + 50;
      const logoBoxSize = 135;

      ctx.fillStyle = '#081f44';
      ctx.beginPath();
      ctx.roundRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      if (logoImgElement) {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.beginPath();
        ctx.roundRect(logoBoxX + 6, logoBoxY + 6, logoBoxSize - 12, logoBoxSize - 12, 22);
        ctx.clip();
        ctx.drawImage(logoImgElement, logoBoxX + 6, logoBoxY + 6, logoBoxSize - 12, logoBoxSize - 12);
        ctx.restore();
      } else {
        // High quality fallback vector silhouette
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(logoBoxX + 22, logoBoxY + 105);
        ctx.lineTo(logoBoxX + 22, logoBoxY + 65);
        ctx.lineTo(logoBoxX + 50, logoBoxY + 85);
        ctx.lineTo(logoBoxX + 50, logoBoxY + 65);
        ctx.lineTo(logoBoxX + 78, logoBoxY + 85);
        ctx.lineTo(logoBoxX + 78, logoBoxY + 45);
        ctx.lineTo(logoBoxX + 100, logoBoxY + 45);
        ctx.lineTo(logoBoxX + 100, logoBoxY + 105);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(logoBoxX + 30, logoBoxY + 70, 75, 50, 6);
        ctx.fill();
      }

      // --- Header Brand Typography ---
      const brandTextX = logoBoxX + logoBoxSize + 30;
      ctx.font = '900 64px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Mail ', brandTextX, cardY + 100);

      const mailWidth = ctx.measureText('Mail ').width;
      ctx.fillStyle = '#fcd34d'; // Amber/Gold branding
      ctx.fillText('Factory', brandTextX + mailWidth, cardY + 100);

      // Slogan text: ★ TRUSTED • FAST • OFFICIAL ★
      ctx.font = '800 20px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.letterSpacing = '4px';
      ctx.fillText('★ TRUSTED  •  FAST  •  OFFICIAL ★', brandTextX, cardY + 160);
      ctx.letterSpacing = '0px';

      // --- Header Right Official Member Badge ---
      const badgeX = cardX + cardW - 200;
      const badgeY = cardY + 45;
      const badgeW = 140;
      const badgeH = 150;

      // Badge Shield Icon Box
      const shieldGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
      shieldGrad.addColorStop(0, '#00b4d8');
      shieldGrad.addColorStop(1, '#0284c7');

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.roundRect(badgeX + 30, badgeY, 80, 95, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Shield Check Icon drawing
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(badgeX + 54, badgeY + 46);
      ctx.lineTo(badgeX + 66, badgeY + 58);
      ctx.lineTo(badgeX + 86, badgeY + 36);
      ctx.stroke();

      // Badge Text under shield
      ctx.font = '900 18px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(hasWithdrawn ? 'VERIFIED' : 'OFFICIAL', badgeX + 70, badgeY + 118);
      ctx.fillText('MEMBER', badgeX + 70, badgeY + 140);

      // ==========================================
      // 4. CARD BODY (3 COLUMNS: Photo, Info, QR)
      // ==========================================
      const bodyTop = cardY + headerH;
      const bodyBottom = cardY + cardH - 80;

      // ----- LEFT COLUMN: PHOTO & ID & SIGNATURE -----
      const leftColCenter = cardX + 240;
      const avatarCenterY = bodyTop + 160;
      const avatarRadius = 115;

      // Outer Cyan Circular Ring
      ctx.beginPath();
      ctx.arc(leftColCenter, avatarCenterY, avatarRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();

      // Inner White Ring
      ctx.beginPath();
      ctx.arc(leftColCenter, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Avatar circle (Try image or initial)
      let photoDrawn = false;
      if (profile?.photoURL) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = profile.photoURL;
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(leftColCenter, avatarCenterY, avatarRadius - 4, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(
                img,
                leftColCenter - avatarRadius,
                avatarCenterY - avatarRadius,
                avatarRadius * 2,
                avatarRadius * 2
              );
              ctx.restore();
              photoDrawn = true;
              resolve(null);
            };
            img.onerror = () => resolve(null);
            setTimeout(resolve, 800); // 800ms safety timeout
          });
        } catch {
          photoDrawn = false;
        }
      }

      if (!photoDrawn) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(leftColCenter, avatarCenterY, avatarRadius - 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0c3260';
        ctx.fill();
        ctx.font = '900 80px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fullName.charAt(0).toUpperCase(), leftColCenter, avatarCenterY);
        ctx.restore();
      }

      // Member ID Dark Blue Badge
      const memberIdBoxW = 280;
      const memberIdBoxH = 75;
      const memberIdBoxX = leftColCenter - memberIdBoxW / 2;
      const memberIdBoxY = avatarCenterY + avatarRadius + 30;

      ctx.fillStyle = '#041d3d';
      ctx.beginPath();
      ctx.roundRect(memberIdBoxX, memberIdBoxY, memberIdBoxW, memberIdBoxH, 20);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '800 16px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('MEMBER ID', leftColCenter, memberIdBoxY + 12);

      ctx.font = '900 26px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(memberId, leftColCenter, memberIdBoxY + 38);

      // Authorized Signature
      const sigY = memberIdBoxY + memberIdBoxH + 40;
      ctx.font = 'italic 36px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText('Mail Factory', leftColCenter, sigY);

      // Signature line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftColCenter - 100, sigY + 12);
      ctx.lineTo(leftColCenter + 100, sigY + 12);
      ctx.stroke();

      ctx.font = '700 14px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Authorized Signature', leftColCenter, sigY + 30);

      // ----- MIDDLE COLUMN: USER DATA LIST -----
      const midColX = cardX + 460;
      let curRowY = bodyTop + 90;
      const rowGap = 135;

      const drawDataRow = (
        label: string,
        val: string,
        iconType: 'user' | 'users' | 'cal' | 'shield',
        badgeContent?: { text: string; bg: string; color: string },
        subNote?: { text: string; color: string }
      ) => {
        // Icon Circle
        ctx.fillStyle = '#0c3260';
        ctx.beginPath();
        ctx.arc(midColX + 25, curRowY + 25, 25, 0, Math.PI * 2);
        ctx.fill();

        // Icon representation inside circle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (iconType === 'user') ctx.fillText('👤', midColX + 25, curRowY + 25);
        else if (iconType === 'users') ctx.fillText('👥', midColX + 25, curRowY + 25);
        else if (iconType === 'cal') ctx.fillText('📅', midColX + 25, curRowY + 25);
        else if (iconType === 'shield') ctx.fillText('🛡️', midColX + 25, curRowY + 25);

        // Label
        ctx.font = '600 18px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, midColX + 68, curRowY);

        // Value or Badges
        if (badgeContent) {
          // Draw Custom Badge Box
          ctx.font = '900 20px sans-serif';
          const badgeTextW = ctx.measureText(badgeContent.text).width;
          const badgeBoxW = badgeTextW + 36;
          const badgeBoxH = 38;
          const badgeBoxX = midColX + 68;
          const badgeBoxY = curRowY + 26;

          ctx.fillStyle = badgeContent.bg;
          ctx.beginPath();
          ctx.roundRect(badgeBoxX, badgeBoxY, badgeBoxW, badgeBoxH, 10);
          ctx.fill();

          ctx.fillStyle = badgeContent.color;
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeContent.text, badgeBoxX + 18, badgeBoxY + badgeBoxH / 2);

          if (subNote) {
            ctx.font = 'bold 15px sans-serif';
            ctx.fillStyle = subNote.color;
            ctx.textBaseline = 'top';
            ctx.fillText(subNote.text, badgeBoxX, badgeBoxY + badgeBoxH + 6);
          }
        } else {
          ctx.font = '900 28px sans-serif';
          ctx.fillStyle = '#0f172a';
          ctx.textBaseline = 'top';
          ctx.fillText(val, midColX + 68, curRowY + 26);
        }

        // Dashed horizontal divider
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(midColX, curRowY + 85);
        ctx.lineTo(midColX + 540, curRowY + 85);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        curRowY += rowGap;
      };

      // 1. Full Name
      drawDataRow('Full Name', fullName, 'user');

      // 2. Member Type
      if (hasWithdrawn) {
        drawDataRow(
          'Member Type',
          '',
          'users',
          { text: '🛡️ Verified Member', bg: '#10b981', color: '#ffffff' }
        );
      } else {
        drawDataRow(
          'Member Type',
          '',
          'users',
          { text: '👤 General Member', bg: '#dcfce7', color: '#15803d' }
        );
      }

      // 3. Join Date
      drawDataRow('Join Date', joinDateFormatted, 'cal');

      // 4. Account Status
      drawDataRow('Account Status', '', 'shield', {
        text: '✓ Active',
        bg: '#dcfce7',
        color: '#15803d',
      });

      // ----- RIGHT COLUMN: QR CODE BOX -----
      const rightColX = cardX + cardW - 320;
      const qrBoxW = 260;
      const qrBoxH = 340;
      const qrBoxY = bodyTop + 140;

      // QR Outer Rounded Border
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(rightColX, qrBoxY, qrBoxW, qrBoxH, 36);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Render QR Code SVG to image onto canvas
      try {
        const qrSvgElement = document.querySelector('#card-qr-svg');
        if (qrSvgElement) {
          const svgData = new XMLSerializer().serializeToString(qrSvgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const blobURL = window.URL.createObjectURL(svgBlob);

          const qrImg = new Image();
          await new Promise((res) => {
            qrImg.onload = () => {
              ctx.drawImage(qrImg, rightColX + 30, qrBoxY + 30, 200, 200);
              window.URL.revokeObjectURL(blobURL);
              res(null);
            };
            qrImg.onerror = () => res(null);
            qrImg.src = blobURL;
            setTimeout(res, 500);
          });
        }
      } catch {
        // Fallback placeholder box
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rightColX + 30, qrBoxY + 30, 200, 200);
      }

      // QR Center Logo Badge
      const qrCenterX = rightColX + qrBoxW / 2;
      const qrCenterY = qrBoxY + 130;
      const qrCenterRadius = 24;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(qrCenterX, qrCenterY, qrCenterRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      if (logoImgElement) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(qrCenterX, qrCenterY, qrCenterRadius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          logoImgElement,
          qrCenterX - (qrCenterRadius - 2),
          qrCenterY - (qrCenterRadius - 2),
          (qrCenterRadius - 2) * 2,
          (qrCenterRadius - 2) * 2
        );
        ctx.restore();
      } else {
        ctx.fillStyle = '#00b4d8';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✉', qrCenterX, qrCenterY);
      }

      // Bottom Dark Navy Box of QR
      const qrFooterH = 80;
      ctx.fillStyle = '#041d3d';
      ctx.beginPath();
      ctx.roundRect(rightColX, qrBoxY + qrBoxH - qrFooterH, qrBoxW, qrFooterH, [0, 0, 32, 32]);
      ctx.fill();

      ctx.font = '800 18px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📱 Scan to view', qrCenterX, qrBoxY + qrBoxH - 50);
      ctx.fillText('my profile', qrCenterX, qrBoxY + qrBoxH - 26);

      // ==========================================
      // 5. BOTTOM FOOTER BAR
      // ==========================================
      const footerH = 80;
      const footerY = cardY + cardH - footerH;

      ctx.fillStyle = '#020b1e';
      ctx.fillRect(cardX, footerY, cardW, footerH);

      ctx.strokeStyle = 'rgba(0, 180, 216, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX, footerY);
      ctx.lineTo(cardX + cardW, footerY);
      ctx.stroke();

      // Left: Globe & URL
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`🌐  ${hostDomain}/verify`, cardX + 60, footerY + footerH / 2);

      // Right: Security Shield & text
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'right';
      ctx.fillText('🛡️  Trusted • Secure • Verified', cardX + cardW - 60, footerY + footerH / 2);

      ctx.restore(); // Restore clip

      // ==========================================
      // 6. Trigger Direct Instant Download
      // ==========================================
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Mail_Factory_Member_Card_${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      {/* Hidden SVG element specifically used for QR rasterization */}
      <div style={{ display: 'none' }}>
        <QRCode
          id="card-qr-svg"
          size={256}
          value={verificationUrl}
          viewBox="0 0 256 256"
          fgColor="#020b1e"
          bgColor="#ffffff"
        />
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            hapticFeedback.light();
            if (onBack) onBack();
            else setActiveTab('profile');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <span>Official Member ID Card</span>
        </div>
      </div>

      {/* Main Action Bar (Download, Verify, Copy Link) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Download Card PNG */}
        <button
          onClick={handleDownloadCard}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:from-[#0096c7] hover:to-[#0369a1] text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating HD Card...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download ID Card (HD PNG)</span>
            </>
          )}
        </button>

        {/* Copy Verification Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-extrabold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Verification Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600" />
              <span>Copy Verification Link</span>
            </>
          )}
        </button>

        {/* Live Verification Modal */}
        <button
          onClick={() => {
            hapticFeedback.light();
            setShowVerifyModal(true);
          }}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span>Verify Certificate</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXACT ID CARD REPLICA CONTAINER (100% RESPONSIVE ON MOBILE & DESKTOP) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[820px] mx-auto py-2">
        <div
          id="member-id-card"
          className="w-full bg-white rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl border border-slate-200/90 text-slate-900 relative select-none transition-all"
        >
          {/* ================= TOP HEADER BAR ================= */}
          <div className="relative bg-gradient-to-r from-[#020b1e] via-[#041d3d] to-[#072d5c] text-white px-4 py-4 sm:px-8 sm:py-5 flex items-center justify-between overflow-hidden border-b-2 border-[#00b4d8]/40">
            {/* Background Wave & Dot Matrix Design */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-10 pointer-events-none" />
            <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-[#00b4d8]/20 to-transparent pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-[#00b4d8]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Left: Brand Logo & Typography */}
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              {/* Mail Factory Official Logo Box */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#0c2a52] to-[#04142b] rounded-2xl border-2 border-amber-300/60 shadow-md flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src={effectiveAppLogo}
                    alt="Mail Factory"
                    className="w-full h-full object-cover rounded-xl"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              {/* Title & Slogan */}
              <div>
                <div className="flex items-center text-2xl sm:text-3xl font-black tracking-tight leading-none">
                  <span className="text-white">Mail</span>
                  <span className="text-amber-300 ml-1.5 sm:ml-2">Factory</span>
                </div>
                <div className="text-[9px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.25em] text-slate-200 mt-1 uppercase flex items-center gap-1.5 sm:gap-2">
                  <span className="text-amber-300">★</span>
                  <span>TRUSTED</span>
                  <span className="text-amber-300">•</span>
                  <span>FAST</span>
                  <span className="text-amber-300">•</span>
                  <span>OFFICIAL</span>
                  <span className="text-amber-300">★</span>
                </div>
              </div>
            </div>

            {/* Right: Official Member Badge with Shield */}
            <div className="relative z-10 flex flex-col items-center shrink-0">
              <div className="w-10 h-12 sm:w-12 sm:h-14 bg-gradient-to-b from-[#00b4d8] to-[#0284c7] rounded-xl flex flex-col items-center justify-center p-1 sm:p-1.5 shadow-lg border-2 border-white/30">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-[8px] sm:text-[10px] font-black tracking-wider text-white uppercase mt-1 drop-shadow-xs text-center whitespace-nowrap">
                {hasWithdrawn ? 'VERIFIED MEMBER' : 'GENERAL MEMBER'}
              </span>
            </div>
          </div>

          {/* ================= CARD BODY (3 COLUMNS / STACK ON MOBILE) ================= */}
          <div className="px-5 py-6 sm:px-8 sm:py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-[#ffffff]">
            {/* ----------------- 1. LEFT COLUMN: PHOTO & SIGNATURE ----------------- */}
            <div className="sm:col-span-4 flex flex-col items-center text-center space-y-3.5 sm:space-y-4">
              {/* Circular Avatar with Thick Blue Border Ring */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-white border-[4px] sm:border-[5px] border-[#0284c7] shadow-xl overflow-hidden flex items-center justify-center">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={fullName}
                      className="w-full h-full rounded-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0c3260] to-[#03152d] flex items-center justify-center text-white text-4xl font-black">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Dark Blue Member ID Box */}
              <div className="w-full max-w-[220px] bg-[#041d3d] text-white py-2 px-3 rounded-2xl shadow-md border border-[#0284c7]/30 text-center">
                <span className="text-[9px] font-bold tracking-[0.2em] text-slate-300 block uppercase">
                  MEMBER ID
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-[#38bdf8] tracking-wider block mt-0.5">
                  {memberId}
                </span>
              </div>

              {/* Authorized Signature */}
              <div className="pt-0.5 flex flex-col items-center">
                <span
                  className="text-2xl text-slate-800 select-none"
                  style={{
                    fontFamily: '"Brush Script MT", "Caveat", "Dancing Script", cursive',
                    letterSpacing: '1px',
                  }}
                >
                  Mail Factory
                </span>
                <div className="w-32 h-[1px] bg-slate-300 my-0.5" />
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                  Authorized Signature
                </span>
              </div>
            </div>

            {/* ----------------- 2. MIDDLE COLUMN: USER DATA LIST ----------------- */}
            <div className="sm:col-span-5 space-y-3.5 sm:space-y-4 sm:pl-2">
              {/* Row 1: Full Name */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0c3260] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block leading-none">
                      Full Name
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5 break-words">
                      {fullName}
                    </h3>
                  </div>
                </div>
                <div className="border-b border-dashed border-slate-300 mt-2.5" />
              </div>

              {/* Row 2: Member Type */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0c3260] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Member Type
                      </span>
                      {hasWithdrawn ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#10b981] text-white text-xs font-black shadow-xs">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Member</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#dcfce7] border border-[#86efac] text-[#15803d] text-xs font-black shadow-xs">
                          <User className="w-3.5 h-3.5 text-[#15803d]" />
                          <span>General Member</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-b border-dashed border-slate-300 mt-2.5" />
              </div>

              {/* Row 3: Join Date */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0c3260] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block leading-none">
                      Join Date
                    </span>
                    <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      {joinDateFormatted}
                    </p>
                  </div>
                </div>
                <div className="border-b border-dashed border-slate-300 mt-2.5" />
              </div>

              {/* Row 4: Account Status */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0c3260] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Account Status
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#dcfce7] border border-[#86efac] text-[#15803d] text-xs font-black">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------- 3. RIGHT COLUMN: QR CODE BOX ----------------- */}
            <div className="sm:col-span-3 flex flex-col items-center">
              <div className="w-full max-w-[170px] sm:max-w-[175px] rounded-3xl border-2 border-[#0284c7] overflow-hidden shadow-lg bg-white flex flex-col items-center">
                {/* QR Code Graphic Area */}
                <div className="p-3 bg-white relative flex items-center justify-center">
                  <QRCode
                    size={135}
                    value={verificationUrl}
                    viewBox="0 0 256 256"
                    fgColor="#020b1e"
                    bgColor="#ffffff"
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                  {/* Center Overlay Logo */}
                  <div className="absolute w-8 h-8 sm:w-9 sm:h-9 bg-white border-2 border-amber-400 rounded-full flex items-center justify-center shadow-md overflow-hidden p-0.5">
                    <img
                      src={effectiveAppLogo}
                      alt="Mail Factory Logo"
                      className="w-full h-full object-cover rounded-full"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* Bottom Dark Navy Bar of QR Box */}
                <div className="w-full bg-[#041d3d] text-white py-2 px-2 flex items-center justify-center gap-1.5 text-center">
                  <Smartphone className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span className="text-[10px] font-bold leading-tight">
                    Scan to verify <br /> profile
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM FOOTER BAR ================= */}
          <div className="bg-[#020b1e] text-white px-4 py-2.5 sm:px-8 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 border-t border-[#00b4d8]/20">
            {/* Left: Verification URL */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-200">
              <Globe className="w-4 h-4 text-[#00b4d8]" />
              <span className="font-mono text-slate-100">{hostDomain}/verify</span>
            </div>

            {/* Right: Security Assurance */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#00b4d8]" />
              <span>Trusted • Secure • Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules & Instructions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Member ID Card Information</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>👤 General Member</span>
            </p>
            <p className="text-slate-600 mt-1">
              Assigned automatically upon registration until your first successful withdrawal is completed.
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80">
            <p className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span>🛡️ Verified Member</span>
            </p>
            <p className="text-emerald-800 mt-1">
              Activated automatically upon completing at least 1 successful withdrawal payout.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
              onClick={() => setShowVerifyModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Official Member Verification
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mail Factory Central Security Registry
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="font-black text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Member ID:</span>
                  <span className="font-mono font-bold text-indigo-700">{memberId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Member Type:</span>
                  <span
                    className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                      hasWithdrawn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {hasWithdrawn ? 'Verified Member' : 'General Member'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Account Status:</span>
                  <span className="font-black text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Join Date:</span>
                  <span className="font-bold text-slate-700">{joinDateFormatted}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-left text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  This ID card is verified and actively registered on Mail Factory central database.
                </span>
              </div>

              <button
                onClick={() => {
                  hapticFeedback.light();
                  setShowVerifyModal(false);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
