package dao;

import model.SanPhamChiTiet;
import quanlybangiay.DBConnect;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SanPhamChiTietDAO {

    // ================= LẤY DANH SÁCH CHI TIẾT THEO SẢN PHẨM =================
    public List<SanPhamChiTiet> getByMaSP(int maSP) {
        List<SanPhamChiTiet> list = new ArrayList<>();

        String sql = """
            SELECT mact, masp, size, mausac, soluong, hinhanh, trangthai
            FROM sanpham_chitiet
            WHERE masp = ? AND trangthai = 1
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, maSP);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(new SanPhamChiTiet(
                        rs.getInt("mact"),
                        rs.getInt("masp"),
                        rs.getInt("size"),
                        rs.getString("mausac"),
                        rs.getInt("soluong"),
                        rs.getString("hinhanh"),   // 👈 ẢNH
                        rs.getInt("trangthai")
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    // ================= THÊM CHI TIẾT (SIZE + MÀU + ẢNH) =================
    public boolean insert(SanPhamChiTiet ct) {
        String sql = """
            INSERT INTO sanpham_chitiet(masp, size, mausac, soluong, hinhanh, trangthai)
            VALUES (?, ?, ?, ?, ?, 1)
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, ct.getMaSP());
            ps.setInt(2, ct.getSize());
            ps.setString(3, ct.getMauSac());
            ps.setInt(4, ct.getSoLuong());
            ps.setString(5, ct.getHinhAnh());

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= CẬP NHẬT SỐ LƯỢNG THEO MÃ CT =================
    public boolean updateSoLuong(int maCT, int soLuongMoi) {
        String sql = """
            UPDATE sanpham_chitiet
            SET soluong = ?
            WHERE mact = ? AND trangthai = 1
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, soLuongMoi);
            ps.setInt(2, maCT);

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= TRỪ KHO (KHI BÁN) =================
    public boolean truKho(int maCT, int soLuongBan) {
        String sql = """
            UPDATE sanpham_chitiet
            SET soluong = soluong - ?
            WHERE mact = ? AND soluong >= ? AND trangthai = 1
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, soLuongBan);
            ps.setInt(2, maCT);
            ps.setInt(3, soLuongBan);

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= XÓA MỀM THEO MÃ CT (KHUYÊN DÙNG) =================
    public boolean deleteSoftByMaCT(int maCT) {
        String sql = """
            UPDATE sanpham_chitiet
            SET trangthai = 0
            WHERE mact = ?
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, maCT);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= XÓA MỀM (GIỮ LẠI ĐỂ TƯƠNG THÍCH CODE CŨ) =================
    public boolean deleteSoft(int maSP, int size, String mauSac) {
        String sql = """
            UPDATE sanpham_chitiet
            SET trangthai = 0
            WHERE masp = ? AND size = ? AND mausac = ?
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, maSP);
            ps.setInt(2, size);
            ps.setString(3, mauSac);

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= CẬP NHẬT SỐ LƯỢNG THEO MASP + SIZE + MÀU =================
    public boolean update(int maSP, int size, String mau, int soLuong) {
        String sql = """
            UPDATE sanpham_chitiet
            SET soluong = ?
            WHERE masp = ? AND size = ? AND mausac = ? AND trangthai = 1
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, soLuong);
            ps.setInt(2, maSP);
            ps.setInt(3, size);
            ps.setString(4, mau);

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
