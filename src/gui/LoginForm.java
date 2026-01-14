package gui;

import dao.NguoiDungDAO;
import model.NguoiDung;

import javax.swing.*;
import java.awt.*;

public class LoginForm extends JFrame {

    private JTextField txtUsername;
    private JPasswordField txtPassword;
    private JButton btnLogin, btnExit;

    public LoginForm() {
        setTitle("Đăng nhập hệ thống");
        setSize(420, 260);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        initUI();
    }

    private void initUI() {

        // ===== Panel chính (NỀN TRẮNG) =====
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBackground(Color.WHITE);
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        add(panel);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 8, 8, 8);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        // ===== Tiêu đề =====
        JLabel lblTitle = new JLabel("ĐĂNG NHẬP HỆ THỐNG", JLabel.CENTER);
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));

        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        panel.add(lblTitle, gbc);

        gbc.gridwidth = 1;

        // ===== Tên đăng nhập =====
        JLabel lblUser = new JLabel("Tên đăng nhập:");
        gbc.gridx = 0;
        gbc.gridy = 1;
        panel.add(lblUser, gbc);

        txtUsername = new JTextField();
        txtUsername.setPreferredSize(new Dimension(200, 30));
        gbc.gridx = 1;
        panel.add(txtUsername, gbc);

        // ===== Mật khẩu =====
        JLabel lblPass = new JLabel("Mật khẩu:");
        gbc.gridx = 0;
        gbc.gridy = 2;
        panel.add(lblPass, gbc);

        txtPassword = new JPasswordField();
        txtPassword.setPreferredSize(new Dimension(200, 30));
        gbc.gridx = 1;
        panel.add(txtPassword, gbc);

        // ===== Nút =====
        btnLogin = new JButton("Đăng nhập");
        btnLogin.setBackground(new Color(33, 150, 243)); // XANH
        btnLogin.setForeground(Color.WHITE);
        btnLogin.setFocusPainted(false);

        btnExit = new JButton("Thoát");

        JPanel btnPanel = new JPanel();
        btnPanel.setBackground(Color.WHITE);
        btnPanel.add(btnLogin);
        btnPanel.add(btnExit);

        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.gridwidth = 2;
        panel.add(btnPanel, gbc);

        // ===== Event =====
        btnLogin.addActionListener(e -> login());
        btnExit.addActionListener(e -> System.exit(0));
    }

    private void login() {
        String username = txtUsername.getText().trim();
        String password = new String(txtPassword.getPassword());

        if (username.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(this,
                    "Vui lòng nhập đầy đủ thông tin!",
                    "Thông báo",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        NguoiDungDAO dao = new NguoiDungDAO();
        NguoiDung nd = dao.login(username, password);

        if (nd != null) {
            JOptionPane.showMessageDialog(this,
                    "Đăng nhập thành công!\nXin chào: " + nd.getHoten(),
                    "Thành công",
                    JOptionPane.INFORMATION_MESSAGE);

             new MainForm(nd).setVisible(true);
             this.dispose();

        } else {
            JOptionPane.showMessageDialog(this,
                    "Sai tên đăng nhập hoặc mật khẩu!",
                    "Lỗi",
                    JOptionPane.ERROR_MESSAGE);
        }
    }
}
