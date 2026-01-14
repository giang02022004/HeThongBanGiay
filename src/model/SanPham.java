package model;

public class SanPham {

    private int maSP;
    private String tenSP;
    private double giaBan;
    private int trangThai;

    // Constructor rỗng
    public SanPham() {}

    // Constructor đầy đủ (KHÔNG CÒN hình ảnh)
    public SanPham(int maSP, String tenSP, double giaBan, int trangThai) {
        this.maSP = maSP;
        this.tenSP = tenSP;
        this.giaBan = giaBan;
        this.trangThai = trangThai;
    }

    // Getter & Setter
    public int getMaSP() {
        return maSP;
    }

    public void setMaSP(int maSP) {
        this.maSP = maSP;
    }

    public String getTenSP() {
        return tenSP;
    }

    public void setTenSP(String tenSP) {
        this.tenSP = tenSP;
    }

    public double getGiaBan() {
        return giaBan;
    }

    public void setGiaBan(double giaBan) {
        this.giaBan = giaBan;
    }

    public int getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(int trangThai) {
        this.trangThai = trangThai;
    }

    // Hiển thị đẹp trong JComboBox
    @Override
    public String toString() {
        return tenSP;
    }
}
