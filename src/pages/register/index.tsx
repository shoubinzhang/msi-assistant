import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtForm, AtInput, AtButton } from 'taro-ui';
import { sendSmsCode, registerAccount } from '@/services/api';

export default function Register() {
  const [form, setForm] = useState({ phone: '', smsCode: '', name: '', hospital: '', position: '' });
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let id: any;
    if (timer > 0) id = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const onChange = (key: keyof typeof form, val: string) => setForm({ ...form, [key]: val });

  const handleSendCode = async () => {
    if (!/^1\d{10}$/.test(form.phone)) return Taro.showToast({ title: '请输入有效手机号', icon: 'none' });
    try {
      await sendSmsCode(form.phone);
      setTimer(60);
      Taro.showToast({ title: '验证码已发送' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '发送失败', icon: 'none' });
    }
  };

  const handleSubmit = async () => {
    const { phone, smsCode, name, hospital, position } = form;
    if (!phone || !smsCode || !name || !hospital || !position) {
      return Taro.showToast({ title: '请填写完整信息', icon: 'none' });
    }
    try {
      const res = await registerAccount(form);
      Taro.setStorageSync('token', res.token);
      Taro.switchTab({ url: '/pages/index/index' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '注册失败', icon: 'none' });
    }
  };

  return (
    <View className='page-register'>
      <AtForm onSubmit={handleSubmit}>
        <AtInput name='phone' title='手机号' type='phone' value={form.phone}
          onChange={val => onChange('phone', val as string)} />
        <View className='sms-row'>
          <AtInput name='smsCode' title='验证码' value={form.smsCode}
            onChange={val => onChange('smsCode', val as string)} />
          <AtButton disabled={timer>0} onClick={handleSendCode}>
            {timer>0 ? `${timer}s后重发` : '发送验证码'}
          </AtButton>
        </View>
        <AtInput name='name' title='姓名' value={form.name}
          onChange={val => onChange('name', val as string)} />
        <AtInput name='hospital' title='医院名称' value={form.hospital}
          onChange={val => onChange('hospital', val as string)} />
        <AtInput name='position' title='职务' value={form.position}
          onChange={val => onChange('position', val as string)} />
        <AtButton formType='submit' type='primary'>注册</AtButton>
      </AtForm>
    </View>
  );
}
