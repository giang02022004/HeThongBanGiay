package dao;

import quanlybangiay.DBConnect;

import java.sql.*;

public class ThongKeDAO {

    // Tổng số hóa đơn
    public int getTongHoaDon() {
        String sql = "SELECT COUNT(*) FROM hoadon";
        try (Connection con = DBConnect.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) return rs.getInt(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    // Tổng doanh thu
    public double getTongDoanhThu() {
        String sql = "SELECT IFNULL(SUM(tongtien),0) FROM hoadon";
        try (Connection con = DBConnect.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) return rs.getDouble(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    // Tổng số sản phẩm đã bán
    public int getTongSanPhamDaBan() {
        String sql = "SELECT IFNULL(SUM(soluong),0) FROM chitiethoadon";
        try (Connection con = DBConnect.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next()) return rs.getInt(1);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }
}
