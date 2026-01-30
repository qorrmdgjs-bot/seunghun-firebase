/**
 * 사주 계산 엔진 (Saju Calculation Engine)
 * 만세력 기반 사주팔자 계산
 */

const SajuEngine = (function() {
  // 천간 (Heavenly Stems)
  const HEAVENLY_STEMS = [
    { name: '갑', hanja: '甲', element: '목', yin: false, color: '#2E7D32' },
    { name: '을', hanja: '乙', element: '목', yin: true, color: '#4CAF50' },
    { name: '병', hanja: '丙', element: '화', yin: false, color: '#C62828' },
    { name: '정', hanja: '丁', element: '화', yin: true, color: '#EF5350' },
    { name: '무', hanja: '戊', element: '토', yin: false, color: '#F9A825' },
    { name: '기', hanja: '己', element: '토', yin: true, color: '#FDD835' },
    { name: '경', hanja: '庚', element: '금', yin: false, color: '#757575' },
    { name: '신', hanja: '辛', element: '금', yin: true, color: '#BDBDBD' },
    { name: '임', hanja: '壬', element: '수', yin: false, color: '#1565C0' },
    { name: '계', hanja: '癸', element: '수', yin: true, color: '#42A5F5' }
  ];

  // 지지 (Earthly Branches)
  const EARTHLY_BRANCHES = [
    { name: '자', hanja: '子', element: '수', animal: '쥐', yin: true, color: '#1565C0' },
    { name: '축', hanja: '丑', element: '토', animal: '소', yin: true, color: '#F9A825' },
    { name: '인', hanja: '寅', element: '목', animal: '호랑이', yin: false, color: '#2E7D32' },
    { name: '묘', hanja: '卯', element: '목', animal: '토끼', yin: true, color: '#4CAF50' },
    { name: '진', hanja: '辰', element: '토', animal: '용', yin: false, color: '#F9A825' },
    { name: '사', hanja: '巳', element: '화', animal: '뱀', yin: true, color: '#EF5350' },
    { name: '오', hanja: '午', element: '화', animal: '말', yin: false, color: '#C62828' },
    { name: '미', hanja: '未', element: '토', animal: '양', yin: true, color: '#FDD835' },
    { name: '신', hanja: '申', element: '금', animal: '원숭이', yin: false, color: '#757575' },
    { name: '유', hanja: '酉', element: '금', animal: '닭', yin: true, color: '#BDBDBD' },
    { name: '술', hanja: '戌', element: '토', animal: '개', yin: false, color: '#FF8F00' },
    { name: '해', hanja: '亥', element: '수', animal: '돼지', yin: true, color: '#42A5F5' }
  ];

  // 오행 (Five Elements)
  const FIVE_ELEMENTS = {
    '목': { name: '목', hanja: '木', meaning: '나무', color: '#4CAF50', produces: '화', controls: '토' },
    '화': { name: '화', hanja: '火', meaning: '불', color: '#F44336', produces: '토', controls: '금' },
    '토': { name: '토', hanja: '土', meaning: '흙', color: '#FFC107', produces: '금', controls: '수' },
    '금': { name: '금', hanja: '金', meaning: '쇠', color: '#9E9E9E', produces: '수', controls: '목' },
    '수': { name: '수', hanja: '水', meaning: '물', color: '#2196F3', produces: '목', controls: '화' }
  };

  // 시간대별 지지 매핑
  const HOUR_TO_BRANCH = [
    { start: 23, end: 1, branch: 0 },   // 자시 (23:00-01:00)
    { start: 1, end: 3, branch: 1 },    // 축시 (01:00-03:00)
    { start: 3, end: 5, branch: 2 },    // 인시 (03:00-05:00)
    { start: 5, end: 7, branch: 3 },    // 묘시 (05:00-07:00)
    { start: 7, end: 9, branch: 4 },    // 진시 (07:00-09:00)
    { start: 9, end: 11, branch: 5 },   // 사시 (09:00-11:00)
    { start: 11, end: 13, branch: 6 },  // 오시 (11:00-13:00)
    { start: 13, end: 15, branch: 7 },  // 미시 (13:00-15:00)
    { start: 15, end: 17, branch: 8 },  // 신시 (15:00-17:00)
    { start: 17, end: 19, branch: 9 },  // 유시 (17:00-19:00)
    { start: 19, end: 21, branch: 10 }, // 술시 (19:00-21:00)
    { start: 21, end: 23, branch: 11 }  // 해시 (21:00-23:00)
  ];

  // 음력 데이터 (1900-2100년 간략화된 버전)
  // 실제 구현에서는 완전한 만세력 데이터 필요
  const LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
    0x0d520
  ];

  // 절기 데이터 (매년 대략적인 날짜)
  const SOLAR_TERMS = [
    { name: '입춘', month: 2, day: 4 },
    { name: '우수', month: 2, day: 19 },
    { name: '경칩', month: 3, day: 6 },
    { name: '춘분', month: 3, day: 21 },
    { name: '청명', month: 4, day: 5 },
    { name: '곡우', month: 4, day: 20 },
    { name: '입하', month: 5, day: 6 },
    { name: '소만', month: 5, day: 21 },
    { name: '망종', month: 6, day: 6 },
    { name: '하지', month: 6, day: 21 },
    { name: '소서', month: 7, day: 7 },
    { name: '대서', month: 7, day: 23 },
    { name: '입추', month: 8, day: 8 },
    { name: '처서', month: 8, day: 23 },
    { name: '백로', month: 9, day: 8 },
    { name: '추분', month: 9, day: 23 },
    { name: '한로', month: 10, day: 8 },
    { name: '상강', month: 10, day: 24 },
    { name: '입동', month: 11, day: 8 },
    { name: '소설', month: 11, day: 22 },
    { name: '대설', month: 12, day: 7 },
    { name: '동지', month: 12, day: 22 },
    { name: '소한', month: 1, day: 6 },
    { name: '대한', month: 1, day: 20 }
  ];

  /**
   * 양력을 음력으로 변환
   */
  function solarToLunar(year, month, day) {
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(year, month - 1, day);
    let offset = Math.floor((targetDate - baseDate) / 86400000);

    let lunarYear = 1900;
    let lunarMonth = 1;
    let lunarDay = 1;
    let isLeap = false;

    for (let i = 1900; i < 2101 && offset > 0; i++) {
      const daysInYear = getLunarYearDays(i);
      if (offset < daysInYear) {
        lunarYear = i;
        break;
      }
      offset -= daysInYear;
    }

    const leapMonth = getLeapMonth(lunarYear);
    let isLeapYear = leapMonth > 0;

    for (let i = 1; i < 13 && offset > 0; i++) {
      let daysInMonth;

      if (isLeapYear && i === leapMonth + 1) {
        daysInMonth = getLeapDays(lunarYear);
        if (offset < daysInMonth) {
          isLeap = true;
          lunarMonth = i - 1;
          break;
        }
        offset -= daysInMonth;
      }

      daysInMonth = getLunarMonthDays(lunarYear, i);
      if (offset < daysInMonth) {
        lunarMonth = i;
        break;
      }
      offset -= daysInMonth;
    }

    lunarDay = offset + 1;

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap: isLeap
    };
  }

  function getLunarYearDays(year) {
    let sum = 348;
    const info = LUNAR_INFO[year - 1900];
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (info & i) ? 1 : 0;
    }
    return sum + getLeapDays(year);
  }

  function getLeapMonth(year) {
    return LUNAR_INFO[year - 1900] & 0xf;
  }

  function getLeapDays(year) {
    if (getLeapMonth(year)) {
      return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }

  function getLunarMonthDays(year, month) {
    return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
  }

  /**
   * 연주(年柱) 계산 - 입춘 기준
   */
  function getYearPillar(year, month, day) {
    // 입춘 전이면 전년도로 계산
    const lichun = getSolarTerm(year, '입춘');
    if (month < lichun.month || (month === lichun.month && day < lichun.day)) {
      year -= 1;
    }

    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;

    return {
      stem: HEAVENLY_STEMS[stemIndex],
      branch: EARTHLY_BRANCHES[branchIndex]
    };
  }

  /**
   * 월주(月柱) 계산 - 절기 기준
   */
  function getMonthPillar(year, month, day) {
    // 절기에 따른 월 보정
    const monthBranch = getMonthBranchBySolarTerm(year, month, day);

    // 월주 천간 계산 (연간에 따라 결정)
    const yearPillar = getYearPillar(year, month, day);
    const yearStemIndex = HEAVENLY_STEMS.indexOf(yearPillar.stem);

    // 월간 계산 공식: (연간 * 2 + 월지) % 10
    const monthStemIndex = ((yearStemIndex % 5) * 2 + monthBranch) % 10;

    return {
      stem: HEAVENLY_STEMS[monthStemIndex],
      branch: EARTHLY_BRANCHES[monthBranch]
    };
  }

  function getMonthBranchBySolarTerm(year, month, day) {
    // 각 월의 절입일 기준 지지
    // 인월(1월) = 입춘, 묘월(2월) = 경칩, ...
    const monthStartTerms = [
      { term: '입춘', branch: 2 },   // 인월
      { term: '경칩', branch: 3 },   // 묘월
      { term: '청명', branch: 4 },   // 진월
      { term: '입하', branch: 5 },   // 사월
      { term: '망종', branch: 6 },   // 오월
      { term: '소서', branch: 7 },   // 미월
      { term: '입추', branch: 8 },   // 신월
      { term: '백로', branch: 9 },   // 유월
      { term: '한로', branch: 10 },  // 술월
      { term: '입동', branch: 11 },  // 해월
      { term: '대설', branch: 0 },   // 자월
      { term: '소한', branch: 1 }    // 축월
    ];

    // 현재 날짜에 해당하는 절기 찾기
    for (let i = 0; i < monthStartTerms.length; i++) {
      const termInfo = getSolarTerm(year, monthStartTerms[i].term);
      const nextTermInfo = getSolarTerm(year, monthStartTerms[(i + 1) % 12].term);

      const currentDate = new Date(year, month - 1, day);
      const termDate = new Date(year, termInfo.month - 1, termInfo.day);

      if (currentDate >= termDate) {
        // 다음 절기 전이면 현재 월
        if (i === 11) {
          // 소한 이후는 축월
          return 1;
        }
        const nextDate = new Date(year, nextTermInfo.month - 1, nextTermInfo.day);
        if (currentDate < nextDate) {
          return monthStartTerms[i].branch;
        }
      }
    }

    // 기본값: 대략적인 월 계산
    return ((month + 1) % 12);
  }

  function getSolarTerm(year, termName) {
    const term = SOLAR_TERMS.find(t => t.name === termName);
    if (term) {
      // 실제로는 매년 약간씩 다르지만 근사값 사용
      return { month: term.month, day: term.day };
    }
    return { month: 1, day: 1 };
  }

  /**
   * 일주(日柱) 계산
   */
  function getDayPillar(year, month, day) {
    // 기준일: 1900년 1월 1일 = 갑진일
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((targetDate - baseDate) / 86400000);

    // 1900년 1월 1일은 갑진일 (천간 0, 지지 4)
    const stemIndex = (daysDiff + 0) % 10;
    const branchIndex = (daysDiff + 4) % 12;

    return {
      stem: HEAVENLY_STEMS[(stemIndex + 10) % 10],
      branch: EARTHLY_BRANCHES[(branchIndex + 12) % 12]
    };
  }

  /**
   * 시주(時柱) 계산
   */
  function getHourPillar(year, month, day, hour) {
    if (hour === null || hour === undefined) {
      return null;
    }

    // 시간에 해당하는 지지 찾기
    let branchIndex = 0;
    for (const mapping of HOUR_TO_BRANCH) {
      if (mapping.start > mapping.end) {
        // 자시 (23:00-01:00)
        if (hour >= mapping.start || hour < mapping.end) {
          branchIndex = mapping.branch;
          break;
        }
      } else {
        if (hour >= mapping.start && hour < mapping.end) {
          branchIndex = mapping.branch;
          break;
        }
      }
    }

    // 시간 천간 계산 (일간에 따라 결정)
    const dayPillar = getDayPillar(year, month, day);
    const dayStemIndex = HEAVENLY_STEMS.indexOf(dayPillar.stem);

    // 시간 천간 공식: (일간 * 2 + 시지) % 10
    const hourStemIndex = ((dayStemIndex % 5) * 2 + branchIndex) % 10;

    return {
      stem: HEAVENLY_STEMS[hourStemIndex],
      branch: EARTHLY_BRANCHES[branchIndex]
    };
  }

  /**
   * 사주팔자 전체 계산
   */
  function calculateSaju(birthYear, birthMonth, birthDay, birthHour, gender) {
    const yearPillar = getYearPillar(birthYear, birthMonth, birthDay);
    const monthPillar = getMonthPillar(birthYear, birthMonth, birthDay);
    const dayPillar = getDayPillar(birthYear, birthMonth, birthDay);
    const hourPillar = getHourPillar(birthYear, birthMonth, birthDay, birthHour);

    const pillars = {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    };

    // 오행 분포 계산
    const elementDistribution = calculateElementDistribution(pillars);

    // 음양 밸런스 계산
    const yinYangBalance = calculateYinYangBalance(pillars);

    // 일간 (일주의 천간) - 본인을 나타냄
    const dayMaster = dayPillar.stem;

    return {
      pillars,
      elementDistribution,
      yinYangBalance,
      dayMaster,
      gender
    };
  }

  /**
   * 오행 분포 계산
   */
  function calculateElementDistribution(pillars) {
    const distribution = {
      '목': 0,
      '화': 0,
      '토': 0,
      '금': 0,
      '수': 0
    };

    const allElements = [];

    // 천간의 오행
    if (pillars.year) {
      allElements.push(pillars.year.stem.element);
      allElements.push(pillars.year.branch.element);
    }
    if (pillars.month) {
      allElements.push(pillars.month.stem.element);
      allElements.push(pillars.month.branch.element);
    }
    if (pillars.day) {
      allElements.push(pillars.day.stem.element);
      allElements.push(pillars.day.branch.element);
    }
    if (pillars.hour) {
      allElements.push(pillars.hour.stem.element);
      allElements.push(pillars.hour.branch.element);
    }

    allElements.forEach(element => {
      distribution[element]++;
    });

    return distribution;
  }

  /**
   * 음양 밸런스 계산
   */
  function calculateYinYangBalance(pillars) {
    let yin = 0;
    let yang = 0;

    const checkYinYang = (item) => {
      if (item) {
        if (item.yin) yin++;
        else yang++;
      }
    };

    if (pillars.year) {
      checkYinYang(pillars.year.stem);
      checkYinYang(pillars.year.branch);
    }
    if (pillars.month) {
      checkYinYang(pillars.month.stem);
      checkYinYang(pillars.month.branch);
    }
    if (pillars.day) {
      checkYinYang(pillars.day.stem);
      checkYinYang(pillars.day.branch);
    }
    if (pillars.hour) {
      checkYinYang(pillars.hour.stem);
      checkYinYang(pillars.hour.branch);
    }

    return { yin, yang };
  }

  /**
   * 대운 계산
   */
  function calculateDaeun(saju, birthYear, birthMonth, birthDay, gender) {
    const daeunList = [];
    const yearPillar = saju.pillars.year;
    const monthPillar = saju.pillars.month;

    // 남자 양년생/여자 음년생: 순행
    // 남자 음년생/여자 양년생: 역행
    const yearStemYin = yearPillar.stem.yin;
    const isMale = gender === 'male';
    const forward = (isMale && !yearStemYin) || (!isMale && yearStemYin);

    // 월주부터 시작
    let currentStemIndex = HEAVENLY_STEMS.indexOf(monthPillar.stem);
    let currentBranchIndex = EARTHLY_BRANCHES.indexOf(monthPillar.branch);

    // 대운 시작 나이 계산 (간략화된 버전)
    // 실제로는 절기까지의 일수로 계산
    const startAge = calculateDaeunStartAge(birthYear, birthMonth, birthDay, forward);

    for (let i = 0; i < 10; i++) {
      if (forward) {
        currentStemIndex = (currentStemIndex + 1) % 10;
        currentBranchIndex = (currentBranchIndex + 1) % 12;
      } else {
        currentStemIndex = (currentStemIndex - 1 + 10) % 10;
        currentBranchIndex = (currentBranchIndex - 1 + 12) % 12;
      }

      const age = startAge + (i * 10);
      const year = birthYear + age;

      daeunList.push({
        order: i + 1,
        stem: HEAVENLY_STEMS[currentStemIndex],
        branch: EARTHLY_BRANCHES[currentBranchIndex],
        startAge: age,
        endAge: age + 9,
        startYear: year,
        endYear: year + 9
      });
    }

    return daeunList;
  }

  function calculateDaeunStartAge(birthYear, birthMonth, birthDay, forward) {
    // 간략화된 대운 시작 나이 계산
    // 실제로는 생일부터 다음(또는 이전) 절기까지의 일수를 3으로 나눔

    // 근사값으로 계산
    const monthStartTerms = [
      { month: 2, day: 4 },   // 입춘
      { month: 3, day: 6 },   // 경칩
      { month: 4, day: 5 },   // 청명
      { month: 5, day: 6 },   // 입하
      { month: 6, day: 6 },   // 망종
      { month: 7, day: 7 },   // 소서
      { month: 8, day: 8 },   // 입추
      { month: 9, day: 8 },   // 백로
      { month: 10, day: 8 },  // 한로
      { month: 11, day: 8 },  // 입동
      { month: 12, day: 7 },  // 대설
      { month: 1, day: 6 }    // 소한
    ];

    // 가장 가까운 절기 찾기
    let minDays = 365;

    for (const term of monthStartTerms) {
      const termDate = new Date(birthYear, term.month - 1, term.day);
      const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

      let daysDiff;
      if (forward) {
        daysDiff = Math.floor((termDate - birthDate) / 86400000);
        if (daysDiff < 0) {
          const nextYearTermDate = new Date(birthYear + 1, term.month - 1, term.day);
          daysDiff = Math.floor((nextYearTermDate - birthDate) / 86400000);
        }
      } else {
        daysDiff = Math.floor((birthDate - termDate) / 86400000);
        if (daysDiff < 0) {
          const prevYearTermDate = new Date(birthYear - 1, term.month - 1, term.day);
          daysDiff = Math.floor((birthDate - prevYearTermDate) / 86400000);
        }
      }

      if (daysDiff >= 0 && daysDiff < minDays) {
        minDays = daysDiff;
      }
    }

    // 3일 = 1년으로 계산
    return Math.round(minDays / 3);
  }

  /**
   * 세운(연운) 계산
   */
  function calculateSaeun(targetYear) {
    const stemIndex = (targetYear - 4) % 10;
    const branchIndex = (targetYear - 4) % 12;

    return {
      year: targetYear,
      stem: HEAVENLY_STEMS[stemIndex],
      branch: EARTHLY_BRANCHES[branchIndex]
    };
  }

  /**
   * 현재 대운 찾기
   */
  function getCurrentDaeun(daeunList, currentAge) {
    for (const daeun of daeunList) {
      if (currentAge >= daeun.startAge && currentAge <= daeun.endAge) {
        return daeun;
      }
    }
    return daeunList[0];
  }

  /**
   * 일진(오늘의 사주) 계산
   */
  function getTodayPillar() {
    const today = new Date();
    return getDayPillar(today.getFullYear(), today.getMonth() + 1, today.getDate());
  }

  // Public API
  return {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    FIVE_ELEMENTS,
    calculateSaju,
    calculateDaeun,
    calculateSaeun,
    getCurrentDaeun,
    getTodayPillar,
    solarToLunar,
    getYearPillar,
    getMonthPillar,
    getDayPillar,
    getHourPillar
  };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SajuEngine;
}
