package gui;

import dao.*;
import model.*;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

public class BanHangPanel extends JPanel {

    private final NguoiDung nguoiDung;

    private JComboBox<KhachHang> cboKhachHang;
    private JComboBox<SanPham> cboSanPham;
    private JComboBox<Integer> cboSize;
    private JComboBox<String> cboMau;

    private JLabel lblTonKho;
    private JSpinner spSoLuong;

    private JTable table;
    private DefaultTableModel model;
    private JLabel lblTongTien;

    private final KhachHangDAO khDAO = new KhachHangDAO();
    private final SanPhamDAO spDAO = new SanPhamDAO();
    private final SanPhamChiTietDAO ctDAO = new SanPhamChiTietDAO();
    private final HoaDonDAO hdDAO = new HoaDonDAO();
    private final ChiTietHoaDonDAO ctHDDAO = new ChiTietHoaDonDAO();

    public BanHangPanel(NguoiDung nd) {
        this.nguoiDung = nd;
        setLayout(new BorderLayout(10,10));
        setBackground(Color.WHITE);
        initUI();
        loadCombo();
    }

    /* ================= UI ================= */

    private void initUI() {

        /* ===== FORM ===== */
        JPanel form = new JPanel(new GridBagLayout());
        form.setBackground(Color.WHITE);
        GridBagConstraints g = new GridBagConstraints();
        g.insets = new Insets(6,6,6,6);
        g.fill = GridBagConstraints.HORIZONTAL;

        cboKhachHang = new JComboBox<>();
        cboSanPham = new JComboBox<>();
        cboSize = new JComboBox<>();
        cboMau = new JComboBox<>();

        lblTonKho = new JLabel("Tồn kho: 0");
        spSoLuong = new JSpinner(new SpinnerNumberModel(1,1,100,1));

        JButton btnThem = new JButton("Thêm vào giỏ");
        JButton btnThemKH = new JButton("+");
        btnThemKH.setPreferredSize(new Dimension(40,28));

        int r = 0;

        // ===== KHÁCH HÀNG + NÚT THÊM =====
        g.gridx=0; g.gridy=r; form.add(new JLabel("Khách hàng"),g);

        JPanel khPanel = new JPanel(new BorderLayout(5,0));
        khPanel.setBackground(Color.WHITE);
        khPanel.add(cboKhachHang, BorderLayout.CENTER);
        khPanel.add(btnThemKH, BorderLayout.EAST);

        g.gridx=1; form.add(khPanel,g);

        r++;
        g.gridx=0; g.gridy=r; form.add(new JLabel("Sản phẩm"),g);
        g.gridx=1; form.add(cboSanPham,g);

        r++;
        g.gridx=0; g.gridy=r; form.add(new JLabel("Size"),g);
        g.gridx=1; form.add(cboSize,g);

        r++;
        g.gridx=0; g.gridy=r; form.add(new JLabel("Màu"),g);
        g.gridx=1; form.add(cboMau,g);

        r++;
        g.gridx=0; g.gridy=r; form.add(lblTonKho,g);

        r++;
        g.gridx=0; g.gridy=r; form.add(new JLabel("Số lượng"),g);
        g.gridx=1; form.add(spSoLuong,g);

        r++;
        g.gridx=1; g.gridy=r; form.add(btnThem,g);

        add(form, BorderLayout.NORTH);

        /* ===== TABLE ===== */
        model = new DefaultTableModel(
                new String[]{"Mã CT","Tên SP","Size","Màu","Giá","SL","Thành tiền"},0
        ){
            public boolean isCellEditable(int r,int c){ return false; }
        };

        table = new JTable(model);
        table.setRowHeight(28);
        table.removeColumn(table.getColumnModel().getColumn(0)); // ẩn mã CT

        add(new JScrollPane(table), BorderLayout.CENTER);

        /* ===== FOOTER ===== */
        JPanel footer = new JPanel(new BorderLayout());

        lblTongTien = new JLabel("Tổng tiền: 0 VNĐ");
        lblTongTien.setFont(new Font("Segoe UI",Font.BOLD,16));

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT,10,0));
        JButton btnXoa = new JButton("Xóa sản phẩm");
        JButton btnThanhToan = new JButton("THANH TOÁN");

        right.add(btnXoa);
        right.add(btnThanhToan);

        footer.add(lblTongTien, BorderLayout.WEST);
        footer.add(right, BorderLayout.EAST);

        add(footer, BorderLayout.SOUTH);

        /* ===== EVENT ===== */
        cboSanPham.addActionListener(e -> loadSize());
        cboSize.addActionListener(e -> loadMau());
        cboMau.addActionListener(e -> loadTonKho());

        btnThem.addActionListener(e -> themVaoGio());
        btnXoa.addActionListener(e -> xoaKhoiGio());
        btnThanhToan.addActionListener(e -> thanhToan());
        btnThemKH.addActionListener(e -> themKhachHangMoi());
    }

    /* ================= LOGIC ================= */

    private void loadCombo() {
        cboKhachHang.removeAllItems();
        cboSanPham.removeAllItems();

        khDAO.getAll().forEach(cboKhachHang::addItem);
        spDAO.getAll().forEach(cboSanPham::addItem);
    }

    private void loadSize() {
        cboSize.removeAllItems();
        cboMau.removeAllItems();
        lblTonKho.setText("Tồn kho: 0");

        SanPham sp = (SanPham) cboSanPham.getSelectedItem();
        if (sp == null) return;

        ctDAO.getByMaSP(sp.getMaSP())
                .stream()
                .map(SanPhamChiTiet::getSize)
                .distinct()
                .forEach(cboSize::addItem);
    }

    private void loadMau() {
        cboMau.removeAllItems();
        lblTonKho.setText("Tồn kho: 0");

        SanPham sp = (SanPham) cboSanPham.getSelectedItem();
        Integer size = (Integer) cboSize.getSelectedItem();
        if (sp == null || size == null) return;

        ctDAO.getByMaSP(sp.getMaSP())
                .stream()
                .filter(ct -> ct.getSize()==size)
                .map(SanPhamChiTiet::getMauSac)
                .distinct()
                .forEach(cboMau::addItem);
    }

    private SanPhamChiTiet getChiTietDangChon() {
        SanPham sp = (SanPham) cboSanPham.getSelectedItem();
        Integer size = (Integer) cboSize.getSelectedItem();
        String mau = (String) cboMau.getSelectedItem();

        if (sp==null || size==null || mau==null) return null;

        return ctDAO.getByMaSP(sp.getMaSP()).stream()
                .filter(ct -> ct.getSize()==size && ct.getMauSac().equals(mau))
                .findFirst().orElse(null);
    }

    private void loadTonKho() {
        SanPhamChiTiet ct = getChiTietDangChon();
        if (ct != null) {
            lblTonKho.setText("Tồn kho: " + ct.getSoLuong());
            spSoLuong.setValue(1);
        }
    }

    private void themVaoGio() {
        SanPhamChiTiet ct = getChiTietDangChon();
        if (ct == null) return;

        int sl = (int) spSoLuong.getValue();
        if (sl > ct.getSoLuong()) {
            JOptionPane.showMessageDialog(this,"Không đủ hàng!");
            return;
        }

        for (int i=0;i<model.getRowCount();i++) {
            int maCT = (int) model.getValueAt(i,0);
            if (maCT == ct.getMaCT()) {
                int slMoi = (int) model.getValueAt(i,5) + sl;
                model.setValueAt(slMoi, i, 5);
                double gia = (double) model.getValueAt(i,4);
                model.setValueAt(slMoi * gia, i, 6);
                tinhTongTien();
                return;
            }
        }

        SanPham sp = spDAO.findById(ct.getMaSP());
        double gia = sp.getGiaBan();

        model.addRow(new Object[]{
                ct.getMaCT(),
                sp.getTenSP(),
                ct.getSize(),
                ct.getMauSac(),
                gia,
                sl,
                sl * gia
        });

        tinhTongTien();
    }

    private void xoaKhoiGio() {
        int r = table.getSelectedRow();
        if (r < 0) {
            JOptionPane.showMessageDialog(this,"Chọn sản phẩm cần xóa!");
            return;
        }
        model.removeRow(r);
        tinhTongTien();
    }

    private void tinhTongTien() {
        double tong = 0;
        for (int i=0;i<model.getRowCount();i++)
            tong += (double) model.getValueAt(i,6);

        lblTongTien.setText("Tổng tiền: " + String.format("%,.0f", tong) + " VNĐ");
    }

    private void thanhToan() {
        if (model.getRowCount()==0) return;

        KhachHang kh = (KhachHang) cboKhachHang.getSelectedItem();
        if (kh == null) return;

        double tong = 0;
        for (int i=0;i<model.getRowCount();i++)
            tong += (double) model.getValueAt(i,6);

        int maHD = hdDAO.insert(kh.getMaKH(), nguoiDung.getMand(), tong);

        for (int i=0;i<model.getRowCount();i++) {
            int maCT = (int) model.getValueAt(i,0);
            int sl = (int) model.getValueAt(i,5);
            double gia = (double) model.getValueAt(i,4);

            ctHDDAO.insert(maHD, maCT, sl, gia);
            ctDAO.truKho(maCT, sl);
        }

        JOptionPane.showMessageDialog(this,"Thanh toán thành công!");
        model.setRowCount(0);
        lblTongTien.setText("Tổng tiền: 0 VNĐ");
    }

    private void themKhachHangMoi() {
        Window w = SwingUtilities.getWindowAncestor(this);
        KhachHangDialog dialog = new KhachHangDialog(w);
        dialog.setVisible(true);

        if (dialog.isAdded()) {
            KhachHang kh = dialog.getKhachHang();
            cboKhachHang.addItem(kh);
            cboKhachHang.setSelectedItem(kh);
        }
    }
}
