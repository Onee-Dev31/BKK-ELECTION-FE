import { environment } from '../../../environments/environment';

export const ELECTION_CONSTANTS = {
    API: {
        SUMMARY: environment.api.summary,
        DISTRICTS: environment.api.districts
    },
    ASSETS: {
        CANDIDATE_IMAGE: 'https://storage.googleapis.com/ers-static/candidates/governor/No{no}.jpg',
        PARTY_LOGO: 'https://storage.googleapis.com/ers-static/parties/{id}.png'
    },
    CANDIDATE_COLORS: {
        1: '#f97316', // วิโรจน์
        2: '#000000ff', // หญิงฐิฏา
        3: '#0ea5e9', // สกลธี
        4: '#7a427cff', // สุชัชวีร์
        5: '#a8a8a8ff', // วีรชัย
        6: '#a855f7', // อัศวิน
        7: '#ec4899', // รสนา
        8: '#22c55e', // ชัชชาติ
        9: '#ff0000ff', // วัชรี
        10: '#ffe600ff', // ศุภชัย
        11: '#2600ffff', // ศิธา
        12: '#555a0fff', // ประยูร
        13: '#411111ff', // พิศาล
        14: '#2d1d42ff', // ธเนตร
        15: '#6ed3b5ff', // ทูตปรีชา
        def: '#644545ff'
    } as Record<number | string, string>,
    NAME_PREFIXES: ['นาย', 'นางสาว', 'น.ต.', 'พล.ต.อ.', 'ดร.', 'ศ.ดร.']
};
