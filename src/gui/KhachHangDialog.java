package gui;

import dao.KhachHangDAO;
import model.KhachHang;

import javax.swing.*;
import java.awt.*;

public class KhachHangDialog extends JDialog {

    private JTextField txtTen, txtSDT, txtDiaChi;
    private boolean added = false;
    private KhachHang khachHang;

    private final KhachHangDAO dao = new KhachHangDAO();

    private final Color PRIMARY = new Color(33,150,243);
    private final Color BORDER = new Color(220,220,220);

    public KhachHangDialog(Window parent) {
        super(parent, "Thêm khách hàng mới", ModalityType.APPLICATION_MODAL);
        setSize(450, 280);
        setLocationRelativeTo(parent);
        initUI();
    }

    private void initUI() {
        setLayout(new BorderLayout(10, 10));

        /* ================= FORM ================= */
        JPanel form = new JPanel(new GridBagLayout());
        form.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        form.setBackground(Color.WHITE);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel lblTitle = new JLabel("THÔNG TIN KHÁCH HÀNG");
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));

        txtTen = createTextField();
        txtSDT = createTextField();
        txtDiaChi = createTextField();

        // ===== TITLE =====
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        gbc.weightx = 1;
        form.add(lblTitle, gbc);
        gbc.gridwidth = 1;

        // ===== TÊN =====
        gbc.gridx = 0;
        gbc.gridy = 1;
        gbc.weightx = 0;
        form.add(new JLabel("Tên khách hàng"), gbc);

        gbc.gridx = 1;
        gbc.weightx = 1;
        form.add(txtTen, gbc);

        // ===== SĐT =====
        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.weightx = 0;
        form.add(new JLabel("Số điện thoại"), gbc);

        gbc.gridx = 1;
        gbc.weightx = 1;
        form.add(txtSDT, gbc);

        // ===== ĐỊA CHỈ =====
        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.weightx = 0;
        form.add(new JLabel("Địa chỉ"), gbc);

        gbc.gridx = 1;
        gbc.weightx = 1;
        form.add(txtDiaChi, gbc);

        add(form, BorderLayout.CENTER);

        /* ================= BUTTON ================= */
        JButton btnHuy = createOutlineButton("Hủy");
        JButton btnLuu = createPrimaryButton("Lưu");

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 10));
        btnPanel.setBackground(Color.WHITE);
        btnPanel.add(btnHuy);
        btnPanel.add(btnLuu);

        add(btnPanel, BorderLayout.SOUTH);

        btnHuy.addActionListener(e -> dispose());
        btnLuu.addActionListener(e -> luu());
    }

    /* ================= LOGIC ================= */
    private void luu() {
        String ten = txtTen.getText().trim();
        String sdt = txtSDT.getText().trim();
        String diaChi = txtDiaChi.getText().trim();

        if (ten.isEmpty() || sdt.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Tên và SĐT không được trống!");
            return;
        }

        if (dao.existsByPhone(sdt)) {
            JOptionPane.showMessageDialog(this, "Số điện thoại đã tồn tại!");
            return;
        }

        khachHang = new KhachHang(0, ten, sdt, diaChi);
        if (dao.insert(khachHang)) {
            added = true;
            dispose();
        } else {
            JOptionPane.showMessageDialog(this, "Thêm khách hàng thất bại!");
        }
    }

    public boolean isAdded() {
        return added;
    }

    public KhachHang getKhachHang() {
        return khachHang;
    }

    /* ================= UI HELPER ================= */
    private JTextField createTextField() {
        JTextField txt = new JTextField();
        txt.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        txt.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(BORDER),
                BorderFactory.createEmptyBorder(6, 10, 6, 10)
        ));
        return txt;
    }

    private JButton createPrimaryButton(String text) {
        JButton b = new JButton(text);
        b.setBackground(PRIMARY);
        b.setForeground(Color.WHITE);
        b.setFocusPainted(false);
        b.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        return b;
    }

    private JButton createOutlineButton(String text) {
        JButton b = new JButton(text);
        b.setForeground(PRIMARY);
        b.setBackground(Color.WHITE);
        b.setFocusPainted(false);
        b.setBorder(BorderFactory.createLineBorder(PRIMARY));
        return b;
    }
}
