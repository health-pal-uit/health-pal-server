// hàm đưa và trả tiền ra vào db
export const Money = {
  to: (v?: number | null) => v,
  from: (v?: string | null) => (v == null ? null : Number(v)),
};
