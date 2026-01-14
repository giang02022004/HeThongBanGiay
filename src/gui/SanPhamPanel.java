package gui;

import dao.SanPhamDAO;
import dao.SanPhamChiTietDAO;
import model.SanPham;
import model.SanPhamChiTiet;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class SanPhamPanel extends JPanel {

    private JTable table;
    private DefaultTableModel model;

    private JTextField txtTen, txtGia, txtMau, txtHinh;
    private JSpinner spSize, spSoLuong;

    private final SanPhamDAO spDAO = new SanPhamDAO();
    private final SanPhamChiTietDAO ctDAO = new SanPhamChiTietDAO();

    public SanPhamPanel() {
        setLayout(new BorderLayout(10, 10));
        setBackground(Color.WHITE);
        initUI();
        loadData();
    }

    /* ================= UI ================= */

    private void initUI() {

        /* ===== FORM ===== */
        JPanel form = new JPanel(new GridBagLayout());
        form.setBorder(BorderFactory.createTitledBorder("Thông tin sản phẩm"));
        GridBagConstraints g = new GridBagConstraints();
        g.insets = new Insets(5, 5, 5, 5);
        g.fill = GridBagConstraints.HORIZONTAL;

        txtTen = new JTextField();
        txtGia = new JTextField();
        txtMau = new JTextField();
        txtHinh = new JTextField();
        txtHinh.setEditable(false);

        spSize = new JSpinner(new SpinnerNumberModel(36, 35, 46, 1));
        spSoLuong = new JSpinner(new SpinnerNumberModel(0, 0, 1000, 1));

        JButton btnChonAnh = new JButton("Chọn ảnh");
        JButton btnThem = new JButton("Thêm");
        JButton btnSua = new JButton("Cập nhật SL");
        JButton btnXoa = new JButton("Xóa");

        btnChonAnh.addActionListener(e -> chonAnh());

        int r = 0;

        g.gridx = 0; g.gridy = r;
        form.add(new JLabel("Tên giày"), g);
        g.gridx = 1;
        form.add(txtTen, g);

        r++;
        g.gridx = 0; g.gridy = r;
        form.add(new JLabel("Giá bán"), g);
        g.gridx = 1;
        form.add(txtGia, g);

        r++;
        g.gridx = 0; g.gridy = r;
        form.add(new JLabel("Size"), g);
        g.gridx = 1;
        form.add(spSize, g);

        r++;
        g.gridx = 0; g.gridy = r;
        form.add(new JLabel("Màu"), g);
        g.gridx = 1;
        form.add(txtMau, g);

        r++;
        g.gridx = 0; g.gridy = r;
        form.add(new JLabel("Số lượng"), g);
        g.gridx = 1;
        form.add(spSoLuong, g);

        r++;
        g.gridx = 0; g.gridy = r;
        form.add(new JLabel("Hình ảnh"), g);
        g.gridx = 1;
        form.add(txtHinh, g);
        g.gridx = 2;
        form.add(btnChonAnh, g);

        r++;
        JPanel btns = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        btns.add(btnThem);
        btns.add(btnSua);
        btns.add(btnXoa);
        g.gridx = 1; g.gridy = r;
        form.add(btns, g);

        add(form, BorderLayout.NORTH);

        /* ===== TABLE ===== */
        model = new DefaultTableModel(
                new String[]{"Mã CT", "Hình", "Tên", "Giá", "Size", "Màu", "Số lượng"}, 0
        ) {
            @Override
            public boolean isCellEditable(int r, int c) {
                return false;
            }

            @Override
            public Class<?> getColumnClass(int c) {
                return c == 1 ? ImageIcon.class : Object.class;
            }
        };

        table = new JTable(model);
        table.setRowHeight(60);
        table.removeColumn(table.getColumnModel().getColumn(0)); // ẩn Mã CT

        add(new JScrollPane(table), BorderLayout.CENTER);

        /* ===== EVENT ===== */
        btnThem.addActionListener(e -> them());
        btnSua.addActionListener(e -> sua());
        btnXoa.addActionListener(e -> xoa());

        table.getSelectionModel().addListSelectionListener(e -> fillForm());
    }

    /* ================= LOGIC ================= */

    private void loadData() {
        model.setRowCount(0);

        for (SanPham sp : spDAO.getAll()) {
            for (SanPhamChiTiet ct : ctDAO.getByMaSP(sp.getMaSP())) {
                model.addRow(new Object[]{
                        ct.getMaCT(),
                        loadImage(ct.getHinhAnh()),
                        sp.getTenSP(),
                        sp.getGiaBan(),
                        ct.getSize(),
                        ct.getMauSac(),
                        ct.getSoLuong()
                });
            }
        }
    }

    private void them() {
        String ten = txtTen.getText().trim();
        if (ten.isEmpty()) return;

        SanPham sp = spDAO.findByTen(ten);
        if (sp == null) {
            spDAO.insert(new SanPham(
                    0,
                    ten,
                    Double.parseDouble(txtGia.getText()),
                    1
            ));
            sp = spDAO.findByTen(ten);
        }

        if (sp == null) return;

        ctDAO.insert(new SanPhamChiTiet(
                0,
                sp.getMaSP(),
                (int) spSize.getValue(),
                txtMau.getText().trim(),
                (int) spSoLuong.getValue(),
                txtHinh.getText(),
                1
        ));

        loadData();
    }

    private void sua() {
        int r = table.getSelectedRow();
        if (r < 0) return;

        int maCT = (int) model.getValueAt(r, 0);
        ctDAO.updateSoLuong(maCT, (int) spSoLuong.getValue());
        loadData();
    }

    private void xoa() {
        int r = table.getSelectedRow();
        if (r < 0) return;

        int maCT = (int) model.getValueAt(r, 0);
        ctDAO.deleteSoftByMaCT(maCT);
        loadData();
    }

    private void fillForm() {
        int r = table.getSelectedRow();
        if (r < 0) return;

        txtTen.setText(model.getValueAt(r, 2).toString());
        txtGia.setText(model.getValueAt(r, 3).toString());
        spSize.setValue(model.getValueAt(r, 4));
        txtMau.setText(model.getValueAt(r, 5).toString());
        spSoLuong.setValue(model.getValueAt(r, 6));
    }

    /* ================= IMAGE ================= */

    private void chonAnh() {
        JFileChooser fc = new JFileChooser("src/img");
        if (fc.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            txtHinh.setText(fc.getSelectedFile().getName());
        }
    }

    private ImageIcon loadImage(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            fileName = "no-image.png";
        }
        ImageIcon icon = new ImageIcon("src/img/" + fileName);
        Image img = icon.getImage().getScaledInstance(55, 55, Image.SCALE_SMOOTH);
        return new ImageIcon(img);
    }
}
