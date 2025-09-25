import { jest } from '@jest/globals';

const updateMock = jest.fn();
const resSuccessMock = jest.fn();
const resFailMock = jest.fn();

jest.unstable_mockModule('../../../src/services/konfigurasiHarga.service.js', () => ({
  update: updateMock
}));

jest.unstable_mockModule('../../../src/utils/responseHandler.js', () => ({
  resSuccess: resSuccessMock,
  resFail: resFailMock
}));

const { updateConfig } = await import('../../../src/controllers/konfigurasiHarga.controller.js');

describe('Konfigurasi Harga Controller - updateConfig()', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ updateConfig() → berhasil update konfigurasi', async () => {
    const req = { body: { harga_per_responden: 2000 } };
    const updatedData = { id: 1, ...req.body };

    updateMock.mockResolvedValue(updatedData);

    await updateConfig(req, mockRes);

    expect(updateMock).toHaveBeenCalledWith(req.body);
    expect(resSuccessMock).toHaveBeenCalledWith(mockRes, 'Konfigurasi harga updated successfully', updatedData);
  });

  it('❌ updateConfig() → gagal karena tidak ditemukan', async () => {
    const req = { body: { harga_per_responden: 2000 } };
    const error = { message: 'Konfigurasi harga not found', status: 404 };

    updateMock.mockRejectedValue(error);

    await updateConfig(req, mockRes);

    expect(resFailMock).toHaveBeenCalledWith(mockRes, 'Konfigurasi harga not found', 404);
  });

  it('❌ updateConfig() → gagal karena error internal', async () => {
    const req = { body: { harga_dasar: 9999 } };
    const error = new Error('DB Failure');

    updateMock.mockRejectedValue(error);

    await updateConfig(req, mockRes);

    expect(resFailMock).toHaveBeenCalledWith(mockRes, 'DB Failure', undefined);
  });
});
