// lib/sample-data.ts
// 샘플 데이터: 분류기의 3가지 결과(official/inactive/normal)를 모두 보여주도록 설계.

const NOW_S = Math.floor(Date.now() / 1000);
const DAY = 86400;

// helper
const make = (value: string, daysAgo: number) => ({
  title: '',
  media_list_data: [],
  string_list_data: [{
    href: `https://www.instagram.com/${value}`,
    value,
    timestamp: NOW_S - daysAgo * DAY,
  }],
});

export const SAMPLE_FOLLOWING_JSON = {
  relationships_following: [
    // ── 정상 친구들 (맞팔 또는 일반 일방 팔로우)
    ...['jonghyun.dev', 'hannah_kim', 'jiwoo.park', 'soyeon_lee',
        'haru_walks', 'design.studio', 'minimal.life', 'cafe.chuncheon',
        'frontend.daily', 'travel.korea',
    ].map((v, i) => make(v, i * 3)),

    // ── 공식 계정들 (학교, 공공, 브랜드, 연예인, 크리에이터)
    make('seoul_city_official',    400),  // public + brand
    make('kangwon_university',     250),  // school
    make('chuncheon_gu_office',    180),  // public
    make('nike_korea_official',    320),  // brand
    make('vogue_korea_official',   600),  // brand
    make('artist_iu_official',     150),  // celeb + brand
    make('youtuber_creator_kr',    200),  // influencer
    make('홍대학생회',              120),  // school (한국어)

    // ── 비활성/봇 의심 계정들
    make('user_38291',             420),  // 숫자5 + 1년+
    make('xkqzj_77',               510),  // 모음없음 + 1년+
    make('photo_bot_kr_2023',      800),  // bot + 4자리 + 2년+
    make('jjwxyz1234',             600),  // 4자리 + 모음없음
    make('mng_x_2022',             730),  // 자동생성 + 2년+
  ],
};

export const SAMPLE_FOLLOWERS_JSON = [
  // 맞팔하는 친구들 (위 following 과 겹침)
  'jonghyun.dev', 'hannah_kim', 'jiwoo.park', 'soyeon_lee', 'haru_walks',
  'design.studio', 'frontend.daily',

  // 나만 팔로우하는 사람 (fans)
  'random_fan_01', 'lurker_kim', 'silent_yang',
].map((value, i) => make(value, i * 2)).map((item) => ({
  // followers JSON 은 string_list_data 만 있는 단순 객체
  string_list_data: item.string_list_data,
}));
