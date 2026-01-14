package model;

public class KhachHang {

    private int maKH;
    private String tenKH;
    private String soDienThoai;
    private String diaChi;
    private int trangThai;

    public KhachHang() {}

    public KhachHang(int maKH, String tenKH, String soDienThoai, String diaChi, int trangThai) {
        this.maKH = maKH;
        this.tenKH = tenKH;
        this.soDienThoai = soDienThoai;
        this.diaChi = diaChi;
        this.trangThai = trangThai;
    }

    // Constructor dùng cho thêm nhanh
    public KhachHang(int maKH, String tenKH, String soDienThoai, String diaChi) {
        this.maKH = maKH;
        this.tenKH = tenKH;
        this.soDienThoai = soDienThoai;
        this.diaChi = diaChi;
        this.trangThai = 1;
    }

    public int getMaKH() {
        return maKH;
    }

    public String getTenKH() {
        return tenKH;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public int getTrangThai() {
        return trangThai;
    }

    public void setMaKH(int maKH) {
        this.maKH = maKH;
    }

    public void setTenKH(String tenKH) {
        this.tenKH = tenKH;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public void setTrangThai(int trangThai) {
        this.trangThai = trangThai;
    }

    // Hiển thị đẹp trong JComboBox
    @Override
    public String toString() {
        if (soDienThoai != null && !soDienThoai.isEmpty()) {
            return tenKH + " (" + soDienThoai + ")";
        }
        return tenKH;
    }
    
}
