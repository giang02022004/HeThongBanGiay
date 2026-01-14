package gui;

import dao.ThongKeDAO;

import javax.swing.*;
import java.awt.*;

public class ThongKePanel extends JPanel {

    private final ThongKeDAO tkDAO = new ThongKeDAO();

    private int tongHoaDon;
    private int tongSanPham;
    private double tongDoanhThu;

    public ThongKePanel() {
        setBackground(Color.WHITE);
        loadData();
    }

    private void loadData() {
        tongHoaDon   = tkDAO.getTongHoaDon();
        tongSanPham  = tkDAO.getTongSanPhamDaBan();
        tongDoanhThu = tkDAO.getTongDoanhThu();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;

        g2.setRenderingHint(
                RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON
        );

        int w = getWidth();
        int h = getHeight();

        /* ===== TITLE ===== */
        g2.setFont(new Font("Segoe UI", Font.BOLD, 24));
        g2.setColor(new Color(33,150,243));
        String title = "BIỂU ĐỒ THỐNG KÊ BÁN HÀNG";
        g2.drawString(title, (w - g2.getFontMetrics().stringWidth(title)) / 2, 60);

        /* ===== CHART CONFIG ===== */
        int chartHeight = 300;
        int baseY = h - 100;

        int barWidth = 120;
        int gap = 100;

        int totalWidth = barWidth * 3 + gap * 2;
        int startX = (w - totalWidth) / 2;

        // Chuẩn hóa doanh thu
        double doanhThuScale = tongDoanhThu / 10000.0;

        double max = Math.max(
                tongHoaDon,
                Math.max(tongSanPham, doanhThuScale)
        );

        /* ===== AXIS ===== */
        g2.setColor(Color.GRAY);
        g2.drawLine(startX - 40, baseY, startX + totalWidth + 40, baseY);

        /* ===== DRAW BARS ===== */
        drawBar(g2, startX, baseY,
                barWidth,
                (int)(chartHeight * tongHoaDon / max),
                new Color(76,175,80),
                "Hóa đơn",
                String.valueOf(tongHoaDon)
        );

        drawBar(g2, startX + barWidth + gap, baseY,
                barWidth,
                (int)(chartHeight * doanhThuScale / max),
                new Color(33,150,243),
                "Doanh thu",
                String.format("%,.0f VNĐ", tongDoanhThu)
        );

        drawBar(g2, startX + 2*(barWidth + gap), baseY,
                barWidth,
                (int)(chartHeight * tongSanPham / max),
                new Color(255,152,0),
                "SP bán",
                String.valueOf(tongSanPham)
        );
    }

    private void drawBar(Graphics2D g2,
                         int x, int baseY, int width, int height,
                         Color color, String label, String value) {

        // cột
        g2.setColor(color);
        g2.fillRoundRect(x, baseY - height, width, height, 20, 20);

        // giá trị
        g2.setFont(new Font("Segoe UI", Font.BOLD, 15));
        g2.setColor(Color.BLACK);
        int valueWidth = g2.getFontMetrics().stringWidth(value);
        g2.drawString(value, x + (width - valueWidth)/2, baseY - height - 10);

        // nhãn
        g2.setFont(new Font("Segoe UI", Font.PLAIN, 15));
        int labelWidth = g2.getFontMetrics().stringWidth(label);
        g2.drawString(label, x + (width - labelWidth)/2, baseY + 30);
    }
}
