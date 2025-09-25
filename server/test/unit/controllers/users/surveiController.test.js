import { jest } from '@jest/globals';

const createMock = jest.fn();
const resSuccessMock = jest.fn();
const resFailMock = jest.fn();
const getUmumIdByUserIdMock = jest.fn();

jest.unstable_mockModule('../../../../src/services/survei.service.js', () => ({
  create: createMock
}));

jest.unstable_mockModule('../../../../src/utils/responseHandler.js', () => ({
  resSuccess: resSuccessMock,
  resFail: resFailMock
}));

jest.unstable_mockModule('../../../../src/utils/userMapper.js', () => ({
  getUmumIdByUserId: getUmumIdByUserIdMock
}));

const { createUserSurvei } = await import('../../../../src/controllers/users/survei.controller.js');

describe('Survei Controller - createUserSurvei()', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const baseReq = {
    user: { userId: 12345 },
    body: {
      judul: '[UNIT TEST] Survei Test',
      deskripsi: 'Unit testing untuk survei controller',
      jumlah_responden: 100,
      tanggal_mulai: new Date(),
      tanggal_berakhir: new Date(),
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ createUserSurvei() → berhasil membuat survei (200)', async () => {
    const umumId = 12345;
    const mockCreatedSurvei = { id: 1, ...baseReq.body, id_umum: umumId };

    getUmumIdByUserIdMock.mockResolvedValue(umumId);
    createMock.mockResolvedValue(mockCreatedSurvei);

    await createUserSurvei(baseReq, mockRes);

    expect(getUmumIdByUserIdMock).toHaveBeenCalledWith(12345);
    expect(createMock).toHaveBeenCalledWith({ ...baseReq.body, id_umum: umumId });
    expect(resSuccessMock).toHaveBeenCalledWith(mockRes, 'Survei created successfully', mockCreatedSurvei);
  });

  it('❌ createUserSurvei() → gagal mendapatkan umumId', async () => {
    const error = new Error('User tidak ditemukan');
    getUmumIdByUserIdMock.mockRejectedValue(error);

    await createUserSurvei(baseReq, mockRes);

    expect(getUmumIdByUserIdMock).toHaveBeenCalledWith(12345);
    expect(resFailMock).toHaveBeenCalledWith(mockRes, 'User tidak ditemukan', undefined);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('❌ createUserSurvei() → gagal karena error dari service', async () => {
    const umumId = 12345;
    const error = new Error('DB error');
    error.status = 500;

    getUmumIdByUserIdMock.mockResolvedValue(umumId);
    createMock.mockRejectedValue(error);

    await createUserSurvei(baseReq, mockRes);

    expect(getUmumIdByUserIdMock).toHaveBeenCalled();
    expect(createMock).toHaveBeenCalledWith({ ...baseReq.body, id_umum: umumId });
    expect(resFailMock).toHaveBeenCalledWith(mockRes, 'DB error', 500);
  });
});
