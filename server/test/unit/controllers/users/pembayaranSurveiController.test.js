import { jest } from '@jest/globals';

const getUmumIdByUserIdMock = jest.fn();
const showSurveiMock = jest.fn();
const createPaymentMock = jest.fn();
const resSuccessMock = jest.fn();
const resFailMock = jest.fn();

jest.unstable_mockModule('../../../../src/utils/userMapper.js', () => ({
  getUmumIdByUserId: getUmumIdByUserIdMock
}));

jest.unstable_mockModule('../../../../src/services/survei.service.js', () => ({
  show: showSurveiMock
}));

jest.unstable_mockModule('../../../../src/services/pembayaranSurvei.service.js', () => ({
  create: createPaymentMock
}));

jest.unstable_mockModule('../../../../src/utils/responseHandler.js', () => ({
  resSuccess: resSuccessMock,
  resFail: resFailMock
}));

const { createPayment } = await import('../../../../src/controllers/users/pembayaranSurvei.controller.js');

describe('PembayaranSurvei Service - createPayment()', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const baseReq = {
    user: { userId: 123 },
    params: { id: '123456789' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ createPayment() → berhasil memulai pembayaran', async () => {
    getUmumIdByUserIdMock.mockResolvedValue(200);
    showSurveiMock.mockResolvedValue({ id: 123456789, id_umum: 200 });
    createPaymentMock.mockResolvedValue({ id: 1, jumlah_tagihan: 50000 });

    await createPayment(baseReq, mockRes);

    expect(getUmumIdByUserIdMock).toHaveBeenCalledWith(123);
    expect(showSurveiMock).toHaveBeenCalledWith('123456789');
    expect(createPaymentMock).toHaveBeenCalledWith('123456789', 200);

    expect(resSuccessMock).toHaveBeenCalledWith(
      mockRes,
      'Payment initiated',
      { id: 1, jumlah_tagihan: 50000 }
    );
  });

  it('❌ createPayment() → gagal karena survei bukan milik user (403)', async () => {
    getUmumIdByUserIdMock.mockResolvedValue(200);
    showSurveiMock.mockResolvedValue({ id: 123456789, id_umum: 123456789 });

    await createPayment(baseReq, mockRes);

    expect(resFailMock).toHaveBeenCalledWith(
      mockRes,
      'Unauthorized to access this survei',
      403
    );
    expect(createPaymentMock).not.toHaveBeenCalled();
  });

  it('❌ createPayment() → gagal karena error dari service', async () => {
    const error = new Error('Database down');
    error.status = 500;

    getUmumIdByUserIdMock.mockResolvedValue(200);
    showSurveiMock.mockRejectedValue(error);

    await createPayment(baseReq, mockRes);

    expect(resFailMock).toHaveBeenCalledWith(mockRes, 'Database down', 500);
  });
});
