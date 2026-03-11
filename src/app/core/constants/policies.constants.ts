import { CandidatePolicy } from '../models/election.models';

export const CANDIDATE_POLICIES: Record<number, CandidatePolicy[]> = {
  8: [
    { category: 'การเดินทาง', description: 'รถเมล์ไฟฟ้าครอบคลุมทุกเส้นทาง เชื่อมต่อล้อ-ราง-เรือ' },
    { category: 'โปร่งใส', description: 'เปิดเผยข้อมูล Open Data และ Open Contract ทุกขั้นตอน' },
    { category: 'สิ่งแวดล้อม', description: 'เพิ่มสวนสาธารณะขนาดเล็ก (Pocket Park) ทั่วกรุงเทพฯ' }
  ],
  4: [
    { category: 'การศึกษา', description: 'โรงเรียนสังกัด กทม. คุณภาพเท่าเทียม กองทุนเพื่อการศึกษา' },
    { category: 'น้ำท่วม', description: 'แก้มลิงใต้ดินอัตโนมัติ แก้ไขปัญหาน้ำท่วมซ้ำซาก' }
  ],
  1: [
    { category: 'สวัสดิการ', description: 'บำนาญผู้สูงอายุ 3,000 บาท และสวัสดิการเด็กแรกเกิด' },
    { category: 'ความปลอดภัย', description: 'เปลี่ยนเมืองพังๆ ให้เป็นเมืองที่ทุกคนเดินได้ปลอดภัย' }
  ]
};

export const DEFAULT_POLICIES: CandidatePolicy[] = [
  { category: 'ทั่วไป', description: 'พัฒนาระบบสาธารณูปโภคและโครงสร้างพื้นฐานเพื่อคุณภาพชีวิตที่ดีขึ้น' },
  { category: 'บริการสาธารณะ', description: 'ยกระดับการให้บริการประชาชนด้วยระบบดิจิทัล' }
];
