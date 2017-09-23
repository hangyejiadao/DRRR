import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SystemMessagesService } from '../../core/services/system-messages.service';
import { FormErrorsAutoClearer } from '../../core/services/form-errors-auto-clearer.service';
import { UserLoginService } from './user-login.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  loginForm: FormGroup;

  formErrorMessages: object;

  private validationMessages: { [key: string]: Function };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private msg: SystemMessagesService,
    private loginService: UserLoginService,
    private autoClearer: FormErrorsAutoClearer,
    private auth: AuthService) { }

  ngOnInit () {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
    this.formErrorMessages = {};
    // 为避免获取消息时配置文件尚未加载，在外面多包一层函数
    this.validationMessages = {
      username: () => this.msg.getMessage('E001', '用户名'),
      password: () => this.msg.getMessage('E001', '密码')
    };
    this.autoClearer.register(this.loginForm, this.formErrorMessages);
    this.loginForm.valueChanges.subscribe(_ => {
      if (this.loginForm.valid) {
        this.formErrorMessages['username'] = '';
      }
    });

    if (this.auth.rememberLoginState) {
      // 判断是否存在登录信息
      const payload = this.auth.getPayloadFromToken('refresh_token');

      if (payload) {
        // 如果存在登录信息，则通过能够刷新令牌来判断登录信息是否已经过期
        this.auth.refreshToken(() => {
          // 登录信息未过期则直接跳转
          this.router.navigate(['/rooms', { page: 1 }]);
          this.msg.showAutoCloseMessage('I002', payload.unique_name);
        });
      } else {
        // 不存在登录信息则将记住登录设为false
        this.auth.rememberLoginState = false;
      }
    }
  }

  login(loginInfo: object) {
    if (!this.loginForm.valid) {
      for (const controlName in this.loginForm.controls) {
        if (!this.loginForm.controls[controlName].valid) {
          this.formErrorMessages[controlName] = this.validationMessages[controlName]();
        }
      }
    } else if (!this.formErrorMessages['username']) {
      // 显示加载消息框
      this.msg.showLoadingMessage('I005', '登录');

      this.loginService
        .login(loginInfo)
        .subscribe(res => {
          this.msg.closeLoadingMessage();
          if (res.error) {
            // 在用户名输入框下方显示错误信息
            this.formErrorMessages['username'] = res.error;
          } else {
            // 保存登录信息
            this.auth.rememberLoginState = loginInfo['rememberMe'];
            this.auth.saveAccessToken(res.accessToken);
            this.auth.saveRefreshToken(res.refreshToken);
            this.router.navigate(['/rooms']);
            this.msg.showAutoCloseMessage('I001', '登录');
          }
        });
    }
  }
}
