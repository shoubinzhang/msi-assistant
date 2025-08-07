import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtForm, AtInput, AtButton } from 'taro-ui';
import { validateBatch, sendSmsCode, loginWithBatch } from '@/services/api';

export default function Login() {
  const [form, setForm] = useState({ batchNumber: '', phone: '', smsCode: '' });
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let id: any;
    if (timer>0) id = setTimeout(()=>setTimer(timer-1),1000);
    return ()=>clearTimeout(id);
  }, [timer]);

  const onChange = (k:keyof typeof form, v:string) => setForm({...form,[k]:v});

  const handleSendCode = async () => {
    if (!form.batchNumber) return Taro.showToast({ title:'请输入产品批号', icon:'none' });
    const ok = await validateBatch(form.batchNumber);
    if (!ok) return Taro.showToast({ title:'无效批号', icon:'none' });
    if (!/^1\d{10}$/.test(form.phone)) return Taro.showToast({ title:'请输入有效手机号', icon:'none' });
    try {
      await sendSmsCode(form.phone);
      setTimer(60);
      Taro.showToast({ title:'验证码已发送' });
    } catch(e:any) {
      Taro.showToast({ title:e.message||'发送失败', icon:'none' });
    }
  };

  const handleSubmit = async () => {
    if (!form.batchNumber||!form.phone||!form.smsCode) {
      return Taro.showToast({title:'请填写完整信息',icon:'none'});
    }
    try {
      const res = await loginWithBatch(form);
      Taro.setStorageSync('token', res.token);
      Taro.switchTab({url:'/pages/index/index'});
    } catch(e:any) {
      Taro.showToast({ title:e.message||'登录失败', icon:'none' });
    }
  };

  return (
    <View className='page-login'>
      <AtForm onSubmit={handleSubmit}>
        <AtInput name='batchNumber' title='产品批号' value={form.batchNumber}
          onChange={v=>onChange('batchNumber', v as string)} />
        <AtInput name='phone' title='手机号' type='phone' value={form.phone}
          onChange={v=>onChange('phone', v as string)} />
        <View className='sms-row'>
          <AtInput name='smsCode' title='验证码' value={form.smsCode}
            onChange={v=>onChange('smsCode', v as string)} />
          <AtButton disabled={timer>0} onClick={handleSendCode}>
            {timer>0 ? `${timer}s后重发` : '发送验证码'}
          </AtButton>
        </View>
        <AtButton formType='submit' type='primary'>登录</AtButton>
      </AtForm>
    </View>
  );
}
