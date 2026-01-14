package gui;

import dao.KhachHangDAO;
import model.KhachHang;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class KhachHangPanel extends JPanel {

    private JTable table;
    private DefaultTableModel model;

    private JTextField txtTen, txtSDT, txtDiaChi;

    private final KhachHangDAO dao = new KhachHangDAO();

    private final Color PRIMARY = new Color(33,150,243);
    private final Color DANGER = new Color(244,67,54);
    private final Color BORDER = new Color(220,220,220);

    public KhachHangPanel() {
        setLayout(new BorderLayout(15,15));
        setBackground(Color.WHITE);
        initUI();
        loadData();
    }

    private void initUI() {

        /* ================= FORM CARD ================= */
        JPanel formCard = new JPanel(new GridBagLayout());
        formCard.setBackground(Color.WHITE);
        formCard.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(BORDER),
                BorderFactory.createEmptyBorder(15,15,15,15)
        ));

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8,8,8,8);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel lblTitle = new JLabel("THÔNG TIN KHÁCH HÀNG");
        lblTitle.setFont(new Font("Segoe UI", Font.BOLD, 16));

        txtTen = createTextField();
        txtSDT = createTextField();
        txtDiaChi = createTextField();

        // Title
        gbc.gridx=0; gbc.gridy=0; gbc.gridwidth=2;
        formCard.add(lblTitle, gbc);

        gbc.gridwidth=1;

        // Tên
        gbc.gridx=0; gbc.gridy=1;
        formCard.add(new JLabel("Tên khách hàng"), gbc);
        gbc.gridx=1;
        formCard.add(txtTen, gbc);

        // SĐT
        gbc.gridx=0; gbc.gridy=2;
        formCard.add(new JLabel("Số điện thoại"), gbc);
        gbc.gridx=1;
        formCard.add(txtSDT, gbc);

        // Địa chỉ
        gbc.gridx=0; gbc.gridy=3;
        formCard.add(new JLabel("Địa chỉ"), gbc);
        gbc.gridx=1;
        formCard.add(txtDiaChi, gbc);

        // Buttons
        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.LEFT,10,0));
        btnPanel.setBackground(Color.WHITE);

        JButton btnThem = createPrimaryButton("Thêm mới");
        JButton btnSua = createPrimaryButton("Cập nhật");
        JButton btnXoa = createDangerButton("Xóa");

        btnPanel.add(btnThem);
        btnPanel.add(btnSua);
        btnPanel.add(btnXoa);

        gbc.gridx=0; gbc.gridy=4; gbc.gridwidth=2;
        formCard.add(btnPanel, gbc);

        add(formCard, BorderLayout.NORTH);

        /* ================= TABLE ================= */
        model = new DefaultTableModel(
                new String[]{"Mã KH","Tên khách","SĐT","Địa chỉ"},0
        ){
            public boolean isCellEditable(int r,int c){return false;}
        };

        table = new JTable(model);
        table.setRowHeight(32);
        table.setFont(new Font("Segoe UI",Font.PLAIN,13));
        table.getTableHeader().setFont(new Font("Segoe UI",Font.BOLD,13));
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createLineBorder(BORDER));

        add(scroll, BorderLayout.CENTER);

        /* ================= EVENT ================= */
        btnThem.addActionListener(e -> them());
        btnSua.addActionListener(e -> sua());
        btnXoa.addActionListener(e -> xoa());
        table.getSelectionModel().addListSelectionListener(e -> fillForm());
    }

    /* ================= LOAD DATA ================= */
    private void loadData() {
        model.setRowCount(0);
        List<KhachHang> list = dao.getAll();
        for (KhachHang kh : list) {
            model.addRow(new Object[]{
                    kh.getMaKH(),
                    kh.getTenKH(),
                    kh.getSoDienThoai(),
                    kh.getDiaChi()
            });
        }
    }
   

    private void fillForm() {
        int r = table.getSelectedRow();
        if (r >= 0) {
            txtTen.setText(model.getValueAt(r,1).toString());
            txtSDT.setText(model.getValueAt(r,2).toString());
            txtDiaChi.setText(model.getValueAt(r,3).toString());
        }
    }

    private void them() {

        String ten = txtTen.getText().trim();
        String sdt = txtSDT.getText().trim();

        if (ten.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Tên khách hàng không được trống!");
            return;
        }

        if (sdt.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Số điện thoại không được trống!");
            return;
        }

        // KIỂM TRA TRÙNG SĐT
        if (dao.existsByPhone(sdt)) {
            JOptionPane.showMessageDialog(this,
                    "Số điện thoại đã tồn tại!\nVui lòng kiểm tra lại.",
                    "Lỗi",
                    JOptionPane.ERROR_MESSAGE);
            return;
        }

        KhachHang kh = new KhachHang(
                0,
                ten,
                sdt,
                txtDiaChi.getText().trim()
        );

        if (dao.insert(kh)) {
            loadData();
            clear();
        }
    }


    private void sua() {
        int r = table.getSelectedRow();
        if (r < 0) {
            JOptionPane.showMessageDialog(this,"Vui lòng chọn khách hàng!");
            return;
        }

        int maKH = (int) model.getValueAt(r,0);

        KhachHang kh = new KhachHang(
                maKH,
                txtTen.getText().trim(),
                txtSDT.getText().trim(),
                txtDiaChi.getText().trim()
        );

        if (dao.update(kh)) {
            loadData();
            clear();
        }

    }

    private void xoa() {
        int r = table.getSelectedRow();
        if (r < 0) return;

        int confirm = JOptionPane.showConfirmDialog(
                this,
                "Bạn có chắc muốn xóa khách hàng này?",
                "Xác nhận",
                JOptionPane.YES_NO_OPTION
        );

        if (confirm == JOptionPane.YES_OPTION) {
            int maKH = (int) model.getValueAt(r,0);
            dao.deleteSoft(maKH);
            loadData();
            clear();
        }
    }

    private void clear() {
        txtTen.setText("");
        txtSDT.setText("");
        txtDiaChi.setText("");
        table.clearSelection();
    }

    /* ================= UI HELPERS ================= */
    private JTextField createTextField() {
        JTextField txt = new JTextField();
        txt.setFont(new Font("Segoe UI",Font.PLAIN,13));
        txt.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(BORDER),
                BorderFactory.createEmptyBorder(6,10,6,10)
        ));
        return txt;
    }

    private JButton createPrimaryButton(String text) {
        JButton b = new JButton(text);
        b.setBackground(PRIMARY);
        b.setForeground(Color.WHITE);
        b.setFocusPainted(false);
        return b;
    }

    private JButton createDangerButton(String text) {
        JButton b = new JButton(text);
        b.setBackground(DANGER);
        b.setForeground(Color.WHITE);
        b.setFocusPainted(false);
        return b;
    }
}
