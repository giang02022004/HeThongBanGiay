package dao;

import quanlybangiay.DBConnect;
import java.sql.*;

public class ChiTietHoaDonDAO {

    public boolean insert(int maHD, int maSP, int soLuong, double donGia) {
        String sql = """
            INSERT INTO chitiethoadon(mahd, masp, soluong, dongia)
            VALUES (?, ?, ?, ?)
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, maHD);
            ps.setInt(2, maSP);
            ps.setInt(3, soLuong);
            ps.setDouble(4, donGia);

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
