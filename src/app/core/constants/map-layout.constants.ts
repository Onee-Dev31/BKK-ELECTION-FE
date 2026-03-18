export interface District {
  id: number;
  number: number;
  row: number;
  col: number;
  leadingCandidateId?: number;
}

// วิธีแก้ไขตำแหน่งบนแผนที่ (Honeycomb Grid):
// 1. row = แถวแนวนอน (เริ่มต้น 1 คือด้านบนสุด ยิ่งเลขมากยิ่งลงล่าง)
// 2. col = คอลัมน์แนวตั้ง (เริ่มต้น 1 คือด้านซ้ายสุด ยิ่งเลขมากยิ่งไปทางขวา)
// หากต้องการขยับหรือสลับเขต ให้แก้ตัวเลข row และ col ในแต่ละเขตได้เลย 
// -------------------------------------------------------------

export const DISTRICT_LAYOUTS: District[] = [
  { id: 36, number: 36, row: 1, col: 7 }, // ดอนเมือง
  { id: 42, number: 42, row: 1, col: 8 }, // สายไหม
  { id: 46, number: 46, row: 1, col: 9 }, // คลองสามวา

  { id: 29, number: 29, row: 2, col: 5 }, // บางซื่อ
  { id: 30, number: 30, row: 2, col: 6 }, // จตุจักร
  { id: 41, number: 41, row: 2, col: 7 }, // หลักสี่
  { id: 5, number: 5, row: 2, col: 8 },   // บางเขน
  { id: 43, number: 43, row: 2, col: 9 }, // คันนายาว
  { id: 3, number: 3, row: 2, col: 10 },  // หนองจอก

  { id: 2, number: 2, row: 3, col: 5 },   // ดุสิต
  { id: 14, number: 14, row: 3, col: 6 }, // พญาไท
  { id: 26, number: 26, row: 3, col: 7 }, // ดินแดง
  { id: 38, number: 38, row: 3, col: 8 }, // ลาดพร้าว
  { id: 27, number: 27, row: 3, col: 9 }, // บึงกุ่ม
  { id: 10, number: 10, row: 3, col: 10 }, // มีนบุรี

  { id: 25, number: 25, row: 4, col: 4 }, // บางพลัด
  { id: 8, number: 8, row: 4, col: 5 },   // ป้อมปราบศัตรูพ่าย
  { id: 37, number: 37, row: 4, col: 6 }, // ราชเทวี
  { id: 17, number: 17, row: 4, col: 7 }, // ห้วยขวาง
  { id: 45, number: 45, row: 4, col: 8 }, // วังทองหลาง
  { id: 6, number: 6, row: 4, col: 9 },   // บางกะปิ
  { id: 11, number: 11, row: 4, col: 10 }, // ลาดกระบัง

  { id: 48, number: 48, row: 5, col: 1 }, // ทวีวัฒนา
  { id: 19, number: 19, row: 5, col: 2 }, // ตลิ่งชัน
  { id: 20, number: 20, row: 5, col: 3 }, // บางกอกน้อย
  { id: 1, number: 1, row: 5, col: 4 },   // พระนคร
  { id: 13, number: 13, row: 5, col: 5 }, // สัมพันธวงศ์
  { id: 7, number: 7, row: 5, col: 6 },   // ปทุมวัน
  { id: 39, number: 39, row: 5, col: 7 }, // วัฒนา
  { id: 34, number: 34, row: 5, col: 8 }, // สวนหลวง
  { id: 44, number: 44, row: 5, col: 9 }, // สะพานสูง

  { id: 23, number: 23, row: 6, col: 1 }, // หนองแขม
  { id: 22, number: 22, row: 6, col: 2 }, // ภาษีเจริญ
  { id: 16, number: 16, row: 6, col: 3 }, // บางกอกใหญ่
  { id: 18, number: 18, row: 6, col: 4 }, // คลองสาน
  { id: 4, number: 4, row: 6, col: 5 },   // บางรัก
  { id: 28, number: 28, row: 6, col: 6 }, // สาทร
  { id: 33, number: 33, row: 6, col: 7 }, // คลองเตย
  { id: 9, number: 9, row: 6, col: 8 },   // พระโขนง
  { id: 32, number: 32, row: 6, col: 9 }, // ประเวศ

  { id: 40, number: 40, row: 7, col: 1 }, // บางแค
  { id: 35, number: 35, row: 7, col: 2 }, // จอมทอง
  { id: 15, number: 15, row: 7, col: 3 }, // ธนบุรี
  { id: 31, number: 31, row: 7, col: 5 }, // บางคอแหลม
  { id: 12, number: 12, row: 7, col: 6 }, // ยานนาวา
  { id: 47, number: 47, row: 7, col: 7 }, // บางนา

  { id: 50, number: 50, row: 8, col: 1 }, // บางบอน
  { id: 49, number: 49, row: 8, col: 2 }, // ทุ่งครุ
  { id: 24, number: 24, row: 8, col: 3 }, // ราษฎร์บูรณะ

  { id: 21, number: 21, row: 9, col: 2 }  // บางขุนเทียน
];
