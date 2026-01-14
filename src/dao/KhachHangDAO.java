package dao;

import model.KhachHang;
import quanlybangiay.DBConnect;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class KhachHangDAO {

    // ================= LẤY DANH SÁCH (CHƯA BỊ XÓA) =================
    public List<KhachHang> getAll() {
        List<KhachHang> list = new ArrayList<>();
        String sql = "SELECT * FROM khachhang WHERE trangthai = 1";

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(new KhachHang(
                        rs.getInt("makh"),
                        rs.getString("tenkh"),
                        rs.getString("sodienthoai"),
                        rs.getString("diachi"),
                        rs.getInt("trangthai")
                ));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    // ================= THÊM KHÁCH HÀNG =================
    public boolean insert(KhachHang kh) {
        String sql = "INSERT INTO khachhang(tenkh, sodienthoai, diachi, trangthai) VALUES (?, ?, ?, 1)";

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, kh.getTenKH());
            ps.setString(2, kh.getSoDienThoai());
            ps.setString(3, kh.getDiaChi());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                ResultSet rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    kh.setMaKH(rs.getInt(1));
                }
                return true;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // ================= XÓA MỀM =================
    public boolean deleteSoft(int maKH) {
        String sql = "UPDATE khachhang SET trangthai = 0 WHERE makh = ?";

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, maKH);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
        // ================= SỬA KHÁCH HÀNG =================
    public boolean update(KhachHang kh) {
        String sql = "UPDATE khachhang SET tenkh = ?, sodienthoai = ?, diachi = ? WHERE makh = ?";

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, kh.getTenKH());
            ps.setString(2, kh.getSoDienThoai());
            ps.setString(3, kh.getDiaChi());
            ps.setInt(4, kh.getMaKH());

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    // ================= KIỂM TRA SĐT ĐÃ TỒN TẠI =================
    public boolean existsByPhone(String sdt) {
        String sql = "SELECT COUNT(*) FROM khachhang WHERE sodienthoai = ? AND trangthai = 1";

        try ( Connection conn = DBConnect.getConnection();  PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, sdt);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return rs.getInt(1) > 0;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }


}
