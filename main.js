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
    // 요약 카드
    summaryIcon: document.getElementById('summaryIcon'),
    summaryTitle: document.getElementById('summaryTitle'),
    summarySubtitle: document.getElementById('summarySubtitle'),
    summaryDescription: document.getElementById('summaryDescription'),
    // 커리어 카드
    careerStrengths: document.getElementById('careerStrengths'),
    careerActions: document.getElementById('careerActions'),
    careerAvoid: document.getElementById('careerAvoid'),
    careerTags: document.getElementById('careerTags'),
    // 재물 카드
    wealthProfile: document.getElementById('wealthProfile'),
    wealthActions: document.getElementById('wealthActions'),
    wealthAvoid: document.getElementById('wealthAvoid'),
    // 인간관계 카드
    relationshipProfile: document.getElementById('relationshipProfile'),
    relationshipActions: document.getElementById('relationshipActions'),
    compatibilityList: document.getElementById('compatibilityList'),
    relationshipAvoid: document.getElementById('relationshipAvoid'),
    // 운세 카드
    fortuneSummary: document.getElementById('fortuneSummary'),
    yearlyActions: document.getElementById('yearlyActions'),
    // 오늘의 팁
    dailyTip: document.getElementById('dailyTip'),
    // 버튼
    saveLocalBtn: document.getElementById('saveLocalBtn'),
    newAnalysisBtn: document.getElementById('newAnalysisBtn'),
    // 기타
    tooltipPopup: document.getElementById('tooltipPopup'),
    tooltipClose: document.getElementById('tooltipClose'),
    tooltipTitle: document.getElementById('tooltipTitle'),
    tooltipText: document.getElementById('tooltipText'),
    themeToggle: document.getElementById('themeToggle')
  };

  // 현재 분석 결과 저장
  let currentResult = null;

  // 일간 아이콘 및 타입 매핑
  const dayMasterTypes = {
    '갑': { icon: '🌲', type: '개척자형 리더', color: '#00FF88' },
    '을': { icon: '🌿', type: '유연한 전략가', color: '#4CAF50' },
    '병': { icon: '☀️', type: '열정적인 리더', color: '#FF3366' },
    '정': { icon: '🕯️', type: '섬세한 창작자', color: '#FF6B8A' },
    '무': { icon: '⛰️', type: '신뢰받는 중재자', color: '#FFD600' },
    '기': { icon: '🏡', type: '현실적인 관리자', color: '#FFC107' },
    '경': { icon: '⚔️', type: '결단력 있는 실행가', color: '#C0C0C0' },
    '신': { icon: '💎', type: '완벽주의 분석가', color: '#E0E0E0' },
    '임': { icon: '🌊', type: '지혜로운 혁신가', color: '#00D4FF' },
    '계': { icon: '💧', type: '감성적인 사색가', color: '#42A5F5' }
  };

  /**
   * 초기화
   */
  function init() {
    setupEventListeners();
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
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!localStorage.getItem('theme')) {
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
      newTheme = systemPrefersDark ? 'light' : 'dark';
    }

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  /**
   * 이벤트 리스너 설정
   */
  function setupEventListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.saveLocalBtn.addEventListener('click', handleSaveLocal);
    elements.newAnalysisBtn.addEventListener('click', handleNewAnalysis);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.tooltipClose.addEventListener('click', closeTooltip);
    elements.tooltipPopup.addEventListener('click', (e) => {
      if (e.target === elements.tooltipPopup) closeTooltip();
    });
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

    if (!validateFormData(formData)) return;
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
    showLoading();

    setTimeout(() => {
      try {
        const saju = SajuEngine.calculateSaju(
          formData.year, formData.month, formData.day,
          formData.hour, formData.gender
        );

        const daeun = SajuEngine.calculateDaeun(
          saju, formData.year, formData.month,
          formData.day, formData.gender
        );

        const interpretation = SajuInterpreter.generateInterpretation(saju, daeun);
        const dailyTip = SajuInterpreter.generateDailyTip(saju);

        currentResult = {
          formData, saju, daeun, interpretation, dailyTip,
          analyzedAt: new Date().toISOString()
        };

        displayResults(currentResult);
        hideLoading();

      } catch (error) {
        console.error('사주 분석 오류:', error);
        alert('사주 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
        hideLoading();
      }
    }, 1500);
  }

  /**
   * 결과 표시
   */
  function displayResults(result) {
    const { saju, interpretation, dailyTip } = result;

    elements.inputSection.style.display = 'none';
    elements.resultSection.style.display = 'block';

    renderSummary(saju, interpretation);
    renderCareerCard(interpretation);
    renderWealthCard(interpretation);
    renderRelationshipCard(interpretation);
    renderFortuneCard(interpretation);
    renderDailyTip(dailyTip);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 요약 카드 렌더링
   */
  function renderSummary(saju, interpretation) {
    const dayMaster = saju.dayMaster;
    const typeInfo = dayMasterTypes[dayMaster.name];
    const basic = interpretation.basic;

    elements.summaryIcon.textContent = typeInfo.icon;
    elements.summarySubtitle.textContent = typeInfo.type;
    elements.summaryDescription.textContent = basic.dayMaster.traits[0];
  }

  /**
   * 커리어 카드 렌더링
   */
  function renderCareerCard(interpretation) {
    const career = interpretation.career;
    const basic = interpretation.basic;

    // 강점 그리드
    const strengths = [
      { title: '핵심 성향', desc: basic.dayMaster.traits[0] },
      { title: '업무 스타일', desc: basic.dayMaster.traits[1] || basic.dayMaster.traits[0] },
      { title: '리더십', desc: career.aptitudes.leadership.description },
      { title: '창의성', desc: career.aptitudes.creativity.description }
    ];

    elements.careerStrengths.innerHTML = strengths.map(s => `
      <div class="strength-item">
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
      </div>
    `).join('');

    // 액션 플랜
    const actions = generateCareerActions(career, basic);
    elements.careerActions.innerHTML = actions.map((action, i) => `
      <div class="action-item">
        <div class="action-number">${i + 1}</div>
        <div class="action-content">
          <h4>${action.title}</h4>
          <p>${action.desc}</p>
        </div>
      </div>
    `).join('');

    // 피해야 할 것
    const avoids = generateCareerAvoids(career, basic);
    elements.careerAvoid.innerHTML = avoids.map(avoid => `
      <div class="avoid-item">
        <span class="avoid-icon">🚫</span>
        <p>${avoid}</p>
      </div>
    `).join('');

    // 추천 직업군
    elements.careerTags.innerHTML = career.recommendedCareers.map(c =>
      `<span class="career-tag">${c}</span>`
    ).join('');
  }

  /**
   * 커리어 액션 플랜 생성
   */
  function generateCareerActions(career, basic) {
    const actions = [];
    const apt = career.aptitudes;

    if (apt.leadership.level === 'strong') {
      actions.push({
        title: '리더십 포지션을 적극적으로 노려보세요',
        desc: '팀 리드, 프로젝트 매니저 등 사람을 이끄는 역할에서 당신의 능력이 빛날 수 있습니다. 작은 프로젝트부터 리딩 경험을 쌓아보세요.'
      });
    } else {
      actions.push({
        title: '전문성을 깊이 있게 파고드세요',
        desc: '특정 분야의 전문가로 성장하는 것이 당신에게 더 맞을 수 있습니다. 한 분야를 깊이 있게 공부하고 경험을 쌓으세요.'
      });
    }

    if (apt.creativity.level === 'strong') {
      actions.push({
        title: '창의적인 프로젝트에 참여하세요',
        desc: '새로운 아이디어를 내고 실험할 수 있는 환경에서 일하세요. 사이드 프로젝트나 창작 활동을 시작해보는 것도 좋습니다.'
      });
    }

    if (apt.analytical.level === 'strong') {
      actions.push({
        title: '데이터 기반 의사결정 역량을 키우세요',
        desc: '분석력이 뛰어난 당신에게 데이터 분석, 전략 기획 등의 역할이 어울립니다. 관련 스킬을 체계적으로 학습하세요.'
      });
    }

    if (apt.social.level === 'strong') {
      actions.push({
        title: '네트워킹에 투자하세요',
        desc: '사람을 통해 기회가 옵니다. 업계 모임, 컨퍼런스에 적극적으로 참여하고 인맥을 넓혀보세요.'
      });
    }

    actions.push({
      title: '3개월 단위 목표를 세우세요',
      desc: '장기 목표를 3개월 단위로 쪼개서 실행하세요. 분기마다 성과를 점검하고 방향을 조정하는 습관을 들이세요.'
    });

    return actions.slice(0, 4);
  }

  /**
   * 커리어 피해야 할 것 생성
   */
  function generateCareerAvoids(career, basic) {
    const avoids = [basic.dayMaster.caution];

    if (career.aptitudes.leadership.level === 'weak') {
      avoids.push('준비 없이 리더 역할을 맡는 것 - 충분한 경험을 쌓은 후에 도전하세요');
    }

    if (career.aptitudes.social.level === 'weak') {
      avoids.push('과도한 네트워킹 의무가 있는 직무 - 당신의 에너지를 빠르게 소진시킬 수 있습니다');
    }

    avoids.push('명확한 목표 없이 이직하는 것 - 최소 6개월은 다음 스텝을 고민하세요');

    return avoids.slice(0, 3);
  }

  /**
   * 재물 카드 렌더링
   */
  function renderWealthCard(interpretation) {
    const wealth = interpretation.wealth;

    // 재물 프로필
    const wealthTypes = {
      strong: { icon: '💰', type: '재물 축적형', desc: '돈을 모으고 불리는 재능이 있습니다' },
      moderate: { icon: '⚖️', type: '균형 관리형', desc: '수입과 지출의 균형을 잘 맞추는 편입니다' },
      weak: { icon: '💸', type: '흐름 중시형', desc: '돈보다 경험과 가치를 중시하는 성향입니다' }
    };
    const wType = wealthTypes[wealth.accumulation.level];

    elements.wealthProfile.innerHTML = `
      <div class="profile-type">
        <div class="profile-type-icon">${wType.icon}</div>
        <div class="profile-type-text">
          <h4>${wType.type}</h4>
          <p>${wType.desc}</p>
        </div>
      </div>
      <p class="profile-description">${wealth.accumulation.description}</p>
    `;

    // 액션 플랜
    const actions = generateWealthActions(wealth);
    elements.wealthActions.innerHTML = actions.map((action, i) => `
      <div class="action-item">
        <div class="action-number">${i + 1}</div>
        <div class="action-content">
          <h4>${action.title}</h4>
          <p>${action.desc}</p>
        </div>
      </div>
    `).join('');

    // 피해야 할 것
    const avoids = generateWealthAvoids(wealth);
    elements.wealthAvoid.innerHTML = avoids.map(avoid => `
      <div class="avoid-item">
        <span class="avoid-icon">🚫</span>
        <p>${avoid}</p>
      </div>
    `).join('');
  }

  /**
   * 재물 액션 플랜 생성
   */
  function generateWealthActions(wealth) {
    const actions = [];

    if (wealth.accumulation.level === 'strong') {
      actions.push({
        title: '자산 포트폴리오를 다각화하세요',
        desc: '재물운이 있으니 적극적으로 투자하되, 한 곳에 몰빵하지 마세요. 부동산, 주식, 예금을 적절히 분배하세요.'
      });
    } else if (wealth.accumulation.level === 'weak') {
      actions.push({
        title: '자동 저축 시스템을 만드세요',
        desc: '월급날 자동이체로 최소 10%를 먼저 저축하세요. 의지에 의존하지 않는 시스템이 당신에게 필요합니다.'
      });
    }

    if (wealth.investment.style === 'aggressive') {
      actions.push({
        title: '투자 전 충분한 리서치를 하세요',
        desc: '공격적인 투자 성향이 있어 큰 수익도 가능하지만, 충동적인 결정은 피하세요. 최소 1주일은 고민하세요.'
      });
    } else if (wealth.investment.style === 'conservative') {
      actions.push({
        title: '안전자산 위주로 포트폴리오를 구성하세요',
        desc: '국채, 우량주, 적금 위주로 안정적인 수익을 추구하세요. 당신에게는 이게 더 맞습니다.'
      });
    }

    actions.push({
      title: '월별 재정 리뷰를 하세요',
      desc: '매월 말일에 30분만 투자해서 수입/지출을 점검하세요. 새는 돈을 찾고 절약 포인트를 발견할 수 있습니다.'
    });

    actions.push({
      title: '비상금 6개월치를 확보하세요',
      desc: '월 생활비의 6배를 언제든 인출 가능한 계좌에 준비하세요. 이것이 투자의 첫걸음입니다.'
    });

    return actions.slice(0, 4);
  }

  /**
   * 재물 피해야 할 것 생성
   */
  function generateWealthAvoids(wealth) {
    const avoids = [];

    if (wealth.investment.style === 'aggressive') {
      avoids.push('레버리지 투자나 빚내서 투자하는 것 - 당신의 공격적 성향과 만나면 위험합니다');
    }

    if (wealth.accumulation.level === 'weak') {
      avoids.push('충동구매와 감정적 소비 - 구매 전 24시간 쿨다운 타임을 가지세요');
    }

    avoids.push('보증 서는 것 - 아무리 가까운 사이라도 금전 보증은 피하세요');
    avoids.push('전문가 상담 없이 큰 금액 투자하는 것 - 1000만원 이상은 전문가와 상의하세요');

    return avoids.slice(0, 3);
  }

  /**
   * 인간관계 카드 렌더링
   */
  function renderRelationshipCard(interpretation) {
    const rel = interpretation.relationship;

    // 관계 프로필
    const relTypes = {
      extrovert: { icon: '🌟', type: '사교적 연결형', desc: '많은 사람들과 어울리며 에너지를 얻습니다' },
      introvert: { icon: '🎯', type: '깊이 있는 관계형', desc: '소수의 깊은 관계를 선호합니다' },
      ambivert: { icon: '🔄', type: '상황 적응형', desc: '상황에 따라 유연하게 대처합니다' }
    };
    const rType = relTypes[rel.style.type];

    elements.relationshipProfile.innerHTML = `
      <div class="profile-type">
        <div class="profile-type-icon">${rType.icon}</div>
        <div class="profile-type-text">
          <h4>${rType.type}</h4>
          <p>${rType.desc}</p>
        </div>
      </div>
      <p class="profile-description">${rel.style.description}</p>
    `;

    // 액션 플랜
    const actions = generateRelationshipActions(rel);
    elements.relationshipActions.innerHTML = actions.map((action, i) => `
      <div class="action-item">
        <div class="action-number">${i + 1}</div>
        <div class="action-content">
          <h4>${action.title}</h4>
          <p>${action.desc}</p>
        </div>
      </div>
    `).join('');

    // 궁합 리스트
    const compats = generateCompatibilityList(rel);
    elements.compatibilityList.innerHTML = compats.map(c => `
      <div class="compatibility-item">
        <div class="compat-icon">${c.icon}</div>
        <h4>${c.type}</h4>
        <p>${c.desc}</p>
      </div>
    `).join('');

    // 피해야 할 것
    const avoids = generateRelationshipAvoids(rel);
    elements.relationshipAvoid.innerHTML = avoids.map(avoid => `
      <div class="avoid-item">
        <span class="avoid-icon">🚫</span>
        <p>${avoid}</p>
      </div>
    `).join('');
  }

  /**
   * 관계 액션 플랜 생성
   */
  function generateRelationshipActions(rel) {
    const actions = [];

    if (rel.style.type === 'extrovert') {
      actions.push({
        title: '깊이 있는 관계에도 투자하세요',
        desc: '많은 사람을 아는 것도 좋지만, 정말 중요한 5명과 깊은 관계를 유지하세요. 정기적으로 1:1 시간을 가지세요.'
      });
    } else if (rel.style.type === 'introvert') {
      actions.push({
        title: '안전한 범위에서 네트워크를 넓혀보세요',
        desc: '한 달에 한 번, 새로운 사람 1명을 만나보세요. 당신의 페이스를 유지하면서도 관계를 확장할 수 있습니다.'
      });
    }

    if (rel.conflict.type === 'direct') {
      actions.push({
        title: '갈등 상황에서 잠시 쉬어가세요',
        desc: '화가 날 때 바로 대응하지 말고, 24시간 후에 대화하세요. 감정이 가라앉은 후 더 나은 해결책을 찾을 수 있습니다.'
      });
    } else if (rel.conflict.type === 'avoidant') {
      actions.push({
        title: '불편한 대화도 피하지 마세요',
        desc: '작은 문제가 쌓이면 큰 갈등이 됩니다. 불편함을 느끼면 일주일 안에 대화로 해결하세요.'
      });
    }

    actions.push({
      title: '감사 표현을 습관화하세요',
      desc: '하루에 한 번, 주변 사람에게 감사를 전하세요. 카톡 한 줄도 좋습니다. 관계가 따뜻해집니다.'
    });

    actions.push({
      title: '경청하는 연습을 하세요',
      desc: '대화할 때 상대방 말을 끝까지 듣고, 요약해서 되물어보세요. "그러니까 네 말은..." 이 한마디가 관계를 바꿉니다.'
    });

    return actions.slice(0, 4);
  }

  /**
   * 궁합 리스트 생성
   */
  function generateCompatibilityList(rel) {
    return [
      { icon: '🎯', type: '목표 지향적인 사람', desc: '함께 성장할 수 있어요' },
      { icon: '🤝', type: '신뢰를 중시하는 사람', desc: '안정적인 관계가 됩니다' },
      { icon: '💡', type: '열린 마음을 가진 사람', desc: '서로 배울 수 있어요' },
      { icon: '😊', type: '긍정적인 사람', desc: '함께하면 에너지가 나요' }
    ];
  }

  /**
   * 관계 피해야 할 것 생성
   */
  function generateRelationshipAvoids(rel) {
    const avoids = [];

    if (rel.conflict.type === 'direct') {
      avoids.push('감정적일 때 중요한 대화하기 - 화가 나면 일단 자리를 피하세요');
    }

    avoids.push('일방적으로 퍼주기만 하는 관계 - Give and Take의 균형을 유지하세요');
    avoids.push('부정적인 에너지를 주는 사람과 자주 만나기 - 당신의 에너지를 보호하세요');
    avoids.push('SNS로만 관계를 유지하기 - 중요한 사람과는 실제로 만나세요');

    return avoids.slice(0, 3);
  }

  /**
   * 운세 카드 렌더링
   */
  function renderFortuneCard(interpretation) {
    const timing = interpretation.timing;
    const currentYear = new Date().getFullYear();

    elements.fortuneSummary.innerHTML = `
      <div class="fortune-year">${currentYear}</div>
      <div class="fortune-theme">${timing.currentYear.interpretation.theme}</div>
      <p class="fortune-description">${timing.currentYear.interpretation.opportunity}</p>
    `;

    const yearActions = [
      {
        title: `${currentYear}년 상반기 집중 포인트`,
        desc: timing.currentYear.interpretation.opportunity
      },
      {
        title: `${currentYear}년 하반기 주의사항`,
        desc: timing.currentYear.interpretation.caution
      },
      {
        title: '올해의 성장 전략',
        desc: '새로운 도전보다는 기존에 하던 일을 더 깊이 파고드세요. 기초를 탄탄히 하는 한 해로 만드세요.'
      }
    ];

    elements.yearlyActions.innerHTML = yearActions.map((action, i) => `
      <div class="action-item">
        <div class="action-number">${i + 1}</div>
        <div class="action-content">
          <h4>${action.title}</h4>
          <p>${action.desc}</p>
        </div>
      </div>
    `).join('');
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
          <span>오늘의 컬러: ${tip.colorName}</span>
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
   * 로컬 저장 처리
   */
  function handleSaveLocal() {
    if (currentResult) {
      localStorage.setItem('sajuResult', JSON.stringify(currentResult));
      alert('결과가 저장되었습니다!');
    }
  }

  /**
   * 새로운 분석 처리
   */
  function handleNewAnalysis() {
    elements.resultSection.style.display = 'none';
    elements.inputSection.style.display = 'block';
    elements.form.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    currentResult = null;
  }

  function showLoading() {
    elements.inputSection.style.display = 'none';
    elements.loading.classList.add('active');
  }

  function hideLoading() {
    elements.loading.classList.remove('active');
  }

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
