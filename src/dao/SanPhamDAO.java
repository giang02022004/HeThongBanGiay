package dao;

import model.SanPham;
import quanlybangiay.DBConnect;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SanPhamDAO {

    // ================= LẤY DANH SÁCH SẢN PHẨM (CHƯA XÓA) =================
    public List<SanPham> getAll() {
        List<SanPham> list = new ArrayList<>();
        String sql = "SELECT masp, tensp, giaban, trangthai FROM sanpham WHERE trangthai = 1";

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                SanPham sp = new SanPham(
                        rs.getInt("masp"),
                        rs.getString("tensp"),
                        rs.getDouble("giaban"),
                        rs.getInt("trangthai")
                );
                list.add(sp);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    // ================= THÊM SẢN PHẨM =================
    public boolean insert(SanPham sp) {
        String sql = """
                INSERT INTO sanpham(tensp, giaban, trangthai)
                VALUES (?, ?, 1)
                """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, sp.getTenSP());
            ps.setDouble(2, sp.getGiaBan());

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= CẬP NHẬT SẢN PHẨM =================
    public boolean update(SanPham sp) {
        String sql = """
                UPDATE sanpham
                SET tensp = ?, giaban = ?
                WHERE masp = ?
                """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, sp.getTenSP());
            ps.setDouble(2, sp.getGiaBan());
            ps.setInt(3, sp.getMaSP());

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= XÓA MỀM =================
    public boolean deleteSoft(int maSP) {
        String sql = "UPDATE sanpham SET trangthai = 0 WHERE masp = ?";

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, maSP);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= TÌM SẢN PHẨM THEO MÃ =================
    public SanPham findById(int maSP) {
        String sql = "SELECT masp, tensp, giaban, trangthai FROM sanpham WHERE masp = ? AND trangthai = 1";

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, maSP);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return new SanPham(
                        rs.getInt("masp"),
                        rs.getString("tensp"),
                        rs.getDouble("giaban"),
                        rs.getInt("trangthai")
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    // ================= TÌM SẢN PHẨM THEO TÊN =================
public SanPham findByTen(String tenSP) {
    String sql = """
        SELECT * FROM sanpham
        WHERE LOWER(TRIM(tensp)) = LOWER(TRIM(?))
        AND trangthai = 1
    """;

    try (Connection conn = DBConnect.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setString(1, tenSP);
        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            return new SanPham(
                rs.getInt("masp"),
                rs.getString("tensp"),
                rs.getDouble("giaban"),
                rs.getInt("trangthai")
            );
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return null;
}

}
