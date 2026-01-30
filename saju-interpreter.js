/**
 * 사주 해석 엔진 (Saju Interpretation Engine)
 * 20년 경력 사주 명리 전문가의 관점을 담은 해석 시스템
 * 모든 해석은 통계적/경향적 관점으로 작성
 */

const SajuInterpreter = (function() {

  // 일간별 기본 성향 (본인의 성격)
  const DAY_MASTER_TRAITS = {
    '갑': {
      name: '갑목(甲木)',
      symbol: '큰 나무',
      traits: [
        '곧은 성품과 뚜렷한 주관을 가지는 경향이 있습니다',
        '새로운 것을 시작하는 능력이 뛰어날 가능성이 높습니다',
        '정의감이 강하고 리더십을 발휘하려는 성향이 보입니다',
        '때로는 융통성이 부족하게 느껴질 수 있습니다'
      ],
      career: ['경영자', '정치인', '교육자', '건축가', '목재/가구 관련업'],
      caution: '지나친 고집은 대인관계에서 마찰을 일으킬 수 있습니다'
    },
    '을': {
      name: '을목(乙木)',
      symbol: '풀과 덩굴',
      traits: [
        '유연하고 적응력이 뛰어난 경향이 있습니다',
        '예술적 감각과 섬세함을 갖추고 있을 가능성이 높습니다',
        '타인과의 조화를 중요시하는 성향이 보입니다',
        '환경에 따라 다양한 모습을 보여줄 수 있습니다'
      ],
      career: ['예술가', '디자이너', '상담사', '플로리스트', '패션 관련업'],
      caution: '우유부단함이 결정적인 순간에 방해가 될 수 있습니다'
    },
    '병': {
      name: '병화(丙火)',
      symbol: '태양',
      traits: [
        '밝고 긍정적인 에너지를 가지는 경향이 있습니다',
        '열정적이고 적극적으로 행동하는 성향이 보입니다',
        '주변 사람들에게 영향력을 미치기 쉬운 편입니다',
        '자신감이 넘치고 표현력이 뛰어날 가능성이 높습니다'
      ],
      career: ['방송인', '연예인', '마케터', '영업직', '에너지 관련업'],
      caution: '과도한 자신감이 오만으로 비춰질 수 있습니다'
    },
    '정': {
      name: '정화(丁火)',
      symbol: '촛불',
      traits: [
        '섬세하고 따뜻한 마음을 가지는 경향이 있습니다',
        '집중력과 끈기가 강한 성향이 보입니다',
        '내면의 열정을 은근히 드러내는 편입니다',
        '문화예술에 대한 감수성이 뛰어날 가능성이 높습니다'
      ],
      career: ['작가', '연구원', '요리사', '조명디자이너', '문화예술 관련업'],
      caution: '내성적인 면이 기회를 놓치게 할 수 있습니다'
    },
    '무': {
      name: '무토(戊土)',
      symbol: '산',
      traits: [
        '든든하고 신뢰감을 주는 경향이 있습니다',
        '포용력이 크고 중심을 잡아주는 역할을 하기 쉽습니다',
        '변화보다는 안정을 추구하는 성향이 보입니다',
        '책임감이 강하고 의리를 중시할 가능성이 높습니다'
      ],
      career: ['부동산업', '금융업', '공무원', '농업', '건설업'],
      caution: '변화에 대한 저항이 발전을 더디게 할 수 있습니다'
    },
    '기': {
      name: '기토(己土)',
      symbol: '논밭',
      traits: [
        '현실적이고 실용적인 사고를 하는 경향이 있습니다',
        '타인을 돌보고 양육하는 성향이 보입니다',
        '꼼꼼하고 세심하게 일을 처리하기 쉽습니다',
        '인내심이 강하고 성실할 가능성이 높습니다'
      ],
      career: ['농업', '식품업', '간호사', '사회복지사', '교육자'],
      caution: '지나친 걱정이 행동력을 저하시킬 수 있습니다'
    },
    '경': {
      name: '경금(庚金)',
      symbol: '바위/철',
      traits: [
        '단호하고 결단력이 있는 경향이 있습니다',
        '정의롭고 원칙을 중시하는 성향이 보입니다',
        '추진력과 실행력이 뛰어나기 쉽습니다',
        '강인한 정신력을 가지고 있을 가능성이 높습니다'
      ],
      career: ['군인', '경찰', '외과의사', '기계공학', '금속/광업'],
      caution: '과도한 강직함이 주변과의 마찰을 일으킬 수 있습니다'
    },
    '신': {
      name: '신금(辛金)',
      symbol: '보석',
      traits: [
        '예민하고 섬세한 감각을 가지는 경향이 있습니다',
        '완벽주의 성향이 있고 품격을 중시합니다',
        '날카로운 분석력과 비평 능력이 뛰어나기 쉽습니다',
        '아름다움과 가치에 대한 안목이 있을 가능성이 높습니다'
      ],
      career: ['보석디자이너', '감정사', '비평가', '외교관', '금융분석가'],
      caution: '예민함이 스트레스로 이어지기 쉽습니다'
    },
    '임': {
      name: '임수(壬水)',
      symbol: '바다/강',
      traits: [
        '지혜롭고 포용력이 큰 경향이 있습니다',
        '자유로운 사고와 창의성이 뛰어난 성향이 보입니다',
        '변화를 두려워하지 않고 모험을 즐기기 쉽습니다',
        '직관력과 통찰력이 뛰어날 가능성이 높습니다'
      ],
      career: ['무역업', '운송업', '철학자', '심리학자', '유통업'],
      caution: '방향성 없는 자유로움이 산만함으로 이어질 수 있습니다'
    },
    '계': {
      name: '계수(癸水)',
      symbol: '비/이슬',
      traits: [
        '섬세하고 감성적인 경향이 있습니다',
        '직관력이 뛰어나고 영감이 풍부한 성향이 보입니다',
        '적응력이 좋고 변화에 유연하게 대처하기 쉽습니다',
        '사색적이고 깊이 있는 사고를 할 가능성이 높습니다'
      ],
      career: ['예술가', '작가', '연구원', '종교인', '심리상담사'],
      caution: '지나친 감성이 현실적 판단을 흐리게 할 수 있습니다'
    }
  };

  // 오행 과다/부족에 따른 해석
  const ELEMENT_ANALYSIS = {
    '목': {
      excess: {
        traits: '추진력과 성장 욕구가 강한 편입니다',
        advice: '때로는 멈추고 성찰하는 시간이 필요할 수 있습니다',
        health: '간, 담낭, 눈 건강에 신경 쓰시는 것이 좋겠습니다'
      },
      deficiency: {
        traits: '시작하는 힘이나 결단력이 부족하게 느껴질 수 있습니다',
        advice: '새로운 도전을 두려워하지 않는 마음가짐이 도움이 됩니다',
        health: '간 기능 강화에 도움이 되는 활동을 권장합니다'
      },
      balance: '성장과 안정 사이에서 균형을 잘 잡을 가능성이 있습니다'
    },
    '화': {
      excess: {
        traits: '열정적이고 에너지가 넘치는 경향이 있습니다',
        advice: '감정 조절과 인내심 기르기가 도움이 될 수 있습니다',
        health: '심장, 혈압, 눈 건강 관리를 권장합니다'
      },
      deficiency: {
        traits: '표현력이나 적극성이 부족하게 느껴질 수 있습니다',
        advice: '자신감을 키우고 적극적으로 자신을 표현해 보세요',
        health: '순환계 건강과 활력 증진에 신경 쓰시길 권합니다'
      },
      balance: '열정과 냉정함을 적절히 조절할 수 있는 편입니다'
    },
    '토': {
      excess: {
        traits: '안정을 추구하고 신중한 경향이 강합니다',
        advice: '때로는 변화를 받아들이는 유연함이 필요합니다',
        health: '소화기 건강과 비장 기능에 주의하세요'
      },
      deficiency: {
        traits: '중심을 잡기 어렵거나 변덕스러울 수 있습니다',
        advice: '일상의 규칙적인 패턴을 만드는 것이 도움이 됩니다',
        health: '소화기 건강 관리를 권장합니다'
      },
      balance: '안정감과 유연성을 균형 있게 갖추고 있는 편입니다'
    },
    '금': {
      excess: {
        traits: '원칙적이고 결단력이 강한 경향이 있습니다',
        advice: '타인의 의견도 수용하는 열린 마음이 도움이 됩니다',
        health: '폐, 대장, 피부 건강에 신경 쓰시길 권합니다'
      },
      deficiency: {
        traits: '결단력이나 실행력이 부족하게 느껴질 수 있습니다',
        advice: '명확한 목표 설정과 단호한 결정 연습이 필요합니다',
        health: '호흡기 건강 관리를 권장합니다'
      },
      balance: '결단력과 유연성을 잘 조화시킬 수 있는 편입니다'
    },
    '수': {
      excess: {
        traits: '지혜롭고 사고력이 뛰어난 경향이 있습니다',
        advice: '생각만 하지 말고 실천으로 옮기는 것이 중요합니다',
        health: '신장, 방광, 뼈 건강에 주의하세요'
      },
      deficiency: {
        traits: '유연성이나 직관력이 부족하게 느껴질 수 있습니다',
        advice: '다양한 관점에서 생각해보는 연습이 도움이 됩니다',
        health: '수분 섭취와 신장 건강 관리를 권장합니다'
      },
      balance: '지혜와 실행력을 균형 있게 갖추고 있는 편입니다'
    }
  };

  // 직업/재능 관점 해석
  const CAREER_INTERPRETATIONS = {
    // 일간과 오행 조합에 따른 직업 적성
    leadership: {
      strong: '리더십을 발휘할 수 있는 위치가 어울릴 가능성이 높습니다. 조직을 이끌거나 독립적으로 일하는 환경에서 능력을 발휘하기 쉽습니다.',
      moderate: '팀 내에서 중요한 역할을 맡되, 최전선보다는 참모 역할이 맞을 수 있습니다.',
      weak: '팀원으로서 협력하며 전문성을 키워나가는 것이 더 어울릴 수 있습니다.'
    },
    creativity: {
      strong: '창의적인 분야에서 재능을 발휘할 가능성이 높습니다. 예술, 디자인, 콘텐츠 제작 등이 적성에 맞을 수 있습니다.',
      moderate: '창의성과 체계성을 함께 요구하는 분야가 어울릴 수 있습니다.',
      weak: '정해진 규칙과 시스템 안에서 일하는 것이 더 편안할 수 있습니다.'
    },
    analytical: {
      strong: '분석력과 논리적 사고가 뛰어난 편입니다. 연구, 데이터 분석, 전략 기획 등의 분야가 맞을 가능성이 있습니다.',
      moderate: '분석과 실행을 균형 있게 할 수 있는 역할이 어울립니다.',
      weak: '직관과 감각에 의존하는 분야가 더 맞을 수 있습니다.'
    },
    social: {
      strong: '사람을 대하는 일에 강점이 있을 가능성이 높습니다. 영업, 상담, 교육 등의 분야가 적성에 맞을 수 있습니다.',
      moderate: '적당한 대인관계가 필요한 업무 환경이 어울립니다.',
      weak: '혼자 집중해서 일할 수 있는 환경이 더 편안할 수 있습니다.'
    }
  };

  // 재물/금전 관점 해석
  const WEALTH_INTERPRETATIONS = {
    accumulation: {
      strong: '재물을 모으고 유지하는 능력이 있는 편입니다. 저축과 투자에 관심을 가지면 좋은 결과가 있을 가능성이 있습니다.',
      moderate: '수입과 지출의 균형을 잘 맞추는 편입니다.',
      weak: '재물이 들어와도 나가기 쉬운 흐름이 있어 관리에 신경 쓰는 것이 좋겠습니다.'
    },
    earning: {
      active: '적극적으로 기회를 찾아 수입을 만들어내는 스타일일 가능성이 있습니다.',
      passive: '안정적인 수입원에서 꾸준히 쌓아가는 방식이 맞을 수 있습니다.',
      mixed: '다양한 수입원을 가지는 것이 유리할 수 있습니다.'
    },
    investment: {
      aggressive: '위험을 감수한 투자에서 큰 수익을 얻을 가능성이 있으나, 손실 위험도 존재합니다.',
      conservative: '안전한 투자 방식이 어울리며, 장기적 관점의 투자가 유리할 수 있습니다.',
      balanced: '분산 투자와 중장기적 전략이 적합할 수 있습니다.'
    }
  };

  // 인간관계 관점 해석
  const RELATIONSHIP_INTERPRETATIONS = {
    style: {
      extrovert: '활발한 사교 활동을 통해 에너지를 얻는 경향이 있습니다. 넓은 인맥이 도움이 될 가능성이 높습니다.',
      introvert: '소수의 깊은 관계를 선호하는 편입니다. 신뢰할 수 있는 몇 명과의 관계가 중요할 수 있습니다.',
      ambivert: '상황에 따라 유연하게 대처할 수 있는 편입니다.'
    },
    compatibility: {
      similar: '비슷한 성향의 사람들과 잘 어울리는 경향이 있습니다.',
      complementary: '자신과 다른 성향의 사람에게서 배울 점이 많을 수 있습니다.',
      flexible: '다양한 유형의 사람들과 관계를 맺을 수 있는 편입니다.'
    },
    conflict: {
      direct: '갈등 상황에서 직접적으로 해결하려는 경향이 있습니다. 감정 조절에 주의가 필요할 수 있습니다.',
      avoidant: '갈등을 피하려는 성향이 있어, 때로는 문제가 쌓일 수 있습니다.',
      mediator: '중재자 역할을 잘 하는 편이나, 자신의 입장을 명확히 하는 것도 필요합니다.'
    }
  };

  // 대운 해석
  const DAEUN_INTERPRETATIONS = {
    '목': {
      theme: '성장과 발전의 시기',
      opportunity: '새로운 시작, 학습, 자기계발에 유리한 흐름이 형성될 가능성이 있습니다.',
      caution: '조급함을 경계하고 차근차근 기반을 다지는 것이 좋겠습니다.'
    },
    '화': {
      theme: '확장과 표현의 시기',
      opportunity: '자신을 알리고 활동 영역을 넓히기에 좋은 시기일 수 있습니다.',
      caution: '과도한 열정이 소진으로 이어지지 않도록 페이스 조절이 필요합니다.'
    },
    '토': {
      theme: '안정과 결실의 시기',
      opportunity: '그동안의 노력이 결실을 맺을 가능성이 있는 시기입니다.',
      caution: '현상 유지에 안주하지 말고 다음 단계를 준비하는 것이 좋겠습니다.'
    },
    '금': {
      theme: '정리와 수확의 시기',
      opportunity: '성과를 거두고 정리하는 데 유리한 흐름일 수 있습니다.',
      caution: '지나친 완벽주의로 인한 스트레스에 주의하세요.'
    },
    '수': {
      theme: '지혜와 준비의 시기',
      opportunity: '깊이 있는 사고와 내면 성장에 좋은 시기일 가능성이 있습니다.',
      caution: '생각만 하고 실천하지 않는 것을 경계해야 합니다.'
    }
  };

  /**
   * 종합 해석 생성
   */
  function generateInterpretation(saju, daeun) {
    const dayMaster = saju.dayMaster;
    const elements = saju.elementDistribution;
    const yinYang = saju.yinYangBalance;

    const interpretation = {
      basic: generateBasicInterpretation(dayMaster, elements, yinYang),
      career: generateCareerInterpretation(dayMaster, elements),
      wealth: generateWealthInterpretation(dayMaster, elements),
      relationship: generateRelationshipInterpretation(dayMaster, elements, yinYang),
      timing: generateTimingInterpretation(daeun, saju)
    };

    return interpretation;
  }

  function generateBasicInterpretation(dayMaster, elements, yinYang) {
    const masterInfo = DAY_MASTER_TRAITS[dayMaster.name];

    // 가장 많은 오행과 가장 적은 오행 찾기
    const sortedElements = Object.entries(elements).sort((a, b) => b[1] - a[1]);
    const strongestElement = sortedElements[0];
    const weakestElement = sortedElements[sortedElements.length - 1];

    const elementAnalysis = [];
    for (const [element, count] of sortedElements) {
      const analysis = ELEMENT_ANALYSIS[element];
      if (count >= 3) {
        elementAnalysis.push({
          element,
          status: 'excess',
          ...analysis.excess
        });
      } else if (count === 0) {
        elementAnalysis.push({
          element,
          status: 'deficiency',
          ...analysis.deficiency
        });
      } else {
        elementAnalysis.push({
          element,
          status: 'balance',
          description: analysis.balance
        });
      }
    }

    return {
      dayMaster: masterInfo,
      elementDistribution: elements,
      elementAnalysis,
      yinYang: {
        ...yinYang,
        description: yinYang.yin > yinYang.yang
          ? '음(陰)의 기운이 강한 편으로, 내향적이고 수용적인 성향이 있을 수 있습니다.'
          : yinYang.yang > yinYang.yin
            ? '양(陽)의 기운이 강한 편으로, 외향적이고 적극적인 성향이 있을 수 있습니다.'
            : '음양의 균형이 잘 잡혀 있어 상황에 따라 유연하게 대처할 수 있는 편입니다.'
      },
      strongestElement: {
        element: strongestElement[0],
        count: strongestElement[1]
      },
      weakestElement: {
        element: weakestElement[0],
        count: weakestElement[1]
      }
    };
  }

  function generateCareerInterpretation(dayMaster, elements) {
    const masterInfo = DAY_MASTER_TRAITS[dayMaster.name];
    const careers = masterInfo.career;

    // 오행 분포에 따른 적성 분석
    const leadership = elements['목'] + elements['화'] >= 4 ? 'strong' :
                      elements['목'] + elements['화'] >= 2 ? 'moderate' : 'weak';

    const creativity = elements['화'] + elements['수'] >= 4 ? 'strong' :
                      elements['화'] + elements['수'] >= 2 ? 'moderate' : 'weak';

    const analytical = elements['금'] + elements['수'] >= 4 ? 'strong' :
                      elements['금'] + elements['수'] >= 2 ? 'moderate' : 'weak';

    const social = elements['화'] + elements['토'] >= 4 ? 'strong' :
                  elements['화'] + elements['토'] >= 2 ? 'moderate' : 'weak';

    return {
      recommendedCareers: careers,
      aptitudes: {
        leadership: {
          level: leadership,
          description: CAREER_INTERPRETATIONS.leadership[leadership]
        },
        creativity: {
          level: creativity,
          description: CAREER_INTERPRETATIONS.creativity[creativity]
        },
        analytical: {
          level: analytical,
          description: CAREER_INTERPRETATIONS.analytical[analytical]
        },
        social: {
          level: social,
          description: CAREER_INTERPRETATIONS.social[social]
        }
      },
      caution: masterInfo.caution,
      summary: `${masterInfo.symbol}의 기운을 가진 분으로, ${masterInfo.traits[0]} 직업 선택에 있어 이러한 성향을 고려하시면 좋겠습니다.`
    };
  }

  function generateWealthInterpretation(dayMaster, elements) {
    // 재물 운 분석 (일간과 재성의 관계)
    const dayElement = dayMaster.element;
    const wealthElement = getControlledElement(dayElement);
    const wealthCount = elements[wealthElement];

    const accumulation = wealthCount >= 2 ? 'strong' :
                        wealthCount === 1 ? 'moderate' : 'weak';

    // 정재 vs 편재 성향 (간략화)
    const isYin = dayMaster.yin;
    const earningStyle = isYin ? 'passive' : 'active';

    // 투자 성향
    const waterFire = elements['수'] + elements['화'];
    const investmentStyle = waterFire >= 4 ? 'aggressive' :
                           elements['토'] + elements['금'] >= 4 ? 'conservative' : 'balanced';

    return {
      accumulation: {
        level: accumulation,
        description: WEALTH_INTERPRETATIONS.accumulation[accumulation]
      },
      earning: {
        style: earningStyle,
        description: WEALTH_INTERPRETATIONS.earning[earningStyle]
      },
      investment: {
        style: investmentStyle,
        description: WEALTH_INTERPRETATIONS.investment[investmentStyle]
      },
      wealthElement: {
        element: wealthElement,
        count: wealthCount
      },
      tips: [
        accumulation === 'weak' ? '재물 관리에 더 신경 쓰고, 충동적인 지출을 줄이는 것이 좋겠습니다.' :
        accumulation === 'strong' ? '재물 복이 있는 편이나, 욕심을 부리지 않는 것이 오히려 더 좋은 결과를 가져올 수 있습니다.' :
        '꾸준한 저축과 분산 투자로 안정적인 자산을 형성해 나가시길 권합니다.',

        investmentStyle === 'aggressive' ? '큰 수익을 노릴 수 있으나 리스크 관리에 주의하세요.' :
        investmentStyle === 'conservative' ? '안전한 투자가 어울리며, 장기적 관점을 유지하세요.' :
        '분산 투자와 균형 잡힌 포트폴리오 구성을 권장합니다.'
      ]
    };
  }

  function generateRelationshipInterpretation(dayMaster, elements, yinYang) {
    // 대인관계 스타일 분석
    const style = elements['화'] + elements['목'] >= 4 ? 'extrovert' :
                 elements['수'] + elements['금'] >= 4 ? 'introvert' : 'ambivert';

    const compatibility = elements['토'] >= 2 ? 'flexible' :
                         yinYang.yin > yinYang.yang ? 'similar' : 'complementary';

    const conflict = elements['화'] + elements['금'] >= 4 ? 'direct' :
                    elements['수'] + elements['목'] >= 4 ? 'avoidant' : 'mediator';

    // 어울리는 사람 유형 (오행 상생 기준)
    const producingElement = getProducingElement(dayMaster.element);
    const producedElement = getProducedElement(dayMaster.element);

    return {
      style: {
        type: style,
        description: RELATIONSHIP_INTERPRETATIONS.style[style]
      },
      compatibility: {
        type: compatibility,
        description: RELATIONSHIP_INTERPRETATIONS.compatibility[compatibility]
      },
      conflict: {
        type: conflict,
        description: RELATIONSHIP_INTERPRETATIONS.conflict[conflict]
      },
      bestMatch: {
        element: producingElement,
        description: `${SajuEngine.FIVE_ELEMENTS[producingElement].meaning}(${producingElement}) 기운이 강한 사람과 좋은 관계를 맺을 가능성이 있습니다.`
      },
      tips: [
        '모든 관계는 노력과 이해를 필요로 합니다. 사주는 경향성을 보여줄 뿐, 운명을 결정하지 않습니다.',
        style === 'introvert' ? '혼자만의 시간도 중요하지만, 가끔은 먼저 연락해 보세요.' :
        style === 'extrovert' ? '많은 사람을 만나되, 깊이 있는 관계에도 투자하세요.' :
        '상황에 맞게 유연하게 대처하되, 자신만의 원칙은 지키세요.'
      ]
    };
  }

  function generateTimingInterpretation(daeunList, saju) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - 30; // 예시용, 실제로는 생년 필요

    // 현재 세운
    const currentSaeun = SajuEngine.calculateSaeun(currentYear);

    // 월별 에너지 (간략화)
    const monthlyEnergy = [];
    for (let m = 1; m <= 12; m++) {
      const monthElement = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'][m - 1];
      monthlyEnergy.push({
        month: m,
        element: monthElement,
        description: getMonthDescription(m, monthElement, saju.dayMaster.element)
      });
    }

    return {
      currentYear: {
        year: currentYear,
        stem: currentSaeun.stem,
        branch: currentSaeun.branch,
        element: currentSaeun.stem.element,
        interpretation: DAEUN_INTERPRETATIONS[currentSaeun.stem.element]
      },
      daeunList: daeunList ? daeunList.map(d => ({
        ...d,
        interpretation: DAEUN_INTERPRETATIONS[d.stem.element]
      })) : [],
      monthlyEnergy,
      advice: '시간의 흐름은 고정된 운명이 아닌 가능성의 흐름입니다. 좋은 시기에는 더 적극적으로, 주의가 필요한 시기에는 신중하게 행동하시면 됩니다.'
    };
  }

  function getMonthDescription(month, monthElement, dayElement) {
    const relationship = getElementRelationship(dayElement, monthElement);
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    if (relationship === 'produce') {
      return `${monthNames[month - 1]}: 에너지를 쏟는 시기로, 적극적인 활동이 좋을 수 있습니다.`;
    } else if (relationship === 'produced') {
      return `${monthNames[month - 1]}: 도움을 받는 시기로, 새로운 기회가 있을 수 있습니다.`;
    } else if (relationship === 'control') {
      return `${monthNames[month - 1]}: 주도권을 가지는 시기로, 결단력이 필요할 수 있습니다.`;
    } else if (relationship === 'controlled') {
      return `${monthNames[month - 1]}: 압박을 느끼는 시기로, 인내심이 필요할 수 있습니다.`;
    } else {
      return `${monthNames[month - 1]}: 안정적인 시기로, 현상 유지에 좋을 수 있습니다.`;
    }
  }

  // 오행 상생상극 관계 헬퍼 함수
  function getProducingElement(element) {
    const producing = { '목': '수', '화': '목', '토': '화', '금': '토', '수': '금' };
    return producing[element];
  }

  function getProducedElement(element) {
    const produced = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
    return produced[element];
  }

  function getControlledElement(element) {
    const controlled = { '목': '토', '화': '금', '토': '수', '금': '목', '수': '화' };
    return controlled[element];
  }

  function getControllingElement(element) {
    const controlling = { '목': '금', '화': '수', '토': '목', '금': '화', '수': '토' };
    return controlling[element];
  }

  function getElementRelationship(element1, element2) {
    if (getProducedElement(element1) === element2) return 'produce';
    if (getProducingElement(element1) === element2) return 'produced';
    if (getControlledElement(element1) === element2) return 'control';
    if (getControllingElement(element1) === element2) return 'controlled';
    return 'same';
  }

  /**
   * 오늘의 팁 생성
   */
  function generateDailyTip(saju) {
    const todayPillar = SajuEngine.getTodayPillar();
    const dayElement = saju.dayMaster.element;
    const todayElement = todayPillar.stem.element;

    const relationship = getElementRelationship(dayElement, todayElement);

    const tips = {
      produce: {
        message: '오늘은 에너지를 발산하기 좋은 날입니다.',
        advice: '적극적인 활동과 표현이 좋은 결과를 가져올 수 있습니다.',
        color: SajuEngine.FIVE_ELEMENTS[todayElement].color,
        colorName: SajuEngine.FIVE_ELEMENTS[todayElement].meaning
      },
      produced: {
        message: '오늘은 도움과 지원을 받기 좋은 날입니다.',
        advice: '주변의 조언에 귀 기울이고, 협력을 구해보세요.',
        color: SajuEngine.FIVE_ELEMENTS[getProducingElement(dayElement)].color,
        colorName: SajuEngine.FIVE_ELEMENTS[getProducingElement(dayElement)].meaning
      },
      control: {
        message: '오늘은 주도적으로 이끌어가기 좋은 날입니다.',
        advice: '결단력을 발휘하고, 밀린 일을 처리해 보세요.',
        color: SajuEngine.FIVE_ELEMENTS[dayElement].color,
        colorName: SajuEngine.FIVE_ELEMENTS[dayElement].meaning
      },
      controlled: {
        message: '오늘은 신중함이 필요한 날입니다.',
        advice: '중요한 결정은 미루고, 충분히 검토한 후 행동하세요.',
        color: SajuEngine.FIVE_ELEMENTS[getProducingElement(dayElement)].color,
        colorName: SajuEngine.FIVE_ELEMENTS[getProducingElement(dayElement)].meaning
      },
      same: {
        message: '오늘은 안정적이고 평온한 날입니다.',
        advice: '일상적인 일에 집중하고, 무리하지 않는 것이 좋습니다.',
        color: SajuEngine.FIVE_ELEMENTS[dayElement].color,
        colorName: SajuEngine.FIVE_ELEMENTS[dayElement].meaning
      }
    };

    const tip = tips[relationship];

    return {
      date: new Date().toLocaleDateString('ko-KR'),
      todayPillar,
      relationship,
      ...tip,
      luckyDirection: getLuckyDirection(todayElement),
      luckyNumber: getLuckyNumber(todayElement)
    };
  }

  function getLuckyDirection(element) {
    const directions = {
      '목': '동쪽',
      '화': '남쪽',
      '토': '중앙',
      '금': '서쪽',
      '수': '북쪽'
    };
    return directions[element];
  }

  function getLuckyNumber(element) {
    const numbers = {
      '목': [3, 8],
      '화': [2, 7],
      '토': [5, 10],
      '금': [4, 9],
      '수': [1, 6]
    };
    return numbers[element];
  }

  // Public API
  return {
    DAY_MASTER_TRAITS,
    ELEMENT_ANALYSIS,
    FIVE_ELEMENTS: SajuEngine.FIVE_ELEMENTS,
    generateInterpretation,
    generateDailyTip,
    getElementRelationship
  };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SajuInterpreter;
}
