package gui;

import model.NguoiDung;
import gui.ThongKePanel;

import javax.swing.*;
import java.awt.*;

public class MainForm extends JFrame {

    private final NguoiDung nguoiDung;

    private CardLayout cardLayout;
    private JPanel contentPanel;

    public MainForm(NguoiDung nd) {
        this.nguoiDung = nd;
        setTitle("Hệ thống quản lý bán giày");
        setSize(950, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        initUI();
    }

    private void initUI() {

        /* ================= ROOT ================= */
        JPanel root = new JPanel(new BorderLayout());
        root.setBackground(Color.WHITE);
        add(root);

        /* ================= HEADER ================= */
        JPanel header = new JPanel(new BorderLayout());
        header.setPreferredSize(new Dimension(0, 60));
        header.setBackground(new Color(33, 150, 243));

        JLabel leftSpace = new JLabel();
        leftSpace.setPreferredSize(new Dimension(220, 0));

        JLabel lblTitle = new JLabel("QUẢN LÝ BÁN GIÀY", JLabel.CENTER);
        lblTitle.setForeground(Color.WHITE);
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 22));

        JLabel lblUser = new JLabel(
                "Xin chào: " + nguoiDung.getHoten() + " (" + nguoiDung.getQuyen() + ")  "
        );
        lblUser.setForeground(Color.WHITE);
        lblUser.setFont(new Font("Segoe UI", Font.PLAIN, 14));

        header.add(leftSpace, BorderLayout.WEST);
        header.add(lblTitle, BorderLayout.CENTER);
        header.add(lblUser, BorderLayout.EAST);

        root.add(header, BorderLayout.NORTH);

        /* ================= SIDEBAR ================= */
        JPanel sidebar = new JPanel();
        sidebar.setPreferredSize(new Dimension(220, 0));
        sidebar.setBackground(new Color(245, 247, 250));
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JButton btnSanPham   = createMenuButton("Sản phẩm");
        JButton btnKhachHang = createMenuButton("Khách hàng");
        JButton btnBanHang   = createMenuButton("Bán hàng");
        JButton btnThongKe   = createMenuButton("Thống kê");
        JButton btnDangXuat  = createMenuButton("Đăng xuất");
        btnDangXuat.setForeground(Color.RED);

        sidebar.add(btnSanPham);
        sidebar.add(Box.createVerticalStrut(12));
        sidebar.add(btnKhachHang);
        sidebar.add(Box.createVerticalStrut(12));
        sidebar.add(btnBanHang);
        sidebar.add(Box.createVerticalStrut(12));
        sidebar.add(btnThongKe);
        sidebar.add(Box.createVerticalGlue());
        sidebar.add(btnDangXuat);

        root.add(sidebar, BorderLayout.WEST);

        /* ================= CONTENT (CardLayout) ================= */
        cardLayout = new CardLayout();
        contentPanel = new JPanel(cardLayout);
        contentPanel.setBackground(Color.WHITE);

        // ===== HOME =====
        JPanel homePanel = new JPanel(new GridBagLayout());
        JLabel lblWelcome = new JLabel("Chào mừng bạn đến với hệ thống quản lý bán giày");
        lblWelcome.setFont(new Font("Segoe UI", Font.BOLD, 22));
        homePanel.add(lblWelcome);

        // ===== PANELS =====
        SanPhamPanel sanPhamPanel     = new SanPhamPanel();        // Admin
        KhachHangPanel khachHangPanel = new KhachHangPanel();      // Admin
        BanHangPanel banHangPanel     = new BanHangPanel(nguoiDung); // Admin + Nhân viên
        ThongKePanel thongKePanel     = new ThongKePanel();

        // ===== ADD CARD =====
        contentPanel.add(homePanel, "HOME");
        contentPanel.add(sanPhamPanel, "SANPHAM");
        contentPanel.add(khachHangPanel, "KHACHHANG");
        contentPanel.add(banHangPanel, "BANHANG");
        contentPanel.add(thongKePanel, "THONGKE");


        root.add(contentPanel, BorderLayout.CENTER);

        /* ================= PHÂN QUYỀN ================= */
        if (!"ADMIN".equalsIgnoreCase(nguoiDung.getQuyen())) {
            // NHÂN VIÊN
            btnSanPham.setVisible(false);
            btnKhachHang.setVisible(false);
            btnThongKe.setVisible(false);

            // vào là bán hàng luôn
            cardLayout.show(contentPanel, "BANHANG");
        } else {
            // ADMIN
            cardLayout.show(contentPanel, "HOME");
        }

        /* ================= EVENT ================= */
        btnSanPham.addActionListener(e ->
                cardLayout.show(contentPanel, "SANPHAM")
        );

        btnKhachHang.addActionListener(e ->
                cardLayout.show(contentPanel, "KHACHHANG")
        );

        btnBanHang.addActionListener(e ->
                cardLayout.show(contentPanel, "BANHANG")
        );

        btnThongKe.addActionListener(e
                -> cardLayout.show(contentPanel, "THONGKE")
        );

        btnDangXuat.addActionListener(e -> {
            new LoginForm().setVisible(true);
            dispose();
        });
    }

    /* ================= STYLE MENU BUTTON ================= */
    private JButton createMenuButton(String text) {
        JButton btn = new JButton(text);
        btn.setMaximumSize(new Dimension(Integer.MAX_VALUE, 44));
        btn.setFocusPainted(false);
        btn.setBackground(Color.WHITE);
        btn.setForeground(new Color(33, 150, 243));
        btn.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btn.setHorizontalAlignment(SwingConstants.LEFT);
        btn.setBorder(
                BorderFactory.createCompoundBorder(
                        BorderFactory.createLineBorder(new Color(220, 220, 220)),
                        BorderFactory.createEmptyBorder(10, 16, 10, 16)
                )
        );
        return btn;
    }
}
