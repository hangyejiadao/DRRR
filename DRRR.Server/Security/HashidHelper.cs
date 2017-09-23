﻿using HashidsNet;
using System;

namespace DRRR.Server.Security
{
    /// <summary>
    /// 哈希ID帮助类
    /// </summary>
    public static class HashidHelper
    {
        private static Hashids _hashids = new Hashids(salt: Guid.NewGuid().ToString(), minHashLength: 10);

        /// <summary>
        /// 对ID进行编码
        /// </summary>
        /// <param name="id">ID</param>
        /// <returns>哈希值</returns>
        public static string Encode(int id)
        {
            return _hashids.Encode(id);
        }

        /// <summary>
        /// 对ID进行解码
        /// </summary>
        /// <param name="hash">哈希值</param>
        /// <returns>解密后的ID</returns>
        public static int Decode(string hash)
        {
            var arr = _hashids.Decode(hash);
            // 如果解析出的ID不存在，则得到一个空数组，这时候返回0
            return arr.Length > 0 ? arr[0] : 0;
        }
    }
}
