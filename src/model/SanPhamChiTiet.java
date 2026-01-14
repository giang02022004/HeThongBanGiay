package model;

public class SanPhamChiTiet {

    private int maCT;       // mact
    private int maSP;       // masp (FK)
    private int size;
    private String mauSac;
    private int soLuong;
    private String hinhAnh; // 👈 ẢNH THEO SIZE – MÀU
    private int trangThai;

    // Constructor rỗng
    public SanPhamChiTiet() {}

    // Constructor đầy đủ
    public SanPhamChiTiet(int maCT, int maSP, int size,
                          String mauSac, int soLuong,
                          String hinhAnh, int trangThai) {
        this.maCT = maCT;
        this.maSP = maSP;
        this.size = size;
        this.mauSac = mauSac;
        this.soLuong = soLuong;
        this.hinhAnh = hinhAnh;
        this.trangThai = trangThai;
    }

    // ===== Getter / Setter =====
    public int getMaCT() {
        return maCT;
    }

    public void setMaCT(int maCT) {
        this.maCT = maCT;
    }

    public int getMaSP() {
        return maSP;
    }

    public void setMaSP(int maSP) {
        this.maSP = maSP;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public String getMauSac() {
        return mauSac;
    }

    public void setMauSac(String mauSac) {
        this.mauSac = mauSac;
    }

    public int getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(int soLuong) {
        this.soLuong = soLuong;
    }

    public String getHinhAnh() {
        return hinhAnh;
    }

    public void setHinhAnh(String hinhAnh) {
        this.hinhAnh = hinhAnh;
    }

    public int getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(int trangThai) {
        this.trangThai = trangThai;
    }

    // Hiển thị đẹp trong JComboBox (VD: Size 42 - Đen)
    @Override
    public String toString() {
        return "Size " + size + " - " + mauSac;
    }
}
