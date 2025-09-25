import { jest } from '@jest/globals';

const findOneMock = jest.fn();
const findByPkMock = jest.fn();
const createMock = jest.fn();
const updateMock = jest.fn();
const commitMock = jest.fn();
const rollbackMock = jest.fn();
const transactionMock = { commit: commitMock, rollback: rollbackMock };

const createXenditInvoiceMock = jest.fn();
const konfigurasiIndexMock = jest.fn();
const kalkulasiJumlahTagihanMock = jest.fn().mockReturnValue(50000);

jest.unstable_mockModule('../../../../src/models/index.js', () => ({
  default: {
    PembayaranSurvei: {
      findOne: findOneMock,
      create: createMock,
      findByPk: jest.fn().mockResolvedValue({ id: 123456789 })
    },
    Survei: { findByPk: findByPkMock },
    Umum: { findByPk: findByPkMock },
    PertanyaanSurvei: {},
    Pengguna: {},
    sequelize: {
      transaction: jest.fn(() => Promise.resolve(transactionMock))
    }
  }
}));

jest.unstable_mockModule('../../../../src/services/xendit.service.js', () => ({
  createXenditInvoice: createXenditInvoiceMock
}));

jest.unstable_mockModule('../../../../src/services/konfigurasiHarga.service.js', () => ({
  index: konfigurasiIndexMock
}));

jest.unstable_mockModule('../../../../src/utils/surveiCalculations.js', () => ({
  kalkulasiJumlahTagihanSurvei: kalkulasiJumlahTagihanMock,
  kalkulasiHadiahPoinSurvei: jest.fn()
}));


jest.unstable_mockModule('../../../../src/services/email.service.js', () => ({
  sendSurveyInvoiceEmail: jest.fn()
}));

const pembayaranService = await import('../../../../src/services/pembayaranSurvei.service.js');

describe('PembayaranSurvei Service - create()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ create() → berhasil membuat invoice Xendit', async () => {
    findOneMock.mockResolvedValue(null);

    const mockUmum = {
      id: 123,
      Pengguna: { email: 'unittesting@email.com' }
    };

    const mockSurvei = {
      id: 456,
      judul: '[UNIT TESTING] Survei testing',
      status: 'payment_pending',
      PertanyaanSurveis: [{}, {}]
    };

    const mockPembayaran = {
      id: 123456789,
      update: updateMock
    };

    findByPkMock.mockImplementation((id) => {
      if (id === 123) return Promise.resolve(mockUmum);
      if (id === 456) return Promise.resolve(mockSurvei);
      return Promise.resolve(null);
    });

    konfigurasiIndexMock.mockResolvedValue({ harga_per_pertanyaan: 25000 });
    createMock.mockResolvedValue(mockPembayaran);
    createXenditInvoiceMock.mockResolvedValue({ invoiceUrl: 'https://xendit.com/invoice/abc123' });

    const result = await pembayaranService.create(456, 123);

    expect(findOneMock).toHaveBeenCalled();
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      id_survei: 456,
      id_umum: 123,
      jumlah_tagihan: 50000,
      status: 'pending'
    }), { transaction: transactionMock });

    expect(updateMock).toHaveBeenCalledWith(
      { invoice_url: 'https://xendit.com/invoice/abc123' },
      { transaction: transactionMock }
    );

    expect(commitMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 123456789 });
  });

  it('❌ create() → gagal karena survei sudah dibayar', async () => {
    findOneMock.mockResolvedValue({ id: 123456789 });

    await expect(pembayaranService.create(999, 123456789)).rejects.toMatchObject({
      status: 400,
      message: 'This survei has already been paid'
    });

    expect(rollbackMock).toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('❌ create() → gagal karena survei tidak ditemukan', async () => {
    findOneMock.mockResolvedValue(null);

    findByPkMock.mockImplementation((id) => {
      if (id === 123456789) return Promise.resolve({ Pengguna: {} });
      if (id === 999) return Promise.resolve(null);
    });

    await expect(pembayaranService.create(999, 123456789)).rejects.toMatchObject({
      status: 404,
      message: 'Survei not found'
    });

    expect(rollbackMock).toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});
