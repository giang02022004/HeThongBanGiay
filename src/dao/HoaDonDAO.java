package dao;

import quanlybangiay.DBConnect;
import java.sql.*;

public class HoaDonDAO {

    public int insert(int maKH, int maND, double tongTien) {
        String sql = """
            INSERT INTO hoadon(ngaylap, makh, mand, tongtien)
            VALUES (NOW(), ?, ?, ?)
        """;

        try (Connection conn = DBConnect.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, maKH);
            ps.setInt(2, maND);
            ps.setDouble(3, tongTien);

            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1); // trả về mã hóa đơn
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return -1;
    }
}
