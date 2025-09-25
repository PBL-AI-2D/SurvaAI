import Invoice from '../config/xendit.js'

export const createXenditInvoice = async ({ pembayaranSurveiId, jumlahTagihan, penggunaEmail, judulSurvei }) => {
  try {
    const invoice = await Invoice.createInvoice({
      data: {
        externalId: pembayaranSurveiId,
        amount: jumlahTagihan,
        payerEmail: penggunaEmail,
        description: `Pembayaran Survei: ${judulSurvei}`,
        successRedirectURL: `${process.env.CLIENT_URL}/pembayaran-survei/success`,
        failureRedirectURL: `${process.env.CLIENT_URL}/pembayaran-survei/failed`,
        currency: 'IDR',
        invoice_duration: 3600
      }
    });

    return {
      invoiceUrl: invoice.invoiceUrl,
      xenditId: invoice.id
    };
  } catch (error) {
    throw { status: 503, message: `Payment gateway error: ${error.message}`};
  }
};

export const validateWebhook = (headers, payload) => {
  const callbackToken = headers['x-callback-token'];

  if (!callbackToken) throw { status: 401, message: 'Missing callback token' };

  if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
    throw { status: 403, message: 'Invalid webhook token' };
  }

  return {
    pembayaranSurveiId: payload.external_id,
    status: payload.status?.toLowerCase() || 'failed',
    paidAmount: payload.paid_amount || 0,
    paymentMethod: payload.payment_method || null
  };
};
