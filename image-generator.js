/**
 * 사주 통합 이미지 생성기 (Saju Image Generator)
 * Canvas API를 사용한 "나의 사주 여정" 시각화
 */

const SajuImageGenerator = (function() {
  // 오행 색상
  const ELEMENT_COLORS = {
    '목': { primary: '#4CAF50', secondary: '#81C784', light: '#E8F5E9' },
    '화': { primary: '#F44336', secondary: '#E57373', light: '#FFEBEE' },
    '토': { primary: '#FFC107', secondary: '#FFD54F', light: '#FFF8E1' },
    '금': { primary: '#9E9E9E', secondary: '#BDBDBD', light: '#F5F5F5' },
    '수': { primary: '#2196F3', secondary: '#64B5F6', light: '#E3F2FD' }
  };

  // 강점/약점 아이콘 (이모지 기반)
  const ICONS = {
    strength: '⭐',
    caution: '⚡',
    career: '💼',
    wealth: '💰',
    relationship: '💝',
    timing: '⏰',
    wood: '🌳',
    fire: '🔥',
    earth: '🏔️',
    metal: '⚔️',
    water: '💧'
  };

  /**
   * 메인 캔버스 이미지 생성
   */
  function generateJourneyImage(saju, interpretation, daeun, options = {}) {
    const width = options.width || 800;
    const height = options.height || 1200;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 배경 그리기
    drawBackground(ctx, width, height, saju.dayMaster.element);

    // 헤더 영역
    drawHeader(ctx, width, saju);

    // 사주 구성표
    drawPillarsSection(ctx, width, saju, 120);

    // 오행 분포 차트
    drawElementChart(ctx, width, saju.elementDistribution, 320);

    // 핵심 키워드
    drawKeywords(ctx, width, interpretation, 520);

    // 대운 타임라인
    if (daeun && daeun.length > 0) {
      drawDaeunTimeline(ctx, width, daeun, saju, 720);
    }

    // 강점/주의점
    drawStrengthsCautions(ctx, width, interpretation, 920);

    // 푸터
    drawFooter(ctx, width, height);

    return canvas;
  }

  function drawBackground(ctx, width, height, element) {
    // 그라데이션 배경
    const colors = ELEMENT_COLORS[element];
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.5, '#FFFFFF');
    gradient.addColorStop(1, colors.light);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 장식 패턴
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = colors.primary;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 100 + 50;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawHeader(ctx, width, saju) {
    // 제목
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 32px "Noto Serif KR", serif';
    ctx.textAlign = 'center';
    ctx.fillText('나의 사주 여정', width / 2, 50);

    // 일간 정보
    const dayMaster = saju.dayMaster;
    ctx.font = '20px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(`${dayMaster.name}${dayMaster.hanja} · ${SajuInterpreter.DAY_MASTER_TRAITS[dayMaster.name].symbol}`, width / 2, 85);
  }

  function drawPillarsSection(ctx, width, saju, startY) {
    const pillars = saju.pillars;
    const pillarWidth = 120;
    const pillarHeight = 160;
    const startX = (width - (pillarWidth * 4 + 30)) / 2;

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('사주팔자 (四柱八字)', width / 2, startY);

    const pillarNames = ['시주', '일주', '월주', '연주'];
    const pillarData = [pillars.hour, pillars.day, pillars.month, pillars.year];

    pillarData.forEach((pillar, index) => {
      const x = startX + index * (pillarWidth + 10);
      const y = startY + 20;

      // 배경 박스
      const element = pillar ? pillar.stem.element : '토';
      const colors = ELEMENT_COLORS[element];

      ctx.fillStyle = colors.light;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;

      roundRect(ctx, x, y, pillarWidth, pillarHeight, 10);
      ctx.fill();
      ctx.stroke();

      // 주 이름
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
      ctx.fillText(pillarNames[index], x + pillarWidth / 2, y + 25);

      if (pillar) {
        // 천간
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 36px "Noto Serif KR", serif';
        ctx.fillText(pillar.stem.hanja, x + pillarWidth / 2, y + 70);

        ctx.font = '14px "Noto Sans KR", sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText(pillar.stem.name, x + pillarWidth / 2, y + 90);

        // 지지
        ctx.fillStyle = ELEMENT_COLORS[pillar.branch.element].primary;
        ctx.font = 'bold 36px "Noto Serif KR", serif';
        ctx.fillText(pillar.branch.hanja, x + pillarWidth / 2, y + 130);

        ctx.font = '14px "Noto Sans KR", sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText(`${pillar.branch.name}(${pillar.branch.animal})`, x + pillarWidth / 2, y + 150);
      } else {
        ctx.fillStyle = '#999999';
        ctx.font = '16px "Noto Sans KR", sans-serif';
        ctx.fillText('시간 미입력', x + pillarWidth / 2, y + 85);
      }
    });
  }

  function drawElementChart(ctx, width, distribution, startY) {
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('오행 분포 (五行分布)', width / 2, startY);

    const elements = ['목', '화', '토', '금', '수'];
    const barWidth = 80;
    const maxBarHeight = 120;
    const startX = (width - (barWidth * 5 + 40)) / 2;
    const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

    elements.forEach((element, index) => {
      const x = startX + index * (barWidth + 10);
      const y = startY + 30;
      const count = distribution[element];
      const barHeight = (count / total) * maxBarHeight;
      const colors = ELEMENT_COLORS[element];

      // 배경 바
      ctx.fillStyle = '#E0E0E0';
      roundRect(ctx, x, y, barWidth, maxBarHeight, 5);
      ctx.fill();

      // 채워진 바
      if (barHeight > 0) {
        ctx.fillStyle = colors.primary;
        roundRect(ctx, x, y + maxBarHeight - barHeight, barWidth, barHeight, 5);
        ctx.fill();
      }

      // 아이콘
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      const elementIcons = { '목': '🌳', '화': '🔥', '토': '🏔️', '금': '⚔️', '수': '💧' };
      ctx.fillText(elementIcons[element], x + barWidth / 2, y + maxBarHeight + 30);

      // 오행 이름
      ctx.fillStyle = '#333333';
      ctx.font = '14px "Noto Sans KR", sans-serif';
      ctx.fillText(`${element}(${count})`, x + barWidth / 2, y + maxBarHeight + 55);
    });
  }

  function drawKeywords(ctx, width, interpretation, startY) {
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('핵심 키워드', width / 2, startY);

    // 키워드 추출
    const dayMaster = interpretation.basic.dayMaster;
    const keywords = [
      { icon: '👤', text: dayMaster.symbol },
      { icon: '💼', text: dayMaster.career[0] },
      { icon: '⭐', text: dayMaster.traits[0].split('경향')[0].trim() }
    ];

    // 추가 키워드
    if (interpretation.career.aptitudes.leadership.level === 'strong') {
      keywords.push({ icon: '👑', text: '리더십' });
    }
    if (interpretation.career.aptitudes.creativity.level === 'strong') {
      keywords.push({ icon: '🎨', text: '창의성' });
    }
    if (interpretation.wealth.accumulation.level === 'strong') {
      keywords.push({ icon: '💰', text: '재물복' });
    }

    const keywordWidth = 150;
    const keywordsPerRow = Math.min(keywords.length, 4);
    const startX = (width - (keywordWidth * keywordsPerRow + 10 * (keywordsPerRow - 1))) / 2;

    keywords.slice(0, 6).forEach((keyword, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const x = startX + col * (keywordWidth + 10);
      const y = startY + 20 + row * 60;

      // 키워드 박스
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, keywordWidth, 50, 25);
      ctx.fill();
      ctx.stroke();

      // 아이콘과 텍스트
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(keyword.icon, x + 15, y + 33);

      ctx.fillStyle = '#333333';
      ctx.font = '14px "Noto Sans KR", sans-serif';
      const maxTextWidth = keywordWidth - 50;
      const truncatedText = truncateText(ctx, keyword.text, maxTextWidth);
      ctx.fillText(truncatedText, x + 45, y + 32);
    });
  }

  function drawDaeunTimeline(ctx, width, daeun, saju, startY) {
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('대운 흐름 (大運)', width / 2, startY);

    const currentYear = new Date().getFullYear();

    // 현재 나이 계산 (예시)
    const birthYear = daeun[0] ? daeun[0].startYear - daeun[0].startAge : currentYear - 30;
    const currentAge = currentYear - birthYear;

    // 현재 대운 찾기
    let currentDaeunIndex = 0;
    daeun.forEach((d, index) => {
      if (currentAge >= d.startAge && currentAge <= d.endAge) {
        currentDaeunIndex = index;
      }
    });

    // 표시할 대운 범위 (현재 기준 앞뒤로)
    const displayStart = Math.max(0, currentDaeunIndex - 1);
    const displayEnd = Math.min(daeun.length, displayStart + 5);
    const displayDaeun = daeun.slice(displayStart, displayEnd);

    const timelineWidth = width - 100;
    const startX = 50;
    const y = startY + 50;

    // 타임라인 선
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, y + 40);
    ctx.lineTo(startX + timelineWidth, y + 40);
    ctx.stroke();

    // 각 대운 노드
    const nodeSpacing = timelineWidth / (displayDaeun.length);

    displayDaeun.forEach((d, index) => {
      const x = startX + nodeSpacing * (index + 0.5);
      const isCurrent = displayStart + index === currentDaeunIndex;
      const colors = ELEMENT_COLORS[d.stem.element];

      // 노드 원
      ctx.beginPath();
      ctx.arc(x, y + 40, isCurrent ? 25 : 20, 0, Math.PI * 2);
      ctx.fillStyle = isCurrent ? colors.primary : colors.secondary;
      ctx.fill();

      if (isCurrent) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // 천간지지
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isCurrent ? 14 : 12}px "Noto Serif KR", serif`;
      ctx.textAlign = 'center';
      ctx.fillText(d.stem.hanja + d.branch.hanja, x, y + 45);

      // 나이 범위
      ctx.fillStyle = '#666666';
      ctx.font = '11px "Noto Sans KR", sans-serif';
      ctx.fillText(`${d.startAge}-${d.endAge}세`, x, y + 75);

      // 연도 범위
      ctx.font = '10px "Noto Sans KR", sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText(`${d.startYear}-${d.endYear}`, x, y + 90);

      // 현재 표시
      if (isCurrent) {
        ctx.fillStyle = colors.primary;
        ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
        ctx.fillText('현재', x, y + 10);
      }
    });

    // 화살표 (더 있음 표시)
    if (displayEnd < daeun.length) {
      ctx.fillStyle = '#999999';
      ctx.font = '16px sans-serif';
      ctx.fillText('→', startX + timelineWidth + 10, y + 45);
    }
  }

  function drawStrengthsCautions(ctx, width, interpretation, startY) {
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('강점과 주의점', width / 2, startY);

    const boxWidth = (width - 80) / 2;
    const boxHeight = 150;

    // 강점 박스
    ctx.fillStyle = '#E8F5E9';
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    roundRect(ctx, 30, startY + 20, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ 강점', 30 + boxWidth / 2, startY + 50);

    // 강점 내용
    const strengths = [];
    const aptitudes = interpretation.career.aptitudes;
    if (aptitudes.leadership.level === 'strong') strengths.push('리더십');
    if (aptitudes.creativity.level === 'strong') strengths.push('창의성');
    if (aptitudes.analytical.level === 'strong') strengths.push('분석력');
    if (aptitudes.social.level === 'strong') strengths.push('사교성');

    if (strengths.length === 0) {
      // 기본 강점 추출
      const traits = interpretation.basic.dayMaster.traits;
      if (traits.length > 0) {
        const trait = traits[0].split('경향')[0].trim();
        strengths.push(trait.substring(0, 15) + (trait.length > 15 ? '...' : ''));
      }
    }

    ctx.fillStyle = '#333333';
    ctx.font = '14px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    strengths.slice(0, 3).forEach((strength, index) => {
      ctx.fillText(`• ${strength}`, 50, startY + 80 + index * 25);
    });

    // 주의점 박스
    ctx.fillStyle = '#FFF3E0';
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    roundRect(ctx, 30 + boxWidth + 20, startY + 20, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E65100';
    ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 주의점', 30 + boxWidth + 20 + boxWidth / 2, startY + 50);

    // 주의점 내용
    const caution = interpretation.basic.dayMaster.caution;
    ctx.fillStyle = '#333333';
    ctx.font = '14px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';

    const cautionLines = wrapText(ctx, caution, boxWidth - 40);
    cautionLines.slice(0, 4).forEach((line, index) => {
      ctx.fillText(line, 50 + boxWidth + 20, startY + 80 + index * 22);
    });
  }

  function drawFooter(ctx, width, height) {
    ctx.fillStyle = '#999999';
    ctx.font = '12px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('※ 사주풀이는 통계적 경향성을 보여주며, 운명을 결정하지 않습니다.', width / 2, height - 40);
    ctx.fillText(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, width / 2, height - 20);
  }

  // 유틸리티 함수
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }

    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    words.forEach(char => {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 오행 분포 원형 차트 생성
   */
  function generateElementPieChart(distribution, size = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
    let startAngle = -Math.PI / 2;

    const elements = ['목', '화', '토', '금', '수'];

    elements.forEach(element => {
      const count = distribution[element];
      const sliceAngle = (count / total) * Math.PI * 2;
      const colors = ELEMENT_COLORS[element];

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors.primary;
      ctx.fill();

      // 레이블
      if (count > 0) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius * 0.6);
        const labelY = centerY + Math.sin(midAngle) * (radius * 0.6);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${element}(${count})`, labelX, labelY);
      }

      startAngle += sliceAngle;
    });

    return canvas;
  }

  /**
   * 캔버스를 이미지로 다운로드
   */
  function downloadAsImage(canvas, filename = 'my-saju-journey.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /**
   * 캔버스를 Blob으로 변환
   */
  function canvasToBlob(canvas) {
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
  }

  // Public API
  return {
    generateJourneyImage,
    generateElementPieChart,
    downloadAsImage,
    canvasToBlob,
    ELEMENT_COLORS
  };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SajuImageGenerator;
}
