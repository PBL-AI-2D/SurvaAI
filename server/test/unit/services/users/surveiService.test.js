import { jest } from '@jest/globals';

const createMock = jest.fn();
const findByPkMock = jest.fn();
const transactionMock = {
  commit: jest.fn(),
  rollback: jest.fn(),
};
const sequelizeMock = {
  transaction: jest.fn(() => Promise.resolve(transactionMock)),
};
const UmumMock = { modelName: 'Umum' };

jest.unstable_mockModule('../../../../src/models/index.js', () => ({
  default: {
    Survei: {
      create: createMock,
      findByPk: findByPkMock,
    },
    sequelize: sequelizeMock,
    Umum: UmumMock,
  },
}));

const surveiService = await import('../../../../src/services/survei.service.js');

const baseSurveiInput = {
  judul: '[UNIT TEST] Survei Test',
  deskripsi: 'Unit testing untuk survei service',
  jumlah_responden: 100,
  tanggal_mulai: new Date(),
  tanggal_berakhir: new Date(),
  kriteria: {},
};

describe('Survei Service - create()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('✅ create() → berhasil membuat survei', async () => {
    const mockCreated = { id: 123456789, ...baseSurveiInput };
    const mockReturned = { ...mockCreated, Umum: {} };

    createMock.mockResolvedValue(mockCreated);
    findByPkMock.mockResolvedValue(mockReturned);

    const result = await surveiService.create(baseSurveiInput);

    expect(sequelizeMock.transaction).toHaveBeenCalled();
    expect(createMock).toHaveBeenCalledWith(baseSurveiInput, { transaction: transactionMock });
    expect(transactionMock.commit).toHaveBeenCalled();
    expect(findByPkMock).toHaveBeenCalledWith(123456789, { include: [UmumMock] });

    expect(result).toEqual(mockReturned);
  });

  it('❌ create() → gagal karena error & transaksi query dibatalkan', async () => {
    const input = {
      ...baseSurveiInput,
      judul: '[UNIT TEST] Survei Testing Error',
    };

    const error = new Error('Simulated database failure');
    createMock.mockRejectedValue(error);

    await expect(surveiService.create(input)).rejects.toThrow('Simulated database failure');

    expect(transactionMock.rollback).toHaveBeenCalled();
    expect(transactionMock.commit).not.toHaveBeenCalled();
    expect(findByPkMock).not.toHaveBeenCalled();
  });

  it('❌ create() → berhasil create, tapi survei tidak ditemukan (null)', async () => {
    const mockCreated = { id: 123456789, ...baseSurveiInput };

    createMock.mockResolvedValue(mockCreated);
    findByPkMock.mockResolvedValue(null);

    const result = await surveiService.create(baseSurveiInput);

    expect(sequelizeMock.transaction).toHaveBeenCalled();
    expect(transactionMock.commit).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
