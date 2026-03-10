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
        def: '#64748b'
    } as Record<number | string, string>,
    DISTRICT_NAMES: [
        'พระนคร', 'ดุสิต', 'หนองจอก', 'บางรัก', 'บางเขน', 'บางกะปิ', 'ปทุมวัน',
        'ป้อมปราบศัตรูพ่าย', 'พระโขนง', 'มีนบุรี', 'ลาดกระบัง', 'ยานนาวา', 'สัมพันธวงศ์',
        'พญาไท', 'ธนบุรี', 'บางกอกใหญ่', 'ห้วยขวาง', 'คลองสาน', 'ตลิ่งชัน', 'บางกอกน้อย',
        'บางขุนเทียน', 'ภาษีเจริญ', 'หนองแขม', 'ราษฎร์บูรณะ', 'บางพลัด', 'ดินแดง',
        'บึงกุ่ม', 'สาทร', 'บางซื่อ', 'จตุจักร', 'บางคอแหลม', 'ประเวศ', 'คลองเตย',
        'สวนหลวง', 'จอมทอง', 'ดอนเมือง', 'ราชเทวี', 'ลาดพร้าว', 'วัฒนา', 'บางแค',
        'หลักสี่', 'สายไหม', 'คันนายาว', 'สะพานสูง', 'วังทองหลาง', 'คลองสามวา', 'บางนา',
        'ทวีวัฒนา', 'ทุ่งครุ', 'บางบอน'
    ],
    NAME_PREFIXES: ['นาย', 'นางสาว', 'น.ต.', 'พล.ต.อ.', 'ดร.', 'ศ.ดร.']
};
