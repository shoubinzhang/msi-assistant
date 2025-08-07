import Taro from '@tarojs/taro';

const request = (url:string, data:any, method='POST') =>
  Taro.request({ url: process.env.API_BASE + url, method, data })
    .then(res => {
      if (res.data.success) return res.data;
      throw new Error(res.data.message||'接口错误');
    });

export const sendSmsCode = (phone:string) =>
  request('/api/send_sms_code', { phone });

export const registerAccount = (payload: {
  phone:string, smsCode:string, name:string,
  hospital:string, position:string
}) => request('/api/register', payload);

export const validateBatch = (batchNumber:string) =>
  request(`/api/validate_batch?batchNumber=${batchNumber}`, {}, 'GET' as any)
    .then((res:any)=>res.valid);

export const loginWithBatch = (payload:{
  batchNumber:string, phone:string, smsCode:string
}) => request('/api/login', payload);
