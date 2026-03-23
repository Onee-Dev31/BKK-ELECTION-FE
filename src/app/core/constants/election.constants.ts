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
        8: '#22c55e', // ชัชชาติ
        4: '#3b82f6', // สุชัชวีร์
        1: '#f97316', // วิโรจน์
        3: '#0ea5e9', // สกลธี
        6: '#a855f7', // อัศวิน
        7: '#ec4899', // รสนา
        def: '#000000ff'
    } as Record<number | string, string>,
    NAME_PREFIXES: ['นาย', 'นางสาว', 'น.ต.', 'พล.ต.อ.', 'ดร.', 'ศ.ดร.']
};
