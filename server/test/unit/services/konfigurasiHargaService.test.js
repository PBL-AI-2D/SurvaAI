import { jest } from '@jest/globals';

const findByPkMock = jest.fn();
const updateMock = jest.fn();
const commitMock = jest.fn();
const rollbackMock = jest.fn();

const transactionMock = { commit: commitMock, rollback: rollbackMock };

jest.unstable_mockModule('../../../src/models/index.js', () => ({
  default: {
    KonfigurasiSurvei: {
      findByPk: findByPkMock
    },
    sequelize: {
      transaction: jest.fn(() => Promise.resolve(transactionMock))
    }
  }
}));

const konfigurasiService = await import('../../../src/services/konfigurasiHarga.service.js');

describe('Konfigurasi Harga Survei - update()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ update() → berhasil mengupdate & kembalikan data terbaru', async () => {
    const mockUpdateData = { harga_per_responden: 1000 };
    const existingConfig = { update: updateMock };

    findByPkMock
      .mockResolvedValueOnce(existingConfig)
      .mockResolvedValueOnce({ id: 1, ...mockUpdateData });

    const result = await konfigurasiService.update(mockUpdateData);

    expect(findByPkMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith(mockUpdateData, { transaction: transactionMock });
    expect(commitMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, ...mockUpdateData });
  });

  it('❌ update() → gagal karena konfigurasi tidak ditemukan', async () => {
    findByPkMock.mockResolvedValue(null);

    await expect(konfigurasiService.update({ harga_per_responden: 1500 }))
      .rejects.toMatchObject({ status: 404, message: 'Konfigurasi harga not found' });

    expect(rollbackMock).toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('❌ update() → gagal karena error internal (rollback)', async () => {
    const mockError = new Error('DB error');
    const existingConfig = { update: updateMock.mockRejectedValue(mockError) };

    findByPkMock.mockResolvedValue(existingConfig);

    await expect(konfigurasiService.update({ harga_dasar: 9999 }))
      .rejects.toThrow('DB error');

    expect(updateMock).toHaveBeenCalled();
    expect(rollbackMock).toHaveBeenCalled();
    expect(commitMock).not.toHaveBeenCalled();
  });
});
