/**
 * 사주풀이 메인 애플리케이션
 * UI 동작 및 통합 로직
 */

(function() {
  'use strict';

  // DOM 요소 캐싱
  const elements = {
    form: document.getElementById('sajuForm'),
    inputSection: document.getElementById('inputSection'),
    loading: document.getElementById('loading'),
    resultSection: document.getElementById('resultSection'),
    pillarsContainer: document.getElementById('pillarsContainer'),
    elementsChart: document.getElementById('elementsChart'),
    yinYangBalance: document.getElementById('yinYangBalance'),
    careerTab: document.getElementById('careerTab'),
    wealthTab: document.getElementById('wealthTab'),
    relationshipTab: document.getElementById('relationshipTab'),
    daeunTimeline: document.getElementById('daeunTimeline'),
    saeunInfo: document.getElementById('saeunInfo'),
    dailyTip: document.getElementById('dailyTip'),
    visualContainer: document.getElementById('visualContainer'),
    journeyCanvas: document.getElementById('journeyCanvas'),
    downloadImageBtn: document.getElementById('downloadImageBtn'),
    saveLocalBtn: document.getElementById('saveLocalBtn'),
    newAnalysisBtn: document.getElementById('newAnalysisBtn'),
    tooltipPopup: document.getElementById('tooltipPopup'),
    tooltipClose: document.getElementById('tooltipClose'),
    tooltipTitle: document.getElementById('tooltipTitle'),
    tooltipText: document.getElementById('tooltipText'),
    themeToggle: document.getElementById('themeToggle')
  };

  // 현재 분석 결과 저장
  let currentResult = null;

  // 오행 색상 매핑
  const elementColors = {
    '목': '#4CAF50',
    '화': '#F44336',
    '토': '#FFC107',
    '금': '#9E9E9E',
    '수': '#2196F3'
  };

  const elementIcons = {
    '목': '🌳',
    '화': '🔥',
    '토': '🏔️',
    '금': '⚔️',
    '수': '💧'
  };

  const elementClasses = {
    '목': 'wood',
    '화': 'fire',
    '토': 'earth',
    '금': 'metal',
    '수': 'water'
  };

  // 용어 해설 데이터
  const termDefinitions = {
    '천간': '하늘의 기운을 나타내는 10개의 글자 (갑을병정무기경신임계)입니다. 사주에서 외면적 특성과 활동성을 나타내는 경향이 있습니다.',
    '지지': '땅의 기운을 나타내는 12개의 글자 (자축인묘진사오미신유술해)입니다. 12간지라고도 하며, 내면적 특성과 잠재력을 나타내는 경향이 있습니다.',
    '오행': '목(木), 화(火), 토(土), 금(金), 수(水)의 다섯 가지 기운입니다. 만물의 구성 요소이자 변화의 원리를 나타냅니다.',
    '일간': '일주의 천간으로, 사주에서 본인 자신을 나타냅니다. 성격과 기질의 핵심이 되는 요소입니다.',
    '대운': '10년 단위로 바뀌는 큰 운의 흐름입니다. 인생의 큰 방향성과 기회를 나타내는 경향이 있습니다.',
    '세운': '해마다 바뀌는 운의 흐름입니다. 그 해의 전체적인 분위기와 경향을 나타냅니다.',
    '음양': '우주의 상반된 두 기운입니다. 양(陽)은 활동적, 외향적, 적극적 성향을, 음(陰)은 수용적, 내향적, 신중한 성향을 나타냅니다.'
  };

  /**
   * 초기화
   */
  function init() {
    setupEventListeners();
    checkSavedResult();
    initTheme();
  }

  /**
   * 테마 초기화
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    // 시스템 테마 변경 감지
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        // 사용자가 수동으로 테마를 설정하지 않은 경우에만 시스템 테마 따름
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  /**
   * 테마 토글
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let newTheme;
    if (currentTheme === 'dark') {
      newTheme = 'light';
    } else if (currentTheme === 'light') {
      newTheme = 'dark';
    } else {
      // 시스템 테마를 따르고 있는 경우, 반대 테마로 설정
      newTheme = systemPrefersDark ? 'light' : 'dark';
    }

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  /**
   * 이벤트 리스너 설정
   */
  function setupEventListeners() {
    // 폼 제출
    elements.form.addEventListener('submit', handleFormSubmit);

    // 탭 버튼
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', handleTabClick);
    });

    // 액션 버튼
    elements.downloadImageBtn.addEventListener('click', handleDownloadImage);
    elements.saveLocalBtn.addEventListener('click', handleSaveLocal);
    elements.newAnalysisBtn.addEventListener('click', handleNewAnalysis);

    // 테마 토글
    elements.themeToggle.addEventListener('click', toggleTheme);

    // 툴팁
    elements.tooltipClose.addEventListener('click', closeTooltip);
    elements.tooltipPopup.addEventListener('click', (e) => {
      if (e.target === elements.tooltipPopup) {
        closeTooltip();
      }
    });

    // 용어 힌트 클릭
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('term-hint')) {
        const term = e.target.dataset.term;
        if (term && termDefinitions[term]) {
          showTooltip(term, termDefinitions[term]);
        }
      }
    });
  }

  /**
   * 저장된 결과 확인
   */
  function checkSavedResult() {
    const saved = localStorage.getItem('sajuResult');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // 저장된 결과가 있으면 자동 표시하지 않고 사용자가 선택하게 함
        console.log('저장된 사주 결과가 있습니다.');
      } catch (e) {
        console.error('저장된 결과 파싱 오류:', e);
      }
    }
  }

  /**
   * 폼 제출 처리
   */
  function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
      year: parseInt(document.getElementById('birthYear').value),
      month: parseInt(document.getElementById('birthMonth').value),
      day: parseInt(document.getElementById('birthDay').value),
      hour: document.getElementById('birthHour').value ? parseInt(document.getElementById('birthHour').value) : null,
      calendarType: document.getElementById('calendarType').value,
      gender: document.querySelector('input[name="gender"]:checked').value
    };

    // 유효성 검사
    if (!validateFormData(formData)) {
      return;
    }

    // 분석 시작
    analyzeSaju(formData);
  }

  /**
   * 폼 데이터 유효성 검사
   */
  function validateFormData(data) {
    if (data.year < 1900 || data.year > 2100) {
      alert('출생년도는 1900년부터 2100년 사이로 입력해주세요.');
      return false;
    }

    if (data.day < 1 || data.day > 31) {
      alert('올바른 날짜를 입력해주세요.');
      return false;
    }

    // 월별 일수 체크
    const daysInMonth = new Date(data.year, data.month, 0).getDate();
    if (data.day > daysInMonth) {
      alert(`${data.month}월은 ${daysInMonth}일까지만 있습니다.`);
      return false;
    }

    return true;
  }

  /**
   * 사주 분석 실행
   */
  function analyzeSaju(formData) {
    // 로딩 표시
    showLoading();

    // 비동기 처리 시뮬레이션 (실제로는 즉시 계산됨)
    setTimeout(() => {
      try {
        // 사주 계산
        const saju = SajuEngine.calculateSaju(
          formData.year,
          formData.month,
          formData.day,
          formData.hour,
          formData.gender
        );

        // 대운 계산
        const daeun = SajuEngine.calculateDaeun(
          saju,
          formData.year,
          formData.month,
          formData.day,
          formData.gender
        );

        // 해석 생성
        const interpretation = SajuInterpreter.generateInterpretation(saju, daeun);

        // 오늘의 팁 생성
        const dailyTip = SajuInterpreter.generateDailyTip(saju);

        // 결과 저장
        currentResult = {
          formData,
          saju,
          daeun,
          interpretation,
          dailyTip,
          analyzedAt: new Date().toISOString()
        };

        // 결과 표시
        displayResults(currentResult);

        // 로딩 숨기기
        hideLoading();

      } catch (error) {
        console.error('사주 분석 오류:', error);
        alert('사주 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
        hideLoading();
      }
    }, 1500); // 1.5초 딜레이로 로딩 경험 제공
  }

  /**
   * 결과 표시
   */
  function displayResults(result) {
    const { saju, daeun, interpretation, dailyTip, formData } = result;

    // 섹션 전환
    elements.inputSection.style.display = 'none';
    elements.resultSection.style.display = 'block';

    // 각 섹션 렌더링
    renderPillars(saju.pillars);
    renderElementsChart(saju.elementDistribution);
    renderYinYangBalance(saju.yinYangBalance, interpretation.basic.yinYang.description);
    renderCareerTab(interpretation.career, interpretation.basic);
    renderWealthTab(interpretation.wealth);
    renderRelationshipTab(interpretation.relationship);
    renderDaeunTimeline(daeun, formData.year);
    renderSaeunInfo(interpretation.timing.currentYear);
    renderDailyTip(dailyTip);
    renderJourneyImage(saju, interpretation, daeun);

    // 스크롤 상단으로
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 사주 기둥 렌더링
   */
  function renderPillars(pillars) {
    const pillarNames = ['시주', '일주', '월주', '연주'];
    const pillarData = [pillars.hour, pillars.day, pillars.month, pillars.year];

    let html = '';

    pillarData.forEach((pillar, index) => {
      if (pillar) {
        const stemElement = pillar.stem.element;
        const branchElement = pillar.branch.element;

        html += `
          <div class="pillar element-bg-${elementClasses[stemElement]}">
            <div class="pillar-name">${pillarNames[index]}</div>
            <div class="pillar-stem element-${elementClasses[stemElement]}">${pillar.stem.hanja}</div>
            <div class="pillar-stem-name">${pillar.stem.name} (${stemElement})</div>
            <div class="pillar-branch element-${elementClasses[branchElement]}">${pillar.branch.hanja}</div>
            <div class="pillar-branch-name">${pillar.branch.name} (${pillar.branch.animal})</div>
          </div>
        `;
      } else {
        html += `
          <div class="pillar">
            <div class="pillar-name">${pillarNames[index]}</div>
            <div class="pillar-empty">시간 미입력</div>
          </div>
        `;
      }
    });

    elements.pillarsContainer.innerHTML = html;
  }

  /**
   * 오행 분포 차트 렌더링
   */
  function renderElementsChart(distribution) {
    const elementList = ['목', '화', '토', '금', '수'];
    const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

    let html = '';

    elementList.forEach(element => {
      const count = distribution[element];
      const percentage = (count / total) * 100;
      const height = Math.max(10, percentage);

      html += `
        <div class="element-bar">
          <div class="element-bar-container">
            <div class="element-bar-fill" style="height: ${height}%; background-color: ${elementColors[element]};"></div>
          </div>
          <div class="element-icon">${elementIcons[element]}</div>
          <div class="element-name">${element}</div>
          <div class="element-count">${count}개</div>
        </div>
      `;
    });

    elements.elementsChart.innerHTML = html;

    // 애니메이션을 위해 약간의 딜레이 후 높이 설정
    setTimeout(() => {
      document.querySelectorAll('.element-bar-fill').forEach(bar => {
        bar.style.height = bar.style.height;
      });
    }, 100);
  }

  /**
   * 음양 밸런스 렌더링
   */
  function renderYinYangBalance(yinYang, description) {
    elements.yinYangBalance.innerHTML = `
      <div class="yin-yang-container">
        <div class="yin-section">
          <div class="yin-yang-label">음 (陰)</div>
          <div class="yin-yang-value">${yinYang.yin}</div>
        </div>
        <div class="yang-section">
          <div class="yin-yang-label">양 (陽)</div>
          <div class="yin-yang-value">${yinYang.yang}</div>
        </div>
      </div>
      <div class="yin-yang-description">${description}</div>
    `;
  }

  /**
   * 직업/재능 탭 렌더링
   */
  function renderCareerTab(career, basic) {
    const dayMaster = basic.dayMaster;

    let aptitudesHtml = '';
    const aptitudeLabels = {
      leadership: '리더십',
      creativity: '창의성',
      analytical: '분석력',
      social: '사교성'
    };

    for (const [key, value] of Object.entries(career.aptitudes)) {
      aptitudesHtml += `
        <div class="aptitude-item">
          <div class="aptitude-label">${aptitudeLabels[key]}</div>
          <div class="aptitude-level ${value.level}">${value.level === 'strong' ? '강함' : value.level === 'moderate' ? '보통' : '약함'}</div>
        </div>
      `;
    }

    let careersHtml = '';
    career.recommendedCareers.forEach(c => {
      careersHtml += `<span class="career-tag">${c}</span>`;
    });

    elements.careerTab.innerHTML = `
      <div class="analysis-section">
        <h3 class="analysis-title">🎯 타고난 기질</h3>
        <p class="analysis-content">
          <strong>${dayMaster.name}</strong> - ${dayMaster.symbol}의 기운을 가지고 계십니다.
        </p>
        <ul class="analysis-list">
          ${dayMaster.traits.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>

      <div class="analysis-section">
        <h3 class="analysis-title">📊 적성 분석</h3>
        <div class="aptitude-grid">
          ${aptitudesHtml}
        </div>
      </div>

      <div class="analysis-section">
        <h3 class="analysis-title">💼 어울리는 직업군</h3>
        <p class="analysis-content">통계적으로 다음 분야에서 적성을 발휘할 가능성이 있습니다:</p>
        <div class="career-tags">
          ${careersHtml}
        </div>
      </div>

      <div class="caution-box">
        <h4>⚡ 주의할 점</h4>
        <p>${career.caution}</p>
      </div>
    `;
  }

  /**
   * 재물/금전 탭 렌더링
   */
  function renderWealthTab(wealth) {
    elements.wealthTab.innerHTML = `
      <div class="analysis-section">
        <h3 class="analysis-title">💰 재물 축적 성향</h3>
        <p class="analysis-content">${wealth.accumulation.description}</p>
      </div>

      <div class="analysis-section">
        <h3 class="analysis-title">📈 수입 스타일</h3>
        <p class="analysis-content">${wealth.earning.description}</p>
      </div>

      <div class="analysis-section">
        <h3 class="analysis-title">🎲 투자 성향</h3>
        <p class="analysis-content">${wealth.investment.description}</p>
      </div>

      <div class="tip-box">
        <h4>💡 재물운 팁</h4>
        <ul class="analysis-list">
          ${wealth.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * 인간관계 탭 렌더링
   */
  function renderRelationshipTab(relationship) {
    elements.relationshipTab.innerHTML = `
      <div class="analysis-section">
        <h3 class="analysis-title">👥 대인관계 스타일</h3>
        <p class="analysis-content">${relationship.style.description}</p>
      </div>

      <div class="analysis-section">
        <h3 class="analysis-title">💕 궁합 경향</h3>
        <p class="analysis-content">${relationship.compatibility.description}</p>
        <p class="analysis-content" style="margin-top: 12px;">${relationship.bestMatch.description}</p>
      </div>

      <div class="analysis-section">
        <h3 class="analysis-title">⚔️ 갈등 패턴</h3>
        <p class="analysis-content">${relationship.conflict.description}</p>
      </div>

      <div class="tip-box">
        <h4>💡 관계 팁</h4>
        <ul class="analysis-list">
          ${relationship.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * 대운 타임라인 렌더링
   */
  function renderDaeunTimeline(daeunList, birthYear) {
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear;

    // 현재 대운 인덱스 찾기
    let currentIndex = 0;
    daeunList.forEach((d, index) => {
      if (currentAge >= d.startAge && currentAge <= d.endAge) {
        currentIndex = index;
      }
    });

    // 표시할 범위 (현재 기준 앞뒤로)
    const displayStart = Math.max(0, currentIndex - 1);
    const displayEnd = Math.min(daeunList.length, displayStart + 5);
    const displayDaeun = daeunList.slice(displayStart, displayEnd);

    let html = '<div class="timeline-container">';

    displayDaeun.forEach((d, index) => {
      const isCurrent = displayStart + index === currentIndex;
      const element = d.stem.element;

      html += `
        <div class="timeline-item ${isCurrent ? 'current' : ''}">
          <div class="timeline-node" style="background-color: ${elementColors[element]};">
            ${d.stem.hanja}${d.branch.hanja}
          </div>
          <div class="timeline-age">${d.startAge}-${d.endAge}세</div>
          <div class="timeline-year">${d.startYear}-${d.endYear}</div>
          ${index < displayDaeun.length - 1 ? '<div class="timeline-line"></div>' : ''}
        </div>
      `;
    });

    html += '</div>';

    elements.daeunTimeline.innerHTML = html;
  }

  /**
   * 세운 정보 렌더링
   */
  function renderSaeunInfo(currentYear) {
    const element = currentYear.element;
    const interp = currentYear.interpretation;

    elements.saeunInfo.innerHTML = `
      <div class="saeun-header">
        <div class="saeun-pillar">
          <div class="saeun-year">${currentYear.year}년</div>
          <div class="saeun-stem-branch element-${elementClasses[element]}">
            ${currentYear.stem.hanja}${currentYear.branch.hanja}
          </div>
        </div>
        <div class="saeun-details">
          <div class="saeun-theme">${interp.theme}</div>
          <div class="saeun-description">${interp.opportunity}</div>
        </div>
      </div>
      <div class="caution-box" style="margin-top: 16px;">
        <h4>주의할 점</h4>
        <p>${interp.caution}</p>
      </div>
    `;
  }

  /**
   * 오늘의 팁 렌더링
   */
  function renderDailyTip(tip) {
    elements.dailyTip.innerHTML = `
      <div class="daily-tip-header">
        <div class="daily-tip-date">${tip.date}</div>
        <div class="daily-tip-pillar">${tip.todayPillar.stem.hanja}${tip.todayPillar.branch.hanja}일</div>
      </div>
      <div class="daily-tip-message">${tip.message}</div>
      <div class="daily-tip-advice">${tip.advice}</div>
      <div class="daily-tip-extras">
        <div class="daily-tip-extra">
          <span class="daily-tip-extra-icon">🎨</span>
          <span>행운의 색상: ${tip.colorName}</span>
        </div>
        <div class="daily-tip-extra">
          <span class="daily-tip-extra-icon">🧭</span>
          <span>행운의 방향: ${tip.luckyDirection}</span>
        </div>
        <div class="daily-tip-extra">
          <span class="daily-tip-extra-icon">🔢</span>
          <span>행운의 숫자: ${tip.luckyNumber.join(', ')}</span>
        </div>
      </div>
    `;
  }

  /**
   * 통합 이미지 렌더링
   */
  function renderJourneyImage(saju, interpretation, daeun) {
    try {
      const canvas = SajuImageGenerator.generateJourneyImage(saju, interpretation, daeun, {
        width: 800,
        height: 1200
      });

      // 캔버스를 컨테이너에 추가
      elements.visualContainer.innerHTML = '';
      elements.visualContainer.appendChild(canvas);
      canvas.id = 'journeyCanvas';

    } catch (error) {
      console.error('이미지 생성 오류:', error);
      elements.visualContainer.innerHTML = '<p style="color: #999; text-align: center;">이미지 생성 중 오류가 발생했습니다.</p>';
    }
  }

  /**
   * 탭 클릭 처리
   */
  function handleTabClick(e) {
    const btn = e.currentTarget;
    const tabId = btn.dataset.tab;

    // 버튼 활성화 상태 변경
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 탭 컨텐츠 표시
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tabId}Tab`).classList.add('active');
  }

  /**
   * 이미지 다운로드 처리
   */
  function handleDownloadImage() {
    const canvas = document.getElementById('journeyCanvas');
    if (canvas) {
      SajuImageGenerator.downloadAsImage(canvas, `나의사주여정_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '')}.png`);
    } else {
      alert('이미지를 생성할 수 없습니다.');
    }
  }

  /**
   * 로컬 저장 처리
   */
  function handleSaveLocal() {
    if (currentResult) {
      localStorage.setItem('sajuResult', JSON.stringify(currentResult));
      alert('결과가 저장되었습니다. 다음에 방문해도 결과를 확인할 수 있습니다.');
    }
  }

  /**
   * 새로운 분석 처리
   */
  function handleNewAnalysis() {
    // 결과 섹션 숨기기
    elements.resultSection.style.display = 'none';
    elements.inputSection.style.display = 'block';

    // 폼 초기화
    elements.form.reset();

    // 스크롤 상단으로
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 현재 결과 초기화
    currentResult = null;
  }

  /**
   * 로딩 표시
   */
  function showLoading() {
    elements.inputSection.style.display = 'none';
    elements.loading.classList.add('active');
  }

  /**
   * 로딩 숨기기
   */
  function hideLoading() {
    elements.loading.classList.remove('active');
  }

  /**
   * 툴팁 표시
   */
  function showTooltip(title, text) {
    elements.tooltipTitle.textContent = title;
    elements.tooltipText.textContent = text;
    elements.tooltipPopup.classList.add('active');
  }

  /**
   * 툴팁 닫기
   */
  function closeTooltip() {
    elements.tooltipPopup.classList.remove('active');
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
